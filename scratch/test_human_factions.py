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
        for _ in range(60):
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

        # TEST 1: Verify all 5 Factions exist in NarrativeRegistry miscScenarios
        print("\n--- TEST 1: Verify Faction Scenarios Registered ---")
        res1 = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const misc = director.registry ? director.registry.getMiscScenarios() : [];
                const factionScenarios = misc.filter(s => s.id && s.id.startsWith('faction_'));
                return {
                    count: factionScenarios.length,
                    ids: factionScenarios.map(s => s.id)
                };
            })()
        """, 'returnByValue': True})
        fsc = res1.get('result', {}).get('value', {})
        print(f"Registered faction scenarios count: {fsc.get('count')}")
        print(f"Scenario IDs: {fsc.get('ids')}")
        assert fsc.get('count', 0) >= 11, f"Expected at least 11 faction scenarios, got {fsc.get('count')}"

        # TEST 2: Present Babaylan Sacred Grove Scenario & Choose Shrine Gold Plunder
        print("\n--- TEST 2: Test Moral Choice (Babaylan Shrine Gold Plunder) ---")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const scn = director.registry.getMiscScenarios().find(s => s.id === 'faction_baliana_sacred_grove_01');
                director.presentScenario(scn);
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.0)

        # Verify choice texts rendered
        choices_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = Array.from(document.querySelectorAll('#choices-container button.choice-btn'));
                return buttons.map(b => b.innerText.trim());
            })()
        """, 'returnByValue': True})
        choices_text = choices_res.get('result', {}).get('value', [])
        print("Rendered choices:")
        for idx, ct in enumerate(choices_text):
            print(f"  [{idx}] {safe_str(ct[:80])}")

        # Choice 2 is the shrine gold plunder
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = document.querySelectorAll('#choices-container button.choice-btn');
                buttons[2].click();
                const director = window.app.director;
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.2)

        # Verify emitted tags on world
        tags_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const world = window.app.director.world;
                const player = world.getEntity('player');
                const remnants = player.getComponent('Remnants');
                return {
                    hasStoleShrineGold: world.hasFlag('stole_shrine_gold'),
                    hasCursedByAnito: world.hasFlag('cursed_by_anito'),
                    hasRepBabaylanEnemy: world.hasFlag('rep_babaylan_enemy'),
                    piloncitos: remnants ? remnants.count : 0
                };
            })()
        """, 'returnByValue': True})
        tag_data = tags_res.get('result', {}).get('value', {})
        print("World status after plunder:")
        print(f"  stole_shrine_gold: {tag_data.get('hasStoleShrineGold')}")
        print(f"  cursed_by_anito: {tag_data.get('hasCursedByAnito')}")
        print(f"  rep_babaylan_enemy: {tag_data.get('hasRepBabaylanEnemy')}")
        print(f"  Piloncitos: {tag_data.get('piloncitos')}")
        assert tag_data.get('hasStoleShrineGold') is True
        assert tag_data.get('hasCursedByAnito') is True
        assert tag_data.get('hasRepBabaylanEnemy') is True

        # TEST 3: Character Info Modal UI Verification
        print("\n--- TEST 3: Character Info Modal Faction Standings & Moral Marks ---")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                document.getElementById('btn-open-char-info').click();
            })()
        """})
        time.sleep(1.0)

        modal_data = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const factionCards = Array.from(document.querySelectorAll('#faction-standings-grid .faction-card'));
                const cardDetails = factionCards.map(c => {
                    const name = c.querySelector('.faction-name')?.innerText || '';
                    const badge = c.querySelector('.faction-standing-badge')?.innerText || '';
                    const isHostile = c.classList.contains('hostile');
                    const isAllied = c.classList.contains('allied');
                    return { name, badge, isHostile, isAllied };
                });

                const markItems = Array.from(document.querySelectorAll('#moral-marks-list .moral-mark-item'));
                const markDetails = markItems.map(m => {
                    const name = m.querySelector('.moral-mark-name')?.innerText || '';
                    const desc = m.querySelector('.moral-mark-desc')?.innerText || '';
                    return { name, desc };
                });

                return { cardDetails, markDetails };
            })()
        """, 'returnByValue': True})
        info_data = modal_data.get('result', {}).get('value', {})
        print("Faction cards rendered:")
        for c in info_data.get('cardDetails', []):
            print(f"  {safe_str(c.get('name'))}: {safe_str(c.get('badge'))} (Hostile={c.get('isHostile')})")

        print("Moral marks rendered:")
        for m in info_data.get('markDetails', []):
            print(f"  {safe_str(m.get('name'))} -> {safe_str(m.get('desc')[:70])}")

        babaylan_card = next((c for c in info_data.get('cardDetails', []) if 'Babaylan' in c.get('name', '')), None)
        assert babaylan_card is not None, "Babaylan card not found"
        assert babaylan_card.get('isHostile') is True, f"Expected Babaylan to be Hostile, got {babaylan_card}"

        mark_names = [m.get('name', '') for m in info_data.get('markDetails', [])]
        assert any('Desecrator of the Anito' in nm for nm in mark_names), "Desecrator moral mark missing"
        assert any('Cursed by Ancestral Spirits' in nm for nm in mark_names), "Cursed by Anito moral mark missing"

        # Capture screenshot artifact of Character Info Modal
        art_path = os.path.abspath(r"C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\faction_standings_and_moral_marks_verified.png")
        ss = cdp('Page.captureScreenshot', {'format': 'png'})
        if 'data' in ss:
            with open(art_path, 'wb') as f:
                f.write(base64.b64decode(ss['data']))
            print(f"\n[Screenshot Saved] -> {art_path}")

        # Close char info modal
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                document.getElementById('btn-close-char-info').click();
            })()
        """})
        time.sleep(0.5)

        # TEST 4: Dynamic Scenario Weighting
        print("\n--- TEST 4: Dynamic Scenario Weighting Check ---")
        weight_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const misc = director.registry.getMiscScenarios();
                const curseScn = misc.find(s => s.id === 'faction_babaylan_curse_encounter_01');
                const normalScn = misc.find(s => s.id === 'faction_karakoa_pirate_cove_01');
                return {
                    curseWeight: director.calculateScenarioWeight(curseScn),
                    normalWeight: director.calculateScenarioWeight(normalScn)
                };
            })()
        """, 'returnByValue': True})
        weights = weight_res.get('result', {}).get('value', {})
        print(f"Babaylan Curse encounter dynamic weight: {weights.get('curseWeight')}")
        print(f"Normal Karakoa encounter dynamic weight: {weights.get('normalWeight')}")
        assert weights.get('curseWeight', 0) > 10.0, f"Expected curse weight > 10.0 due to stacked hostility, got {weights.get('curseWeight')}"

        # TEST 5: Choice Blocking by Active Enmity
        print("\n--- TEST 5: Choice Gating by Enmity Tag ---")
        cdp('Runtime.evaluate', {'expression': """
            (() => {
                const director = window.app.director;
                const scn = director.registry.getMiscScenarios().find(s => s.id === 'faction_baliana_sacred_grove_01');
                director.presentScenario(scn);
                if (director.typewriter) {
                    director.typewriter.skipToEnd();
                }
            })()
        """})
        time.sleep(1.0)

        gating_res = cdp('Runtime.evaluate', {'expression': """
            (() => {
                const buttons = Array.from(document.querySelectorAll('#choices-container button.choice-btn'));
                return buttons.map(b => ({
                    text: b.innerText.trim(),
                    disabled: b.disabled,
                    title: b.title
                }));
            })()
        """, 'returnByValue': True})
        gating_buttons = gating_res.get('result', {}).get('value', [])
        print("Choices when Babaylan enemy is active:")
        for b in gating_buttons:
            print(f"  disabled={b.get('disabled')}, title='{safe_str(b.get('title'))}' -> {safe_str(b.get('text')[:60])}")

        # Choice 0 (Santigwar) and Choice 1 (Offering) should be disabled because rep_babaylan_enemy is active!
        assert gating_buttons[0].get('disabled') is True, "Expected Santigwar choice to be blocked by Babaylan hostility"
        assert gating_buttons[1].get('disabled') is True, "Expected Offering choice to be blocked by Babaylan hostility"

        # Capture screenshot of choice gating
        art_path2 = os.path.abspath(r"C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\faction_choice_gating_verified.png")
        ss2 = cdp('Page.captureScreenshot', {'format': 'png'})
        if 'data' in ss2:
            with open(art_path2, 'wb') as f:
                f.write(base64.b64decode(ss2['data']))
            print(f"[Screenshot Saved] -> {art_path2}")

        print("\nALL 5 FACTION TESTS PASSED PERFECTLY!")

    finally:
        proc.kill()

if __name__ == '__main__':
    main()
