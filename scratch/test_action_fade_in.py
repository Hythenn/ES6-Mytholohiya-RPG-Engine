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
user_data_dir = r'C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\scratch\edge_temp_test_action_fade_in'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9235',
    f'--user-data-dir={user_data_dir}',
    '--window-size=1280,800',
    'http://localhost:8000'
])
time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9235/json').read().decode())
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
    time.sleep(1.5)

    # Skip typing so choices appear immediately
    cdp('Runtime.evaluate', {'expression': 'window.app.typewriter.skipToEnd();'})
    time.sleep(0.3)

    print('Step 2: Checking action buttons for fade-in styles...')
    res = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const btns = Array.from(document.querySelectorAll('#choices-container .choice-btn'));
                return btns.map((b, idx) => {
                    const style = window.getComputedStyle(b);
                    return {
                        text: b.textContent.trim(),
                        disabled: b.disabled,
                        hasCooldownClass: b.classList.contains('cooldown-active'),
                        animationName: style.animationName,
                        animationDuration: style.animationDuration,
                        animationDelay: style.animationDelay
                    };
                });
            })()
        """,
        'returnByValue': True
    })
    btns_info = res.get('result', {}).get('value', [])
    safe_print('Action Buttons Info', btns_info)

    assert len(btns_info) > 0, 'Action buttons must be present'
    for b in btns_info:
        assert not b['hasCooldownClass'], 'Must not have cooldown-active class'
        assert not b['disabled'], 'Buttons must not be disabled by an artificial loading cooldown'
        assert 'actionFadeIn' in b['animationName'], f"Expected animationName 'actionFadeIn', got {b['animationName']}"

    print('Step 3: Clicking first action immediately without artificial delay...')
    cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const firstBtn = document.querySelector('#choices-container .choice-btn');
                firstBtn.click();
            })()
        """
    })
    time.sleep(0.5)

    # Skip outcome typing to verify continue button appearance
    cdp('Runtime.evaluate', {'expression': 'window.app.typewriter.skipToEnd();'})
    time.sleep(0.3)

    print('Step 4: Checking Continue button for fade-in animation...')
    res_cont = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const contBtn = document.querySelector('#choices-container .choice-btn');
                if (!contBtn) return null;
                const style = window.getComputedStyle(contBtn);
                return {
                    text: contBtn.textContent.trim(),
                    hasCooldownClass: contBtn.classList.contains('cooldown-active'),
                    disabled: contBtn.disabled,
                    animationName: style.animationName
                };
            })()
        """,
        'returnByValue': True
    })
    cont_info = res_cont.get('result', {}).get('value')
    safe_print('Continue Button Info', cont_info)
    assert cont_info is not None, 'Continue button must be present'
    assert 'actionFadeIn' in cont_info['animationName'], 'Continue button must also have actionFadeIn'
    assert not cont_info['hasCooldownClass'], 'Continue button must not have cooldown-active'
    assert not cont_info['disabled'], 'Continue button must not be disabled by cooldown'

    print('ALL ACTION FADE-IN TESTS PASSED SUCCESSFULLY!')

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
