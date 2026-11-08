// 相性診断マシン（壊れてる）。名前は端末の中だけで使う（送らない・保存しない）
(function () {
  window.__jsUp = true
  const $ = s => document.querySelector(s)
  const NS = 'http://www.w3.org/2000/svg'
  const svg = $('#mSvg')
  let lang = /^ja/i.test(navigator.language || 'ja') ? 'ja' : 'en'
  try { const l = localStorage.getItem('aisho.lang'); if (l === 'ja' || l === 'en') lang = l } catch (e) {}
  let muted = false
  try { muted = localStorage.getItem('aisho.mute') === '1' } catch (e) {}
  const U = () => D.ui[lang]
  const L = a => a[lang === 'ja' ? 0 : 1]
  const isTouch = matchMedia('(pointer:coarse)').matches
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
  const DUR = 40

  // ---- 名前から決まる部分（同じ二人なら同じ）
  const norm = s => (s || '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase()
  function fnv(str) { let h = 0x811c9dc5; for (const ch of str) { h ^= ch.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0 } return h >>> 0 }
  function mul(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
  function base(a, b) {
    const r = mul(fnv([norm(a), norm(b)].sort().join('\u0000')))
    const pick = n => Math.floor(r() * n)
    return { pct: 31 + pick(69), type: pick(D.type.length), past: pick(D.past.length), future: pick(D.future.length), lucky: pick(D.lucky.length), no: 1000 + pick(9000) }
  }
  // 1回ごとのゆらぎ（検証では種を固定できる）
  let rr = Math.random

  // ---- 音
  Snd.def({
    whir: ['snd/whir1.mp3', 'snd/whir2.mp3', 'snd/whir3.mp3'], smack: ['snd/smack1.mp3', 'snd/smack2.mp3', 'snd/smack3.mp3'],
    lever: ['snd/lever1.mp3', 'snd/lever2.mp3'], boing: ['snd/boing1.mp3', 'snd/boing2.mp3'], fan: ['snd/fan1.mp3', 'snd/fan2.mp3', 'snd/fan3.mp3'],
    steam: 'snd/steam.mp3', plug: ['snd/plug1.mp3', 'snd/plug2.mp3'], ding: 'snd/ding.mp3', register: 'snd/register.mp3', paper: ['snd/paper1.mp3', 'snd/paper2.mp3'],
    fall: 'snd/fall1.mp3', glass: 'snd/glass.mp3', clank: 'snd/clank.mp3', drum: 'snd/drumroll.mp3', coin: 'snd/coin.mp3',
    jgood: 'snd/jgood.mp3', jbad: 'snd/jbad.mp3', weird: ['snd/weird1.mp3', 'snd/weird2.mp3'], spark: ['snd/spark1.mp3', 'snd/spark2.mp3', 'snd/spark3.mp3']
  })
  Snd.setMute(muted)
  const ALL_SND = [...new Set(Object.values(Snd.files).flat().concat(['snd/hum.mp3', 'snd/amb.mp3']))]

  // ---- 機械の部品を作る
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e }
  const CX = 176, CY = 318
  const ang = v => -75 + v * 1.25
  const pt = (r, a) => [CX + r * Math.sin(a * Math.PI / 180), CY - r * Math.cos(a * Math.PI / 180)]
  ;(function buildDial() {
    const g = $('#scale')
    for (let v = 0; v <= 100; v += 10) { const a = ang(v), [x1, y1] = pt(64, a), [x2, y2] = pt(v % 50 ? 70 : 74, a); el('line', { x1, y1, x2, y2, stroke: '#3a2d22', 'stroke-width': v % 50 ? 1.2 : 2 }, g) }
    for (const v of [0, 50]) { const [x, y] = pt(52, ang(v)); el('text', { x, y: y + 4, 'text-anchor': 'middle', class: 'dial' }, g).textContent = v }
    const [a1, a2] = [ang(100), ang(120)], [o1x, o1y] = pt(75, a1), [o2x, o2y] = pt(75, a2), [i2x, i2y] = pt(63, a2), [i1x, i1y] = pt(63, a1)
    $('#redZone').setAttribute('d', `M${o1x} ${o1y} A75 75 0 0 1 ${o2x} ${o2y} L${i2x} ${i2y} A63 63 0 0 0 ${i1x} ${i1y}Z`)
    const [nx, ny] = pt(45, 62); const ng = $('#dialNg'); ng.setAttribute('x', nx); ng.setAttribute('y', ny); ng.setAttribute('text-anchor', 'middle'); ng.setAttribute('transform', `rotate(62 ${nx} ${ny})`); ng.setAttribute('style', 'font-size:9px')
    const [hx, hy] = pt(30, 0); el('path', { d: `M${hx} ${hy + 6} c-6 -6 -12 -1 -6 5 l6 5 l6 -5 c6 -6 0 -11 -6 -5z`, fill: '#c0392b', opacity: .7 }, g)
  })()
  const tubes = [136, 176, 216].map((x, i) => {
    const g = el('g', {}, $('#tubes'))
    el('rect', { x: x - 11, y: 116, width: 22, height: 12, rx: 2, fill: '#3b2516' }, g)
    const glow = el('ellipse', { cx: x, cy: 96, rx: 24, ry: 30, fill: 'url(#gTube)', opacity: 0 }, g)
    el('path', { d: `M${x - 10} 118 V${84 - i % 2 * 6} a10 10 0 0 1 20 0 V118z`, fill: 'rgba(210,235,240,.22)', stroke: '#9fb6bd', 'stroke-width': 1.5 }, g)
    const fil = el('path', { d: `M${x - 4} 114 V96 q4 -9 8 0 V114`, fill: 'none', stroke: '#5a3a22', 'stroke-width': 2 }, g)
    const crack = el('path', { d: `M${x - 6} ${86} l5 7 l-3 6 l6 4`, stroke: '#ddd', 'stroke-width': 1, fill: 'none', opacity: 0 }, g)
    return { glow, fil, crack, dead: false, x }
  })
  const lamps = []
  for (let i = 0; i < 10; i++) lamps.push(el('circle', { cx: 110 + i * 14.8, cy: 452, r: 4.5, class: 'lamp' }, $('#lamps')))
  // 調子の悪い所を光らせる枠
  const HL = {}
  const hlG = el('g', { 'pointer-events': 'none' }, svg)
  svg.insertBefore(hlG, $('#fx'))
  HL.side = el('path', { d: 'M22 156 L62 144 L62 520 L22 506 Z', fill: 'none', stroke: '#ffcf5a', 'stroke-width': 4, class: 'glowPart', display: 'none' }, hlG)
  HL.vent = el('rect', { x: 106, y: 344, width: 154, height: 84, rx: 7, fill: 'none', stroke: '#ffcf5a', 'stroke-width': 4, class: 'glowPart', display: 'none' }, hlG)
  HL.lever = el('circle', { cx: 300, cy: 300, r: 46, fill: 'none', stroke: '#ffcf5a', 'stroke-width': 4, class: 'glowPart', display: 'none' }, hlG)
  HL.plug = el('circle', { cx: 32, cy: 542, r: 26, fill: 'none', stroke: '#ffcf5a', 'stroke-width': 4, class: 'glowPart', display: 'none' }, hlG)
  const PART = { stick: 'side', heat: 'vent', lever: 'lever', plug: 'plug' }

  // ---- 煙と火花
  const fx = $('#fx'), parts = []
  function emit(kind, x, y, o = {}) {
    if (parts.length > 90) return
    let e
    if (kind === 'smoke') e = el('circle', { r: 8, fill: o.dark ? '#3a3a3a' : '#9a9a96', filter: 'url(#fBlur)' }, fx)
    else if (kind === 'fire') { e = el('g', { filter: 'url(#fFire)' }, fx); const j = () => (rr() - .5) * 8; el('path', { d: `M${j()} -30 Q4 -18 6 -12 Q${9 + j()} -22 ${12 + j()} -20 Q14 -6 11 4 Q6 12 -2 11 Q-12 9 -12 0 Q-13 -10 ${-8 + j()} -18 Q-6 -10 -3 -9 Q-4 -20 ${j()} -30Z`, fill: '#e8401a', opacity: .85 }, e); el('path', { d: `M${j() / 2} -16 Q4 -8 5 0 Q4 7 -1 7 Q-6 6 -5 -1 Q-4 -8 ${j() / 2} -16Z`, fill: '#ffc23a', opacity: .9 }, e) }
    else if (kind === 'bolt') e = el('circle', { r: 3.5, fill: '#8d8a82', stroke: '#4a4842' }, fx)
    else e = el('line', { stroke: rr() < .5 ? '#fff6c8' : '#ffcf5a', 'stroke-width': 2, 'stroke-linecap': 'round' }, fx)
    const sp = o.sp || 1, a = rr() * Math.PI * 2
    const p = { e, kind, x, y, life: 0, max: kind === 'smoke' ? 1.6 + rr() : kind === 'fire' ? .5 + rr() * .3 : kind === 'bolt' ? 1.4 : .35 + rr() * .25,
      vx: kind === 'smoke' ? (rr() - .5) * 18 : Math.cos(a) * (60 + rr() * 140) * sp, vy: kind === 'smoke' ? -30 - rr() * 30 : kind === 'fire' ? -50 : Math.sin(a) * (60 + rr() * 140) * sp - 40 }
    if (kind === 'bolt') { p.vx = (rr() - .5) * 60; p.vy = -60 }
    parts.push(p)
  }
  function stepParts(dt) {
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]; p.life += dt
      if (p.life >= p.max) { p.e.remove(); parts.splice(i, 1); continue }
      const k = p.life / p.max
      if (p.kind === 'smoke') { p.x += p.vx * dt; p.y += p.vy * dt; p.e.setAttribute('cx', p.x); p.e.setAttribute('cy', p.y); p.e.setAttribute('r', 8 + k * 26); p.e.setAttribute('opacity', (1 - k) * .75) }
      else if (p.kind === 'fire') { p.y += p.vy * dt; const sc = (1 - k * .7) * (p.s || (p.s = .8 + rr() * .7)); p.e.setAttribute('transform', `translate(${(p.x + (rr() - .5) * 3).toFixed(1)} ${p.y.toFixed(1)}) scale(${(sc * (1 + (rr() - .5) * .15)).toFixed(2)} ${sc.toFixed(2)})`); p.e.setAttribute('opacity', 1 - k * k) }
      else if (p.kind === 'bolt') { p.vy += 500 * dt; p.x += p.vx * dt; p.y = Math.min(560, p.y + p.vy * dt); p.e.setAttribute('cx', p.x); p.e.setAttribute('cy', p.y); p.e.setAttribute('opacity', 1 - Math.max(0, k - .7) / .3) }
      else { p.vy += 400 * dt; const x2 = p.x + p.vx * .03, y2 = p.y + p.vy * .03; p.x += p.vx * dt; p.y += p.vy * dt; p.e.setAttribute('x1', p.x); p.e.setAttribute('y1', p.y); p.e.setAttribute('x2', x2); p.e.setAttribute('y2', y2); p.e.setAttribute('opacity', 1 - k) }
    }
  }
  const burst = (x, y, n, sp) => { for (let i = 0; i < n; i++) emit('spark', x, y, { sp }) }

  // ---- 状態
  let S = null, R = null, nameA = '', nameB = '', paused = false, jolt = 0, tutFor = null
  const tutDone = {}
  const broken = { plateRot: 0, tapeFall: -1, crack: false, dent: false, tick: false, lampsDead: [] }
  function resetMachine() {
    tubes.forEach(t => { t.dead = false; t.crack.setAttribute('opacity', 0) })
    Object.assign(broken, { plateRot: 0, tapeFall: -1, crack: false, dent: false, tick: false, lampsDead: [] })
    $('#plate').removeAttribute('transform'); $('#tape').setAttribute('transform', 'rotate(8 234 104)'); $('#tape').style.opacity = 1
    $('#crack').setAttribute('opacity', 0); $('#sideDent').setAttribute('opacity', 0)
    $('#paper').setAttribute('height', 0); $('#plug').removeAttribute('transform')
    parts.splice(0).forEach(p => p.e.remove())
  }
  function newState() {
    const order = ['stick', 'heat', 'lever', 'plug'].map(k => [k, rr()]).sort((a, b) => a[1] - b[1]).map(a => a[0])
    return { t: -0.8, br: 0, temp: 34, ev: {}, next: 2.2, order, blows: 0, fixes: 0, fails: 0, nv: 0, nvel: 0, over: false, endT: 0, msg: null, msgT: 0, lastWhir: 0, log: [] }
  }

  // ---- 不調の発生と結末
  function spawn(force) {
    const act = Object.keys(S.ev)
    let type = force || S.order.find(k => !S.log.some(l => l[1] === k) && !S.ev[k])
    if (!type) { const c = ['stick', 'heat', 'lever', 'plug'].filter(k => !S.ev[k]); type = c[Math.floor(rr() * c.length)] }
    if (!type || S.ev[type] || act.length >= 2) return
    const first = !tutDone[type]
    const lim = (type === 'lever' ? 5 : 4) * (first ? 1.5 : 1)
    const e = { t0: S.t, lim, first, n: 0 }
    if (type === 'lever') e.g = .2 + rr() * .6
    if (type === 'heat') S.temp = Math.max(S.temp, 66)
    S.ev[type] = e; S.log.push([+S.t.toFixed(2), type, 'start'])
    Snd.play(type === 'plug' ? 'spark' : 'weird', { vol: .55 })
    if (first && !tutFor) showTut(type)
  }
  function end(type, ok) {
    const e = S.ev[type]; if (!e) return
    delete S.ev[type]; S.log.push([+S.t.toFixed(2), type, ok ? 'fix' : 'blow'])
    if (type === tutFor) { tutDone[type] = true; hideTut(); const nxt = Object.keys(S.ev).find(k => !tutDone[k]); if (nxt) showTut(nxt) }
    if (ok) {
      S.fixes++; say('fixed', .9); Snd.play('lever', { vol: .4, rate: 1.3 })
      if (type === 'heat') { Snd.play('steam', { vol: .5 }); for (let i = 0; i < 6; i++) emit('smoke', 130 + rr() * 110, 346) }
      if (type === 'stick') S.nvel += 260
    } else {
      S.blows++; S.br = Math.min(100, S.br + 15); say('blow', 1.1); jolt = 1
      const [x, y] = { stick: [176, 290], heat: [180, 350], lever: [300, 280], plug: [30, 530] }[type]
      burst(x, y, 16, 1.3); Snd.play('spark', { vol: .8 }); Snd.play(rr() < .5 ? 'fall' : 'glass', { vol: .7 }); Snd.duck(.4, 1)
      if (type === 'heat') { S.temp = 58; for (let i = 0; i < 8; i++) emit('fire', 120 + rr() * 120, 350); for (let i = 0; i < 8; i++) emit('smoke', 130 + rr() * 110, 340, { dark: true }) }
      breakPart()
    }
  }
  function breakPart() {
    const opts = []
    if (tubes.some(t => !t.dead)) opts.push('tube')
    if (!broken.plateRot) opts.push('plate')
    if (broken.tapeFall < 0) opts.push('tape')
    if (!broken.crack) opts.push('crack')
    if (!broken.dent) opts.push('dent')
    if (!broken.tick) opts.push('tick')
    if (broken.lampsDead.length < 4) opts.push('lamp')
    const k = opts[Math.floor(rr() * opts.length)] || 'bolt'
    if (k === 'tube') { const t = tubes.filter(t => !t.dead)[0]; t.dead = true; t.crack.setAttribute('opacity', 1); burst(t.x, 96, 10, .8); Snd.play('glass', { vol: .6 }) }
    if (k === 'plate') { broken.plateRot = rr() < .5 ? 9 : -8; const px = broken.plateRot > 0 ? 92 : 260; $('#plate').setAttribute('transform', `rotate(${broken.plateRot} ${px} 169)`); emit('bolt', broken.plateRot > 0 ? 260 : 92, 169) }
    if (k === 'tape') broken.tapeFall = 0
    if (k === 'crack') { broken.crack = true; $('#crack').setAttribute('opacity', 1) }
    if (k === 'dent') { broken.dent = true; $('#sideDent').setAttribute('opacity', .9) }
    if (k === 'tick') broken.tick = true
    if (k === 'lamp') broken.lampsDead.push(Math.floor(rr() * 10))
    emit('bolt', 70 + rr() * 210, 150 + rr() * 300)
  }

  // ---- 操作
  function smack() {
    jolt = Math.max(jolt, .6); Snd.play('smack', { vol: .9 }); burst(40, 320 + (rr() - .5) * 80, 4, .6)
    const e = S.ev.stick
    if (e) { e.n++; S.nvel += 140 * (rr() < .5 ? -1 : 1); if (e.n >= 2) end('stick', true) }
    else { S.br = Math.min(100, S.br + 1.5); S.fails++; say('hit', .7) }
  }
  function fanStroke() {
    Snd.play('fan', { vol: .55 }); S.temp = Math.max(28, S.temp - 9)
    for (let i = 0; i < 2; i++) emit('smoke', 140 + rr() * 90, 346)
    const e = S.ev.heat; if (e) { e.n++; if (S.temp < 48) end('heat', true) }
  }
  let leverAnim = 0
  function pullLever() {
    leverAnim = 1; Snd.play('lever', { vol: .8 })
    const e = S.ev.lever
    if (!e) { Snd.play('boing', { vol: .5 }); return }
    const pos = leverPos(e)
    if (Math.abs(pos - e.g) <= .13) end('lever', true)
    else { e.n++; S.fails++; S.br = Math.min(100, S.br + 3); Snd.play('clank', { vol: .8 }); say('miss', .8); e.g = .2 + rr() * .6; jolt = Math.max(jolt, .4) }
  }
  const leverPos = e => (Math.sin((S.t - e.t0) * Math.PI * 2 / 1.6 - Math.PI / 2) + 1) / 2
  function plugTap() {
    const e = S.ev.plug
    Snd.play('plug', { vol: .8 })
    if (!e) return
    e.n++; burst(30, 530, 3, .5); if (e.n >= 3) end('plug', true)
  }

  // ---- 電光表示
  function say(k, sec) { S.msg = k; S.msgT = sec }
  let tickText = '', tickW = 0
  function setTick(txt) {
    if (txt === tickText) return
    tickText = txt; const t = $('#tick'); t.textContent = txt
    try { tickW = t.getComputedTextLength() } catch (e) { tickW = 0 }
  }
  function tickNow(time) {
    const T = U().tick
    let k = 'idle'
    if (S) {
      if (S.over) k = S.endT > 2.2 ? 'done' : 'print'
      else if (S.msgT > 0) k = S.msg
      else { const a = Object.keys(S.ev); k = a.length ? a[Math.floor(time / 1.2) % a.length] : 'run' }
    }
    let txt = T[k]
    if (broken.tick && S && !S.over) { const r = mul(Math.floor(time * 4)); txt = [...txt].map(c => r() < .22 ? '#' : c).join('') }
    setTick(txt)
    const t = $('#tick')
    if (tickW > 156) { const span = tickW + 60, x = 96 + 160 - ((time * 40) % span); t.setAttribute('text-anchor', 'start'); t.setAttribute('x', x) }
    else { t.setAttribute('text-anchor', 'middle'); t.setAttribute('x', 176) }
  }

  // ---- 指ガイド（初めての不調だけ）
  function showTut(type) {
    tutFor = type
    const u = U().tut, txt = type === 'heat' && !isTouch ? u.heatPc : u[type]
    $('#tutTxt').textContent = txt
    const tut = $('#tut'); tut.className = type === 'heat' ? 'swipe' : type === 'lever' ? 'pull' : ''
    tut.hidden = false; placeTut()
  }
  function hideTut() { tutFor = null; $('#tut').hidden = true }
  function placeTut() {
    if (!tutFor) return
    const r = $('#h' + { stick: 'Side', heat: 'Vent', lever: 'Lever', plug: 'Plug' }[tutFor]).getBoundingClientRect()
    const tut = $('#tut'), x = clamp(r.left + r.width / 2, 50, innerWidth - 50), y = clamp(r.top + r.height * (tutFor === 'lever' ? .2 : .45), 60, innerHeight - 80)
    tut.style.left = x + 'px'; tut.style.top = y + 'px'
  }

  // ---- 1コマ（固定 60Hz）
  const DT = 1 / 60
  function step() {
    if (!S) return
    S.t += DT
    if (S.msgT > 0) S.msgT -= DT
    if (!S.over) {
      if (S.t >= DUR) return finish()
      if (S.t >= S.next && S.t < DUR - 4) { spawn(); S.next = S.t + Math.max(1.6, 2.2 + rr() * 1.6 - S.t * .012) }
      const act = Object.keys(S.ev).length
      S.br = Math.min(100, S.br + act * 1.6 * DT)
      for (const k in S.ev) { const e = S.ev[k]; if (k !== 'heat' && S.t - e.t0 > e.lim) end(k, false) }
      if (S.ev.heat) {
        S.temp += (S.ev.heat.first ? 7 : 11) * DT + (act - 1) * 2 * DT
        if (S.temp >= 100) end('heat', false)
      } else S.temp += ((38 + S.br * .2) - S.temp) * .4 * DT
      // 針: 測っているふり。止まっている間は動かない
      if (!S.ev.stick && S.t > 0) {
        const tgt = 45 + 35 * Math.sin(S.t * 1.7) * Math.sin(S.t * .63 + 1) + (rr() - .5) * S.br * .9
        S.nvel += (tgt - S.nv) * 18 * DT; S.nvel *= .9; S.nv += S.nvel * DT
      }
      if (S.t - S.lastWhir > 1.3 && S.t > 0) { S.lastWhir = S.t; Snd.play('whir', { vol: .35, rate: 1 + S.temp / 300 }) }
      if (S.ev.plug && rr() < .06) { emit('spark', 30, 530); if (rr() < .3) Snd.play('spark', { vol: .4 }) }
      if (S.br > 60 && rr() < .03) emit('spark', 100 + rr() * 150, 150 + rr() * 300)
    } else {
      S.endT += DT
      const fin = R.needle
      if (fin === 'spin') S.nv += 400 * DT
      else if (fin === 'jit') S.nv = 60 + (rr() - .5) * 120
      else { S.nvel += (fin - S.nv) * 30 * DT; S.nvel *= .85; S.nv += S.nvel * DT }
      if (S.endT < 2.2) { $('#paper').setAttribute('height', Math.min(70, S.endT * 34)); if (Math.floor(S.endT * 5) !== Math.floor((S.endT - DT) * 5)) Snd.play('paper', { vol: .3 }) }
      if (S.endT >= 2.6 && !S.shown) { S.shown = true; showEnd() }
    }
    if (S.temp > 62 && rr() < (S.temp - 62) / 30 + (S.ev.heat ? .25 : 0)) emit('smoke', 120 + rr() * 130, 346, { dark: S.temp > 85 })
    if (S.br > 45 && rr() < .04) emit('smoke', 110 + rr() * 140, 70, { dark: true })
    jolt *= .9
    if (leverAnim > 0) leverAnim = Math.max(0, leverAnim - DT * 2.2)
    if (broken.tapeFall >= 0 && broken.tapeFall < 2) broken.tapeFall += DT
    stepParts(DT)
  }
  function finish() {
    S.over = true; hideTut()
    for (const k in S.ev) delete S.ev[k]
    R = makeResult()
    Snd.play('ding', { vol: .8 }); Snd.play('drum', { vol: .6, delay: .3 }); Snd.duck(.3, 2.5)
  }

  // ---- 見た目を状態に合わせる
  function render(time) {
    const sh = S && !S.over ? .3 + Object.keys(S.ev).length * 1.1 + Math.max(0, S.temp - 70) * .06 + S.br * .015 : S && S.over ? .2 : 0
    const amp = sh + jolt * 6
    $('#mach').setAttribute('transform', amp ? `translate(${((Math.random() - .5) * amp).toFixed(2)} ${((Math.random() - .5) * amp * .6).toFixed(2)})` : '')
    const nv = S ? S.nv : 2 + Math.sin(time * 3) * 1.5
    const st = S && S.ev.stick ? (Math.random() - .5) * 1.5 : 0
    $('#needle').setAttribute('transform', `rotate(${(S && R && R.needle === 'spin' && S.over ? nv : ang(clamp(nv, -4, 122))) + st} ${CX} ${CY})`)
    const temp = S ? S.temp : 30
    const hot = clamp((temp - 60) / 40, 0, 1)
    $('#hotTint').setAttribute('opacity', hot * .32); $('#hotGlow').setAttribute('opacity', hot * .9)
    const colH = clamp((temp - 20) / 85, 0, 1) * 84
    $('#thermoCol').setAttribute('y', 440 - colH); $('#thermoCol').setAttribute('height', colH)
    const power = !S ? .35 : S.over ? .9 : S.ev.plug ? .15 + Math.random() * .5 : .8 + hot * .2
    tubes.forEach((t, i) => { const o = t.dead ? 0 : power * (.75 + Math.sin(time * 7 + i * 2) * .1); t.glow.setAttribute('opacity', o); t.fil.setAttribute('stroke', t.dead ? '#3a3a3a' : o > .3 ? '#ffb24a' : '#7a4a22') })
    const lit = S ? (S.over ? 10 : Math.floor(clamp(S.t, 0, DUR) / DUR * 10)) : 0
    lamps.forEach((l, i) => l.classList.toggle('on', i < lit && !broken.lampsDead.includes(i)))
    $('#mach').classList.toggle('dim', !!(S && S.ev.plug && Math.random() < .5))
    // 押す所の光
    for (const k in PART) HL[PART[k]].setAttribute('display', S && S.ev[k] ? 'inline' : 'none')
    $('#meterFlash').setAttribute('opacity', S && S.ev.stick ? .25 + Math.sin(time * 14) * .15 : 0)
    // レバー
    const le = S && S.ev.lever
    $('#tGreen').setAttribute('opacity', le ? .95 : .3)
    if (le) { $('#tGreen').setAttribute('y', 243.5 + le.g * 85 - 11); $('#tDot').setAttribute('y', 240 + leverPos(le) * 85); $('#tDot').setAttribute('opacity', 1) }
    else $('#tDot').setAttribute('opacity', .25)
    $('#leverLamp').setAttribute('fill', le ? (Math.sin(time * 16) > 0 ? '#ff6a3a' : '#3c2f22') : '#3c2f22')
    $('#lever').setAttribute('transform', `rotate(${Math.sin(leverAnim * Math.PI) * 38} 296 340)`)
    // 差しこみ
    const pe = S && S.ev.plug
    const out = pe ? clamp((S.t - pe.t0) / pe.lim, 0, 1) * (1 - pe.n * .28) : 0
    $('#plug').setAttribute('transform', out ? `translate(${(out * 16).toFixed(1)} ${(out * 10).toFixed(1)}) rotate(${(out * 16).toFixed(1)} 25 545)` : '')
    // 落ちる貼り紙
    if (broken.tapeFall >= 0) { const k = Math.min(1, broken.tapeFall / 1.4); $('#tape').setAttribute('transform', `translate(${k * 40} ${k * k * 380}) rotate(${8 + k * 160} 234 104)`); $('#tape').style.opacity = 1 - Math.max(0, k - .8) * 5 }
    tickNow(time)
    placeTut()
  }

  let last = performance.now(), acc = 0
  function loop(now) {
    acc += Math.min(.1, (now - last) / 1000); last = now
    if (!paused) while (acc >= DT) { step(); acc -= DT } else acc = 0
    render(now / 1000)
    requestAnimationFrame(loop)
  }

  // ---- 入力（本物の指・マウスで押す）
  let drag = null
  const svgScale = () => { const m = svg.getScreenCTM(); return m ? m.a : 1 }
  svg.addEventListener('pointerdown', e => {
    if (!S || S.over) return
    const part = e.target.closest && e.target.closest('[data-part]'); if (!part) return
    e.preventDefault(); Snd.init()
    const p = part.dataset.part
    if (p === 'side') smack()
    else if (p === 'plug') plugTap()
    else if (p === 'vent') { drag = { type: 'fan', x: e.clientX, y: e.clientY, acc: 0 }; try { svg.setPointerCapture(e.pointerId) } catch (er) {} moveFan(e) }
    else if (p === 'lever') { drag = { type: 'lever', y0: e.clientY, pulled: false }; try { svg.setPointerCapture(e.pointerId) } catch (er) {} }
  })
  svg.addEventListener('pointermove', e => {
    if (!drag || !S || S.over) return
    const sc = svgScale()
    if (drag.type === 'fan') {
      drag.acc += Math.hypot(e.clientX - drag.x, e.clientY - drag.y) / sc; drag.x = e.clientX; drag.y = e.clientY
      while (drag.acc >= 70) { drag.acc -= 70; fanStroke() }
      moveFan(e)
    } else if (!drag.pulled && (e.clientY - drag.y0) / sc > 20) { drag.pulled = true; pullLever() }
  })
  const up = () => { if (drag && drag.type === 'lever' && !drag.pulled && S && !S.over) pullLever(); drag = null; $('#fanCur').hidden = true }
  svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up)
  function moveFan(e) { const f = $('#fanCur'); f.hidden = false; f.style.left = e.clientX + 'px'; f.style.top = e.clientY + 'px'; f.style.transform = `translate(-50%,-30%) rotate(${((e.clientX % 60) - 30) * .8}deg)` }

  // ---- 結果
  function makeResult() {
    const b = base(nameA, nameB), br = S.br
    const tier = br < 25 ? 0 : br < 50 ? 1 : br < 80 ? 2 : 3
    const bk = []; while (bk.length < 3) { const i = Math.floor(rr() * D.broken.length); if (!bk.includes(i)) bk.push(i) }
    const r = { b, tier, br: Math.round(br), bk, wild: tier === 3 ? Math.floor(rr() * 4) : -1, over: 101 + Math.floor(rr() * 59), swap: rr() < .5 ? 'past' : 'future', glitch: Math.floor(rr() * 1e6) }
    r.mech = S.fixes === 0 ? 3 : S.blows === 0 ? 0 : S.blows <= 2 ? 1 : 2
    r.needle = tier <= 1 ? b.pct : tier === 2 ? 108 : [120, -3, 'spin', 'jit'][r.wild]
    r.fixes = S.fixes; r.blows = S.blows
    return r
  }
  function pctText(r) {
    const u = U()
    if (r.tier === 3) return u.wild[r.wild]
    if (r.tier === 2) return [r.over + '%', u.pctTail[2]]
    return [r.b.pct + '%', u.pctTail[r.tier]]
  }
  function rows(r) {
    const u = U().r, ja = lang === 'ja'
    const past = (ja ? '' : 'In a past life, ') + L(D.past[r.b.past])
    let out = [
      ['type', u.type, L(D.type[r.b.type])],
      ['past', u.past, past],
      ['future', u.future, L(D.future[r.b.future])],
      ['lucky', u.lucky, L(D.lucky[r.b.lucky])]
    ]
    if (r.tier >= 2) { const i = out.findIndex(o => o[0] === r.swap); out[i][2] = L(D.broken[r.bk[0]]) }
    if (r.tier === 3) {
      const o = out.findIndex(o => o[0] === (r.swap === 'past' ? 'future' : 'past')); out[o][2] = L(D.broken[r.bk[1]])
      out[3][2] = ja ? '消火器' : 'A fire extinguisher'
    }
    return out
  }
  function funnyLine(r) { const rs = rows(r); return r.tier >= 2 ? rs.find(o => o[0] === r.swap)[2] : rs[2][2] }

  // 感熱紙に印字する（保存する画像も同じ）
  async function drawReceipt() {
    const c = $('#rc'), x = c.getContext('2d'), r = R, u = U(), W = c.width, H = c.height
    const [pv, pt2] = pctText(r), rs = rows(r)
    const DOT = '"DotGothic16", ui-monospace, monospace'
    const all = [u.r.head, nameA, nameB, pv, pt2, u.r.foot, u.cond[r.tier], u.mech[r.mech], u.stamp, ...rs.flat()].join('')
    try { await Promise.race([document.fonts.load(`28px ${DOT}`, all), new Promise(ok => setTimeout(ok, 2500))]) } catch (e) {}
    x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, W, H)
    // 紙（上はちぎった跡、壊れているほど下が焦げて破れる）
    x.save()
    x.beginPath(); x.moveTo(0, 14)
    for (let i = 0; i <= 30; i++) x.lineTo(i * W / 30, i % 2 ? 4 : 14)
    const bottom = r.tier === 3 ? H - 30 : H - 4
    for (let i = 30; i >= 0; i--) x.lineTo(i * W / 30, bottom - (r.tier === 3 ? ((i * 37) % 23) : i % 2 ? 0 : 8))
    x.closePath(); x.fillStyle = '#fbf8ee'; x.fill(); x.clip()
    const rnd = mul(r.glitch)
    for (let i = 0; i < 900; i++) { x.fillStyle = `rgba(120,110,90,${rnd() * .05})`; x.fillRect(rnd() * W, rnd() * H, 2, 2) }
    if (r.tier >= 1) x.rotate((r.tier === 1 ? -.6 : -1.4) * Math.PI / 180)
    const ink = r.tier >= 2 ? '#3a332c' : '#24201b'
    x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'alphabetic'
    const font = s => { x.font = `${s}px ${DOT}` }
    const fitText = (t, maxW, s) => { font(s); while (x.measureText(t).width > maxW && s > 14) { s -= 2; font(s) } return s }
    const dash = y => { x.save(); x.strokeStyle = '#8a8070'; x.setLineDash([8, 7]); x.lineWidth = 2; x.beginPath(); x.moveTo(36, y); x.lineTo(W - 36, y); x.stroke(); x.restore() }
    font(26); x.fillText(u.r.head, W / 2, 66)
    font(19); x.fillStyle = '#5c5448'; const d = new Date(); x.fillText(`${u.r.no}${String(r.b.no).padStart(4, '0')}   ${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`, W / 2, 98)
    dash(120)
    x.fillStyle = ink
    fitText(nameA, W - 90, 36); x.fillText(nameA, W / 2, 168)
    font(26); x.fillText('×', W / 2, 206)
    fitText(nameB, W - 90, 36); x.fillText(nameB, W / 2, 248)
    dash(274)
    font(22); x.fillStyle = '#5c5448'; x.fillText(u.r.pct, W / 2, 312)
    x.fillStyle = r.tier === 3 ? '#8a2318' : ink
    fitText(pv, W - 80, 104); x.fillText(pv, W / 2, 410)
    font(24); x.fillStyle = ink; if (pt2) x.fillText(pt2.trim(), W / 2, 450)
    dash(476)
    // 行（左寄せ・折り返し）
    x.textAlign = 'left'
    let y = 516
    const wrap = (t, maxW) => { const out = []; let line = ''; for (const ch of (lang === 'ja' ? [...t] : t.split(/(?<= )/))) { if (x.measureText(line + ch).width > maxW && line) { out.push(line); line = ch.trimStart() } else line += ch } if (line) out.push(line); return out }
    for (const [k, lab, val0] of rs) {
      let val = val0
      if (r.tier === 3 && k === 'type') { const g = mul(r.glitch + 7); val = [...val].map(ch => g() < .3 ? '■' : ch).join('') }
      font(18); x.fillStyle = '#6e6556'; x.fillText(lab, 40, y)
      font(25); x.fillStyle = ink
      const ls = wrap(val, W - 80).slice(0, 3)
      if (r.tier === 3 && k === (r.swap === 'past' ? 'future' : 'past')) {
        // 1行だけ逆さまに印字される
        x.save(); x.translate(W / 2, y + 16 + ls.length * 17); x.rotate(Math.PI); x.textAlign = 'center'
        ls.forEach((l, i) => x.fillText(l, 0, -((ls.length - 1) * 34) / 2 + i * 34 + 9)); x.restore()
      } else ls.forEach((l, i) => x.fillText(l, 40, y + 34 + i * 33))
      y += 34 + ls.length * 33 + 14
    }
    dash(y - 4); y += 32
    font(20); x.fillStyle = '#6e6556'
    x.fillText(`${u.r.cond}: ${u.cond[r.tier]}`, 40, y); x.fillText(`${u.r.mech}: ${u.mech[r.mech]}`, 40, y + 32)
    x.textAlign = 'center'; font(19); x.fillStyle = '#5c5448'; if (r.tier < 3) x.fillText(u.r.foot, W / 2, Math.min(H - 30, y + 100))
    // 焦げ・にじみ
    if (r.tier >= 2) {
      // 紙の角から入る焦げ: 外側ほど黒く、縁はギザギザ
      const burn = (cx, cy, rad) => {
        for (const [k, col] of [[1.25, 'rgba(170,120,50,.28)'], [1, 'rgba(120,70,25,.75)'], [.78, 'rgba(45,25,12,.95)']]) {
          x.beginPath(); for (let i = 0; i <= 40; i++) { const a = i / 40 * Math.PI * 2, rr2 = rad * k * (.82 + rnd() * .3); x.lineTo(cx + Math.cos(a) * rr2, cy + Math.sin(a) * rr2) }
          x.closePath(); x.fillStyle = col; x.fill()
        }
      }
      burn(W + 10, H + 10, r.tier === 3 ? 150 : 100)
      if (r.tier === 3) { burn(-10, 140, 70); burn(W + 6, 330, 46) }
      x.fillStyle = 'rgba(40,35,30,.12)'; x.fillRect(0, 560 + rnd() * 220, W, 18)
    }
    x.restore()
    // 測定不能のハンコ
    if (r.tier === 3) {
      x.save(); x.translate(W - 150, 520); x.rotate(-12 * Math.PI / 180)
      x.strokeStyle = 'rgba(190,40,30,.82)'; x.fillStyle = 'rgba(190,40,30,.82)'; x.lineWidth = 6
      font(36); const sw = x.measureText(u.stamp).width + 32
      x.strokeRect(-sw / 2, -36, sw, 52); x.textAlign = 'center'; x.fillText(u.stamp, 0, 4); x.restore()
    }
  }

  function aff() {
    const box = $('#affBox'), url = window.AFF_URL || '', u = U()
    if (!url) { box.hidden = true; $('#bAff').removeAttribute('href'); return }
    $('#bAff').href = url; $('#affTxt').textContent = u.aff; $('#affNote').textContent = u.affNote
    box.hidden = false
  }
  async function showEnd() {
    document.body.classList.remove('play'); document.body.classList.add('end')
    $('#vEnd').hidden = false; aff()
    await drawReceipt()
    Snd.play('register', { vol: .8 }); Snd.play(R.tier <= 1 ? 'jgood' : 'jbad', { vol: .7, delay: .5 })
    Snd.loop('hum', null)
    window.TM && TM.end(100 - R.br, R.tier <= 1)
    window.__aishoShown = (window.__aishoShown || 0) + 1
  }

  // ---- 文言
  function applyLang() {
    const u = U(); document.documentElement.lang = lang
    document.title = lang === 'ja' ? '相性診断マシン（壊れてる）名前で恋愛・友達の相性診断' : 'The Compatibility Machine (Broken)'
    $('#tTitle').innerHTML = lang === 'ja' ? '相性診断マシン<small>（壊れてる）</small>' : 'The Compatibility Machine<small>(broken)</small>'
    $('#plateT').textContent = u.plate; $('#plateT').setAttribute('style', lang === 'ja' ? '' : 'font-size:17px')
    $('#tapeT').textContent = u.tape; $('#tLab').textContent = u.lab
    $('#nA').placeholder = u.you; $('#nB').placeholder = u.them
    $('#startTxt').textContent = u.start; $('#bRand').textContent = u.pickRandom; $('#bHow').textContent = u.how
    $('#bLang').textContent = lang === 'ja' ? 'EN' : 'JA'
    $('#bSave').textContent = u.save; $('#bPost').textContent = u.post; $('#bAgain').textContent = u.again
    $('#loadTxt').textContent = u.load
    $('#howH').textContent = u.how; $('#howClose').textContent = u.back
    $('#howBody').innerHTML = u.howBody.map(t => `<p>${t}</p>`).join('') + `<small>${u.credits}<br><a href="privacy.html" target="_blank" rel="noopener">${u.privacy}</a></small>`
    $('#nameMsg').textContent = ''
    $('#dialNg').textContent = lang === 'ja' ? '測定不能' : 'N/A'
    if (R && !$('#vEnd').hidden) { drawReceipt(); aff() }
    if (tutFor) showTut(tutFor)
  }
  function setMuteIco() { $('#icoWave').style.display = muted ? 'none' : '' }

  // ---- 始める・もう一回
  function start() {
    const a = $('#nA').value.trim(), b = $('#nB').value.trim()
    if (!a || !b) { $('#nameMsg').textContent = U().needName; (a ? $('#nB') : $('#nA')).focus(); return }
    nameA = a; nameB = b
    document.activeElement && document.activeElement.blur && document.activeElement.blur()
    Snd.init(); Snd.play('coin', { vol: .9 }); Snd.loop('amb', 'snd/amb.mp3', .22); Snd.loop('hum', 'snd/hum.mp3', .3)
    resetMachine(); R = null; S = newState(); hideTut()
    document.body.classList.add('play'); document.body.classList.remove('end'); $('#vEnd').hidden = true
    window.TM && TM.start()
  }
  function again() {
    S = null; R = null; resetMachine(); hideTut()
    document.body.classList.remove('play', 'end'); $('#vEnd').hidden = true
    Snd.loop('hum', null)
  }
  function randomNames() {
    const p = D.presets[Math.floor(Math.random() * D.presets.length)]
    const [a, b] = lang === 'ja' ? p[0] : p[1]
    $('#nA').value = a; $('#nB').value = b; $('#nameMsg').textContent = ''
  }
  const on = (s, f) => $(s).addEventListener('click', f)
  on('#bStart', start)
  on('#bRand', () => { Snd.init(); Snd.play('lever', { vol: .5 }); randomNames() })
  on('#bHow', () => { $('#how').hidden = false })
  on('#howClose', () => { $('#how').hidden = true })
  on('#bAgain', again)
  on('#bLang', () => { lang = lang === 'ja' ? 'en' : 'ja'; try { localStorage.setItem('aisho.lang', lang) } catch (e) {} applyLang() })
  on('#bMute', () => { muted = !muted; Snd.init(); Snd.setMute(muted); try { localStorage.setItem('aisho.mute', muted ? '1' : '0') } catch (e) {} setMuteIco() })
  on('#bSave', () => { window.TM && TM.share('save'); $('#rc').toBlob(b => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'aisho-machine.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000) }) })
  on('#bPost', () => {
    window.TM && TM.share('x')
    const u = U(), [pv, pt2] = pctText(R)
    const text = `${u.postHead}\n${u.r.pct} ${pv}${pt2}\n${funnyLine(R)}\n${u.tags}`   // 名前は入れない
    window.__lastPost = text
    open('https://x.com/intent/post?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent('https://tom3games.github.io/aisho-machine/'), '_blank')
  })
  $('#bAff').addEventListener('click', () => { window.TM && TM.aff() })
  $('#nA').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); $('#nB').focus() } })
  $('#nB').addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); start() } })
  $('#how').addEventListener('click', e => { if (e.target.id === 'how') $('#how').hidden = true })

  // ---- 検証用の窓口
  window.aisho = {
    base, norm,
    state: () => S && { t: S.t, br: S.br, temp: S.temp, ev: Object.keys(S.ev), fixes: S.fixes, blows: S.blows, fails: S.fails, over: S.over, log: S.log.slice() },
    ev: k => S && S.ev[k] && { ...S.ev[k], pos: k === 'lever' ? leverPos(S.ev[k]) : undefined },
    result: () => R && { ...R, pct: pctText(R), rows: rows(R) },
    tut: () => tutFor,
    partXY: name => { const r = $('#h' + name[0].toUpperCase() + name.slice(1)).getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, top: r.top, bottom: r.bottom, left: r.left, right: r.right } },
    leverXY: () => { const r = $('#lever circle').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 } },
    dbg: {
      pause: b => { paused = b !== false }, step: n => { for (let i = 0; i < (n || 1); i++) step(); render(performance.now() / 1000) },
      seed: n => { rr = mul(n) }, setBreak: v => { if (S) S.br = v }, finish: () => { if (S && !S.over) finish() },
      spawn: k => { if (S) spawn(k) }, fx: () => parts.length,
      set: o => { if (S) Object.assign(S, o) }, burst: (x, y, n) => burst(x, y, n, 1.3),
      act: k => { if (S && !S.over) ({ smack, fan: fanStroke, lever: pullLever, plug: plugTap })[k]() }
    }
  }

  // ---- 読み込み（フォントと音。終わってから消す。遅くても12秒で消す）
  applyLang(); setMuteIco()
  requestAnimationFrame(loop)
  let got = 0
  const total = ALL_SND.length + 1
  const tickBar = () => { got++; $('#loadBar i').style.width = (got / total * 100) + '%' }
  const fontP = Promise.race([Promise.all(['16px "DotGothic16"', '20px "Zen Antique"', '16px "Yomogi"'].map(f => document.fonts.load(f, '相性診断マシンこわれてますカイセキ'))), new Promise(ok => setTimeout(ok, 4000))]).catch(() => {}).then(tickBar)
  const sndP = ALL_SND.map(u => fetch(u).then(r => r.arrayBuffer()).catch(() => {}).then(tickBar))
  const done = () => {
    if (window.__aishoReady) return
    window.__aishoReady = true
    tickText = ''; const l = $('#loading'); l.style.opacity = 0; setTimeout(() => { l.style.display = 'none' }, 380)
  }
  Promise.all([fontP, ...sndP]).then(done)
  setTimeout(done, 12000)
})()
