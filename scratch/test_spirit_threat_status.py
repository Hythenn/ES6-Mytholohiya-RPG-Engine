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
user_data_dir = r'C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\scratch\edge_temp_test_spirit_threat'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9236',
    f'--user-data-dir={user_data_dir}',
    '--window-size=1280,800',
    'http://localhost:8000'
])
time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9236/json').read().decode())
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

    print('Step 2: Checking initial Spirit Threat badge and meter header...')
    res1 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const badge = document.getElementById('panganib-tier-badge');
                const header = document.getElementById('panganib-value').previousElementSibling;
                return {
                    badgeText: badge ? badge.textContent.trim() : null,
                    badgeClass: badge ? badge.className : null,
                    headerText: header ? header.textContent.trim() : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Initial Tier State', res1.get('result', {}).get('value'))
    v1 = res1.get('result', {}).get('value', {})
    assert v1.get('badgeText') == 'SERENE', f"Expected 'SERENE', got: {v1.get('badgeText')}"
    assert 'Tahimik' not in v1.get('badgeText'), 'Must not contain Tagalog word Tahimik'
    assert 'PANGANIB' not in v1.get('headerText'), 'Meter header must not have PANGANIB'
    assert 'SPIRIT SCENT' in v1.get('headerText'), 'Meter header must contain SPIRIT SCENT'

    print('Step 3: Modifying heat to 35 (Unsettled tier)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("danger:modifyHeat", { delta: 25, source: "Test" });'
    })
    time.sleep(0.3)
    res2 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const badge = document.getElementById('panganib-tier-badge');
                return {
                    badgeText: badge ? badge.textContent.trim() : null,
                    badgeClass: badge ? badge.className : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Tier 2 State', res2.get('result', {}).get('value'))
    v2 = res2.get('result', {}).get('value', {})
    assert v2.get('badgeText') == 'UNSETTLED', f"Expected 'UNSETTLED', got: {v2.get('badgeText')}"
    assert 'Ligaw' not in v2.get('badgeText'), 'Must not contain Tagalog word Ligaw'

    print('Step 4: Modifying heat to 60 (Blood Scent tier)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("danger:modifyHeat", { delta: 25, source: "Test" });'
    })
    time.sleep(0.3)
    res3 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const badge = document.getElementById('panganib-tier-badge');
                return {
                    badgeText: badge ? badge.textContent.trim() : null,
                    badgeClass: badge ? badge.className : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Tier 3 State', res3.get('result', {}).get('value'))
    v3 = res3.get('result', {}).get('value', {})
    assert v3.get('badgeText') == 'BLOOD SCENT', f"Expected 'BLOOD SCENT', got: {v3.get('badgeText')}"
    assert 'Amoy' not in v3.get('badgeText'), 'Must not contain Tagalog word Amoy'

    print('Step 5: Modifying heat to 85 (Hunted tier)...')
    cdp('Runtime.evaluate', {
        'expression': 'window.app.eventBus.emit("danger:modifyHeat", { delta: 25, source: "Test" });'
    })
    time.sleep(0.3)
    res4 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const badge = document.getElementById('panganib-tier-badge');
                return {
                    badgeText: badge ? badge.textContent.trim() : null,
                    badgeClass: badge ? badge.className : null
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Tier 4 State', res4.get('result', {}).get('value'))
    v4 = res4.get('result', {}).get('value', {})
    assert v4.get('badgeText') == 'HUNTED', f"Expected 'HUNTED', got: {v4.get('badgeText')}"
    assert 'Panganib' not in v4.get('badgeText'), 'Must not contain Tagalog word Panganib'

    print('ALL SPIRIT THREAT STATUS TESTS PASSED SUCCESSFULLY!')

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
