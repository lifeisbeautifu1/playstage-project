kaboom({
  global: true,
  fullscreen: true,
  scale: 4,
  debug: true,
  clearColor: [0, 0, 0, 1],
});

// Constants
const MOVE_SPEED = 120,
  BIG_JUMP_FORCE = 500,
  ENEMY_SPEED = 20,
  FALL_DEATH = 500;
let JUMP_FORCE = 250,
  isJumping = true,
  ENEMY_CURRENT_DIRECTION = 20,
  CURRENT_JUMP_FORCE = JUMP_FORCE;

loadRoot('https://i.imgur.com/');
loadSprite('pipe', 'MtZHqBo.png');
loadSprite('kaboom', 'o9WizfI.png');
loadSprite('brokenPlatform', 'PXYcMlR.png');
loadSprite('tiles2', '6I4bBXm.png', {
  sliceX: 48,
  sliceY: 22,
});
loadSprite('tiles', 'KXNFR2s.png', {
  sliceX: 20,
  sliceY: 20,
  anims: {
    idle: { from: 300, to: 300 },
    run: { from: 301, to: 303 },
    idleEnemy: { from: 320, to: 322 },
    lastEnemyRun: { from: 360, to: 362 },
    flying: { from: 380, to: 381 },
    bat: { from: 383, to: 384 },
    jumpingThingy: { from: 163, to: 165 },
    jump: { from: 305, to: 305 },
    jumpp: { from: 304, to: 304 },
    hornEnemy: {
      from: 340,
      to: 343,
    },
  },
});

