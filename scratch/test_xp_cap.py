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

def safe_print(label, obj):
    s = f'{label}: {json.dumps(obj, indent=2)}'
    print(s.encode('ascii', 'replace').decode('ascii'))

edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'
user_data_dir = r'C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\scratch\edge_temp_test_xp'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9238',
    f'--user-data-dir={user_data_dir}',
    '--window-size=1280,800',
    'http://localhost:8000'
])
time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9238/json').read().decode())
    target = next(t for t in tabs if 'http://localhost:8000' in t.get('url', ''))
    ws = SimpleWS(target['webSocketDebuggerUrl'])

    msg_id = 0
    def cdp(method, params=None):
        global msg_id
        msg_id += 1
        ws.send({'id': msg_id, 'method': method, 'params': params or {}})
        while True:
            m = ws.recv()
            if m.get('id') == msg_id: return m.get('result', {})

    cdp('Runtime.enable')
    cdp('Page.enable')
    time.sleep(1)

    print('Step 1: Starting prologue...')
    cdp('Runtime.evaluate', {'expression': 'document.getElementById("btn-launch-start").click();'})
    time.sleep(0.5)
    cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
    time.sleep(1.2)

    print('Step 2: Checking initial Level 1 XP (Base Cap 15)...')
    res1 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const player = window.app.world.getEntity('player');
                const exp = player.getComponent('Experience');
                const badge = document.getElementById('char-level-badge');
                const xpVal = document.getElementById('xp-value');
                return {
                    level: exp.level,
                    currentXp: exp.currentXp,
                    nextLevelXp: exp.nextLevelXp,
                    badgeText: badge ? badge.textContent.trim() : null,
                    xpValText: xpVal ? xpVal.textContent.trim() : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Level 1 XP State', res1.get('result', {}).get('value'))
    v1 = res1.get('result', {}).get('value', {})
    assert v1.get('level') == 1, 'Initial level must be 1'
    assert v1.get('currentXp') == 0, 'Initial currentXp must be 0'
    assert v1.get('nextLevelXp') == 15, f"Initial cap must be 15, got: {v1.get('nextLevelXp')}"
    assert v1.get('xpValText') == '0 / 15 XP', f"HUD text must be '0 / 15 XP', got: {v1.get('xpValText')}"

    print('Step 3: Gaining +15 XP to reach Level 2 (Cap: Math.ceil(15 * 1.8) = 27)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("player:gainXp", { amount: 15, source: "Test Step" });'
    })
    time.sleep(0.2)
    res2 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const player = window.app.world.getEntity('player');
                const exp = player.getComponent('Experience');
                const badge = document.getElementById('char-level-badge');
                const xpVal = document.getElementById('xp-value');
                return {
                    level: exp.level,
                    currentXp: exp.currentXp,
                    nextLevelXp: exp.nextLevelXp,
                    badgeText: badge ? badge.textContent.trim() : null,
                    xpValText: xpVal ? xpVal.textContent.trim() : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Level 2 XP State', res2.get('result', {}).get('value'))
    v2 = res2.get('result', {}).get('value', {})
    assert v2.get('level') == 2, 'Level must be 2'
    assert v2.get('currentXp') == 0, 'Current XP should reset to 0 after exact level up'
    assert v2.get('nextLevelXp') == 27, f"Level 2 cap must be 27, got: {v2.get('nextLevelXp')}"
    assert v2.get('badgeText') == 'LV 2', f"Badge text must be 'LV 2', got: {v2.get('badgeText')}"
    assert v2.get('xpValText') == '0 / 27 XP', f"HUD text must be '0 / 27 XP', got: {v2.get('xpValText')}"

    print('Step 4: Gaining +27 XP to reach Level 3 (Cap: Math.ceil(27 * 1.8) = 49)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("player:gainXp", { amount: 27, source: "Test Step" });'
    })
    time.sleep(0.2)
    res3 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const player = window.app.world.getEntity('player');
                const exp = player.getComponent('Experience');
                const badge = document.getElementById('char-level-badge');
                const xpVal = document.getElementById('xp-value');
                return {
                    level: exp.level,
                    currentXp: exp.currentXp,
                    nextLevelXp: exp.nextLevelXp,
                    badgeText: badge ? badge.textContent.trim() : null,
                    xpValText: xpVal ? xpVal.textContent.trim() : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Level 3 XP State', res3.get('result', {}).get('value'))
    v3 = res3.get('result', {}).get('value', {})
    assert v3.get('level') == 3, 'Level must be 3'
    assert v3.get('nextLevelXp') == 49, f"Level 3 cap must be 49, got: {v3.get('nextLevelXp')}"
    assert v3.get('xpValText') == '0 / 49 XP', f"HUD text must be '0 / 49 XP', got: {v3.get('xpValText')}"

    print('Step 5: Gaining +49 XP to reach Level 4 (Cap: Math.ceil(49 * 1.8) = 89)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("player:gainXp", { amount: 49, source: "Test Step" });'
    })
    time.sleep(0.2)
    res4 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const player = window.app.world.getEntity('player');
                const exp = player.getComponent('Experience');
                return {
                    level: exp.level,
                    currentXp: exp.currentXp,
                    nextLevelXp: exp.nextLevelXp
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Level 4 XP State', res4.get('result', {}).get('value'))
    v4 = res4.get('result', {}).get('value', {})
    assert v4.get('level') == 4, 'Level must be 4'
    assert v4.get('nextLevelXp') == 89, f"Level 4 cap must be 89, got: {v4.get('nextLevelXp')}"

    print('Step 6: Gaining +89 XP to reach Level 5 (Cap: Math.ceil(89 * 1.8) = 161)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("player:gainXp", { amount: 89, source: "Test Step" });'
    })
    time.sleep(0.2)
    res5 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const player = window.app.world.getEntity('player');
                const exp = player.getComponent('Experience');
                return {
                    level: exp.level,
                    currentXp: exp.currentXp,
                    nextLevelXp: exp.nextLevelXp
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Level 5 XP State', res5.get('result', {}).get('value'))
    v5 = res5.get('result', {}).get('value', {})
    assert v5.get('level') == 5, 'Level must be 5'
    assert v5.get('nextLevelXp') == 161, f"Level 5 cap must be 161, got: {v5.get('nextLevelXp')}"

    print('ALL XP CAP PROGRESSION TESTS PASSED SUCCESSFULLY!')

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()

