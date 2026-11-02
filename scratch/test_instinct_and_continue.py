import asyncio
import json
import urllib.request
import aiohttp

def get_cdp_url():
    resp = urllib.request.urlopen("http://localhost:9232/json")
    targets = json.loads(resp.read().decode())
    for t in targets:
        if t.get("type") == "page":
            return t.get("webSocketDebuggerUrl")
    raise RuntimeError("No page target found on port 9232")

async def send_cdp(ws, method, params=None, msg_id=1):
    payload = {"id": msg_id, "method": method, "params": params or {}}
    await ws.send_json(payload)
    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            data = json.loads(msg.data)
            if data.get("id") == msg_id:
                return data

async def eval_js(ws, expr, msg_id=100):
    res = await send_cdp(ws, "Runtime.evaluate", {
        "expression": expr,
        "awaitPromise": True,
        "returnByValue": True
    }, msg_id=msg_id)
    if "result" in res and "result" in res["result"]:
        return res["result"]["result"].get("value")
    return res

async def main():
    ws_url = get_cdp_url()
    async with aiohttp.ClientSession() as session:
        async with session.ws_connect(ws_url) as ws:
            print("Connected to CDP at", ws_url)

            # 1. Reload page
            await send_cdp(ws, "Page.navigate", {"url": "http://localhost:8000"})
            await asyncio.sleep(2)

            # 2. Select Hunter background (high WIS, high DEX) to test Instinct PASS
            await eval_js(ws, """
                window.__test_game = window.MytholohiyaGame;
                const app = window.MytholohiyaGame;
                app.ui.showBackgroundScreen();
            """, 101)
            await asyncio.sleep(0.5)

            await eval_js(ws, """
                const app = window.MytholohiyaGame;
                app.selectBackground('hunter');
                app.startGame();
            """, 102)
            await asyncio.sleep(1)

            # Skip prologue scenarios to reach main game or test scenario directly
            await eval_js(ws, """
                const app = window.MytholohiyaGame;
                // Directly test presentScenario on PeopleAndTerrain pickpocket scenario with high DEX/WIS
                const pickpocket = window.ScenarioRegistry.people_apprentice_pickpocket;
                const player = app.world.getEntity('player');
                // Set WIS to 14, DEX to 14
                const stats = player.getComponent('Stats');
                stats.WIS = 14;
                stats.DEX = 14;
                app.director.presentScenario(pickpocket);
                app.typewriter.skipToEnd();
            """, 103)
            await asyncio.sleep(1)

            # Verify [Instinct] badge rendered and visible
            badge_info = await eval_js(ws, """
                (() => {
                    const badge = document.querySelector('.instinct-badge');
                    const p = badge ? badge.closest('.narrative-paragraph') : null;
                    return {
                        badgeExists: Boolean(badge),
                        badgeText: badge ? badge.textContent.trim() : null,
                        stat: badge ? badge.getAttribute('data-stat') : null,
                        score: badge ? badge.getAttribute('data-score') : null,
                        dc: badge ? badge.getAttribute('data-dc') : null,
                        paragraphText: p ? p.textContent : null
                    };
                })()
            """, 104)
            print("Hunter [Instinct] Success Check Result:", json.dumps(badge_info, indent=2))
            assert badge_info["badgeExists"], "Instinct badge was not created"
            assert badge_info["badgeText"] == "[Instinct]", f"Expected '[Instinct]', got {badge_info['badgeText']}"
            assert badge_info["stat"] == "WIS", f"Expected 'WIS', got {badge_info['stat']}"

            # Verify Choice button for catching boy wrist is VISIBLE and available for high DEX
            choices_high_dex = await eval_js(ws, """
                (() => {
                    const btns = Array.from(document.querySelectorAll('#choices-container .choice-btn'));
                    return btns.map(b => b.textContent.trim());
                })()
            """, 105)
            print("Choices available with high DEX:", choices_high_dex)
            has_catch_wrist = any("Catch the boy wrist" in c for c in choices_high_dex)
            assert has_catch_wrist, "High DEX should have 'Catch the boy wrist' choice visible"

            # Hover over badge and verify tooltip contents
            await eval_js(ws, """
                const badge = document.querySelector('.instinct-badge');
                const rect = badge.getBoundingClientRect();
                const event = new MouseEvent('mouseover', {
                    bubbles: true,
                    clientX: rect.left + 10,
                    clientY: rect.top + 5
                });
                badge.dispatchEvent(event);
            """, 106)
            await asyncio.sleep(0.5)

            tooltip_info = await eval_js(ws, """
                (() => {
                    const tip = document.getElementById('instinct-hover-tooltip');
                    return {
                        tipExists: Boolean(tip),
                        hidden: tip ? tip.hidden : true,
                        display: tip ? tip.style.display : null,
                        html: tip ? tip.innerHTML : null
                    };
                })()
            """, 107)
            print("Tooltip Display Info:", {
                "tipExists": tooltip_info["tipExists"],
                "hidden": tooltip_info["hidden"],
                "display": tooltip_info["display"]
            })
            assert tooltip_info["tipExists"] and not tooltip_info["hidden"], "Instinct tooltip should be visible"
            assert "Passive WIS Check" in tooltip_info["html"], "Tooltip should mention Passive WIS Check"
            assert "Success" in tooltip_info["html"], "Tooltip should mention Success"

            # 3. Now test LOW STATS (Failed WIS & Failed DEX):
            # Player should NOT get [Instinct] badge, should get subtle narrative hints:
            # - Fail WIS narrative
            # - Fail DEX subtle hint: "The boy is darting around the milestone, but deep inside you know you aren't agile enough..."
            # - 'Catch the boy wrist' choice should be HIDDEN!
            await eval_js(ws, """
                const app = window.MytholohiyaGame;
                const pickpocket = window.ScenarioRegistry.people_apprentice_pickpocket;
                const player = app.world.getEntity('player');
                const stats = player.getComponent('Stats');
                stats.WIS = 8;
                stats.DEX = 8;
                app.director.presentScenario(pickpocket);
                app.typewriter.skipToEnd();
            """, 108)
            await asyncio.sleep(1)

            low_stats_info = await eval_js(ws, """
                (() => {
                    const badge = document.querySelector('.instinct-badge');
                    const paragraphs = Array.from(document.querySelectorAll('.narrative-paragraph')).map(p => p.textContent);
                    const choices = Array.from(document.querySelectorAll('#choices-container .choice-btn')).map(b => b.textContent.trim());
                    return {
                        hasBadge: Boolean(badge),
                        paragraphs,
                        choices
                    };
                })()
            """, 109)
            print("Low Stats Failure Test Result:")
            print("Has Instinct Badge:", low_stats_info["hasBadge"])
            print("Has 'Catch the boy wrist' choice:", any("Catch the boy wrist" in c for c in low_stats_info["choices"]))
            has_subtle_dex_hint = any("deep inside you know you aren't agile enough" in p for p in low_stats_info["paragraphs"])
            print("Has subtle DEX failure narrative hint:", has_subtle_dex_hint)
            assert not low_stats_info["hasBadge"], "Failed check should NOT show [Instinct] badge"
            assert not any("Catch the boy wrist" in c for c in low_stats_info["choices"]), "Low DEX choice should be hidden"
            assert has_subtle_dex_hint, "Subtle hint for failed DEX check must be displayed in story text"

            # 4. Now test CONTINUE PROMPT:
            # Trigger choice resolution to show continue button
            await eval_js(ws, """
                const app = window.MytholohiyaGame;
                const choices = app.director.currentScenario.choices;
                const stepWideIdx = choices.findIndex(c => c.text && c.text.includes('Step wide'));
                app.director.selectChoice(stepWideIdx);
                app.typewriter.skipToEnd();
            """, 110)
            await asyncio.sleep(1)

            continue_button_info = await eval_js(ws, """
                (() => {
                    const btns = Array.from(document.querySelectorAll('#choices-container .choice-btn'));
                    return btns.map(b => ({
                        text: b.textContent.trim(),
                        html: b.innerHTML
                    }));
                })()
            """, 111)
            print("Continue Button Info:", json.dumps(continue_button_info, indent=2))
            assert len(continue_button_info) == 1, "Should have 1 continue button"
            btn_text = continue_button_info[0]["text"]
            assert "CONTINUE TO NEXT SCENARIO" not in btn_text, f"'CONTINUE TO NEXT SCENARIO' must NOT be in button, found: {btn_text}"
            assert "Proceed onward along your path" in btn_text, f"Expected 'Proceed onward along your path', got: {btn_text}"

            print("ALL TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(main())
