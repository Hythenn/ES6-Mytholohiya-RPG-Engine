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
user_data_dir = r'C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442\scratch\edge_temp_test_stat_tooltips'

proc = subprocess.Popen([
    edge_path,
    '--headless',
    '--disable-gpu',
    '--remote-debugging-port=9233',
    f'--user-data-dir={user_data_dir}',
    '--window-size=1280,800',
    'http://localhost:8000'
])
time.sleep(2)

try:
    tabs = json.loads(urllib.request.urlopen('http://localhost:9233/json').read().decode())
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

    print('Test 1: Preset Background Cards stat-pill hover...')
    res = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const pill = document.querySelector('#background-cards-grid .stat-pill[data-stat="INT"]');
                if (!pill) return { error: 'No INT pill found in background cards' };
                const rect = pill.getBoundingClientRect();
                const mouseover = new MouseEvent('mouseover', {
                    bubbles: true,
                    clientX: rect.left + 5,
                    clientY: rect.top + 5
                });
                pill.dispatchEvent(mouseover);

                const tip = document.getElementById('stat-hover-tooltip');
                return {
                    pillDataStat: pill.getAttribute('data-stat'),
                    pillDataVal: pill.getAttribute('data-val'),
                    tipExists: !!tip,
                    tipHidden: tip ? tip.hidden : true,
                    tipText: tip ? tip.textContent : '',
                    tipHtml: tip ? tip.innerHTML : ''
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Preset INT Pill Hover Result', res.get('result', {}).get('value'))
    v = res.get('result', {}).get('value', {})
    assert v.get('tipExists'), 'Tooltip element must exist'
    assert not v.get('tipHidden'), 'Tooltip must not be hidden'
    assert 'INTELLIGENCE' in v.get('tipText'), 'Must contain INTELLIGENCE'
    assert 'conceptualization' in v.get('tipText').lower(), 'Must explain conceptualization'
    assert 'SCENARIO ENCOUNTERS' in v.get('tipText'), 'Must contain SCENARIO ENCOUNTERS section'

    print('Test 2: Fate-Forged Unique Vessel stat-pill hover...')
    res2 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const tab = document.querySelector('.creator-tab[data-tab="tab-random"]');
                if (tab) tab.click();
                const pill = document.querySelector('#random-character-showcase .stat-pill[data-stat="WIS"]');
                if (!pill) return { error: 'No WIS pill in random showcase' };
                const rect = pill.getBoundingClientRect();
                const mouseover = new MouseEvent('mouseover', {
                    bubbles: true,
                    clientX: rect.left + 5,
                    clientY: rect.top + 5
                });
                pill.dispatchEvent(mouseover);

                const tip = document.getElementById('stat-hover-tooltip');
                return {
                    pillDataStat: pill.getAttribute('data-stat'),
                    pillDataVal: pill.getAttribute('data-val'),
                    tipText: tip ? tip.textContent : ''
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Fate-Forged WIS Pill Hover Result', res2.get('result', {}).get('value'))
    v2 = res2.get('result', {}).get('value', {})
    assert 'WISDOM' in v2.get('tipText'), 'Must contain WISDOM'
    assert 'instinct perception' in v2.get('tipText').lower(), 'Must explain instinct perception'

    print('Test 3: Custom Allocator stat row hover...')
    res3 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const tab = document.querySelector('.creator-tab[data-tab="tab-custom"]');
                if (tab) tab.click();
                const infoDiv = document.querySelector('#custom-stat-allocator .stat-alloc-info[data-stat="STR"]');
                if (!infoDiv) return { error: 'No STR infoDiv in custom allocator' };
                const rect = infoDiv.getBoundingClientRect();
                const mouseover = new MouseEvent('mouseover', {
                    bubbles: true,
                    clientX: rect.left + 5,
                    clientY: rect.top + 5
                });
                infoDiv.dispatchEvent(mouseover);

                const tip = document.getElementById('stat-hover-tooltip');
                return {
                    stat: infoDiv.getAttribute('data-stat'),
                    val: infoDiv.getAttribute('data-val'),
                    tipText: tip ? tip.textContent : ''
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Custom Allocator STR Hover Result', res3.get('result', {}).get('value'))
    v3 = res3.get('result', {}).get('value', {})
    assert 'STRENGTH' in v3.get('tipText'), 'Must contain STRENGTH'

    print('Test 4: In-Game Character Info & Gear Modal (#stats-list) hover...')
    cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
    time.sleep(1.2)

    res4 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const app = window.app;
                app.ui.openCharInfoModal();

                // Find CON stat in modal list
                const conItem = document.querySelector('#stats-list .stat-item[data-stat="CON"]');
                if (!conItem) return { error: 'CON stat item not found in modal' };

                const rect = conItem.getBoundingClientRect();
                const mouseover = new MouseEvent('mouseover', {
                    bubbles: true,
                    clientX: rect.left + 10,
                    clientY: rect.top + 10
                });
                conItem.dispatchEvent(mouseover);

                const tip = document.getElementById('stat-hover-tooltip');
                const zIndex = window.getComputedStyle(tip).zIndex;
                return {
                    stat: conItem.getAttribute('data-stat'),
                    val: conItem.getAttribute('data-val'),
                    tipHidden: tip.hidden,
                    zIndex,
                    tipText: tip.textContent
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Modal CON Stat Hover Result', res4.get('result', {}).get('value'))
    v4 = res4.get('result', {}).get('value', {})
    assert 'CONSTITUTION' in v4.get('tipText'), 'Must contain CONSTITUTION'
    score_val = int(v4.get('val'))
    expected_mod = (score_val - 10) // 2
    mod_str = f"+{expected_mod}" if expected_mod >= 0 else f"{expected_mod}"
    assert f"Score {score_val} ({mod_str})" in v4.get('tipText'), f"Must display Score {score_val} ({mod_str})"
    assert int(v4.get('zIndex')) >= 1000, 'Z-index must be at least 1000 to overlay modal'

    print('Test 5: Mouseout hides stat tooltip...')
    res5 = cdp('Runtime.evaluate', {
        'expression': """
            (() => {
                const conItem = document.querySelector('#stats-list .stat-item[data-stat="CON"]');
                const mouseout = new MouseEvent('mouseout', {
                    bubbles: true
                });
                conItem.dispatchEvent(mouseout);

                const tip = document.getElementById('stat-hover-tooltip');
                return {
                    tipHidden: tip ? tip.hidden : true
                };
            })()
        """,
        'returnByValue': True
    })
    safe_print('Mouseout Hide Result', res5.get('result', {}).get('value'))
    v5 = res5.get('result', {}).get('value', {})
    assert v5.get('tipHidden'), 'Tooltip must be hidden on mouseout'

    print('ALL STAT TOOLTIP TESTS PASSED SUCCESSFULLY!')

finally:
    proc.terminate()
    try:
        proc.wait(timeout=2)
    except Exception:
        proc.kill()
