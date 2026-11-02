import subprocess, time, urllib.request, json, os, socket, base64, struct

class SimpleWS:
    def __init__(self, ws_url):
        parts = ws_url.replace('ws://', '').split('/', 1)
        host_port = parts[0].split(':')
        host = host_port[0]
        port = int(host_port[1])
        path = '/' + parts[1] if len(parts) > 1 else '/'
        self.sock = socket.create_connection((host, port))
        key = base64.b64encode(os.urandom(16)).decode('ascii')
        req = (
            f'GET {path} HTTP/1.1\r\n'
            f'Host: {host}:{port}\r\n'
            f'Upgrade: websocket\r\n'
            f'Connection: Upgrade\r\n'
            f'Sec-WebSocket-Key: {key}\r\n'
            f'Sec-WebSocket-Version: 13\r\n\r\n'
        )
        self.sock.sendall(req.encode('utf-8'))
        resp = b''
        while b'\r\n\r\n' not in resp:
            resp += self.sock.recv(1024)

    def send(self, data):
        payload = json.dumps(data).encode('utf-8')
        length = len(payload)
        mask_key = os.urandom(4)
        masked = bytearray(b ^ mask_key[i % 4] for i, b in enumerate(payload))
        if length < 126:
            header = struct.pack('!BB', 0x81, 0x80 | length)
        elif length < 65536:
            header = struct.pack('!BBH', 0x81, 0x80 | 126, length)
        else:
            header = struct.pack('!BBQ', 0x81, 0x80 | 127, length)
        self.sock.sendall(header + mask_key + masked)

    def recv(self):
        b1, b2 = struct.unpack('!BB', self._recv_exact(2))
        length = b2 & 0x7F
        if length == 126:
            length = struct.unpack('!H', self._recv_exact(2))[0]
        elif length == 127:
            length = struct.unpack('!Q', self._recv_exact(8))[0]
        masked = (b2 & 0x80) != 0
        if masked:
            mask_key = self._recv_exact(4)
            payload = self._recv_exact(length)
            payload = bytearray(b ^ mask_key[i % 4] for i, b in enumerate(payload))
        else:
            payload = self._recv_exact(length)
        return json.loads(payload.decode('utf-8'))

    def _recv_exact(self, n):
        res = b''
        while len(res) < n:
            chunk = self.sock.recv(n - len(res))
            if not chunk: raise EOFError('Connection closed')
            res += chunk
        return res

def safe_str(val):
    return str(val).encode('ascii', errors='replace').decode('ascii')

