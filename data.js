// 文言と結果の素（日英）。人をけなす言葉は入れない。笑いは機械の壊れ方と場面に寄せる
window.D = {
  ui: {
    ja: {
      title: '相性診断マシン（壊れてる）', plate: '相性診断マシン', tape: 'こわれてます',
      load: '真空管あたため中', lab: 'ふたりの名前を打つ', you: 'あなた', them: 'あいて', pickRandom: 'おまかせ', start: '100円を入れる', how: '遊び方', back: 'もどる',
      needName: '名前を2つ入れてください',
      save: '画像を保存', post: 'Xでポスト', again: 'もう一回', aff: 'ちゃんとした占い師に見てもらうなら', affNote: '17歳以上',
      privacy: 'プライバシーについて',
      howBody: [
        '二人の名前を入れて100円を入れると、古い相性診断マシンが動き出します。',
        'ただし壊れかけです。調子の悪い所が光ったら直してください。<b>針が止まったら横を叩く</b>、<b>煙が出たらこすってあおぐ</b>、<b>歯車が噛んだらランプが緑の時にレバーを引く</b>、<b>コンセントが抜けかけたら押しこむ</b>。',
        '最後に結果の紙が出ます。同じ二人なら同じ相性が出ます。機械の調子しだいで、ですが。',
        '名前はこの端末の中だけで使います。どこにも送らず、保存もしません。'
      ],
      credits: '音: CC0 / Public domain の録音素材（rubberduck・Kenney・artisticdude・Vinrax・Iwan Sounds and DIY・Oreocooke・cori ほか）',
      tut: { stick: 'たたく', heat: 'こすってあおぐ', heatPc: 'ドラッグであおぐ', lever: '緑で引く', plug: '押しこむ' },
      tick: { idle: 'ゴヨウノ　カタハ　100エン', run: 'カイセキチュウ', stick: 'ハリ　ガ　ウゴカナイ', heat: 'ネツ　ボウソウ', lever: 'ハグルマ　ガ　カンダ', plug: 'デンキ　ガ　タリナイ', fixed: 'ナオッタ', blow: 'ドカン', miss: 'ガコン', hit: 'イタイ', print: 'ケッカ　インサツチュウ', done: 'マタ　ドウゾ' },
      r: { head: '相性診断マシン 3号機', pct: '相性', type: 'タイプ', past: '前世', future: 'この先', lucky: 'ラッキーアイテム', cond: '機械の調子', mech: '整備の腕', foot: 'またのご来店をお待ちしています', no: 'No.' },
      cond: ['良好', '少し熱い', '煙が出ている', '燃えた'],
      mech: ['名人', 'まあまあ', '見習い', '見てただけ'],
      pctTail: ['', '（たぶん）', '（計測オーバー）'],
      wild: [['120%', '（測定不能）'], ['-3%', '（逆に合う）'], ['999%', '（針が折れた）'], ['??%', '（数字が燃えた）']],
      stamp: '測定不能',
      postHead: '相性診断マシン（壊れてる）の結果', tags: '#相性診断 #相性診断マシン'
    },
    en: {
      title: 'The Compatibility Machine (Broken)', plate: 'COMPATIBILITY', tape: 'OUT OF ORDER',
      load: 'Warming the tubes', lab: 'Type two names', you: 'You', them: 'Them', pickRandom: 'Random', start: 'Insert a coin', how: 'How to play', back: 'Back',
      needName: 'Enter two names',
      save: 'Save image', post: 'Post on X', again: 'Again', aff: 'For a proper fortune teller', affNote: '17+',
      privacy: 'Privacy',
      howBody: [
        'Type two names and drop in a coin. An old compatibility machine starts up.',
        'It is falling apart. When a part lights up, fix it: <b>needle stuck, smack the side</b>. <b>Smoke, rub to fan it</b>. <b>Gears jammed, pull the lever on green</b>. <b>Plug slipping, push it back in</b>.',
        'A slip prints at the end. The same two names get the same match. Depending on how the machine holds up.',
        'Names are only used on this device. Nothing is sent or saved.'
      ],
      credits: 'Sound: CC0 / public domain recordings (rubberduck, Kenney, artisticdude, Vinrax, Iwan Sounds and DIY, Oreocooke, cori and others)',
      tut: { stick: 'Smack', heat: 'Rub to fan', heatPc: 'Drag to fan', lever: 'Pull on green', plug: 'Push in' },
      tick: { idle: 'INSERT COIN', run: 'ANALYZING', stick: 'NEEDLE STUCK', heat: 'OVERHEAT', lever: 'GEAR JAM', plug: 'LOW POWER', fixed: 'FIXED', blow: 'BANG', miss: 'CLUNK', hit: 'OUCH', print: 'PRINTING', done: 'COME AGAIN' },
      r: { head: 'COMPATIBILITY MACHINE No.3', pct: 'MATCH', type: 'TYPE', past: 'PAST LIFE', future: 'AHEAD', lucky: 'LUCKY ITEM', cond: 'MACHINE', mech: 'REPAIR SKILL', foot: 'THANK YOU, COME AGAIN', no: 'No.' },
      cond: ['Fine', 'A bit hot', 'Smoking', 'On fire'],
      mech: ['Master', 'Decent', 'Apprentice', 'Just watched'],
      pctTail: ['', ' (probably)', ' (off the scale)'],
      wild: [['120%', ' (unmeasurable)'], ['-3%', ' (so it works)'], ['999%', ' (needle snapped)'], ['??%', ' (digits burned)']],
      stamp: 'NO READING',
      postHead: 'The Compatibility Machine (Broken) says', tags: '#CompatibilityTest'
    }
  },
  // おまかせの名前（実在の人にしない）
  presets: [
    [['自分', '推し'], ['Me', 'My idol']], [['たろう', 'はなこ'], ['Taro', 'Hanako']], [['店長', '新人バイト'], ['The manager', 'The new hire']],
    [['ぼく', 'となりの席の人'], ['Me', 'The person next to me']], [['猫', 'こたつ'], ['The cat', 'The kotatsu']], [['月曜日', 'わたし'], ['Monday', 'Me']],
    [['課長', 'コピー機'], ['The boss', 'The copier']], [['朝', '布団'], ['Morning', 'My futon']], [['わたし', '昨日のわたし'], ['Me', 'Yesterday me']],
    [['カレー', '福神漬け'], ['Curry', 'Pickles']]
  ],
  type: [
    ['回転寿司型', 'Conveyor-sushi type'], ['自販機の当たり型', 'Vending-machine-bonus type'], ['二度寝型', 'Snooze-button type'], ['こたつ型', 'Kotatsu type'],
    ['乗り換え案内型', 'Transit-app type'], ['半額シール型', 'Half-price-sticker type'], ['洗濯機の脱水型', 'Spin-cycle type'], ['迷子のエレベーター型', 'Lost-elevator type'],
    ['夏祭りの金魚型', 'Festival-goldfish type'], ['折りたたみ傘型', 'Folding-umbrella type'], ['充電ケーブル型', 'Charging-cable type'], ['合鍵型', 'Spare-key type'],
    ['湯たんぽ型', 'Hot-water-bottle type'], ['おでんの大根型', 'Oden-radish type'], ['手書きの地図型', 'Hand-drawn-map type'], ['ラジオ体操型', 'Morning-exercise type']
  ],
  past: [
    ['借金の貸し借りがあった', 'one of you owed the other money'], ['同じ村の井戸を使っていた', 'you shared a village well'],
    ['文通相手だった（返事は2年おき）', 'you were pen pals (one reply every 2 years)'], ['同じ船の船乗りだった', 'you sailed on the same ship'],
    ['どちらかが、どちらかの家の猫だった', 'one of you was the other\'s cat'], ['同じ団子屋の常連だった', 'you were regulars at the same dumpling shop'],
    ['将棋の相手だった（決着つかず）', 'you were shogi rivals (no winner yet)'], ['同じ灯台を交代で守っていた', 'you took turns keeping a lighthouse'],
    ['傘を借りたまま返していない', 'an umbrella was borrowed and never returned'], ['となりの畑だった', 'you farmed next-door fields'],
    ['同じ郵便配達の道を歩いていた', 'you walked the same mail route'], ['一緒に大きなカブを抜いた', 'you pulled a giant turnip together']
  ],
  future: [
    ['3年後、同じ回転寿司で再会', 'meet again at the same sushi train in 3 years'], ['来週、同じタイミングでくしゃみをする', 'sneeze at the same moment next week'],
    ['5年後、同じ福引で二人ともティッシュをもらう', 'both win tissues at the same raffle in 5 years'], ['次の雨の日、同じ色の傘をさす', 'carry the same color umbrella next time it rains'],
    ['2年後、同じ映画の同じ場面で泣く', 'cry at the same movie scene in 2 years'], ['今年中に、同じ駅で同じ電車を逃す', 'miss the same train at the same station this year'],
    ['10年後、どちらかの家のこたつで寝落ちする', 'fall asleep at a kotatsu in 10 years'], ['来月、同じ自販機で同じ飲み物を買う', 'buy the same drink from the same machine next month'],
    ['7年後、同じ迷子のお知らせを聞く', 'hear the same lost-child announcement in 7 years'], ['いつか同じ夜に、同じ月を見て「丸い」と言う', 'look at the same moon one night and both say "round"'],
    ['半年後、同じ店で最後の1個を取り合う', 'reach for the last one on the same shelf in 6 months'], ['4年後、同じ写真に偶然うつりこむ', 'photobomb the same stranger\'s photo in 4 years']
  ],
  lucky: [
    ['輪ゴム', 'A rubber band'], ['半額シール', 'A half-price sticker'], ['予備の電池', 'A spare battery'], ['折りたたみ傘', 'A folding umbrella'],
    ['つまようじ', 'A toothpick'], ['もめん豆腐', 'Firm tofu'], ['回数券', 'A ticket book'], ['蚊取り線香', 'A mosquito coil'],
    ['洗濯ばさみ', 'A clothespin'], ['方位磁石', 'A compass'], ['栓抜き', 'A bottle opener'], ['うちわ', 'A paper fan']
  ],
  // 壊れた時だけ出る行（人ではなく機械と場面の話）
  broken: [
    ['となりの家の犬のほうが合う', 'The neighbor\'s dog is a better match'], ['この結果は電子レンジとの相性です', 'This reading is for a microwave'],
    ['二人の共通点: 同じ空気を吸っている', 'Common ground: you both breathe air'], ['計算中に昼ごはんのことを考えていた', 'The machine was thinking about lunch'],
    ['結果は明日の朝、郵便受けに届きます（届きません）', 'Results arrive by mail tomorrow (they will not)'], ['この先: 煙でよく見えない', 'Ahead: too much smoke to see'],
    ['この相性は保証期間外です', 'This match is out of warranty'], ['測っている間に針が一周した', 'The needle went all the way around'],
    ['相性の代わりに室温を測りました: 38℃', 'Measured room temperature instead: 38C'], ['この機械とコンセントの相性: 最悪', 'This machine and its outlet: a terrible match'],
    ['となりの自販機のほうがこの機械と合う', 'The vending machine next door gets along with it better'], ['前世の記録は燃えました', 'Past-life records burned up']
  ]
}
