import './mute-auto.mjs'
// 相性診断マシンの検証。本物のマウス・指で押す。node verify.mjs
import { chromium, webkit } from 'playwright'
import { spawn } from 'node:child_process'
import { mkdirSync, readFileSync } from 'node:fs'
import { MUTE_LAUNCH, muteContext } from './mute.mjs'
const ROOT = import.meta.dirname
mkdirSync(ROOT + '/shots', { recursive: true })
const PORT = 6852
const server = spawn(process.execPath, ['server.mjs'], { cwd: ROOT, env: { ...process.env, PORT: String(PORT) } })
await new Promise(r => setTimeout(r, 400))
const URL0 = `http://localhost:${PORT}/`
let pass = 0, fail = 0
const results = []
async function t(name, fn) {
  try { const r = await fn(); if (r === false) throw new Error('false'); pass++; results.push(`ok   ${name}${r && r !== true ? '  ' + JSON.stringify(r) : ''}`) }
  catch (e) { fail++; results.push(`FAIL ${name}  ${e.message.split('\n')[0]}`) }
  console.log(results[results.length - 1])
}
const expect = (c, msg) => { if (!c) throw new Error(msg) }
const sleep = ms => new Promise(r => setTimeout(r, ms))
const NAME_A = 'ゆうたろう', NAME_B = 'Zephyrine'
const AFF = 'https://ac.cross-system.com/H558ec8Ha0ffaf0N/cl/?bId=ea9Uac13&param4=A3503_00'

async function open(browser, opts = {}, { affEmpty = false } = {}) {
  const ctx = await browser.newContext({ locale: 'ja-JP', viewport: { width: 390, height: 844 }, ...opts })
  await muteContext(ctx)
  await ctx.addInitScript(() => { try { localStorage.clear() } catch (e) {} })
  await ctx.route('**/ac.cross-system.com/**', r => r.abort())
  await ctx.route('**/x.com/**', r => r.abort())
  if (affEmpty) await ctx.route('**/config.js*', r => r.fulfill({ contentType: 'text/javascript', body: "window.AFF_URL = ''" }))
  const p = await ctx.newPage(); p.errs = []; p.reqs = []
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message))
  p.on('console', m => { if (m.type() === 'error') p.errs.push('console ' + m.text()) })
  p.on('requestfailed', r => { if (!/fonts\.(googleapis|gstatic)|cross-system|x\.com/.test(r.url())) p.errs.push('reqfail ' + r.url()) })
  ctx.on('request', r => p.reqs.push(r.url() + ' ' + (r.postData() || '')))
  await p.goto(URL0); await p.waitForFunction(() => window.__aishoReady, null, { timeout: 15000 })
  await p.waitForFunction(() => getComputedStyle(document.getElementById('loading')).display === 'none', null, { timeout: 3000 })
  return p
}
const overflow = p => p.evaluate(() => {
  const W = document.documentElement.clientWidth, bad = []
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[hidden]') || el.closest('svg') || (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))) continue
    const r = el.getBoundingClientRect(); if (r.width && (r.right > W + 1 || r.left < -1)) bad.push((el.id || el.className || el.tagName) + ':' + Math.round(r.left) + '-' + Math.round(r.right))
  }
  return { sw: document.documentElement.scrollWidth, W, bad: bad.slice(0, 5) }
})
// 一画面: 縦スクロールなし・押す物が全部画面内
const fit = q => q.evaluate(() => {
  const H = innerHeight, W = innerWidth, de = document.documentElement, over = []
  if (de.scrollHeight > H + 1) over.push('page:' + de.scrollHeight)
  for (const el of document.querySelectorAll('button,input,a,canvas,.hit')) {
    if (el.closest('[hidden]') || (el.checkVisibility && !el.checkVisibility({ visibilityProperty: true, opacityProperty: true }))) continue
    if (el.classList.contains('hit') && !document.body.classList.contains('play')) continue
    const r = el.getBoundingClientRect(); if (!r.width) continue
    if (r.bottom > H + 1 || r.top < -1 || r.right > W + 1 || r.left < -1) over.push((el.id || el.className.baseVal || el.className || el.tagName) + ':' + Math.round(r.top) + '-' + Math.round(r.bottom))
  }
  return { H, over: over.slice(0, 6) }
})
// 遊び中に画面に出ている文字（電光表示と指ガイドだけのはず）
const textsInPlay = q => q.evaluate(() => {
  const out = []
  const tick = document.getElementById('tick').textContent.trim(); if (tick) out.push('tick')
  if (!document.getElementById('tut').hidden) out.push('tut')
  for (const el of document.querySelectorAll('#tPanel,#vEnd,#how')) if (el.checkVisibility && el.checkVisibility({ visibilityProperty: true, opacityProperty: true })) out.push(el.id)
  return out
})
const visibleText = q => q.evaluate(() => document.body.innerText + ' ' + [...document.querySelectorAll('svg text')].map(t => t.textContent).join(' '))

