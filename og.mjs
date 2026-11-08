import './mute-auto.mjs'
// SNS用サムネ og.png（1200x630）。煙と火花の出ている機械＋タイトル＋レシートの一言。node og.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
const ROOT = import.meta.dirname, PORT = 6853
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const b = await chromium.launch(MUTE_LAUNCH), ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, locale: 'ja-JP' }); await muteContext(ctx)
const p = await ctx.newPage()
await p.goto(`http://localhost:${PORT}/`); await p.waitForFunction(() => window.__aishoReady)
await p.evaluate(() => document.fonts.ready)
await p.addStyleTag({ content: `#corner,#tPanel,#bulb,#tut,#fanCur{display:none!important}#stage{left:-10px!important;right:auto!important;width:560px;top:6px!important;bottom:-24px!important;transition:none!important}
 body{background:radial-gradient(ellipse 40% 60% at 22% 30%,rgba(255,170,90,.35),transparent 70%),linear-gradient(transparent 86%,#2a1f17 86%),repeating-linear-gradient(0deg,rgba(0,0,0,.22) 0 2px,transparent 2px 34px),repeating-linear-gradient(90deg,rgba(0,0,0,.22) 0 2px,transparent 2px 34px),#3b5249!important}` })
await p.evaluate(() => { document.getElementById('nA').value = 'じぶん'; document.getElementById('nB').value = '推し' })
await p.evaluate(() => document.getElementById('bStart').click())
await p.evaluate(() => {
  const d = aisho.dbg; d.pause(); d.seed(11)
  d.step(60 * 2); d.spawn('stick'); d.spawn('plug'); d.step(60 * 7)      // 2つ壊れる
  d.spawn('lever'); d.step(60 * 8)
  d.set({ nv: 117, nvel: 0 }); d.spawn('stick'); d.spawn('heat'); d.step(60 * 1.2); d.set({ temp: 99.6 })
  for (let i = 0; i < 120 && aisho.state().ev.includes('heat'); i++) d.step(1)
  d.burst(176, 280, 14); d.burst(300, 270, 10); d.step(5)
})
await p.evaluate(() => {
  const d = document.createElement('div'); d.style.cssText = 'position:fixed;left:540px;right:34px;top:0;bottom:0;z-index:31;display:flex;flex-direction:column;justify-content:center;gap:18px;color:#f3e7c9'
  d.innerHTML = `<div style="font-family:'Zen Antique';font-size:76px;line-height:1.08;text-shadow:0 4px 0 #1a130d">相性診断<br>マシン<span style="font-family:'Yomogi';font-size:44px;color:#ffcf5a;display:inline-block;transform:rotate(-4deg);margin-left:10px">（壊れてる）</span></div>
  <div style="font-family:'Hiragino Sans';font-weight:800;font-size:27px;line-height:1.45">名前を入れたら、機械が燃えた。<br>叩いて、あおいで、レバーを引け。</div>
  <div style="align-self:flex-start;background:#fbf8ee;color:#2a2622;font-family:'DotGothic16';padding:14px 26px 16px;transform:rotate(-3deg);box-shadow:0 8px 16px rgba(0,0,0,.45);clip-path:polygon(0 6px,5% 0,10% 6px,15% 0,20% 6px,25% 0,30% 6px,35% 0,40% 6px,45% 0,50% 6px,55% 0,60% 6px,65% 0,70% 6px,75% 0,80% 6px,85% 0,90% 6px,95% 0,100% 6px,100% 100%,0 100%)">
   <div style="font-size:20px;color:#6e6556">相性</div><div style="font-size:64px;line-height:1;color:#8a2318">120%<span style="font-size:26px;color:#2a2622">（測定不能）</span></div>
   <div style="font-size:23px;margin-top:8px">となりの家の犬のほうが合う</div></div>`
  document.body.appendChild(d)
})
await p.waitForTimeout(500)
await p.screenshot({ path: ROOT + '/og.png' })
await b.close(); server.kill()
