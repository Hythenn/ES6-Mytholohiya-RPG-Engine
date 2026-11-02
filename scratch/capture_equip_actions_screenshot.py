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
        time.sleep(0.5)

        # Start game with Mandirigma (has torso, weapon, etc.)
        cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
        time.sleep(1.2)

        # Open Character Info & Gear modal
        cdp('Runtime.evaluate', {'expression': 'document.getElementById("btn-open-char-info").click();'})
        time.sleep(0.5)

        # Click the first occupied slot row to reveal its action buttons
        cdp('Runtime.evaluate', {'expression': """
            const occ = document.querySelector('#equipment-slots-grid .equip-slot-row.occupied');
            if (occ) occ.click();
        """})
        time.sleep(0.3)

        # Take screenshot of the Character Info & Gear modal
        shot_res = cdp('Page.captureScreenshot', {'format': 'png'})
        data = base64.b64decode(shot_res['data'])

        artifact_dir = r"C:\Users\kenne\.gemini\antigravity\brain\5d1f663b-a160-4661-96b0-e340b5178442"
        shot_path = os.path.join(artifact_dir, "char_info_gear_actions_verified.png")
        with open(shot_path, "wb") as f:
            f.write(data)

        print(f"Screenshot successfully saved to {shot_path}")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()