// Game scene
scene('game', ({ level, score }) => {
  layers(['bg', 'obj', 'ui'], 'obj');

  // Our maps
  const maps = [
    [
      '                                         ',
      '                                         ',
      '                   ж      н г н       жжжжжжж     ',
      'b             г   д г и д н г о      д       г    ',
      'b-------7-----г   д г   д плллс      д       г   ',
      'b       7     г и д ежжжз---г    и   д-------г   ',
      'b       ^     г   д   q     г        д       г    ',
      'b      123    ежжжз         г        д       ежжжз     ',
      'b      456      ф q         г        д          ',
      'b            w  Ф           ежжжжжжжжз        >  d     ',
      'b   >       zxc  W w        77  7    |       абббв    ',
      'b   i       v b zxxc        97  7    s       г ',
      'bD  l W  w  v b v  b      p  ^  8            г  ',
      'b===========v b-v  b wW >p p123              г ',
      'b           v bллм  zxxxc   456              г     ',
      'b         клv b  н  v   b         >          г       ',
      'b         н v b  н  v   bтух     hkr  w m W nг       ',
      'b         н v b  o      b  b   hr   zxxxxxxxx         ',
      '                           b   v            ',
      '                           baaav           ',
    ],
    [
      '         жжжжжжжжжжжжжжжжжжжж                         ',
      '        д 7  7  q 7 7  7  | qг и   д      г   д   ',
      '     и  д 7  7    7 7  7  |  г     д------г и д----г                       ',
      '        д 7  ^    7 8  7  s  г   и д  7   г   д 7  г   д    г д     г          ',
      '        д 7 123   7    ^     г     д  9   ежжжз 7  г   д    г д     г    д      ',
      '     и  д 7 456   ^   123    ежжжжжз      ф |   8  г и д    г длллллг    д---            ',
      '        д 9      123  456     Ф   q       Ф |      г   д----г д     г    д       ',
      '        д        456           W    >       s      ежжжз    ежз     ежжжжз          ',
      '     и  д                  эаббббббббв              Ф q      7      q |  ф     ',
      '        д                  юг и    и д                       ^        s  Ф     ',
      'bжжжжжжжз                  яг        д                      123               ',
      'b   q   s                   г        д >        W  w        456          W d    ',
      'bD      w                   ллллллллллллм     > абббв                  zxxxc   ',
      'bббббббббв             ~`@  г        д  н    кллг   д                  v    ',
      '  и      д   +       +      г        д  н    н  г и д            w     v     ',
      '         д       +          г        д  пллллс  г   д          аббв    v  ',
      '     и   д                  г        д          г   д  >    g  г  д    v     ',
      '         дaaaaaaaaaaaaaaaaaaг        д----------г   д  l w gg mг  д    v ',
      '                                     д          г    бббббббббб   д   nv    ',
      '                                                                  д    v   ',
      '                                                                  дaaaav     ',
    ],
    [
      '                            ',
      '                             ',
      'b  г    д   г       д    г    д    г   д',
      'b--г и  д---г  И    дллллг И  длм  г И д                 ',
      'b  ежжжжз 7 г       д    ежжжжз н  г   д     г    д      ',
      'b    ф    9 ежжжжжжжз     q  7  н  г   д     г    д    г    д ',
      'b    Ф        q 7  |         ^  пллг   длллллг И  д    г    д',
      'b  >            8  s        123    ежжжз  7  г    д----г И  д-----г  д ',
      'bd l                        456       s   7  ежжжжз    г    д  7  г  д ',
      'bxxxc     W        >    Ц                 9  q 7  ф    ежжжжз  7  г  д ',
      'b   b    zxc     ь l  M ц         T            ^  Ф     Ф 7    9  г  длллл ',
      'b И b  ! v b    АБББББББВ       Ь t  M        123         8       ежжз   ',
      'b   b Bl v b    Г       Д       АББББВ        456                  q ф  ',
      'b   bтуухv baaaaГ   И   Д   +   Г    Д          T !                  Ф',
      '                        Д !     Г  И Д >      ь t i         ?     О     ',
      '                        Д lW  w Г    Д i     АББББВ      ?        С Ь d ',
      '                         БББББББ     Д l  M  Г    Д   ?          zxxxxc   ',
      '                               КЛЛЛЛМ БББББББ  И  Д              v    b',
      '                               Н    П             Д              v  И b',
      '                               Н    П             Д              v    b',
      '                                                  Дaaaaaaaaaaaaaav    b',
    ],
    [
      '                                             ',
      'ЖЖЖЖЖЖЖЖЖ          ЖЖЖЖЖЖЖ                    ',
      ' ф  ф  Ф Г  ЖЖЖ   Д | ф ф Г                    ',
      ' ф  ф    ЕЖЗ 7qГ  Д s ф ф Г   ЖЖЖЖЖ            ',
      ' ф  ф    ф ф 7 ЕЖЖЗ   ф ф ЕЖЖЗ  7Ф Г   Д       ',
      ' ф  ф    ф ф 9 ф  ф   ф ф  ф ф  7  Г   Д       ',
      ' ф  ф    ф ф   ф  ф   ф ф  ф ф  7  Г   Д      ',
      ' {}}[    ф ф   ф  ф   {}[  ф ф  8  ЕЖЖЖЗ      ',
      '         ф ф   {}}[        ф ф     ф   ф      ',
      '         {}[               {}[     ф   ф           p        ',
      '                                   ф   ф           Y      ',
      '                                   ф   ф          ~``@        ',
      '                                   {}}}[  p               ',
      '                                             Y                  ',
      '                                          EFFFR            V       ',
      '                                          H   J           ~`@     p p ',
      '                                          H I J         w        EFFFG',
      '                                          H   J       EFFR       H   J',
      '                                          H   J   p   H  J   ь Y H   J                         Ц',
      '                                          H   J W    P I JXXXEFFF    J                    >    ц',
      '                                          H I  FFFFFF    J   H    I  J                T   i АББББББВ',
      '                                          H       I      J   H       J  ь   w      W  t АБББГ      _',
      '                                          H              J   H        ББББББВXXXXАББББББ    Г    W _ ь   Ь  M  d',
      '                                          H              JaaaH              Д    Г          ББББББББББББББББББББ',
      '                                          H               FFF               Д    Г                 ',
      '                                                                            ДaaaaГ                 ',
    ],
    [
      '                                                ГД  ГД  ГД',
      'Я                          ЭЮЮЮЯ                ГД  ГД  ГД ',
      'ЮХ                         ЭЮЮЮЯ                ГД  ГД  ГД                                          АЪЪЪЪЪЪЪЪЪВ',
      'ЮЮХ                        ЭЮЮЮЯ                ГД  ГД  ЕЗ                                          Щ         Щ    ',
      'ЮЮЯ                        ЧЙЙЙШ                ЕЗ  ГД                                              Щ    Ь    Щ   ',
      'ЮЮШ                         q                       ЕЗ  pp                                          Щ  ]ЪЪВ   Щ    ',
      'ЮШ            ь M                               pp      АВ                                          Щ     Щ   Щ   ',
      'Я        ыы   ~`@                               АВ  pp  ГД            ь                             Щ  ь  Щ   Щ    ',
      'ЮХ       ~@           Ц    ТУУУХ T              ГД  АВ  ГД Ц         ]ЪЪ$          T                ЕЪЪ$  Щ   Ё   ',
      'ЮЮХ   w   W   №%&   Ь ц w  ЭЮЮЮЯ t ь      w  Y  ГДM ГД ЬГД ц W  ь     s       ь pЬ t            Ц         Щ      T     Ц',
      'ЮЮЮУУУУУУУУУУХ*()ТУУУУУУУУУЮЮЮЮЮУУУУУХ p  АБББББ  ББ  ББ  ББББББВ       Ь    АББББББВ         p ц ь w  W  Щ W w  t ь   ц  d',
      'ЮЮЮЮЮЮЮЮЮЮЮЮЮЯ   ЭЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЯллллГ                     Д    ]ЪЪ$    Г      Д        АББББББББББББ ББББББББББББББББ        ',
      'ЮЮЮЮЮЮЮЮЮЮЮЮЮЯ   ЭЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЮЯ    Г                     Д            Г      Д        Г                      ',
      '                                                                Д            Г      Д    щ   Г                      ',
      '                                                                Д            Г      Д    Щ   Г                      ',
    ],
  ];

  const levelCfg = {
    width: 16,
    height: 16,
    '=': [sprite('tiles', { frame: 271 }), solid()],
    t: [sprite('tiles', { frame: 35 })],
    T: [sprite('tiles', { frame: 15 })],
    ы: [sprite('tiles', { frame: 13 })],
    Ц: [sprite('tiles', { frame: 14 })],
    ц: [sprite('tiles', { frame: 34 })],
    M: [sprite('tiles', { frame: 54 })],
    '<': [sprite('tiles', { frame: 184 })],
    i: [sprite('tiles', { frame: 204 })],
    '!': [sprite('tiles', { frame: 185 })],
    l: [sprite('tiles', { frame: 205 })],
    '>': [sprite('tiles', { frame: 186 })],
    m: [sprite('tiles', { frame: 94 })],
    I: [sprite('tiles', { frame: 206 })],
    w: [sprite('tiles', { frame: 37 })],
    W: [sprite('tiles', { frame: 38 })],
    ь: [sprite('tiles', { frame: 16 })],
    Ь: [sprite('tiles', { frame: 17 })],
    ф: [sprite('tiles', { frame: 19 })],
    Ф: [sprite('tiles', { frame: 39 })],
    '^': [sprite('tiles', { frame: 5 })],
    1: [sprite('tiles', { frame: 24 })],
    2: [sprite('tiles', { frame: 25 })],
    3: [sprite('tiles', { frame: 26 })],
    4: [sprite('tiles', { frame: 44 }), solid()],
    5: [sprite('tiles', { frame: 45 }), solid()],
    6: [sprite('tiles', { frame: 46 }), solid()],
    7: [sprite('tiles', { frame: 23 })],
    8: [sprite('tiles', { frame: 6 })],
    9: [sprite('tiles', { frame: 43 })],
    '-': [sprite('pipe'), solid()],
    '+': [sprite('tiles', { frame: 63 }), solid(), 'platform'],
    '?': [sprite('tiles', { frame: 71 }), solid(), 'my-block'],
    '~': [sprite('tiles', { frame: 64 }), solid()],
    '`': [sprite('tiles', { frame: 65 }), solid()],
    '@': [sprite('tiles', { frame: 66 }), solid()],
    '|': [sprite('tiles', { frame: 325 })],
    _: [sprite('tiles', { frame: 292 })],
    s: [sprite('tiles', { frame: 345 })],
    z: [sprite('tiles', { frame: 270 }), solid()],
    x: [sprite('tiles', { frame: 271 }), solid()],
    c: [sprite('tiles', { frame: 272 }), solid()],
    v: [sprite('tiles', { frame: 290 }), solid()],
    b: [sprite('tiles', { frame: 292 }), solid()],
    B: [sprite('tiles', { frame: 67 }), solid(), 'boom'],
    d: [sprite('tiles', { frame: 58 }), 'door'],
    D: [sprite('tiles', { frame: 59 })],
    a: [sprite('tiles', { frame: 122 }), solid(), 'deadly'],
    g: [sprite('tiles', { frame: 71 }), solid()],
    h: [sprite('tiles', { frame: 190 }), solid()],
    k: [sprite('tiles', { frame: 191 }), solid()],
    r: [sprite('tiles', { frame: 192 }), solid()],
    q: [sprite('tiles', { frame: 166 })],
    n: [
      sprite('tiles', { frame: 163 }),
      solid(),
      'up-down',
      { dir: 1, timer: 0.01, duration: 3 },
    ],

    а: [sprite('tiles', { frame: 195 }), solid()],
    б: [sprite('tiles', { frame: 196 }), solid()],
    в: [sprite('tiles', { frame: 197 }), solid()],
    г: [sprite('tiles', { frame: 215 }), solid()],
    д: [sprite('tiles', { frame: 217 }), solid()],
    е: [sprite('tiles', { frame: 235 }), solid()],
    ж: [sprite('tiles', { frame: 236 }), solid()],
    з: [sprite('tiles', { frame: 237 }), solid()],
    и: [sprite('tiles', { frame: 216 }), solid()],
    И: [sprite('tiles', { frame: 291 }), solid()],

    А: [sprite('tiles', { frame: 115 }), solid()],
    Б: [sprite('tiles', { frame: 116 }), solid()],
    В: [sprite('tiles', { frame: 117 }), solid()],
    щ: [sprite('tiles', { frame: 118 }), solid()],

    Г: [sprite('tiles', { frame: 135 }), solid()],
    Д: [sprite('tiles', { frame: 137 }), solid()],
    Щ: [sprite('tiles', { frame: 138 }), solid()],

    Е: [sprite('tiles', { frame: 155 }), solid()],
    Ж: [sprite('tiles', { frame: 156 }), solid()],
    З: [sprite('tiles', { frame: 157 }), solid()],
    Ё: [sprite('tiles', { frame: 158 }), solid()],

    '{': [sprite('tiles', { frame: 84 }), solid()],
    '}': [sprite('tiles', { frame: 85 }), solid()],
    '[': [sprite('tiles', { frame: 86 }), solid()],

    E: [sprite('tiles2', { frame: 18 }), solid()],
    F: [sprite('tiles2', { frame: 19 }), solid()],
    G: [sprite('tiles2', { frame: 20 }), solid()],
    H: [sprite('tiles2', { frame: 66 }), solid()],
    I: [sprite('tiles2', { frame: 67 }), solid()],
    J: [sprite('tiles2', { frame: 68 }), solid()],
    K: [sprite('tiles2', { frame: 114 }), solid()],
    L: [sprite('tiles2', { frame: 115 }), solid()],
    O: [sprite('tiles2', { frame: 116 }), solid()],
    Y: [sprite('tiles2', { frame: 119 }), solid()],

    P: [sprite('tiles2', { frame: 164 }), solid()],
    R: [sprite('tiles2', { frame: 165 }), solid()],
    Q: [sprite('tiles2', { frame: 212 }), solid()],
    S: [sprite('tiles2', { frame: 213 }), solid()],

    X: [sprite('tiles2', { frame: 258 }), solid(), 'fragile'],
    V: [sprite('tiles2', { frame: 449 })],

    // Pipes
    к: [sprite('tiles', { frame: 227 }), solid()],
    л: [sprite('tiles', { frame: 228 }), solid()],
    м: [sprite('tiles', { frame: 229 }), solid()],
    н: [sprite('tiles', { frame: 247 }), solid()],
    о: [sprite('tiles', { frame: 249 }), solid()],
    п: [sprite('tiles', { frame: 267 }), solid()],
    р: [sprite('tiles', { frame: 268 }), solid()],
    с: [sprite('tiles', { frame: 269 }), solid()],

    К: [sprite('tiles', { frame: 180 })],
    Л: [sprite('tiles', { frame: 181 })],
    М: [sprite('tiles', { frame: 182 })],
    Н: [sprite('tiles', { frame: 200 })],
    О: [sprite('tiles', { frame: 201 })],
    П: [sprite('tiles', { frame: 202 })],
    Р: [sprite('tiles', { frame: 220 })],
    С: [sprite('tiles', { frame: 221 })],
    Т: [sprite('tiles', { frame: 222 })],

    // Saw
    т: [sprite('tiles', { frame: 124 }), solid()],
    у: [sprite('tiles', { frame: 125 }), solid()],
    х: [sprite('tiles', { frame: 126 }), solid()],
    э: [sprite('tiles', { frame: 60 })],
    ю: [sprite('tiles', { frame: 80 })],
    я: [sprite('tiles', { frame: 100 })],

    ']': [sprite('tiles', { frame: 175 }), solid()],
    Ъ: [sprite('tiles', { frame: 176 }), solid()],
    $: [sprite('tiles', { frame: 177 }), solid()],

    '№': [sprite('tiles', { frame: 140 })],
    '%': [sprite('tiles', { frame: 141 })],
    '&': [sprite('tiles', { frame: 142 })],
    '*': [sprite('tiles', { frame: 160 }), solid()],
    '(': [sprite('tiles', { frame: 161 }), solid()],
    ')': [sprite('tiles', { frame: 162 }), solid()],

    Т: [sprite('tiles', { frame: 87 }), solid()],
    У: [sprite('tiles', { frame: 88 }), solid()],
    Х: [sprite('tiles', { frame: 89 }), solid()],
    Э: [sprite('tiles', { frame: 107 }), solid()],
    Ю: [sprite('tiles', { frame: 108 }), solid()],
    Я: [sprite('tiles', { frame: 109 }), solid()],
    Ч: [sprite('tiles', { frame: 127 }), solid()],
    Й: [sprite('tiles', { frame: 128 }), solid()],
    Ш: [sprite('tiles', { frame: 129 }), solid()],

    p: [sprite('tiles', { frame: 1 }), 'coin', scale(1.1)],
  };

  const gameLevel = addLevel(maps[level], levelCfg);

  // Scoreboard
  const scoreLabel = add([
    text('Score: ' + score),
    pos(30, 1),
    layer('ui'),
    {
      value: score,
    },
  ]);

  add([text('Level: ' + parseInt(level + 1)), pos(30, 15)]);

  playerPositions = [];
  playerPositions.push({ x: 40, y: 210 });
  playerPositions.push({ x: 27, y: 208 });
  playerPositions.push({ x: 36, y: 144 });
  playerPositions.push({ x: 43, y: 96 });
  playerPositions.push({ x: 60, y: 120 });

  jumpingThingyPositions = [];
  jumpingThingyPositions.push({ x: 180, y: 210 });
  jumpingThingyPositions.push({ x: 410, y: 208 });
  jumpingThingyPositions.push({ x: 0, y: 0 });
  jumpingThingyPositions.push({ x: 885, y: 272 });

  let player = add([
    sprite('tiles', { frame: 300, animSpeed: 0.1 }),
    body(),
    solid(),
    pos(playerPositions[level].x, playerPositions[level].y),
    scale(1),
    { dir: 1, key: false },
    origin('bot'),
  ]);

  secretPositions = [];
  secretPositions.push({ x: 137, y: 128 });
  secretPositions.push({ x: 215.5, y: 80 });
  secretPositions.push({ x: 617, y: 272 });
  secretPositions.push({ x: 1509, y: 368 });
  secretPositions.push({ x: 249, y: 112 });
  add([
    sprite('tiles', { frame: 389 }),
    solid(),
    pos(secretPositions[level].x, secretPositions[level].y),
    'secret',
    origin('bot'),
  ]);

  player.collides('secret', (s) => {
    destroy(s);
    add([
      sprite('tiles', { frame: 390 }),
      pos(s.pos.x, s.pos.y),
      origin('bot'),
    ]);

    add([
      sprite('tiles', { frame: 97 }),
      solid(),
      pos(s.pos.x - 10, s.pos.y),
      'key',
      origin('bot'),
    ]);
  });

  switch (level) {
    case 0:
      {
        JUMP_FORCE = 250;
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        // Spawn jumping tile
        const jumpingThingy = add([
          sprite('tiles', { frame: 163, animSpeed: 0.5 }),
          solid(),
          pos(jumpingThingyPositions[level].x, jumpingThingyPositions[level].y),
          {
            animation: true,
          },
          'jump',
          scale(1),
          origin('bot'),
        ]);
        // Animate jumping tile
        jumpingThingy.action(() => {
          if (jumpingThingy.animation) {
            jumpingThingy.play('jumpingThingy');
            jumpingThingy.animation = false;
          }
        });
        // Spawn enemies
        const enemies = [];
        const enemiesPositions = [
          {
            x: 380,
            y: 220,
          },
          {
            x: 665,
            y: 272,
          },
        ];
        for (let i = 0; i < enemiesPositions.length; ++i) {
          enemies.push(
            add([
              sprite('tiles', { frame: 320, animSpeed: 0.15 }),
              body(),
              solid(),
              pos(enemiesPositions[i].x, enemiesPositions[i].y),
              { dir: 1, time: 0.01, animation: true, duration: 2.5 },
              origin('bot'),
              'enemy',
              'dangerous',
            ])
          );
        }
        const flyingEnemies = [];
        const flyingEnemiesPositions = [
          {
            x: 519.5,
            y: 272,
          },
          {
            x: 537,
            y: 256,
          },
        ];
        for (let i = 0; i < flyingEnemiesPositions.length; ++i) {
          flyingEnemies.push(
            add([
              sprite('tiles', { frame: 381 }),
              solid(),
              pos(flyingEnemiesPositions[i].x, flyingEnemiesPositions[i].y),
              'flying-enemy',
              'deadly',
              {
                timer: 0.01,
                dir: 1,
                animation: true,
                duration: 4,
              },
              origin('bot'),
            ])
          );
        }
      }
      break;
    case 1:
      {
        // Spawn jumping tile
        const jumpingThingy = add([
          sprite('tiles', { frame: 163, animSpeed: 0.5 }),
          solid(),
          pos(jumpingThingyPositions[level].x, jumpingThingyPositions[level].y),
          {
            animation: true,
          },
          'jump',
          scale(1),
          origin('bot'),
        ]);
        // Animate jumping tile
        jumpingThingy.action(() => {
          if (jumpingThingy.animation) {
            jumpingThingy.play('jumpingThingy');
            jumpingThingy.animation = false;
          }
        });
        const flyingEnemies = [];
        const flyingEnemiesPositions = [
          {
            x: 270.5,
            y: 200,
          },
          {
            x: 390,
            y: 186,
          },
          {
            x: 390,
            y: 70,
          },
        ];

        for (let i = 0; i < flyingEnemiesPositions.length; ++i) {
          flyingEnemies.push(
            add([
              sprite('tiles', { frame: 383 }),
              solid(),
              pos(flyingEnemiesPositions[i].x, flyingEnemiesPositions[i].y),
              'bat',
              'deadly',
              {
                timer: 0.01,
                dir: 1,
                animation: true,
                duration: 6,
              },
              origin('bot'),
            ])
          );
        }

        const enemies = [];
        const enemiesPositions = [
          {
            x: 711,
            y: 240,
          },
          {
            x: 935,
            y: 288,
          },
        ];
        for (let i = 0; i < enemiesPositions.length; ++i) {
          enemies.push(
            add([
              sprite('tiles', { frame: 340, animSpeed: 0.1 }),
              body(),
              solid(),
              pos(enemiesPositions[i].x, enemiesPositions[i].y),
              { dir: 1, time: 0.01, animation: true, duration: 2.5 },
              origin('bot'),
              'horn',
              'dangerous',
            ])
          );
        }
      }
      break;
    case 2:
      {
        // Spawn enemies
        const worms = [];
        const wormsPositions = [
          {
            x: 373,
            y: 176,
          },
          {
            x: 503,
            y: 256,
          },
          {
            x: 700,
            y: 272,
          },
        ];
        for (let i = 0; i < wormsPositions.length; ++i) {
          worms.push(
            add([
              sprite('tiles', { frame: 246, animSpeed: 0.1 }),
              body(),
              solid(),
              scale(1),
              pos(wormsPositions[i].x, wormsPositions[i].y),
              { dir: 1, time: 0.01, duration: 3 },
              origin('bot'),
              'worm',
            ])
          );
        }

        const flyingEnemies = [];
        const flyingEnemiesPositions = [
          {
            x: 980,
            y: 210,
          },
        ];

        for (let i = 0; i < flyingEnemiesPositions.length; ++i) {
          flyingEnemies.push(
            add([
              sprite('tiles', { frame: 383 }),
              solid(),
              pos(flyingEnemiesPositions[i].x, flyingEnemiesPositions[i].y),
              'bat',
              'deadly',
              {
                timer: 0.01,
                dir: 1,
                animation: true,
                duration: 6,
              },
              origin('bot'),
            ])
          );
        }
      }
      break;
    case 3:
      {
        // Spawn jumping tile
        const jumpingThingy = add([
          sprite('tiles', { frame: 163, animSpeed: 0.5 }),
          solid(),
          pos(jumpingThingyPositions[level].x, jumpingThingyPositions[level].y),
          {
            animation: true,
          },
          'jump',
          scale(1),
          origin('bot'),
        ]);
        // Animate jumping tile
        jumpingThingy.action(() => {
          if (jumpingThingy.animation) {
            jumpingThingy.play('jumpingThingy');
            jumpingThingy.animation = false;
          }
        });
        // Spawn enemies
        const enemies = [];
        const enemiesPositions = [
          {
            x: 300,
            y: 128,
          },
          {
            x: 628,
            y: 192,
          },
          {
            x: 1369,
            y: 352,
          },
          {
            x: 1727,
            y: 368,
          },
        ];
        for (let i = 0; i < enemiesPositions.length; ++i) {
          enemies.push(
            add([
              sprite('tiles', { frame: 320, animSpeed: 0.1 }),
              body(),
              solid(),
              pos(enemiesPositions[i].x, enemiesPositions[i].y),
              {
                dir: 1,
                time: 0.01,
                animation: true,
                duration: i < 2 ? 2.5 : 4,
              },
              origin('bot'),
              'enemy',
              'dangerous',
            ])
          );
        }
      }
      break;
    case 4:
      {
        JUMP_FORCE = 300;
        CURRENT_JUMP_FORCE = JUMP_FORCE;
        // Spawn enemies
        const enemies = [];
        const enemiesPositions = [
          {
            x: 503,
            y: 128,
          },
          {
            x: 1163,
            y: 176,
          },
          {
            x: 1165,
            y: 128,
          },
          {
            x: 1329,
            y: 160,
          },
          {
            x: 1669,
            y: 176,
          },
          {
            x: 1711,
            y: 80,
          },
          {
            x: 1843,
            y: 176,
          },
        ];
        for (let i = 0; i < enemiesPositions.length; ++i) {
          enemies.push(
            add([
              sprite('tiles', { frame: 360, animSpeed: 0.15 }),
              body(),
              solid(),
              pos(enemiesPositions[i].x, enemiesPositions[i].y),
              { dir: 1, time: 0.01, animation: true, duration: 3 },
              origin('bot'),
              'last-enemy',
            ])
          );
        }
      }
      break;
  }

  // Camera follow the player and lose if we fall
  player.action(() => {
    camPos(player.pos);
    if (player.pos.y >= FALL_DEATH) {
      go('lose', { score: scoreLabel.value, level: level });
    }
  });

  player.collides('last-enemy', (e) => {
    if (isJumping) {
      destroy(e);
      // spawn
      const body = add([
        sprite('tiles', { frame: 365 }),
        origin('bot'),
        pos(e.pos.x, e.pos.y),
      ]);
      wait(2, () => {
        destroy(body);
      });
      scoreLabel.value++;
      scoreLabel.text = 'Score: ' + scoreLabel.value;
    } else {
      go('lose', { score: scoreLabel.value, level: level });
    }
  });

  player.collides('enemy', (e) => {
    if (isJumping) {
      destroy(e);
      // spawn
      const body = add([
        sprite('tiles', { frame: 324 }),
        origin('bot'),
        pos(e.pos.x, e.pos.y),
      ]);
      wait(2, () => {
        destroy(body);
      });
      scoreLabel.value++;
      scoreLabel.text = 'Score: ' + scoreLabel.value;
    } else {
      go('lose', { score: scoreLabel.value, level: level });
    }
  });

  player.collides('worm', (w) => {
    if (isJumping) {
      destroy(w);
      scoreLabel.value++;
      scoreLabel.text = 'Score: ' + scoreLabel.value;
    } else {
      go('lose', { score: scoreLabel.value, level: level });
    }
  });

  player.collides('horn', (e) => {
    if (isJumping) {
      destroy(e);
      // spawn
      const body = add([
        sprite('tiles', { frame: 344 }),
        origin('bot'),
        pos(e.pos.x, e.pos.y),
      ]);
      wait(2, () => {
        destroy(body);
      });
      scoreLabel.value++;
      scoreLabel.text = 'Score: ' + scoreLabel.value;
    } else {
      go('lose', { score: scoreLabel.value, level: level });
    }
  });

  player.collides('platform', (p) => {
    let broken;
    wait(1, () => {
      new_pos = p.pos;
      broken = add([sprite('brokenPlatform'), pos(new_pos), solid()]);
      destroy(p);
    });
    wait(2, () => {
      destroy(broken);
    });
  });

  player.collides('fragile', (f) => {
    destroy(f);
  });

  player.collides('boom', (b) => {
    destroy(player);
    destroy(b);
    const obj = add([
      sprite('kaboom'),
      pos(b.pos.x - 10, b.pos.y - 20),
      scale(0.8),
    ]);
    setTimeout(() => {
      go('lose', { score: scoreLabel.value, level: level });
      // destroy(obj);
    }, 2000);
  });

  player.collides('key', (k) => {
    destroy(k);
    player.key = true;
  });

  player.collides('deadly', (e) => {
    go('lose', { score: scoreLabel.value, level: level });
  });

  // Make all enemies move and add animation
  action('enemy', (enemy) => {
    enemy.move(enemy.dir * ENEMY_SPEED, 0);
    enemy.time -= dt();
    if (enemy.time <= 0) {
      enemy.dir = -enemy.dir;
      enemy.time = enemy.duration;
    }
    if (enemy.animation) {
      enemy.play('idleEnemy');
      enemy.animation = false;
    }
  });

  // Make all enemies move and add animation
  action('last-enemy', (enemy) => {
    enemy.move(enemy.dir * ENEMY_SPEED, 0);
    enemy.time -= dt();
    if (enemy.time <= 0) {
      enemy.dir = -enemy.dir;
      enemy.time = enemy.duration;
    }
    if (enemy.animation) {
      enemy.play('lastEnemyRun');
      enemy.animation = false;
    }
  });

  // Make all enemies move and add animation
  action('worm', (enemy) => {
    if (Math.abs(player.pos.x - enemy.pos.x) < 100) {
      if (enemy.pos.x < player.pos.x) {
        enemy.move(ENEMY_SPEED);
        enemy.scale.x = 1;
      } else {
        enemy.move(-ENEMY_SPEED);
        enemy.scale.x = -1;
      }
    }
  });

  action('horn', (enemy) => {
    enemy.move(enemy.dir * ENEMY_SPEED, 0);
    enemy.time -= dt();
    if (enemy.time <= 0) {
      enemy.dir = -enemy.dir;
      enemy.time = enemy.duration;
    }
    if (enemy.animation) {
      enemy.play('hornEnemy');
      enemy.animation = false;
    }
  });

  action('up-down', (u) => {
    u.move(0, ENEMY_SPEED * u.dir * 1.8);
    u.timer -= dt();
    if (u.timer <= 0) {
      u.dir = -u.dir;
      u.timer = u.duration;
    }
  });

  // Make flying enemies fly and add animation
  action('flying-enemy', (f) => {
    f.move(0, f.dir * ENEMY_SPEED);
    if (f.animation) {
      f.play('flying');
      f.animation = false;
    }
    f.timer -= dt();
    if (f.timer <= 0) {
      f.timer = f.duration;
      f.dir = -f.dir;
    }
  });

  action('bat', (f) => {
    f.move(f.dir * ENEMY_SPEED, 0);
    if (f.animation) {
      f.play('bat');
      f.animation = false;
    }
    f.timer -= dt();
    if (f.timer <= 0) {
      f.timer = f.duration;
      f.dir = -f.dir;
    }
  });

  //Go to next level
  player.collides('door', () => {
    if (player.key) {
      if (level == 4) {
        keyPress('right', () => {
          go('end', { score: scoreLabel.value });
        });
      } else {
        keyPress('right', () => {
          go('game', {
            level: (level + 1) % maps.length,
            score: scoreLabel.value,
          });
        });
      }
    }
  });

  player.collides('jump', () => {
    player.jump(BIG_JUMP_FORCE * 0.8);
    player.play('jump');
  });

  player.collides('coin', (c) => {
    destroy(c);
    scoreLabel.value++;
    scoreLabel.text = 'Score: ' + scoreLabel.value;
  });

  // Key events

  keyPress('left', () => {
    player.scale.x = -1;
    player.play('run');
    player.dir = -1;
  });

  keyDown('left', () => {
    player.move(-MOVE_SPEED, 0);
  });

  keyRelease('left', () => {
    player.play('idle');
  });

  keyRelease('right', () => {
    player.play('idle');
  });

  keyPress('right', () => {
    player.scale.x = 1;
    player.dir = 1;
    player.play('run');
  });

  keyDown('right', () => {
    player.move(MOVE_SPEED, 0);
  });

  keyPress('space', () => {
    if (player.grounded()) {
      isJumping = true;
      player.jump(CURRENT_JUMP_FORCE);
    }
  });

  player.action(() => {
    if (player.grounded()) {
      if (isJumping) {
        isJumping = false;
      }
    }
  });
});

scene('lose', ({ score, level }) => {
  add([
    text('GAME OVER\n\nPress enter to start again.', 10),
    origin('center'),
    pos(width() / 2, height() / 2),
  ]);
  keyPress('enter', () => {
    go('game', { level: level, score: score });
  });
});

scene('end', ({ score }) => {
  add([
    text(
      'The end!\n\nThank you for playing our little demo.\n\nPress enter to play again',
      6
    ),
    origin('center'),
    pos(width() / 2, height() / 2),
  ]);
  keyPress('enter', () => {
    go('game', { level: 0, score: 0 });
  });
});

start('game', { level: 0, score: 0 });
