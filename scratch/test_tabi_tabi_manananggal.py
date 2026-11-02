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
        time.sleep(1.0)

        # Launch start screen
        cdp('Runtime.evaluate', {'expression': 'document.getElementById("btn-launch-start").click();'})
        time.sleep(0.8)

        # Start game with first background card
        cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
        time.sleep(1.0)

        print("Waiting for gameplay transition fade...")
        for _ in range(30):
            time.sleep(0.5)
            r = cdp('Runtime.evaluate', {'expression': """
                const overlay = document.getElementById('screen-fade-overlay');
                const isFading = overlay && overlay.classList.contains('is-active');
                const app = window.app;
                const director = app && app.director;
                Boolean(!isFading && director && director.world);
            """, 'returnByValue': True})
            if r.get('result', {}).get('value'):
                print("Gameplay active!")
                break

        print("Now presenting scn_balete_01 with boosted stats...")
        dbg = cdp('Runtime.evaluate', {'expression': """(() => {
            const director = window.app.director;
            const player = director.world.getEntity('player');
            const stats = player ? player.getComponent('Stats') : null;
            if (stats) {
                stats.WIS = 16;
                stats.INT = 16;
            }
            const sub = director.registry.getSubstory('sub_early_02_whispering_balete');
            const scenario = sub ? sub.scenarios.find(s => s.id === 'scn_balete_01') : null;
            if (scenario) {
                director.presentScenario(scenario);
            }
            if (window.app.typewriter) {
                window.app.typewriter.skipToEnd();
            }
            return {
                hasSub: Boolean(sub),
                hasScn: Boolean(scenario),
                subKeys: Array.from(director.registry.substories.keys())
            };
        })()""", 'returnByValue': True})
        print("Debug info:", dbg)
        time.sleep(1.0)

        # Skip typing again to be sure
        cdp('Runtime.evaluate', {'expression': """
            if (window.app.typewriter) {
                window.app.typewriter.skipToEnd();
            }
        """})
        time.sleep(0.5)

        # Verify passive instinct check text
        r = cdp('Runtime.evaluate', {'expression': """
            const container = document.getElementById('narrative-output');
            container ? container.innerText : '';
        """, 'returnByValue': True})
        passive_text = r.get('result', {}).get('value', '')
        print("Passive text excerpt:", passive_text[:400].replace('\n', ' ').encode('ascii', errors='replace').decode())
        assert "Dalakitnon" not in passive_text, "Error: Dalakitnon should not be mentioned in passive hint for Aswang threat"
        assert "fermented oil" in passive_text, "Passive text should mention fermented oil"

        # Check choices rendered
        r = cdp('Runtime.evaluate', {'expression': """
            const btns = Array.from(document.querySelectorAll('.choice-btn'));
            btns.map(b => ({
                text: b.innerText,
                tag: (b.querySelector('.choice-tag') || {}).innerText || ''
            }));
        """, 'returnByValue': True})
        choices_info = r.get('result', {}).get('value', [])
        print(f"Found {len(choices_info)} choices:")
        for idx, c in enumerate(choices_info):
            safe_txt = c['text'].replace('\n', ' ')[:100].encode('ascii', errors='replace').decode()
            print(f"  [{idx}] {safe_txt}")

        choice_track = None
        choice_tabi = None
        for idx, c in enumerate(choices_info):
            if "Track the sour stench" in c['text']:
                choice_track = idx
            if "Tabi-tabi po" in c['text']:
                choice_tabi = idx

        print(f"Choice indices -> track: {choice_track}, tabi-tabi po: {choice_tabi}")
        assert choice_track is not None, "Tracking lower torso choice must be present"
        assert choice_tabi is not None, "Tabi-tabi po option must be present"

        # TEST 1: Click "Tabi-tabi po" option
        print("\n--- TEST 1: Clicking Tabi-tabi po against Manananggal / Wakwak ---")
        click_dbg = cdp('Runtime.evaluate', {'expression': f"""(() => {{
            const btns = document.querySelectorAll('.choice-btn');
            const targetBtn = btns[{choice_tabi}];
            const btnText = targetBtn ? targetBtn.innerText : null;
            if (targetBtn) targetBtn.click();
            return {{
                btnText,
                btnCount: btns.length,
                outcomeHeaders: Array.from(document.querySelectorAll('.narrative-outcome-header')).map(h => h.textContent),
                outputTail: document.getElementById('narrative-output') ? document.getElementById('narrative-output').innerText.slice(-300) : ''
            }};
        }})()""", 'returnByValue': True})
        print("Click debug:", safe_str(click_dbg.get('result', {}).get('value')))
        time.sleep(0.5)
        cdp('Runtime.evaluate', {'expression': """
            if (window.app.typewriter) window.app.typewriter.skipToEnd();
        """})
        time.sleep(0.5)

        r = cdp('Runtime.evaluate', {'expression': """(() => {
            const headers = Array.from(document.querySelectorAll('.narrative-outcome-header'));
            return headers.map(h => h.textContent);
        })()""", 'returnByValue': True})
        outcome_headers = r.get('result', {}).get('value', [])
        print("Outcome headers:", safe_str(outcome_headers))
        assert any("INEFFECTIVE FOLKLORE" in h for h in outcome_headers), f"Expected INEFFECTIVE FOLKLORE in headers: {outcome_headers}"

        r = cdp('Runtime.evaluate', {'expression': "document.getElementById('narrative-output')?.innerText || ''", 'returnByValue': True})
        narrative_body = r.get('result', {}).get('value', '')
        print("Narrative excerpt:", safe_str(narrative_body[-350:].replace('\n', ' ')))
        assert "monsters of the blood" in narrative_body or "Aswang" in narrative_body, "Narrative must explain Aswang lore"
        assert "Polite apologies" in narrative_body or "reverence" in narrative_body

        # TEST 2: Test INT check tracking the torso
        print("\n--- TEST 2: Testing successful lower torso tracking ---")
        t2_prep = cdp('Runtime.evaluate', {'expression': """(() => {
            try {
                const director = window.app.director;
                director.awaitingContinue = false;
                const sub = director.registry.getSubstory('sub_early_02_whispering_balete');
                const scenario = sub ? sub.scenarios.find(s => s.id === 'scn_balete_01') : null;
                const output = document.getElementById('narrative-output');
                if (output) output.innerHTML = '';
                director.presentScenario(scenario);
                if (window.app.typewriter) window.app.typewriter.skipToEnd();
                return {
                    scenarioPresented: scenario ? scenario.id : null,
                    awaitingContinue: director.awaitingContinue,
                    outputLen: output ? output.innerText.length : -1
                };
            } catch (err) {
                return { error: err.message, stack: err.stack };
            }
        })()""", 'returnByValue': True})
        print("T2 prep debug:", safe_str(t2_prep.get('result', {}).get('value')))
        time.sleep(1.0)

        # Force success on INT check choice (index 3 in scn_balete_01.choices)
        t2_choice = cdp('Runtime.evaluate', {'expression': """(() => {
            try {
                const director = window.app.director;
                director.awaitingContinue = false;
                director.selectChoice(3, null, { success: true, outcome: 'SUCCESS', total: 16, dc: 15, statKey: 'INT' });
                if (window.app.typewriter) window.app.typewriter.skipToEnd();
                return {
                    selected: true,
                    awaitingContinue: director.awaitingContinue,
                    outputLen: document.getElementById('narrative-output')?.innerText.length
                };
            } catch (err) {
                return { error: err.message, stack: err.stack };
            }
        })()""", 'returnByValue': True})
        print("T2 choice debug:", safe_str(t2_choice.get('result', {}).get('value')))
        time.sleep(1.0)

        r = cdp('Runtime.evaluate', {'expression': "document.getElementById('narrative-output')?.innerText || ''", 'returnByValue': True})
        narrative_track = r.get('result', {}).get('value', '')
        print("Track narrative excerpt:", safe_str(narrative_track[-350:].replace('\n', ' ')))
        assert "fermented coconut oil" in narrative_track, "Success narrative must mention fermented coconut oil"
        assert "pale otherworldly spirit" not in narrative_track, "Should not contain 'pale otherworldly spirit'"
        assert "Dalakitnon" not in narrative_track, "Should not contain 'Dalakitnon'"
        assert "Tabi-tabi po" not in narrative_track[-250:], "Should not contain 'Tabi-tabi po' in successful torso tracking outcome"

        # Capture screenshot of the verified narrative
        shot = cdp('Page.captureScreenshot', {'format': 'png'})
        artifact_path = r"C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\tabi_tabi_manananggal_verified.png"
        with open(artifact_path, "wb") as f:
            f.write(base64.b64decode(shot['data']))
        print(f"Captured screenshot artifact to {artifact_path}")

        print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
