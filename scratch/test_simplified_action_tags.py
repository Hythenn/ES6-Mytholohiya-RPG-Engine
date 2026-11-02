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
user_data_dir = r'C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\scratch\edge_temp_test_tags'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9237',
    f'--user-data-dir={user_data_dir}',
    '--window-size=1280,800',
    'http://localhost:8000'
])
time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9237/json').read().decode())
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
    cdp('Runtime.evaluate', {'expression': 'window.app.typewriter.skipToEnd();'})
    time.sleep(0.3)

    print('Step 2: Checking prologue choice button tags...')
    res1 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const btns = Array.from(document.querySelectorAll('#choices-container .choice-btn'));
                return btns.map(b => ({
                    text: b.textContent.trim(),
                    tags: Array.from(b.querySelectorAll('.choice-tag')).map(t => t.textContent.trim()),
                    label: b.querySelector('.choice-label') ? b.querySelector('.choice-label').textContent.trim() : ''
                }));
            })()
        """,
        'returnByValue': True
    })
    choices1 = res1.get('result', {}).get('value', [])
    safe_print('Prologue Choices', choices1)

    assert len(choices1) > 0, 'Must have choices in prologue'
    for c in choices1:
        assert '//' not in c['text'], f"Found '//' in choice text: {c['text']}"
        for tag in c['tags']:
            assert '//' not in tag, f"Found '//' in tag: {tag}"

    # Verify stat tags like [Wisdom] or [Dexterity] exist
    all_tags = [t for c in choices1 for t in c['tags']]
    print('All tags found in prologue:', all_tags)
    assert any(t in ['[Wisdom]', '[Dexterity]', '[Strength]', '[Constitution]', '[Charisma]', '[Intelligence]'] for t in all_tags), 'Should have simplified stat tag'

    print('Step 3: Testing passive perception scenario (the apprentice pickpocket)...')
    res2 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const app = window.app;
                const player = app.world.getEntity('player');
                const stats = player.getComponent('Stats');
                stats.WIS = 18;
                stats.DEX = 18;

                const boyScenario = app.director.registry.getMiscScenarios().find(s => s.id === 'misc_weeping_orphan_pickpocket_01');
                if (!boyScenario) return { error: 'Scenario not found' };

                app.director.presentScenario(boyScenario);
                app.typewriter.skipToEnd();

                const btns = Array.from(document.querySelectorAll('#choices-container .choice-btn'));
                return btns.map(b => ({
                    text: b.textContent.trim(),
                    tags: Array.from(b.querySelectorAll('.choice-tag')).map(t => t.textContent.trim()),
                    label: b.querySelector('.choice-label') ? b.querySelector('.choice-label').textContent.trim() : ''
                }));
            })()
        """,
        'returnByValue': True
    })
    choices2 = res2.get('result', {}).get('value', [])
    safe_print('Pickpocket Scenario Choices', choices2)

    assert len(choices2) >= 3, 'Must have at least 3 choices in pickpocket scenario'
    for c in choices2:
        assert '//' not in c['text'], f"Found '//' in pickpocket choice text: {c['text']}"
        for tag in c['tags']:
            assert '//' not in tag, f"Found '//' in tag: {tag}"

    pickpocket_tags = [t for c in choices2 for t in c['tags']]
    print('Pickpocket Scenario Tags:', pickpocket_tags)
    # Check that [Instinct] is present instead of [KEEN INSTINCT // REVEALED]
    assert '[Instinct]' in pickpocket_tags, f"Expected '[Instinct]', got: {pickpocket_tags}"
    # Check that [Dexterity] is present instead of [Dexterity // Measured test]
    assert '[Dexterity]' in pickpocket_tags, f"Expected '[Dexterity]', got: {pickpocket_tags}"
    # Check that [Charisma] is present instead of [Charisma // Measured test]
    assert '[Charisma]' in pickpocket_tags, f"Expected '[Charisma]', got: {pickpocket_tags}"

    print('ALL SIMPLIFIED ACTION TAG TESTS PASSED SUCCESSFULLY!')

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