async function typeNames(p, a, b, touch) {
  if (touch) await p.tap('#nA'); else await p.click('#nA')
  await p.keyboard.type(a)
  if (touch) await p.tap('#nB'); else await p.click('#nB')
  await p.keyboard.type(b)
}
async function tapXY(p, x, y, touch) { if (touch) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y) }
// 上手い人: 光った所を本物の入力で直す
async function playSkilled(p, touch) {
  const st0 = Date.now(), acts = { smack: 0, fan: 0, lever: 0, plug: 0 }
  while (Date.now() - st0 < 50000) {
    const s = await p.evaluate(() => aisho.state())
    if (!s || s.over) break
    const ev = s.ev
    if (ev.includes('plug')) { const c = await p.evaluate(() => aisho.partXY('plug')); for (let i = 0; i < 3; i++) { await tapXY(p, c.x, c.y, touch); acts.plug++; await sleep(60) } continue }
    if (ev.includes('stick')) { const c = await p.evaluate(() => aisho.partXY('side')); for (let i = 0; i < 2; i++) { await tapXY(p, c.x, c.y, touch); acts.smack++; await sleep(60) } continue }
    if (ev.includes('heat')) {
      const c = await p.evaluate(() => aisho.partXY('vent'))
      await p.mouse.move(c.x - 40, c.y); await p.mouse.down()
      for (let i = 0; i < 8; i++) { await p.mouse.move(c.x + (i % 2 ? -50 : 50), c.y + 5, { steps: 4 }); acts.fan++ }
      await p.mouse.up(); continue
    }
    if (ev.includes('lever')) {
      const e = await p.evaluate(() => aisho.ev('lever'))
      if (e && Math.abs(e.pos - e.g) < .05) {
        const k = await p.evaluate(() => aisho.leverXY())
        await p.mouse.move(k.x, k.y); await p.mouse.down(); await p.mouse.move(k.x, k.y + 45, { steps: 3 }); await p.mouse.up(); acts.lever++
      }
      await sleep(10); continue
    }
    await sleep(60)
  }
  await p.waitForFunction(() => window.__aishoShown, null, { timeout: 15000 })
  return acts
}
async function startGame(p, a, b, touch) {
  await typeNames(p, a, b, touch)
  const r = await p.evaluate(() => { const r = document.getElementById('bStart').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } })
  await tapXY(p, r.x, r.y, touch)
  await p.waitForFunction(() => document.body.classList.contains('play'))
}

