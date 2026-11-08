import './mute-auto.mjs'
// 遊び方ごとの壊れ方の分布（時間を止めて1コマずつ進める）。node sim.mjs
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
const ROOT = import.meta.dirname, PORT = 6855
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const b = await chromium.launch()
const p = await (await b.newContext()).newPage()
await p.goto(`http://localhost:${PORT}/`); await p.waitForFunction(() => window.__aishoReady)
const res = await p.evaluate(async () => {
  // 反応の遅さ（秒）と、1回の操作にかかる時間で人の速さをまねる
  const bots = { '速い人 0.6秒': 0.6, '普通 1.0秒': 1.0, 'のんびり 1.6秒': 1.6, '遅い 2.5秒': 2.5, '横を叩き続ける': 'spam', '何もしない': null }
  const out = {}
  for (const [name, delay] of Object.entries(bots)) {
    const tiers = [0, 0, 0, 0], brs = []
    for (let seed = 1; seed <= 12; seed++) {
      document.getElementById('nA').value = 'a' + seed; document.getElementById('nB').value = 'b'
      aisho.dbg.seed(seed * 97); document.getElementById('bStart').click(); aisho.dbg.pause()
      let busy = 0
      for (let f = 0; f < 60 * 46; f++) {
        const s = aisho.state(); if (s.over) break
        if (busy > 0) busy -= 1 / 60
        else if (delay === 'spam') { aisho.dbg.act('smack'); busy = .35 }
        else if (delay != null) {
          const ready = k => { const e = aisho.ev(k); return e && s.t - e.t0 >= delay }
          if (ready('plug')) { aisho.dbg.act('plug'); busy = .2 }
          else if (ready('stick')) { aisho.dbg.act('smack'); busy = .3 }
          else if (ready('heat')) { aisho.dbg.act('fan'); busy = .15 }
          else if (ready('lever')) { const e = aisho.ev('lever'); if (Math.abs(e.pos - e.g) < .08) { aisho.dbg.act('lever'); busy = .5 } }
        }
        aisho.dbg.step(1)
      }
      aisho.dbg.step(60 * 4)
      const r = aisho.result(); tiers[r.tier]++; brs.push(r.br)
      document.getElementById('bAgain').click(); aisho.dbg.pause(false)
    }
    out[name] = { tiers: tiers.join('/'), avgBr: Math.round(brs.reduce((a, c) => a + c, 0) / brs.length) }
  }
  return out
})
console.table(res)
await b.close(); server.kill()
