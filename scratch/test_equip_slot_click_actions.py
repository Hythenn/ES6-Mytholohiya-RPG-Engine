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

        # Start game with Babaylan or Mandirigma
        cdp('Runtime.evaluate', {'expression': 'document.querySelector("#background-cards-grid button").click();'})
        time.sleep(1.2)

        # Open Character Info & Gear modal
        cdp('Runtime.evaluate', {'expression': 'document.getElementById("btn-open-char-info").click();'})
        time.sleep(0.5)

        # Check 1: Initial state of equipment slots modal
        res1 = cdp('Runtime.evaluate', {
            'expression': """
                (() => {
                    const modal = document.getElementById('char-info-modal');
                    const isVisible = !modal.hidden && modal.style.display !== 'none';
                    const rows = Array.from(document.querySelectorAll('#equipment-slots-grid .equip-slot-row'));
                    const occupiedRows = rows.filter(r => r.classList.contains('occupied'));
                    const actionBoxes = Array.from(document.querySelectorAll('#equipment-slots-grid .slot-action-buttons'));
                    return {
                        modalVisible: isVisible,
                        totalSlots: rows.length,
                        occupiedSlots: occupiedRows.map(r => r.dataset.slotId),
                        actionBoxesCount: actionBoxes.length
                    };
                })()
            """,
            'returnByValue': True
        })
        initial_check = res1.get('result', {}).get('value', {})
        print("Initial Slots State:", json.dumps(initial_check, indent=2))
        assert initial_check["modalVisible"], "Modal must be visible"
        assert initial_check["totalSlots"] == 14, "Must have 14 slots"
        assert len(initial_check["occupiedSlots"]) > 0, "Must have occupied slots"
        assert initial_check["actionBoxesCount"] == 0, f"No action buttons should be visible initially! Found: {initial_check['actionBoxesCount']}"
        print("PASS Check 1: 0 action buttons visible initially.")

        target_slot_id = initial_check["occupiedSlots"][0]

        # Check 2: Click the first occupied slot row
        res2 = cdp('Runtime.evaluate', {
            'expression': f"""
                (() => {{
                    const row = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    if (!row) return null;
                    row.click();
                    const updatedRow = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    const actionBox = updatedRow ? updatedRow.querySelector('.slot-action-buttons') : null;
                    const btns = actionBox ? Array.from(actionBox.querySelectorAll('button')).map(b => b.textContent.trim()) : [];
                    return {{
                        slotId: '{target_slot_id}',
                        isSelected: updatedRow ? updatedRow.classList.contains('selected') : false,
                        buttons: btns
                    }};
                }})()
            """,
            'returnByValue': True
        })
        click_res = res2.get('result', {}).get('value', {})
        print("Occupied Slot Clicked:", json.dumps(click_res, indent=2))
        assert click_res["isSelected"], "Row must be selected on click"
        assert len(click_res["buttons"]) >= 1, "Must show action options when clicked"
        assert "Unequip" in click_res["buttons"], "Must include Unequip option"
        print(f"PASS Check 2: Clicked slot {click_res['slotId']}, revealed actions: {click_res['buttons']}")

        # Check 3: Click 'Wear Inside-Out' if available
        has_flip = any("Inside-Out" in b for b in click_res["buttons"])
        if has_flip:
            res3 = cdp('Runtime.evaluate', {
                'expression': f"""
                    (() => {{
                        const row = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                        const flipBtn = row.querySelector('.btn-flip-slot');
                        if (!flipBtn) return null;
                        flipBtn.click();
                        const updatedRow = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                        return {{
                            rowText: updatedRow.querySelector('.slot-item-name').textContent.trim(),
                            flipBtnText: updatedRow.querySelector('.btn-flip-slot') ? updatedRow.querySelector('.btn-flip-slot').textContent.trim() : null
                        }};
                    }})()
                """,
                'returnByValue': True
            })
            flip_res = res3.get('result', {}).get('value', {})
            print("After Wear Inside-Out:", json.dumps(flip_res, indent=2))
            assert "[INSIDE-OUT]" in flip_res["rowText"], f"Expected [INSIDE-OUT] in text, got: {flip_res['rowText']}"
            assert flip_res["flipBtnText"] == "Wear Normally", f"Flip button should change to Wear Normally, got: {flip_res['flipBtnText']}"
            print("PASS Check 3: Wear Inside-Out toggled and updated button to 'Wear Normally'.")

        # Check 4: Click the row again to collapse it
        res4 = cdp('Runtime.evaluate', {
            'expression': f"""
                (() => {{
                    const row = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    row.click();
                    const updatedRow = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    const actionBoxes = Array.from(document.querySelectorAll('#equipment-slots-grid .slot-action-buttons'));
                    return {{
                        isSelected: updatedRow ? updatedRow.classList.contains('selected') : false,
                        totalActionBoxes: actionBoxes.length
                    }};
                }})()
            """,
            'returnByValue': True
        })
        collapse_res = res4.get('result', {}).get('value', {})
        print("After Collapse Click:", json.dumps(collapse_res, indent=2))
        assert not collapse_res["isSelected"], "Row should no longer be selected"
        assert collapse_res["totalActionBoxes"] == 0, "No action boxes should be visible after collapsing"
        print("PASS Check 4: Clicking the selected row collapsed it cleanly.")

        # Check 5: Re-select, then click Unequip
        res5 = cdp('Runtime.evaluate', {
            'expression': f"""
                (() => {{
                    const row = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    row.click();
                    const updatedRow = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    const unequipBtn = updatedRow.querySelector('.btn-unequip-slot');
                    unequipBtn.click();
                    const finalRow = document.querySelector('#equipment-slots-grid .equip-slot-row[data-slot-id="{target_slot_id}"]');
                    return {{
                        isOccupied: finalRow.classList.contains('occupied'),
                        isEmptyText: finalRow.querySelector('.slot-empty-text') !== null,
                        totalActionBoxes: document.querySelectorAll('#equipment-slots-grid .slot-action-buttons').length
                    }};
                }})()
            """,
            'returnByValue': True
        })
        unequip_res = res5.get('result', {}).get('value', {})
        print("After Unequip:", json.dumps(unequip_res, indent=2))
        assert not unequip_res["isOccupied"], f"{target_slot_id} should now be unequipped"
        assert unequip_res["isEmptyText"], f"{target_slot_id} should display Empty"
        assert unequip_res["totalActionBoxes"] == 0, "No action boxes open after unequipping"
        print("PASS Check 5: Unequip succeeded and slot reverted to Empty.")

        print("ALL TESTS PASSED SUCCESSFULLY!")

    finally:
        proc.kill()

if __name__ == "__main__":
    main()