// ================= Chromium
const browser = await chromium.launch(MUTE_LAUNCH)
const p = await open(browser)
await t('起動時にエラーが出ない・ロード画面が消える', async () => { expect(p.errs.length === 0, p.errs.join('|')) })
await t('ブラウザの拡大が起きない', async () => {
  const r = await p.evaluate(() => {
    const vp = document.querySelector('meta[name=viewport]').content
    const g = new Event('gesturestart', { cancelable: true }); document.dispatchEvent(g)
    const w = new WheelEvent('wheel', { ctrlKey: true, deltaY: -10, bubbles: true, cancelable: true }); window.dispatchEvent(w)
    const k = new KeyboardEvent('keydown', { key: '+', ctrlKey: true, bubbles: true, cancelable: true }); window.dispatchEvent(k)
    return { vp, gesture: g.defaultPrevented, wheel: w.defaultPrevented, key: k.defaultPrevented, ta: getComputedStyle(document.documentElement).touchAction, us: getComputedStyle(document.body).userSelect }
  })
  expect(/user-scalable=no/.test(r.vp) && r.gesture && r.wheel && r.key && r.ta === 'manipulation' && r.us === 'none', JSON.stringify(r))
})
await t('OGP 一式がある', async () => {
  const r = await p.evaluate(() => ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'].map(k => !!document.querySelector(`meta[property="${k}"]`)).concat(!!document.querySelector('meta[name="twitter:card"]')))
  expect(r.every(Boolean), JSON.stringify(r))
})
await t('タイトルでは PR が出ていない', async () => { expect(!(await p.isVisible('#bAff')), 'visible') })
await t('名前が空だと始まらない（案内が出る）', async () => {
  await p.click('#bStart'); const r = await p.evaluate(() => ({ play: document.body.classList.contains('play'), msg: document.getElementById('nameMsg').textContent }))
  expect(!r.play && r.msg, JSON.stringify(r)); return r.msg
})
await t('同じ二人は順番・空白・全角半角が違っても同じ素の結果', async () => {
  const r = await p.evaluate(() => [aisho.base('たろう', 'はなこ'), aisho.base('はなこ', 'たろう'), aisho.base(' たろう ', 'はなこ'), aisho.base('ＡＢＣ', 'x'), aisho.base('abc', 'X'), aisho.base('たろう', 'はなこ2')])
  const j = o => JSON.stringify(o)
  expect(j(r[0]) === j(r[1]) && j(r[0]) === j(r[2]) && j(r[3]) === j(r[4]) && j(r[0]) !== j(r[5]), j(r)); return r[0]
})
await t('素の結果は散らばる（200組で相性の値が30種以上・タイプ全16種）', async () => {
  const r = await p.evaluate(() => { const pc = new Set(), ty = new Set(); for (let i = 0; i < 200; i++) { const b = aisho.base('name' + i, 'other' + (i * 7)); pc.add(b.pct); ty.add(b.type) } return { pct: pc.size, type: ty.size } })
  expect(r.pct >= 30 && r.type === 16, JSON.stringify(r)); return r
})

// ---- 上手い人の通し（本物のマウス）
let skilledC
await t('キーボードで名前を打って始められる（本物のクリック）', async () => {
  await startGame(p, NAME_A, NAME_B, false)
  const v = await p.evaluate(() => [document.getElementById('nA').value, document.getElementById('nB').value])
  expect(v[0] === NAME_A && v[1] === NAME_B, v)
})
await t('Chromium: 始めた後も実際には無音', async () => { const r = await p.evaluate(() => ({ ok: window.__muteOk(), calls: window.__soundCalls })); expect(r.ok, JSON.stringify(r)); return r })
await t('遊び中の押す所4つが画面内にある', async () => {
  const r = await p.evaluate(() => ['side', 'vent', 'lever', 'plug'].map(k => ({ ...aisho.partXY(k), H: innerHeight, W: innerWidth })))
  expect(r.every(c => c.top >= 0 && c.bottom <= c.H && c.left >= 0 && c.right <= c.W && c.w >= 40 && c.h >= 40), JSON.stringify(r))
  return r.map(c => Math.round(c.w) + 'x' + Math.round(c.h))
})
await t('不調が出ていない時に横を叩くと少し壊れる（叩き放題にしない）', async () => {
  await p.waitForFunction(() => aisho.state().t > 0.3)
  const s0 = await p.evaluate(() => aisho.state())
  if (s0.ev.length) return 'skip: 既に不調'
  const c = await p.evaluate(() => aisho.partXY('side')); await p.mouse.click(c.x, c.y)
  const s1 = await p.evaluate(() => aisho.state()); expect(s1.br > s0.br && s1.fails === 1, JSON.stringify([s0.br, s1.br, s1.fails])); return [s0.br.toFixed(1), s1.br.toFixed(1)]
})
let textMax = 0
const watchText = setInterval(async () => { try { const n = (await textsInPlay(p)).length; textMax = Math.max(textMax, n) } catch (e) {} }, 400)
await t('上手い人（本物のマウスで叩く・あおぐ・レバー・差しこむ）は壊れ方が小さい', async () => {
  const acts = await playSkilled(p, false)
  skilledC = await p.evaluate(() => aisho.result())
  expect(skilledC.tier <= 1 && skilledC.fixes >= 6, JSON.stringify({ tier: skilledC.tier, br: skilledC.br, fixes: skilledC.fixes, blows: skilledC.blows, acts }))
  return { tier: skilledC.tier, br: skilledC.br, fixes: skilledC.fixes, blows: skilledC.blows, pct: skilledC.pct.join(''), acts }
})
clearInterval(watchText)
await t('遊び中の文字は同時に2つまで', async () => { expect(textMax <= 2, textMax); return textMax })
await t('1回の中で4種の不調が全部出た', async () => {
  const log = await p.evaluate(() => aisho.state().log)
  const kinds = new Set(log.map(l => l[1])); expect(kinds.size === 4, JSON.stringify(log)); return { events: log.filter(l => l[2] === 'start').length }
})
await sleep(1100); await p.screenshot({ path: `${ROOT}/shots/v-end-skilled.png` })
await t('結果画面だけに PR（href・rel・target・PR表示の大きさ・17歳以上）', async () => {
  const r = await p.evaluate(() => {
    const a = document.getElementById('bAff'), pr = a.querySelector('.pr'), tx = document.getElementById('affTxt')
    const ar = a.getBoundingClientRect()
    return { vis: a.checkVisibility(), href: a.href, rel: a.rel, target: a.target, txt: a.innerText, prSize: parseFloat(getComputedStyle(pr).fontSize), txSize: parseFloat(getComputedStyle(tx).fontSize), note: document.getElementById('affNote').textContent, inView: ar.bottom <= innerHeight && ar.top >= 0 }
  })
  expect(r.vis && r.inView && r.href === AFF && /sponsored/.test(r.rel) && /noopener/.test(r.rel) && r.target === '_blank' && /PR/.test(r.txt) && /ちゃんとした占い師に見てもらうなら/.test(r.txt) && r.prSize >= r.txSize - 1 && r.note === '17歳以上', JSON.stringify(r))
  return { prSize: r.prSize, txSize: r.txSize }
})
await t('PR を押すと新しいタブ＋aff_click が記録される', async () => {
  const [pop] = await Promise.all([p.context().waitForEvent('page', { timeout: 5000 }), p.click('#bAff')])
  const log = await p.evaluate(() => window.__tmLog.map(l => l.name))
  await pop.close().catch(() => {})
  expect(log.includes('aff_click') && log.includes('game_start') && log.includes('game_end'), log.join(',')); return log
})
await t('Xでポストの本文に名前を入れない', async () => {
  const [pop] = await Promise.all([p.context().waitForEvent('page', { timeout: 5000 }), p.click('#bPost')])
  await pop.close().catch(() => {})
  const txt = await p.evaluate(() => window.__lastPost)
  expect(txt && !txt.includes(NAME_A) && !txt.includes(NAME_B) && /#相性診断/.test(txt), txt); return txt.replace(/\n/g, ' / ')
})
await t('名前はどこにも送らない・保存しない（全通信と localStorage を見る）', async () => {
  const enc = [NAME_A, NAME_B, encodeURIComponent(NAME_A), encodeURIComponent(NAME_B)]
  const bad = p.reqs.filter(u => enc.some(n => u.includes(n)))
  const ls = await p.evaluate(() => JSON.stringify(Object.assign({}, localStorage)))
  expect(!bad.length && !enc.some(n => ls.includes(n)), JSON.stringify(bad) + ls); return { requests: p.reqs.length }
})
await t('結果画面のエラーなし', async () => { expect(p.errs.length === 0, p.errs.join('|')) })

// ---- 何もしない通し（時間を進める）
let idle
await t('何もしないと一番壊れた結果になる（測定不能系・見てただけ）', async () => {
  await p.click('#bAgain')
  await p.waitForFunction(() => !document.body.classList.contains('play') && !document.body.classList.contains('end'))
  await p.click('#bStart'); await p.waitForFunction(() => document.body.classList.contains('play'))
  await p.evaluate(() => { aisho.dbg.pause(); aisho.dbg.step(60 * 44) })
  await p.waitForFunction(() => window.__aishoShown >= 2, null, { timeout: 8000 })
  idle = await p.evaluate(() => aisho.result())
  expect(idle.tier === 3 && idle.mech === 3 && idle.br >= 75 && idle.blows >= 6, JSON.stringify({ tier: idle.tier, br: idle.br, mech: idle.mech, blows: idle.blows }))
  return { tier: idle.tier, br: idle.br, blows: idle.blows, pct: idle.pct.join(''), rows: idle.rows.map(r => r[2]) }
})
await sleep(1100); await p.screenshot({ path: `${ROOT}/shots/v-end-idle.png` })
await t('同じ二人なら素の結果（タイプ・前世・この先・ラッキー・相性の数）が同じ', async () => {
  const a = skilledC.b, b = idle.b
  expect(JSON.stringify(a) === JSON.stringify(b), JSON.stringify([a, b])); return a
})
await t('壊れた時は上手い時と文面が変わる（壊れた行が入る）', async () => {
  const s = skilledC.rows.map(r => r[2]).join('|'), i = idle.rows.map(r => r[2]).join('|')
  expect(s !== i && idle.pct[0] !== skilledC.pct[0], s + ' // ' + i)
})
await t('英語に切り替えると結果も英語', async () => {
  await p.click('#bLang'); await sleep(400)
  const r = await p.evaluate(() => aisho.result().rows.map(r => r[1] + ':' + r[2]).join(' | '))
  expect(!/[ぁ-んァ-ヶ]/.test(r), r); await p.screenshot({ path: `${ROOT}/shots/v-end-en.png` }); await p.click('#bLang'); return r
})
await t('画面と文言に禁止語（当たる・必ず・今だけ・AI・画像生成・ポイント制）がない', async () => {
  const src = readFileSync(ROOT + '/data.js', 'utf8') + readFileSync(ROOT + '/index.html', 'utf8')
  const txt = await visibleText(p)
  const bad = ['当たる', '必ず', '今だけ', '画像生成', 'ポイント制'].filter(w => src.includes(w) || txt.includes(w)).concat(/\bAI\b/.test(txt) ? ['AI'] : [])
  expect(!bad.length, bad.join(','))
})
await p.close()

// ---- AFF_URL が空ならボタンも注記も出ない
await t('AFF_URL が空なら PR と注記が出ない', async () => {
  const q = await open(browser, {}, { affEmpty: true })
  await startGame(q, 'あ', 'い', false)
  await q.evaluate(() => { aisho.dbg.pause(); aisho.dbg.step(60 * 44) })
  await q.waitForFunction(() => window.__aishoShown)
  const r = await q.evaluate(() => ({ box: document.getElementById('affBox').hidden, vis: document.getElementById('bAff').checkVisibility(), note: document.getElementById('affNote').checkVisibility(), href: document.getElementById('bAff').getAttribute('href') }))
  await q.close()
  expect(r.box && !r.vis && !r.note && !r.href, JSON.stringify(r))
})

// ---- 3サイズ × 全画面
const SIZES = [[360, 640, 'small'], [390, 844, 'phone'], [430, 932, 'max']]
for (const [w, h, name] of SIZES) {
  const q = await open(browser, { viewport: { width: w, height: h }, deviceScaleFactor: 2 })
  const views = {}
  views.title = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-title.png` })
  await q.click('#bHow'); views.how = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-how.png` }); await q.click('#howClose')
  await startGame(q, 'じぶん', '推し', false); await sleep(700)
  await q.evaluate(() => { aisho.dbg.pause(); aisho.dbg.seed(3); aisho.dbg.step(60 * 3); aisho.dbg.spawn('heat'); aisho.dbg.spawn('lever'); aisho.dbg.step(60) })
  views.play = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-play.png` })
  await t(`${name}: 遊び中の文字は2つまで`, async () => { const n = await textsInPlay(q); expect(n.length <= 2, n.join(',')) })
  await q.evaluate(() => { aisho.dbg.step(60 * 42) })
  await q.waitForFunction(() => window.__aishoShown); await sleep(1000)
  views.end = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-end.png` })
  await q.click('#bLang'); await sleep(300); views.endEn = await fit(q); await q.screenshot({ path: `${ROOT}/shots/fit-${name}-end-en.png` })
  for (const [v, r] of Object.entries(views)) await t(`一画面に収まる ${name} ${w}x${h} ${v}`, async () => { expect(!r.over.length, JSON.stringify(r)) })
  await t(`${name}: はみ出し・エラーなし`, async () => { const o = await overflow(q); expect(o.sw <= o.W && !o.bad.length && !q.errs.length, JSON.stringify(o) + q.errs.join('|')) })
  await q.close()
}
await browser.close()

