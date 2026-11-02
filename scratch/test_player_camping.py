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
    browser_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    user_data = os.path.abspath(r"scratch\edge_profile")
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
        msg_counter = 1
        for _ in range(20):
            time.sleep(0.5)
            msg_counter += 1
            r = ws.call("Runtime.evaluate", {
                "expression": "Boolean(document.getElementById('btn-launch-start'))"
            }, msg_id=msg_counter)
            if r.get("result", {}).get("result", {}).get("value"):
                break

        msg_counter += 1
        ws.call("Runtime.evaluate", {
            "expression": "document.getElementById('btn-launch-start').click();"
        }, msg_id=msg_counter)
        time.sleep(1)

        msg_counter += 1
        ws.call("Runtime.evaluate", {
            "expression": "document.querySelector('#background-cards-grid button').click();"
        }, msg_id=msg_counter)
        time.sleep(1)

        print("Waiting for transition to core game...")
        msg_counter = 10
        for _ in range(60):
            time.sleep(0.5)
            msg_counter += 1
            r = ws.call("Runtime.evaluate", {
                "expression": """
                    (() => {
                        const overlay = document.getElementById('screen-fade-overlay');
                        const isFading = overlay && overlay.classList.contains('is-active');
                        const app = window.app;
                        const director = app && app.director;
                        return Boolean(!isFading && director && director.world);
                    })()
                """
            }, msg_id=msg_counter)
            if r.get("result", {}).get("result", {}).get("value"):
                print("Core gameplay loop active!")
                break

        # TEST 1: Verify Substory Registered
        print("\n--- TEST 1: Verify Camping Substory Registered ---")
        msg_counter += 1
        res1 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_player_camping');
                    return {
                        exists: Boolean(substory),
                        name: substory ? substory.internalName : null,
                        scenarioCount: substory ? substory.scenarios.length : 0,
                        scenarioIds: substory ? substory.scenarios.map(s => s.id) : []
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        data1 = res1.get("result", {}).get("result", {}).get("value", {})
        print("Substory Check:", json.dumps(data1, indent=2))
        assert data1.get("exists"), "sub_early_player_camping not found in registry!"
        assert data1.get("scenarioCount") == 2, f"Expected 2 scenarios, got {data1.get('scenarioCount')}"

        # TEST 2: Present Node 1 (Wilderness Trail) & Choose to Pitch Tent
        print("\n--- TEST 2: Trail Shelter Decision (Pitch Tent) ---")
        msg_counter += 1
        res2 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_player_camping');
                    const trailNode = substory.scenarios[0];
                    director.presentScenario(trailNode);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Pitch camp tent
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    const tentNode = substory.scenarios[1];
                    return {
                        hasPitchedTentTag: director.world.hasFlag('pitched_camp_tent'),
                        tentWeight: director.calculateScenarioWeight(tentNode)
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        trail_result = res2.get("result", {}).get("result", {}).get("value", {})
        print("Trail Decision Result:", json.dumps(trail_result, indent=2))
        assert trail_result.get("hasPitchedTentTag"), "pitched_camp_tent tag not set!"
        assert trail_result.get("tentWeight") >= 100.0, f"Expected tent weight >= 100, got {trail_result.get('tentWeight')}"

        # TEST 3: Present Node 2 (Inside Tent) & Test Resting Option
        print("\n--- TEST 3: Inside Tent (Sleep Until Dawn) ---")
        msg_counter += 1
        res3 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_player_camping');
                    const tentNode = substory.scenarios[1];
                    const player = director.world.getEntity('player');
                    const vit = player.getComponent('Vitality');
                    vit.current = 8; // lower HP to test healing
                    director.presentScenario(tentNode);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Sleep deeply
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        hpAfterSleep: vit.current,
                        wellRested: director.world.hasFlag('well_rested'),
                        cleansed: director.world.hasFlag('cleansed')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        sleep_result = res3.get("result", {}).get("result", {}).get("value", {})
        print("Sleep Result:", json.dumps(sleep_result, indent=2))
        assert sleep_result.get("hpAfterSleep") == 14, f"Expected 14 HP (8 + 6), got {sleep_result.get('hpAfterSleep')}"
        assert sleep_result.get("wellRested"), "well_rested flag not set!"

        # TEST 4: Inside Tent (Folklore Prep - Inverted Armor & Blessed Oil)
        print("\n--- TEST 4: Inside Tent (Inverted Armor baliktad & Wards) ---")
        msg_counter += 1
        res4 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_player_camping');
                    const tentNode = substory.scenarios[1];
                    director.presentScenario(tentNode);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 1: Inside-out armor and Blessed Lana oil
                    director.selectChoice(1);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        clothingInsideOut: director.world.hasFlag('clothing_inside_out'),
                        blessedWeapon: director.world.hasFlag('blessed_weapon')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        folklore_result = res4.get("result", {}).get("result", {}).get("value", {})
        print("Folklore Prep Result:", json.dumps(folklore_result, indent=2))
        assert folklore_result.get("clothingInsideOut"), "clothing_inside_out flag not set!"
        assert folklore_result.get("blessedWeapon"), "blessed_weapon flag not set!"

        # TEST 5: Inside Tent (High Heat Danger / Failed Scent Masking Ambush Tag)
        print("\n--- TEST 5: Scent Decontamination Check ---")
        msg_counter += 1
        res5 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_player_camping');
                    const tentNode = substory.scenarios[1];
                    director.presentScenario(tentNode);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 2 with forced check failure
                    director.selectChoice(2, null, { success: false, statKey: 'DEX', total: 6, dc: 11 });
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        bloodiedGear: director.world.hasFlag('bloodied_gear'),
                        nocturnalCampAmbush: director.world.hasFlag('nocturnal_camp_ambush')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        danger_result = res5.get("result", {}).get("result", {}).get("value", {})
        print("Danger Result (Failed Wash):", json.dumps(danger_result, indent=2))
        assert danger_result.get("nocturnalCampAmbush"), "nocturnal_camp_ambush tag not emitted on failed scent wash!"

        print("\nALL 5 CAMPING & SHELTER TESTS PASSED WITH 100% SUCCESS!")
        ws.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
