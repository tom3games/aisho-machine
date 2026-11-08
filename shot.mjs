import './mute-auto.mjs'
// 目で見る用のスクショ。node shot.mjs [幅 高さ]
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
const ROOT = import.meta.dirname, PORT = 6851
mkdirSync(ROOT + '/shots', { recursive: true })
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const [w, h] = [+(process.argv[2] || 390), +(process.argv[3] || 844)]
const b = await chromium.launch(MUTE_LAUNCH)
const ctx = await b.newContext({ locale: 'ja-JP', viewport: { width: w, height: h }, deviceScaleFactor: 2 })
await muteContext(ctx)
const p = await ctx.newPage()
p.on('pageerror', e => console.log('ERR', e.message)); p.on('console', m => { if (m.type() === 'error') console.log('CON', m.text()) })
await p.goto(`http://localhost:${PORT}/`); await p.waitForFunction(() => window.__aishoReady)
await p.waitForTimeout(500)
await p.screenshot({ path: `${ROOT}/shots/s-title.png` })
await p.click('#nA'); await p.keyboard.type('たろう'); await p.click('#nB'); await p.keyboard.type('はなこ')
await p.evaluate(() => { aisho.dbg.seed(7) })
await p.click('#bStart')
await p.evaluate(() => aisho.dbg.pause())
await p.evaluate(() => aisho.dbg.step(60 * 3))
await p.evaluate(() => { aisho.dbg.spawn('heat'); aisho.dbg.step(60 * 1.5) })
await p.screenshot({ path: `${ROOT}/shots/s-play1.png` })
await p.evaluate(() => { aisho.dbg.setBreak(80); aisho.dbg.spawn('lever'); aisho.dbg.step(60 * 6) })
await p.evaluate(() => { aisho.dbg.spawn('plug'); aisho.dbg.step(30) })
await p.screenshot({ path: `${ROOT}/shots/s-play2.png` })
await p.evaluate(() => { aisho.dbg.setBreak(95); aisho.dbg.finish(); aisho.dbg.step(60 * 1.5) })
await p.screenshot({ path: `${ROOT}/shots/s-print.png` })
await p.evaluate(() => aisho.dbg.step(60 * 2))
await p.waitForFunction(() => window.__aishoShown)
await p.waitForTimeout(1200)
await p.screenshot({ path: `${ROOT}/shots/s-end.png` })
console.log(JSON.stringify(await p.evaluate(() => aisho.result())).slice(0, 600))
await b.close(); server.kill()
