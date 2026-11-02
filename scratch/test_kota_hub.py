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
    user_data = os.path.abspath(r"scratch\edge_profile_hub")
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
        print("\n--- TEST 1: Verify Kota Hub Substory Registered ---")
        msg_counter += 1
        res1 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_kota_hub');
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
        assert data1.get("exists"), "sub_early_kota_hub substory not found in registry!"
        assert data1.get("scenarioCount") == 4, f"Expected 4 scenarios, got {data1.get('scenarioCount')}"

        # TEST 2: Present Node 1 (Central Plaza Hub) & Route to Riverside Market
        print("\n--- TEST 2: Central Plaza Hub & Routing to Market ---")
        msg_counter += 1
        res2 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_kota_hub');
                    const hub = substory.scenarios[0];
                    director.presentScenario(hub);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Wander down toward Riverside Market
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    const marketScn = substory.scenarios[1];
                    return {
                        hasMarketTag: director.world.hasFlag('at_kota_market'),
                        marketWeight: director.calculateScenarioWeight(marketScn)
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        market_routing = res2.get("result", {}).get("result", {}).get("value", {})
        print("Market Routing State:", json.dumps(market_routing, indent=2))
        assert market_routing.get("hasMarketTag"), "at_kota_market tag not set!"
        assert market_routing.get("marketWeight") >= 100.0, "Market scenario weight was not boosted to >= 100!"

        # TEST 3: Present Market & Listen to Kudlong Epic Chanter (Heat Reduction & Lore)
        print("\n--- TEST 3: Riverside Market Epic Chanting ---")
        msg_counter += 1
        res3 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_kota_hub');
                    const marketScn = substory.scenarios[1];
                    director.presentScenario(marketScn);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Listen to Kudlong chanter
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        learnedMoonLore: director.world.hasFlag('learned_moon_lore'),
                        steadyNerves: director.world.hasFlag('steady_nerves')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        chanter_result = res3.get("result", {}).get("result", {}).get("value", {})
        print("Chanter Result:", json.dumps(chanter_result, indent=2))
        assert chanter_result.get("learnedMoonLore"), "learned_moon_lore flag not set!"

        # TEST 4: Present Tavern & Rest with Tuba Palm Wine (+8 HP, -3 Piloncitos, -30 Danger Heat)
        print("\n--- TEST 4: Longhouse Tavern Resting ---")
        msg_counter += 1
        res4 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_kota_hub');
                    const tavernScn = substory.scenarios[2];
                    const player = director.world.getEntity('player');
                    const vit = player.getComponent('Vitality');
                    vit.current = 10; // lower HP to verify healing
                    director.presentScenario(tavernScn);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Pay 3 Piloncitos to drink Tuba and rest on abaca mat
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        hpAfterRest: vit.current,
                        wellRested: director.world.hasFlag('well_rested'),
                        cleansed: director.world.hasFlag('cleansed')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        tavern_result = res4.get("result", {}).get("result", {}).get("value", {})
        print("Tavern Rest Result:", json.dumps(tavern_result, indent=2))
        assert tavern_result.get("hpAfterRest") > 10, f"Expected HP to be restored after rest, got {tavern_result.get('hpAfterRest')}"
        assert tavern_result.get("wellRested"), "well_rested flag not set!"

        # TEST 5: Present Shrine & Atang Offering (-2 Piloncitos, -25 Danger Heat, Cures Afflictions)
        print("\n--- TEST 5: Ancestral Dambana Shrine & Atang Offering ---")
        msg_counter += 1
        res5 = ws.call("Runtime.evaluate", {
            "expression": """
                (() => {
                    const director = window.app.director;
                    const substory = director.registry.getSubstory('sub_early_kota_hub');
                    const shrineScn = substory.scenarios[3];
                    director.presentScenario(shrineScn);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    // Select Choice 0: Atang offering
                    director.selectChoice(0);
                    if (director.typewriter) {
                        director.typewriter.skipToEnd();
                    }
                    return {
                        anitoBlessed: director.world.hasFlag('anito_blessed'),
                        cleansed: director.world.hasFlag('cleansed')
                    };
                })()
            """,
            "returnByValue": True
        }, msg_id=msg_counter)
        shrine_result = res5.get("result", {}).get("result", {}).get("value", {})
        print("Shrine Atang Result:", json.dumps(shrine_result, indent=2))
        assert shrine_result.get("anitoBlessed"), "anito_blessed flag not set!"

        print("\nALL 5 KOTA HUB TESTS PASSED WITH 100% SUCCESS!")
        ws.close()
    finally:
        proc.terminate()

if __name__ == "__main__":
    main()