def main():
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = os.path.abspath(r"scratch\edge_profile")
    port = 9222

    proc = subprocess.Popen([
        chrome_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--headless=new",
        "--no-first-run",
        "--disable-gpu",
        "http://localhost:8000"
    ])
    print("Started browser, waiting for CDP...")

    try:
        time.sleep(2.0)
        tabs_url = f"http://localhost:{port}/json"
        with urllib.request.urlopen(tabs_url) as resp:
            tabs = json.loads(resp.read().decode('utf-8'))
        page_tab = next(t for t in tabs if t.get('type') == 'page')
        ws = SimpleWS(page_tab['webSocketDebuggerUrl'])
        print("Connected to page CDP.")

        msg_id = 0
        def cdp(method, params=None):
            nonlocal msg_id
            msg_id += 1
            ws.send({'id': msg_id, 'method': method, 'params': params or {}})
            while True:
                m = ws.recv()
                if m.get('id') == msg_id:
                    return m.get('result', {})

        cdp('Runtime.enable')
        cdp('Page.enable')
        cdp('Network.enable')
        cdp('Network.setCacheDisabled', {'cacheDisabled': True})
        cdp('Page.reload', {'ignoreCache': True})
        time.sleep(1.5)

        # Launch start screen
        cdp('Runtime.evaluate', {'expression': 'document.getElementById("btn-launch-start").click();'})
        time.sleep(0.8)

        # Start game with first background card
        cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
        time.sleep(1.0)

        print("Waiting for gameplay transition...")
        for _ in range(30):
            time.sleep(0.5)
            r = cdp('Runtime.evaluate', {'expression': """
                (() => {
                    const overlay = document.getElementById('screen-fade-overlay');
                    const isFading = overlay && overlay.classList.contains('is-active');
                    const app = window.app;
                    const director = app && app.director;
                    return Boolean(!isFading && director && director.world);
                })()
            """})
            if r.get('result', {}).get('value'):
                print("Gameplay active!")
                break

        time.sleep(1.0)

        # TEST 1: Present Tikbalang Encounter
        print("\n--- TEST 1: Present Tikbalang Encounter ---")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const world = director.world;
                // Ensure clothing_inside_out flag is set so option is allowed
                world.setFlag('clothing_inside_out');
                const scn = director.registry.getMiscScenarios().find(s => s.id === 'misc_tikbalang_grove_01');
                director.presentScenario(scn);
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.0)

        # Check prompt text: should be obscured, NOT mention Tikbalang
        prompt_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const pList = Array.from(document.querySelectorAll('#narrative-output p, .narrative-paragraph'));
                return pList.map(p => p.innerText).join('\\n');
            })()
        """, 'returnByValue': True})
        prompt_text = prompt_res.get('result', {}).get('value', '')
        print("Prompt narrative:")
        print(safe_str(prompt_text))
        assert 'Tikbalang' not in prompt_text, f"Expected Tikbalang name to be obscured in prompt, got: {prompt_text}"
        assert 'horse-headed' in prompt_text.lower(), "Expected obscured descriptor 'horse-headed' in prompt"

        # Check choices
        choices_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = Array.from(document.querySelectorAll('#choices-container button.choice-btn'));
                return buttons.map(b => b.innerText.trim());
            })()
        """, 'returnByValue': True})
        choices_text = choices_res.get('result', {}).get('value', [])
        print("\nRendered choices:")
        for idx, ct in enumerate(choices_text):
            print(f"  [{idx}] {safe_str(ct[:80])}")

        # Click choice 0 (Inverted Garment Ward)
        print("\nExecuting Choice 0 (Inverted Garment Ward)...")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = document.querySelectorAll('#choices-container button.choice-btn');
                buttons[0].click();
                const director = window.app.director;
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.2)

        # TEST 2: Verify outcome story DOES NOT reveal Tikbalang immediately
        print("\n--- TEST 2: Verify Outcome Story & Deferred Discovery ---")
        outcome_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const pList = Array.from(document.querySelectorAll('#narrative-output p, .narrative-paragraph'));
                const latestParagraphs = pList.slice(-2).map(p => p.innerText).join('\\n');
                const world = window.app.director.world;
                return {
                    latestText: latestParagraphs,
                    hasKnowledge: world.hasCreatureKnowledge('tikbalang'),
                    hasPendingTales: world.hasPendingCreatureTales(),
                    pendingList: world.getPendingCreatureTales(),
                    hasPendingFlag: world.hasFlag('has_pending_creature_tales')
                };
            })()
        """, 'returnByValue': True})
        outcome_data = outcome_res.get('result', {}).get('value', {})
        print("Outcome text:")
        print(safe_str(outcome_data.get('latestText', '')))
        print(f"Creature Knowledge 'tikbalang': {outcome_data.get('hasKnowledge')}")
        print(f"Has Pending Tales: {outcome_data.get('hasPendingTales')}")
        print(f"Pending Tales List: {outcome_data.get('pendingList')}")
        print(f"Has Pending Flag: {outcome_data.get('hasPendingFlag')}")

        assert 'Tikbalang' not in outcome_data.get('latestText', ''), "Outcome story should NOT reveal 'Tikbalang' name immediately!"
        assert outcome_data.get('hasKnowledge') is False, "Creature knowledge should NOT be unlocked on the spot!"
        assert 'tikbalang' in outcome_data.get('pendingList', []), "Expected 'tikbalang' in pendingCreatureTales"
        assert outcome_data.get('hasPendingFlag') is True, "Expected 'has_pending_creature_tales' flag on world"

        # Advance through continue prompt
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const contBtn = document.querySelector('#choices-container button.choice-btn');
                if (contBtn) contBtn.click();
            })()
        """})
        time.sleep(0.8)

        # TEST 3: Present Chill Campfire Scenario (Kiko the Mangyan Hunter)
        print("\n--- TEST 3: Present Chill Campfire Scenario ---")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const scn = director.registry.getMiscScenarios().find(s => s.id === 'misc_hunter_campfire_01');
                director.presentScenario(scn);
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.0)

        # Verify dynamic storytelling choice was injected
        chill_choices_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = Array.from(document.querySelectorAll('#choices-container button.choice-btn'));
                return buttons.map(b => b.innerText.trim());
            })()
        """, 'returnByValue': True})
        chill_choices = chill_choices_res.get('result', {}).get('value', [])
        print("Chill campfire choices:")
        tale_choice_idx = None
        for idx, ct in enumerate(chill_choices):
            print(f"  [{idx}] {safe_str(ct)}")
            if 'horse-headed' in ct.lower() or 'recount' in ct.lower():
                tale_choice_idx = idx

        assert tale_choice_idx is not None, "Expected dynamic tale-sharing choice to be injected during chill campfire scenario!"

        # TEST 4: Select the Storytelling Choice & Unravel the Mystery
        print(f"\n--- TEST 4: Select Storytelling Choice (Index {tale_choice_idx}) ---")
        cdp('Runtime.evaluate', {'expression': f"""
            (() => {{
                const buttons = document.querySelectorAll('#choices-container button.choice-btn');
                buttons[{tale_choice_idx}].click();
                const director = window.app.director;
                if (director.typewriter) {{
                    director.typewriter.skipToEnd();
                }}
            }})()
        """})
        time.sleep(1.2)

        # Verify discovery resolution narrative and codex unlock
        resolution_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const pList = Array.from(document.querySelectorAll('#narrative-output p, .narrative-paragraph'));
                const resolutionText = pList.slice(-3).map(p => p.innerText).join('\\n');
                const world = window.app.director.world;
                return {
                    resolutionText,
                    hasKnowledge: world.hasCreatureKnowledge('tikbalang'),
                    hasPendingTales: world.hasPendingCreatureTales(),
                    hasPendingFlag: world.hasFlag('has_pending_creature_tales')
                };
            })()
        """, 'returnByValue': True})
        res_data = resolution_res.get('result', {}).get('value', {})
        print("Storytelling resolution narrative:")
        print(safe_str(res_data.get('resolutionText', '')))
        print(f"Creature Knowledge 'tikbalang': {res_data.get('hasKnowledge')}")
        print(f"Has Pending Tales: {res_data.get('hasPendingTales')}")
        print(f"Has Pending Flag: {res_data.get('hasPendingFlag')}")

        assert 'Tikbalang' in res_data.get('resolutionText', ''), "Elder response should reveal and explain the Tikbalang!"
        assert res_data.get('hasKnowledge') is True, "Creature knowledge should now be unlocked in the Codex!"
        assert res_data.get('hasPendingTales') is False, "Pending tales should now be resolved!"
        assert res_data.get('hasPendingFlag') is False, "Pending flag should be cleared!"

        # Capture screenshot artifact of the campfire storytelling resolution
        art_path = os.path.abspath(r"C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\campfire_tale_revelation_verified.png")
        ss = cdp('Page.captureScreenshot', {'format': 'png'})
        if 'data' in ss:
            with open(art_path, 'wb') as f:
                f.write(base64.b64decode(ss['data']))
            print(f"\n[Screenshot Saved] -> {art_path}")

        print("\nALL CREATURE TALE IMMERSION TESTS PASSED PERFECTLY!")

    finally:
        proc.kill()

if __name__ == '__main__':
    main()