// ================= WebKit（iPhone 相当・指で押す）
const wb = await webkit.launch()
const wp = await open(wb, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 })
await t('WebKit: 2本指の touchmove を止める', async () => {
  const r = await wp.evaluate(() => { const e = new Event('touchmove', { cancelable: true, bubbles: true }); Object.defineProperty(e, 'touches', { value: [{}, {}] }); document.body.dispatchEvent(e); return e.defaultPrevented })
  expect(r, r)
})
await t('WebKit: 指で名前を入れて始める', async () => { await startGame(wp, NAME_B, NAME_A, true) })
await t('WebKit: 始めた後も実際には無音', async () => { const r = await wp.evaluate(() => ({ ok: window.__muteOk(), calls: window.__soundCalls })); expect(r.ok, JSON.stringify(r)); return r })
await t('WebKit: 指ガイドはスマホの言い方（こすってあおぐ）', async () => {
  const r = await wp.evaluate(() => { aisho.dbg.pause(); const t0 = aisho.state().t; aisho.dbg.spawn('heat'); const r = { t0, tut: aisho.tut(), txt: document.getElementById('tutTxt').textContent }; aisho.dbg.pause(false); return r })
  expect(r.tut === 'heat' && r.txt === 'こすってあおぐ', JSON.stringify(r)); return r.txt
})
await t('WebKit: 上手い人（指で叩く・差しこむ、あおぐ・レバー）も壊れ方が小さい', async () => {
  const acts = await playSkilled(wp, true)
  const r = await wp.evaluate(() => aisho.result())
  expect(r.tier <= 1, JSON.stringify({ tier: r.tier, br: r.br, fixes: r.fixes, blows: r.blows, acts }))
  await t('WebKit: 名前の順番を逆にしても Chromium と同じ素の結果', async () => { expect(JSON.stringify(r.b) === JSON.stringify(skilledC.b), JSON.stringify([r.b, skilledC.b])) })
  return { tier: r.tier, br: r.br, fixes: r.fixes, blows: r.blows, pct: r.pct.join('') }
})
await sleep(1100); await wp.screenshot({ path: `${ROOT}/shots/v-webkit-end.png` })
await t('WebKit: 結果に PR、エラーなし、無音', async () => {
  const r = await wp.evaluate(() => ({ vis: document.getElementById('bAff').checkVisibility(), mute: window.__muteOk() }))
  expect(r.vis && r.mute && wp.errs.length === 0, JSON.stringify(r) + wp.errs.join('|'))
})
// ---- ページを離れた時の音（2026-11-11 横丁へ移っても BGM が鳴り続けた不具合の再発防止）
await t('WebKit: 裏に回ると BGM と環境音が止まり suspend。戻っても触るまで鳴らない（bfcache の pageshow でも）', async () => {
  const r = await wp.evaluate(async () => {
    if (!Snd.ctx) Snd.init()
    const url = Object.values(Snd.files).flat()[0]; Snd.loop('vtest', url, 0.2)
    for (let i = 0; i < 30 && !Snd.playing().includes('vtest'); i++) await new Promise(r => setTimeout(r, 100))
    const c = Snd.ctx; let sus = 0; const os = c.suspend.bind(c); c.suspend = () => { sus++; return os() }
    const before = Snd.playing().length, wake0 = Snd.life.wake
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' }); document.dispatchEvent(new Event('visibilitychange'))
    const hid = { away: Snd.away, playing: Snd.playing().length, sus, gain: Snd.master.gain.value }
    const name = Object.keys(Snd.files)[0], src = Snd.play(name); Snd.loop('vtest2', url, 0.2);    // 裏にいる間の音は鳴らさない
    await new Promise(r => setTimeout(r, 400)); const quiet = Snd.playing().length
    Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'visible' }); document.dispatchEvent(new Event('visibilitychange'))
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }))
    await new Promise(r => setTimeout(r, 400)); const back = { away: Snd.away, playing: Snd.playing().length, gain: Snd.master.gain.value }
    Snd.loop('vtest2', null)
    return { before, wake0, hid, src: src === null, quiet, back }
  })
  // ボタンでない所を1回タップ（触ったら鳴らし直す）
  const pt = await wp.evaluate(() => { for (let y = 0.5; y < 0.98; y += 0.06) for (let x = 0.08; x < 0.95; x += 0.12) { const X = innerWidth * x, Y = innerHeight * y, e = document.elementFromPoint(X, Y); if (e && !e.closest('button,a,input,select,textarea,label,[onclick],[role=button],[tabindex]')) return { x: X, y: Y } } return null })
  if (pt) await wp.touchscreen.tap(pt.x, pt.y); else await wp.keyboard.press('Shift')
  await wp.waitForTimeout(700)
  const after = await wp.evaluate(() => ({ away: Snd.away, playing: Snd.playing().length, wake: Snd.life.wake, mute: window.__muteOk() }))
  await wp.evaluate(() => Snd.loop('vtest', null))
  expect(r.before >= 1 && r.hid.away && r.hid.playing === 0 && r.hid.sus === 1 && r.hid.gain === 0 && r.src && r.quiet === 0 && r.back.away && r.back.playing === 0 && r.back.gain === 0 && !after.away && after.playing >= r.before && after.wake === r.wake0 + 1 && after.mute, JSON.stringify({ r, after, pt })); return { before: r.before, after: after.playing }
})
await t('WebKit: 別のページへ移る（pagehide）と止まり、戻るで戻っても鳴っていない・エラーなし', async () => {
  await wp.evaluate(() => addEventListener('pagehide', () => { try { sessionStorage.setItem('vHide', JSON.stringify({ away: Snd.away, playing: Snd.playing().length, hide: Snd.life.hide })) } catch (e) {} }))
  await wp.evaluate(() => { if (!Snd.ctx) Snd.init(); Snd.loop('vtest', Object.values(Snd.files).flat()[0], 0.2) }); await wp.waitForTimeout(500)
  const pre = await wp.evaluate(() => Snd.playing().length)
  await wp.goto(URL0 + 'privacy.html'); await wp.waitForTimeout(300)
  const hid = await wp.evaluate(() => sessionStorage.getItem('vHide'))
  await wp.goBack(); await wp.waitForFunction(() => window.__aishoReady, null, { timeout: 15000 }); await wp.waitForTimeout(800)
  const back = await wp.evaluate(() => ({ playing: typeof Snd === 'undefined' ? 0 : Snd.playing().length, mute: window.__muteOk() }))
  const h = JSON.parse(hid || '{}')
  expect(pre >= 1 && h.away && h.playing === 0 && back.playing === 0 && back.mute && wp.errs.length === 0, JSON.stringify({ pre, h, back, e: wp.errs })); return { pre, h, back }
})
await wb.close()
server.kill()
console.log('\n' + results.filter(r => r.startsWith('FAIL')).join('\n'))
console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
