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
    user_data = os.path.abspath(r"scratch\edge_profile_rescue")
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

        ws.call("Runtime.evaluate", {
            "expression": "if (document.getElementById('btn-launch-start')) document.getElementById('btn-launch-start').click();"
        }, msg_id=2)
        time.sleep(1)

        ws.call("Runtime.evaluate", {
            "expression": "const b = document.querySelector('#background-cards-grid button'); if (b) b.click();"
        }, msg_id=3)
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
        print("\n--- TEST 1: Verify Substory Registered ---")
        msg_counter += 1
        res1 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_merchant_rescue');
                    return {
                        exists: Boolean(substory),
                        name: substory ? substory.internalName : null,
                        scenarioCount: substory ? substory.scenarios.length : 0
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        data1 = res1.get("result", {}).get("result", {}).get("value", {})
        print("Substory Check:", json.dumps(data1, indent=2))
        assert data1.get("exists"), "sub_early_merchant_rescue substory not found in registry!"

        # TEST 2: Present Node 1 (Combat with Sigbin hounds)
        print("\n--- TEST 2: Present Node 1 (Combat) & Execute Rescue ---")
        msg_counter += 1
        res2 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_merchant_rescue');
                    const scn1 = substory.scenarios[0];
                    director.presentScenario(scn1);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        id: scn1.id,
                        label: scn1.locationLabel,
                        choicesCount: scn1.choices.length
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        print("Presented Node 1:", res2.get("result", {}).get("result", {}).get("value"))

        time.sleep(0.5)
        # Choose option 0 (Combat success with Bagacay Spear)
        msg_counter += 1
        res_choice = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    // Force success resolution override for check
                    director.selectChoice(0, null, { success: true, statKey: 'DEX', total: 18, dc: 13 });
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    const world = director.world;
                    return {
                        hasRescuedTag: world.hasFlag('rescued_merchant_lito'),
                        activeTags: Array.from(director.activeTags)
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        state_after_combat = res_choice.get("result", {}).get("result", {}).get("value", {})
        print("State After Combat:", json.dumps(state_after_combat, indent=2))
        assert state_after_combat.get("hasRescuedTag"), "rescued_merchant_lito flag was not emitted on success!"

        # TEST 3: Verify Affinity Weight Chaining to Node 2
        print("\n--- TEST 3: Verify Affinity Weight Chaining to Node 2 ---")
        msg_counter += 1
        res_weight = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_merchant_rescue');
                    const scn2 = substory.scenarios[1];
                    const weight = director.calculateScenarioWeight(scn2);
                    return {
                        scn2Id: scn2.id,
                        calculatedWeight: weight
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        weight_data = res_weight.get("result", {}).get("result", {}).get("value", {})
        print("Node 2 Weight after Tag Emission:", json.dumps(weight_data, indent=2))
        assert weight_data.get("calculatedWeight") >= 10.0, "Node 2 did not receive massive affinity weight from rescued tag!"

        # TEST 4: Present Node 2 (Dialogue with Mang Tasyo) and choose Cartography / Intel
        print("\n--- TEST 4: Present Node 2 (Dialogue) & Unlock Locations / Faction Standing ---")
        msg_counter += 1
        res_dialogue = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_merchant_rescue');
                    const scn2 = substory.scenarios[1];
                    director.presentScenario(scn2);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        id: scn2.id,
                        label: scn2.locationLabel,
                        choices: scn2.choices.map(c => c.text)
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        dialogue_info = res_dialogue.get("result", {}).get("result", {}).get("value", {})
        print("Node 2 Dialogue Choices rendered:", json.dumps(dialogue_info, indent=2))

        # Select Choice 0: Inquire about secret waterways and hidden locations
        time.sleep(0.5)
        msg_counter += 1
        res_choice2 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    director.selectChoice(0, null, { success: true, statKey: 'WIS', total: 15, dc: 10 });
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    const world = director.world;
                    return {
                        unlockedLocationSaltFlats: world.hasFlag('unlocked_loc_hidden_salt_flats') || world.hasFlag('unlocked_location_salt_flats'),
                        knowsGatecode: world.hasFlag('knows_kota_dula_gatecode'),
                        repRajahnateTrusted: world.hasFlag('rep_rajahnate_trusted')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        state_after_dialogue = res_choice2.get("result", {}).get("result", {}).get("value", {})
        print("State After Inquiring About Hidden Routes:", json.dumps(state_after_dialogue, indent=2))
        assert state_after_dialogue.get("unlockedLocationSaltFlats"), "Hidden salt flats location flag not unlocked!"
        assert state_after_dialogue.get("repRajahnateTrusted"), "rep_rajahnate_trusted tag not set!"

        print("\nALL CHAINED SCENARIO & INTEL TESTS PASSED WITH 100% SUCCESS!")
        ws.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
