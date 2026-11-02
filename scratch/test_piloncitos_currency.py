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

def safe_print(*args):
    text = " ".join(str(a) for a in args)
    print(text.encode("ascii", "replace").decode("ascii"))

def main():
    chrome_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = os.path.abspath(r"scratch\edge_profile")
    port = 9222

    proc = subprocess.Popen([
        chrome_path,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={user_data}",
        "--headless=new",
        "--window-size=1280,820",
        "--no-first-run",
        "--disable-gpu",
        "http://localhost:8000"
    ])

    try:
        time.sleep(2.0)
        tabs_url = f"http://localhost:{port}/json"
        with urllib.request.urlopen(tabs_url) as resp:
            tabs = json.loads(resp.read().decode('utf-8'))
        page_tab = next(t for t in tabs if t.get('type') == 'page')
        ws = SimpleWS(page_tab['webSocketDebuggerUrl'])

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

        card_check = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const grid = document.getElementById('background-cards-grid');
                    const articles = Array.from(grid ? grid.querySelectorAll('article') : []);
                    return {
                        gridChildren: grid ? grid.children.length : 0,
                        vitals: articles.map(c => {
                            const vitals = c.querySelector('.card-vitals-row');
                            return vitals ? vitals.textContent.trim() : '';
                        })
                    };
                })()
            """,
            'returnByValue': True
        })
        card_res = card_check.get('result', {}).get('value', {})
        safe_print("Character Selection Card Vitals:", card_res)
        card_vitals = card_res.get("vitals", [])
        assert len(card_vitals) > 0, "Must have character selection cards"
        for v in card_vitals:
            assert "PILONCITOS:" in v, f"Card must display PILONCITOS, got: {v}"
            assert "REMNANTS" not in v, f"Card must NOT display REMNANTS, got: {v}"
            assert "(coins)" not in v.lower(), f"Must not contain (coins) parenthesis, got: {v}"
        safe_print("PASS Check 1: Character selection cards display PILONCITOS with no parenthesis.")

        # Start game with first background
        cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
        time.sleep(1.2)

        # Check 2: HUD Currency Meter Header
        hud_check = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const sanityVal = document.getElementById('sanity-value');
                    const headerSpan = sanityVal ? sanityVal.previousElementSibling : null;
                    return {
                        headerText: headerSpan ? headerSpan.textContent.trim() : null,
                        currentValue: sanityVal ? sanityVal.textContent.trim() : null
                    };
                })()
            """,
            'returnByValue': True
        })
        hud_res = hud_check.get('result', {}).get('value', {})
        safe_print("HUD Currency Header:", hud_res)
        assert "PILONCITOS" in hud_res["headerText"], f"Meter header must say PILONCITOS, got: {hud_res['headerText']}"
        assert "REMNANTS" not in hud_res["headerText"], f"Meter header must not say REMNANTS, got: {hud_res['headerText']}"
        assert "(coins)" not in hud_res["headerText"].lower(), f"Must not contain (coins) parenthesis, got: {hud_res['headerText']}"
        safe_print("PASS Check 2: HUD meter header displays PILONCITOS cleanly.")

        # Check 3: Mechanical log when modifying currency
        log_check = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const app = window.app;
                    let emittedLog = null;
                    const listener = (payload) => {
                        emittedLog = payload;
                    };
                    app.eventBus.on('log:mechanical', listener);
                    app.eventBus.emit('player:modifyRemnants', { amount: 5, source: 'Trade with Peddler' });
                    app.eventBus.off('log:mechanical', listener);
                    const player = app.world.getEntity('player');
                    const comp = player.getComponent('Remnants');
                    return {
                        logText: emittedLog ? emittedLog.text : null,
                        newCount: comp ? comp.count : null
                    };
                })()
            """,
            'returnByValue': True
        })
        log_res = log_check.get('result', {}).get('value', {})
        safe_print("Currency Log Result:", log_res)
        assert "Piloncitos: +5" in log_res["logText"], f"Expected 'Piloncitos: +5' in log, got: {log_res['logText']}"
        assert "Remnants:" not in log_res["logText"], f"Must not say Remnants, got: {log_res['logText']}"
        safe_print("PASS Check 3: Mechanical log reports Piloncitos.")

        # Check 4: Hidden Wealth Attraction Mechanic in calculateScenarioWeight
        weight_check = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const director = window.app.director;
                    const player = window.app.world.getEntity('player');
                    const comp = player.getComponent('Remnants');

                    const banditScenario = {
                        id: 'misc_ridge_bandits_01',
                        baseWeight: 0.22,
                        intrinsicTags: ['bandit_ambush', 'perilous_road']
                    };
                    const baganiScenario = {
                        id: 'misc_rogue_bagani_warrior_01',
                        baseWeight: 0.18,
                        intrinsicTags: ['bandit_ambush', 'warrior_mugger', 'bagani_challenge']
                    };
                    const duwendeScenario = {
                        id: 'misc_duwende_gold_mound_01',
                        baseWeight: 0.18,
                        intrinsicTags: ['duwende_trick', 'treasure_coveter', 'spirit_encounter']
                    };
                    const peacefulScenario = {
                        id: 'misc_peaceful_shrine_01',
                        baseWeight: 0.3,
                        intrinsicTags: ['anito_shrine', 'peaceful_trade']
                    };

                    // Case A: 0 coins
                    comp.count = 0;
                    const w0_bandit = director.calculateScenarioWeight(banditScenario);
                    const w0_bagani = director.calculateScenarioWeight(baganiScenario);
                    const w0_duwende = director.calculateScenarioWeight(duwendeScenario);

                    // Case B: 15 coins
                    comp.count = 15;
                    const w15_bandit = director.calculateScenarioWeight(banditScenario);
                    const w15_bagani = director.calculateScenarioWeight(baganiScenario);
                    const w15_duwende = director.calculateScenarioWeight(duwendeScenario);

                    // Case C: 30 coins
                    comp.count = 30;
                    const w30_bandit = director.calculateScenarioWeight(banditScenario);
                    const w30_bagani = director.calculateScenarioWeight(baganiScenario);
                    const w30_duwende = director.calculateScenarioWeight(duwendeScenario);

                    return {
                        zeroCoins: { bandit: w0_bandit, bagani: w0_bagani, duwende: w0_duwende },
                        fifteenCoins: { bandit: w15_bandit, bagani: w15_bagani, duwende: w15_duwende },
                        thirtyCoins: { bandit: w30_bandit, bagani: w30_bagani, duwende: w30_duwende }
                    };
                })()
            """,
            'returnByValue': True
        })
        weight_res = weight_check.get('result', {}).get('value', {})
        safe_print("Scenario Weight Results by Wealth Tier:", json.dumps(weight_res, indent=2))
        z = weight_res["zeroCoins"]
        m = weight_res["fifteenCoins"]
        h = weight_res["thirtyCoins"]

        assert m["bandit"] > z["bandit"], "Bandit risk must increase at 15 coins"
        assert h["bandit"] > m["bandit"], "Bandit risk must increase further at 30 coins"
        assert m["bagani"] > z["bagani"], "Rogue Bagani risk must increase at 15 coins"
        assert h["bagani"] > m["bagani"], "Rogue Bagani risk must increase further at 30 coins"
        assert m["duwende"] > z["duwende"], "Duwende treasure attraction must increase at 15 coins"
        assert h["duwende"] > m["duwende"], "Duwende treasure attraction must increase further at 30 coins"
        safe_print("PASS Check 4: Hidden wealth attraction increases encounters with bandits, warriors, and treasure-seekers.")

        # Check 5: Dambana Atang Altar UI uses Piloncitos
        cdp('Runtime.evaluate', {'expression': 'window.app.ui.openDambanaModal();'})
        time.sleep(0.4)

        dambana_check = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const badge = document.querySelector('.dambana-remnants-badge');
                    const costs = Array.from(document.querySelectorAll('.dambana-body .boon-cost')).map(el => el.textContent.trim());
                    return {
                        badgeText: badge ? badge.textContent.trim() : '',
                        costs: costs
                    };
                })()
            """,
            'returnByValue': True
        })
        dambana_res = dambana_check.get('result', {}).get('value', {})
        safe_print("Dambana Altar Check:", dambana_res)
        assert "PILONCITOS" in dambana_res["badgeText"], f"Dambana badge must say PILONCITOS, got: {dambana_res['badgeText']}"
        assert "REMNANTS" not in dambana_res["badgeText"], f"Dambana badge must not say REMNANTS, got: {dambana_res['badgeText']}"
        for cost in dambana_res["costs"]:
            assert "Piloncitos" in cost, f"Boon cost must say Piloncitos, got: {cost}"
            assert "Remnants" not in cost, f"Boon cost must not say Remnants, got: {cost}"
        safe_print("PASS Check 5: Dambana Atang Altar displays Piloncitos.")

        safe_print("ALL TESTS PASSED SUCCESSFULLY!")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()
