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
        head = self.sock.recv(2)
        if not head:
            return None
        b1, b2 = struct.unpack('!BB', head)
        payload_len = b2 & 0x7F
        if payload_len == 126:
            ext = self.sock.recv(2)
            payload_len = struct.unpack('!H', ext)[0]
        elif payload_len == 127:
            ext = self.sock.recv(8)
            payload_len = struct.unpack('!Q', ext)[0]
        data = b''
        while len(data) < payload_len:
            chunk = self.sock.recv(payload_len - len(data))
            if not chunk:
                break
            data += chunk
        return json.loads(data.decode('utf-8', errors='ignore'))

    def call(self, method, params=None, msg_id=1):
        msg = {'id': msg_id, 'method': method}
        if params:
            msg['params'] = params
        self.send(msg)
        while True:
            res = self.recv()
            if res and res.get('id') == msg_id:
                return res

    def close(self):
        self.sock.close()

def main():
    # 1. Remove the old root scenario files
    base_dir = os.path.join('js', 'data', 'scenarios')
    old_files = [
        'EarlyGameBalete.js',
        'EarlyGameSaltTrail.js',
        'HumanFactions.js',
        'LateGameBakunawaMaw.js',
        'MidGameTerraces.js',
        'MiscScenarios.js',
        'PeopleAndTerrainScenarios.js'
    ]
    for fn in old_files:
        p = os.path.join(base_dir, fn)
        if os.path.exists(p):
            os.remove(p)
            print(f"Removed deprecated file: {fn}")

    browser_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = os.path.abspath(r"scratch\edge_profile_verify")
    browser_cmd = [
        browser_path,
        "--headless=new",
        "--remote-debugging-port=9222",
        f"--user-data-dir={user_data}",
        "--disable-gpu",
        "--no-sandbox",
        "http://localhost:8000/index.html"
    ]
    proc = subprocess.Popen(browser_cmd)
    time.sleep(2)

    try:
        targets_raw = urllib.request.urlopen("http://localhost:9222/json").read()
        targets = json.loads(targets_raw)
        page_target = next(t for t in targets if t.get("type") == "page")
        ws_url = page_target["webSocketDebuggerUrl"]

        ws = SimpleWS(ws_url)
        ws.call("Page.enable")
        ws.call("Runtime.enable")

        print("Waiting for page load and engine initialization...")
        time.sleep(2)

        # Click launch start if needed
        ws.call("Runtime.evaluate", {
            "expression": "if (document.getElementById('btn-launch-start')) document.getElementById('btn-launch-start').click();"
        }, msg_id=2)
        time.sleep(1)

        # Click first background card if needed
        ws.call("Runtime.evaluate", {
            "expression": "const b = document.querySelector('#background-cards-grid button'); if (b) b.click();"
        }, msg_id=3)
        time.sleep(1)

        print("Waiting for transition to core game...")
        msg_counter = 10
        for _ in range(30):
            time.sleep(0.5)
            msg_counter += 1
            r = ws.call("Runtime.evaluate", {
                "expression": "Boolean(window.app && window.app.director && window.app.director.world && !document.body.classList.contains('fade-active'))"
            }, msg_id=msg_counter)
            if r.get("result", {}).get("result", {}).get("value"):
                print("Core gameplay loop active!")
                break

        msg_counter += 1
        eval_res = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app ? window.app.director : null;
                    if (!director || !director.registry) {
                        return { error: 'Director or registry not found' };
                    }
                    const misc = director.registry.getMiscScenarios();
                    const substories = director.registry.getAllSubstories();
                    const miscIds = misc.map(s => s.id);

                    const testIds = [
                        'misc_tikbalang_grove_01',
                        'misc_kapre_bough_01',
                        'misc_diwata_waterfall_01',
                        'misc_ancestral_altar_01',
                        'misc_batibat_nightmare_01',
                        'misc_berbalang_astral_01',
                        'misc_kubo_tapahan_01',
                        'misc_crowded_kedatuan_market_01',
                        'misc_blind_potter_01',
                        'misc_salt_widow_01',
                        'misc_slick_peddler_01',
                        'misc_weeping_orphan_pickpocket_01',
                        'misc_hunter_campfire_01',
                        'misc_roadside_taboan_hearth_01',
                        'misc_rattan_bridge_chasm_01',
                        'misc_karst_limestone_scree_01',
                        'faction_kota_dula_gate_01',
                        'faction_baliana_sacred_grove_01',
                        'faction_karakoa_pirate_cove_01',
                        'faction_aswang_village_dusk_01',
                        'faction_headhunters_karst_pass_01'
                    ];

                    const missing = testIds.filter(id => !miscIds.includes(id));

                    return {
                        miscCount: misc.length,
                        substoryCount: substories.length,
                        missing,
                        substoryIds: substories.map(s => s.substoryId)
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)

        print("Raw eval response:", json.dumps(eval_res))
        result = eval_res.get("result", {}).get("result", {}).get("value", {})
        print("Verification Result:", json.dumps(result, indent=2))

        assert result.get('miscCount') == 45, f"Expected 45 misc scenarios, got {result.get('miscCount')}"
        assert result.get('substoryCount') == 4, f"Expected 4 substories, got {result.get('substoryCount')}"
        assert len(result.get('missing', [])) == 0, f"Missing scenarios: {result.get('missing')}"

        print("SUCCESS! All 39 misc scenarios and 4 substories are registered correctly through subfolders!")
        ws.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
