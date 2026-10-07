"use strict";

(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  const TILE = 32;
  const COLS = 13;
  const ROWS = 13;
  const FIELD = COLS * TILE;
  const HUD = 160;
  const TANK = 26;
  const INSET = (TILE - TANK) / 2;

  const UP = 0;
  const RIGHT = 1;
  const DOWN = 2;
  const LEFT = 3;
  const DIR = [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
  ];

  const EMPTY = 0;
  const BRICK = 1;
  const STEEL = 2;
  const WATER = 3;
  const BUSH = 4;
  const BASE = 5;
  const ICE = 6;
  const HALF = TILE / 2;
  const CELL = TILE / 4;
  const GAME_SEC = 64 / 60;
  const BRICK_FULL = 0xffff;

  const CODE_DIR = {
    ArrowUp: UP,
    KeyW: UP,
    ArrowRight: RIGHT,
    KeyD: RIGHT,
    ArrowDown: DOWN,
    KeyS: DOWN,
    ArrowLeft: LEFT,
    KeyA: LEFT,
  };

  const THEMES = {
    city: {
      name: "CITY",
      accent: "#e6d7a2",
      ground: "#070707",
      fleck: null,
      brick: ["#6e3014", "#c45c28"],
      steel: ["#8d8d8d", "#d5d5d5", "#6e6e6e", "#f4f4f4"],
      water: ["#163e78", "#2f6fbe"],
      bush: ["#1b5c28", "#2f9a3e"],
      ice: ["#c5d7e6", "#f4fbff", "#7ea4c0"],
    },
    snow: {
      name: "SNOW",
      accent: "#d5e6f2",
      ground: "#243044",
      fleck: "#e7eef6",
      brick: ["#6a5348", "#d7c4b0"],
      steel: ["#7f8c99", "#d5e2ea", "#5c6770", "#f4fbff"],
      water: ["#2a4a66", "#8eb8cc"],
      bush: ["#dfe8e4", "#8eaa96"],
      ice: ["#b7d0e4", "#f7fbff", "#6f98b8"],
    },
    desert: {
      name: "DESERT",
      accent: "#e6c27a",
      ground: "#4a3218",
      fleck: "#c4a36a",
      brick: ["#6b3a18", "#e0a15a"],
      steel: ["#8a7a62", "#e6d2a8", "#5c5144", "#fff6e0"],
      water: ["#1a5c62", "#3ec4b4"],
      bush: ["#5c6828", "#c6a84a"],
      ice: ["#c5d7e6", "#f4fbff", "#7ea4c0"],
    },
    woods: {
      name: "WOODS",
      accent: "#b7d39a",
      ground: "#142016",
      fleck: "#2c4634",
      brick: ["#3d4a28", "#8a9a4a"],
      steel: ["#6e7568", "#c5cbb8", "#4a5046", "#eef2e4"],
      water: ["#0e2e28", "#1f6a52"],
      bush: ["#14361c", "#3f9a48"],
      ice: ["#c5d7e6", "#f4fbff", "#7ea4c0"],
    },
  };

  // # full brick   U D L R half brick (top, bottom, left, right)
  // = full steel   u d l r half steel
  // ~ water  * bush  - ice  B base
  // Stages 1-35 are the Famicom maps. The eagle nest is stamped on the bottom rows.
  // Our own themed maps follow, as a bonus.
  const LEVELS = [
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        ".#.#.#.#.#.#.",
        ".#.#.#.#.#.#.",
        ".#.#.#=#.#.#.",
        ".#.#.U.U.#.#.",
        ".U.U.D.D.U.U.",
        "D.DD.U.U.DD.D",
        "u.UU.D.D.UU.u",
        ".D.D.###.D.D.",
        ".#.#.#.#.#.#.",
        ".#.#.U.U.#.#.",
        ".#.#.###.#.#.",
        ".....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....#...#....",
        ".***#.....ddd",
        "#***.........",
        "****...#.###L",
        "****###U.#.R.",
        "****..#....R.",
        ".*....===..*.",
        ".D.D.....****",
        "#LR#LRUUU****",
        ".....#.DD****",
        "#..l...UU***.",
        "##.l.###.***.",
        "=##..#B#.#...",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...=...=.....",
        ".#.=...#.#.#.",
        ".#....##.#=#.",
        "...#.....=...",
        "*..#..=..#*#=",
        "**...#..=.*..",
        ".###***=..*#.",
        "...=*#.#.#.#.",
        "=#.=.#.#...#.",
        ".#.#.###.#=#.",
        ".#.#.###.....",
        ".#...###.#.#.",
        ".#.#.#B#.###.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".**........*.",
        "**..D##DD...*",
        "*..R######D.u",
        "u..########L.",
        "..RU...U##.L.",
        "~.R.l.l.#L...",
        "..#.DD..#L.~~",
        "..########...",
        ".R########L..",
        ".UU######UU..",
        ".##DU##UD##.*",
        "*.UU.###UU.**",
        "=*...#B#..**=",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....###......",
        "d.D.#...uu=..",
        "=.#...#......",
        "#.###.##.~~~.",
        "U...U....~...",
        "..D.~~.~~~.##",
        "##..~#.#L....",
        "....~.....rl.",
        "~~~.~.=.#.r..",
        "...DD.....r##",
        "....#UUU#D...",
        "##U..###.U#..",
        "U....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".......uu....",
        "..=uuu....=..",
        "..=...*.u==..",
        ".=...*=...=..",
        "....*==...u=.",
        ".=.*===.=....",
        ".r.==...==...",
        "l...=.===..r.",
        ".r=...==*..=.",
        ".=....=*..==.",
        ".uu=..*..=...",
        ".....###.u.d=",
        "dd...#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        ".RU#......#UL",
        "RU..#.**.#..R",
        "#...#****#..R",
        "#..R#*==*#L.#",
        "RDD#~~~~~~###",
        ".###==#==###L",
        "..##=.#.=##L.",
        "..#########L.",
        "#*UUU==UUUU*#",
        "#***********#",
        "..***###****.",
        "...L.#B#..L..",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".....R.L**...",
        ".Lr.L...R*LR*",
        ".Lr.L.#.R*LR*",
        ".#..#.=.#*.#*",
        "...Ru.#.Ul.**",
        "##L..*#*..R##",
        "....R***L....",
        "=##.U***UR##=",
        "uuu.D.*.D.uuu",
        ".#..#...#....",
        ".#L..U.U..R#*",
        "..U..###..***",
        "..D..#B#..D**",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "......####...",
        ".###D.D..#...",
        "....#.U....##",
        ".~~~~~.#L..#u",
        "..ddd~.#.=l#.",
        "#.###~~~.~##.",
        "....=~...~u..",
        "~~~.~~##.~...",
        ".....#uu.~~~.",
        "###..........",
        "..#.uu...##.R",
        "#....###.#..#",
        ".....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".....=.#.##..",
        ".R####.#.....",
        "...L.#.##.***",
        ".R.....=.****",
        ".R.###=##**U=",
        ".UUU=..#.**.R",
        "R###.=*****..",
        "...=..*****#.",
        "=#.****=***#.",
        "R#*****....#L",
        ".#**....u###.",
        "..**.###.#.R.",
        ".D**.#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        "**..D###D..**",
        "*..R#####L..*",
        "...##*#*##...",
        "...#**#**#...",
        "*..#######..*",
        "**..#*#*#..**",
        "~~~.#####.~~~",
        "....RRRRR....",
        "....LLLLL....",
        "rrr.......lll",
        "LLL..###..RRR",
        "lllr.#B#.lrrr",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....D...D....",
        ".####...####.",
        ".#....#....=.",
        ".=.#U...U#.##",
        ".#.L*d=d*R.=#",
        ".U..*****..u#",
        "#d..*****..D#",
        "#=.L*u=u*R.#.",
        "##.#D...D#.=.",
        "#=....#....#.",
        "#####...###==",
        "##..U###U..#.",
        "##...#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "..#..#.D.#...",
        "*###.#.d.#L..",
        "***..U.#.U.RL",
        "*~~~~~~~~~~.~",
        ".#....DD.....",
        "..#..R##U#Uuu",
        "##.#.R##*#dd#",
        "...=.d.****..",
        "~~.~~~~~.~~~~",
        "**.R..DD.....",
        "**#.L..R.dD#.",
        "*d#.L###.U.#.",
        ".....#B#.D.U.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...#.....d*..",
        "#.....d*r=l.#",
        "...d*r=l.u*..",
        "..r=l.u*.....",
        "...u*........",
        "...*d*.*d*...",
        "=#.r=l.r=l.#=",
        "...*u*.*u*...",
        "....d...d....",
        "#..r=l.r=l..#",
        "#..*u*.*u*..#",
        "..D..###..D..",
        "..##.#B#.##..",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....##..#....",
        ".**##...#....",
        "********##...",
        "*u#*###****#=",
        "**#***u**#l#.",
        ".**#d****#.#.",
        ".#####**##L**",
        "ru##...#U...*",
        ".#.#.dDU**#L*",
        ".#..R#U**#..*",
        ".##LRU**D*#**",
        "..#.*####*U*.",
        "..U.*#B#.***.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        "..=*=........",
        "...*.*d......",
        ".*....*D.....",
        ".**..*.*d....",
        ".*.*.*..*D...",
        ".*..*...**d..",
        "..*....****D.",
        "...*..*.****.",
        "#.....*..***=",
        "##.....*.****",
        "=##..###*.***",
        "==##.#B#*..**",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....D.....D..",
        ".#.##..---##.",
        ".#..#.=-----.",
        "---l#..#----.",
        "------##RL...",
        "..r----#RL.uu",
        "####-------##",
        "...##----l...",
        ".###.---##.#.",
        "---#-....#.#.",
        "-----u.u..D#.",
        "#----###.#...",
        "##l..#B#.#.#.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "........===*.",
        ".#......=..=.",
        "#*#...####.=.",
        ".#*#..#.*#==.",
        "..#.*=#*.#...",
        "....=.#=##...",
        "..##=#.=.....",
        "..#.*#=*.....",
        "===*.#..##...",
        "=.####..#==..",
        "=..=.....=##.",
        "*===.###..#==",
        ".....#B#...==",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".#.#.#.#.#.#.",
        ".#.#.#.#.#.#.",
        ".u.u.u.u.u.u.",
        "D.D.#...#.D.D",
        "#.#U#.#.#U#.#",
        "u.u.=.u.=.u.u",
        "**..#.*.#..**",
        "****#U*U#****",
        "*************",
        "D.D.#***#.D.D",
        ".#.#..*..#.#.",
        ".#.#.###.#.#.",
        ".U.U.#B#.U.U.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...~.#..#.#..",
        "........#.=..",
        "...~.D=.#.#..",
        "u.#~.=.DU.#..",
        "..#~...#.....",
        "#.#~~.~~~~..#",
        "...D...*.~.uu",
        "##R#.=***~.DD",
        "U.R..#***~.#.",
        ".d...#.*.~.*.",
        ".#.d.UUU..***",
        ".#.#.###.~***",
        ".....#B#.~.*.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...DDD..D....",
        ".D########...",
        ".********##..",
        "**......**##.",
        "*.=..=...***.",
        "*.=..=...***.",
        "*..*....**##L",
        "*********###L",
        "#**##***####.",
        ".##########.=",
        "=.#=######L.=",
        ".=#U=#####===",
        ".....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".....*.......",
        "....*=*......",
        "..*..*..**...",
        ".*#*...*##*..",
        "..*#*...**..*",
        "*..*..*....*=",
        "#*...*=*..*.*",
        "=#*...*..*=*.",
        "#*..*...*.*..",
        "*..*#*.*#*...",
        "...*#*..*..*.",
        ".*..*###..*=*",
        "*=*..#B#.*#*.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        ".....==......",
        "......=......",
        ".==**#=#**==.",
        "...=**=**=...",
        "*...=***=...*",
        "=*...***...*=",
        "*...du*ud...*",
        "....=.d.=....",
        "...=..=..=...",
        ".............",
        ".....###.....",
        "..=..#B#..=..",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "..=.#u....R..",
        "..#.#*.U###..",
        ".**.#*RL...==",
        "******###.R#.",
        "..**DDu#.R#UR",
        "#u.DUU...#U.R",
        "R.D#---------",
        "R.U.---------",
        "..=.---------",
        "#.#.---------",
        "R.#.---------",
        "R.#..###-----",
        "..U..#B#.----",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...=.#.#.#.=.",
        ".#.#.....=...",
        ".#.#..=..=.==",
        ".#...#.=#...=",
        "....##.##.=..",
        "..=.#..##.##.",
        "=.=..#.=..=#.",
        "..##.#...#=..",
        ".=##.##.##..#",
        ".#...#=....##",
        "...#.##=.=..#",
        "#.##.###.#=..",
        "#.#..#B#.###.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "..~~.........",
        "d..~*.L......",
        "*d....l.L.~~.",
        "**.uDR..l*~..",
        "***..=DR....d",
        "**ud.R.=D..d*",
        "*u..U=.R.u.**",
        ".....LU=..***",
        "..~*r..LUdu**",
        ".~~.R.r.....*",
        "......R.*~..u",
        "=....###.~~..",
        "==...#B#....=",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....=........",
        "==..=..==....",
        ".=..=...=.==*",
        ".=..===.*.=..",
        ".#....=.===..",
        "*==.=#=##....",
        "..=*=*..#..==",
        "..=..*..=..=.",
        "..#..=..==#=.",
        "*===**#==.#=.",
        "...#....**.#.",
        "...=.###.*.#.",
        "...=.#B#.=.#.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "..........rl.",
        "......d...=..",
        ".....D*D.#L..",
        "....d***d#L..",
        "...D**-**#L..",
        "..d**---**L..",
        ".D**-----**D.",
        "d**-------**d",
        "**---------**",
        ".*---------*.",
        ".*---------*.",
        ".*---###---*.",
        ".*--.#B#.--*.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "..........#..",
        ".#~~.=.#.....",
        "..~~#***~~.=.",
        ".....***~~#..",
        ".=..~~.*.....",
        "**#.~~=....#.",
        "***......=..=",
        ".#~~.#.......",
        "=.~~**~~**.#.",
        "....*.~~**~~.",
        "...=*...**~~.",
        "..#.####.....",
        "#....#B#.#=..",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        ".....DD...d..",
        ".dd.D**d.D*D.",
        "D**D****D***D",
        "*************",
        "=*~*****~****",
        "**~~~***~~~*=",
        "****~*=***~**",
        "*************",
        "*****UU*****u",
        "u***U..U***u.",
        ".uUU.###UUU..",
        ".....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "...~....~....",
        "~~.~.~~~~.~~~",
        "**#..#..~.~*~",
        "*~~~~.=..#***",
        "**.~..~.~~~~*",
        "~~.~.~~..~...",
        "..#*#.#*.~..~",
        ".~~*~~~~.*#.~",
        "#..#..~.**~.~",
        "~~.~~.~#~~~..",
        "..#.**..*~..~",
        ".~~~*###.~.~~",
        ".~...#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "-------------",
        "-------------",
        "---#-----#---",
        "-#.#.#-#.#.#-",
        "-UU#.....#UU-",
        "---#D#=#D#---",
        "=---.u.u.---=",
        "----.D.D.----",
        "----.#.#.----",
        "---#..D..#---",
        "-#-#.uuu.#-#-",
        ".#D#.###.#D#.",
        ".U...#B#...U.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....=....=...",
        ".=...=..=**..",
        "..=....=*dl..",
        "...=.*****.r.",
        ".l..=**=*..=.",
        ".ul*.=**=..r.",
        "..*****..=...",
        ".dl*.=*...=..",
        ".***=.=.d..=.",
        "***=....r....",
        "..=........r=",
        ".....###.dl..",
        "l.d..#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        "....LR.......",
        "LLLR.L..LL...",
        "LLL##...L#L..",
        "RR.#L..RL##..",
        ".L.#RL.L###..",
        ".LR..#L#RR#..",
        ".L..R##L.L#..",
        ".R..L##L.L#..",
        ".RUU.###.LLU#",
        ".R..RL#RLLLRR",
        "..L.#RL##..R.",
        "..LRL####L.L.",
        "..LR.#B#.##..",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".............",
        "....#.#......",
        "*..*#*#*..*..",
        "#**#####**#*.",
        "####=#=####*.",
        "~~~#####~~~*.",
        "~#########~~*",
        "###~###~###**",
        "##~~~#~~~##~~",
        "*~~*****~~*~*",
        ".**.....**.*.",
        ".....###.....",
        ".....#B#.....",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".#.#.#.#.#.#.",
        "#R#..U.U..#L#",
        ".D.D.#=#.D.D.",
        "=#.U.D.D.U.#=",
        "..UU#...#DD..",
        ".#.R.~~~.L.#.",
        "L#..~~~~~..#.",
        ".#.~~.~~.~~#.",
        "**#.~~#~~.#**",
        ".U#..#=#..#D.",
        "#D.R.###.L.U#",
        ".#U#.#####.#.",
        "L....#B#....R",
      ],
    },
    {
      theme: "snow",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".U.#.D.#.U.#.",
        "#--.#=#.#--#.",
        ".--.#.#.#--..",
        "=--U#.#.#D--=",
        "..--#...#--..",
        "=--.#.~.#.--=",
        "L#--~.~.~--#.",
        ".#---~.~---#.",
        "*--..~#~..--*",
        ".U#--#=#--#D.",
        "#D.--###--.U#",
        ".--=-#####-=-",
        ".----#B#----.",
      ],
    },
    {
      theme: "desert",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".#.~.#.~.#.#.",
        "#~#..U.U..#~#",
        ".~.~.#=#.~.~.",
        "=~.U.~~~.U.~=",
        "..UU~...~DD..",
        ".~#..~.~..#~.",
        "L#..~.~.~..R.",
        ".~.~~~~~~~.~.",
        "*~.~.#.#.~.~*",
        ".U#..~=~..#D.",
        "#D.~.###.~.U#",
        ".~U~.#####.~.",
        "..~..#B#..~..",
      ],
    },
    {
      theme: "woods",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".*#.*#.*#.*#.",
        "#*#..U.U..#*#",
        ".*.*.#=#.*.*.",
        "=*#U#...#D#*=",
        "..**#...#**..",
        ".*#.*~.~*.#*.",
        "#*.~*****~.*#",
        ".#.***.***.#.",
        "**#.*#=#*.#**",
        ".U*.*###*.*D.",
        "#D*..###..*U#",
        ".*#*.#####.*#",
        "..*..#B#..*..",
      ],
    },
    {
      theme: "snow",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".=.#.=.#.=.#.",
        "#--U#=#U#--#.",
        ".--D#.#D#--..",
        "=UU--#-#--DD=",
        "..--#...#--..",
        ".--=#.~.#=--.",
        "L#--#~#~#--#.",
        ".#--~~~~~--#.",
        "*--..~#~..--*",
        ".U=--#=#--=D.",
        "#D.--###--.U#",
        ".=--=###=--=.",
        ".--..#B#..--.",
      ],
    },
    {
      theme: "city",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".R#..#.L#..#.",
        "#=#..U.U..#=#",
        ".D.D.#=#.D.D.",
        "=U.U.D.D.U.U=",
        "..DD#...#UU..",
        "L#..#~~~#..#.",
        ".#..~~.~~..#.",
        "**=.~~#~~.=**",
        ".U#..#=#..#D.",
        "#D#..###..#U#",
        ".R=..###..=L.",
        ".#=#.#####.#.",
        "..=..#B#..=..",
      ],
    },
    {
      theme: "woods",
      foes: 20,
      maxAlive: 4,
      player: { c: 4, r: 12 },
      rows: [
        ".*~.*#.*~.*~.",
        "#*#~~U.U~~#*#",
        ".~*~.#=#.~*~.",
        "=*~U~...~D~*=",
        "..**#...#**..",
        "#*.~*****~.*#",
        ".#.***.***.#.",
        "**~.*#=#*.~**",
        ".U*.~###~.*D.",
        "#D~..###..~U#",
        ".R#~~###~~#L.",
        ".*~..#####.~*",
        "..~..#B#..~..",
      ],
    },
  ];

  // Speeds are NES px/frame at our 2× scale and 60fps: 2/4 → 60, 3/4 → 90, 4/4 → 120.
  // Shells are 2px/frame (240) or 4px/frame (480). Armor takes four hits.
  const KINDS = {
    basic: { speed: 60, hp: 1, score: 100, body: "#dedede", turret: "#7a1f1f" },
    fast: { speed: 120, hp: 1, score: 200, body: "#e2c15a", turret: "#8a5a12" },
    rapid: { speed: 60, hp: 1, score: 300, body: "#8ecae6", turret: "#1d4e89" },
    armor: { speed: 60, hp: 4, score: 400, body: "#6fbf73", turret: "#14532d" },
  };

  // Famicom stages: 20 tanks, types from ROM $E4EC / $E578. 0 basic, 1 fast, 2 power, 3 armor.
  const ROM_WAVES = [
    ["basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast"],
    ["armor", "armor", "fast", "fast", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic"],
    ["basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast", "fast", "fast", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "basic", "basic", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "armor", "armor", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast", "fast", "fast", "fast"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "armor", "armor"],
    ["basic", "basic", "basic", "fast", "fast", "fast", "fast", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "basic", "basic", "basic", "basic", "basic", "basic", "basic"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "armor", "armor", "fast", "fast", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "basic"],
    ["basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast", "fast", "fast", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "armor", "armor", "armor"],
    ["basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast", "rapid", "rapid", "rapid", "rapid", "armor", "armor"],
    ["fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["basic", "basic", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "fast", "fast", "armor", "armor"],
    ["armor", "armor", "fast", "fast", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic"],
    ["armor", "armor", "armor", "armor", "basic", "basic", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast"],
    ["fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "basic", "basic", "basic", "basic", "rapid", "rapid", "rapid", "rapid"],
    ["fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "basic", "basic", "rapid", "rapid", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "armor", "armor", "armor", "armor"],
    ["fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "rapid", "rapid", "armor", "armor", "armor", "armor"],
    ["armor", "armor", "armor", "armor", "armor", "armor", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast"],
    ["rapid", "rapid", "rapid", "rapid", "armor", "armor", "fast", "fast", "fast", "fast", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic"],
    ["rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "basic", "basic", "basic", "basic", "rapid", "rapid", "rapid", "rapid"],
    ["rapid", "rapid", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "basic", "basic"],
    ["fast", "fast", "armor", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "basic", "rapid", "rapid"],
    ["rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["basic", "basic", "basic", "basic", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "rapid", "rapid", "rapid", "rapid", "armor", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "rapid", "rapid", "rapid"],
    ["armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "basic", "basic", "basic", "basic", "basic", "basic", "rapid", "rapid", "fast", "fast", "fast", "fast"],
    ["fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast"],
    ["rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor"],
    ["rapid", "rapid", "rapid", "rapid", "fast", "fast", "fast", "fast", "fast", "fast", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor", "armor"],
  ];

  const WAVES = [
    ["basic", "basic", "fast", "basic"],
    ["basic", "fast", "rapid", "armor", "fast", "rapid"],
    ["fast", "rapid", "armor", "rapid", "armor", "fast", "armor", "basic"],
    ["basic", "fast", "fast", "rapid", "basic", "armor"],
    ["fast", "rapid", "armor", "fast", "rapid", "basic", "armor", "fast"],
    ["rapid", "fast", "armor", "basic", "rapid", "armor", "fast", "rapid"],
    ["fast", "armor", "rapid", "fast", "armor", "rapid", "armor", "basic", "fast", "rapid"],
    ["armor", "rapid", "fast", "armor", "rapid", "armor", "fast", "rapid", "armor", "basic"],
    ["armor", "rapid", "armor", "fast", "rapid", "armor", "rapid", "armor", "fast", "armor", "rapid", "basic"],
  ];

  // ROM $E474: centers (24,24), (120,24), (216,24). Field origin is 16, so columns 0, 6 and 12.
  const SPAWNS = [
    { c: 0, r: 0 },
    { c: 6, r: 0 },
    { c: 12, r: 0 },
  ];

  const MASK_LEFT = 0x3333;
  const MASK_RIGHT = 0xcccc;
  const MASK_TOP = 0x00ff;
  const MASK_BOTTOM = 0xff00;
  const PARTS = {
    ".": [EMPTY, 0],
    "#": [BRICK, BRICK_FULL],
    U: [BRICK, MASK_TOP],
    D: [BRICK, MASK_BOTTOM],
    L: [BRICK, MASK_LEFT],
    R: [BRICK, MASK_RIGHT],
    "=": [STEEL, BRICK_FULL],
    u: [STEEL, MASK_TOP],
    d: [STEEL, MASK_BOTTOM],
    l: [STEEL, MASK_LEFT],
    r: [STEEL, MASK_RIGHT],
    "~": [WATER, 0],
    "*": [BUSH, 0],
    "-": [ICE, 0],
    B: [BASE, 0],
  };

  for (const level of LEVELS) {
    if (!THEMES[level.theme]) throw new Error("Unknown theme " + level.theme);
    if (level.rows.length !== ROWS) {
      throw new Error("Level has " + level.rows.length + " rows");
    }
    for (const row of level.rows) {
      if (row.length !== COLS) throw new Error("Bad row length " + row.length + ": " + row);
      for (const ch of row) {
        if (!PARTS[ch]) throw new Error("Bad tile " + ch);
      }
    }
  }

  const held = new Set();
  const order = [];

  const game = {
    mode: "title",
    score: 0,
    reserves: 3,
    levelIndex: 0,
    map: [],
    mask: [],
    baseCell: null,
    baseAlive: true,
    player: null,
    enemies: [],
    bullets: [],
    explosions: [],
    floaters: [],
    engine: false,
    queue: [],
    pickup: null,
    freeze: 0,
    playerFreeze: 0,
    shovel: 0,
    fortified: [],
    spawnTimer: 0,
    spawnCursor: 0,
    introTimer: 0,
    clearTimer: 0,
    deadTimer: 0,
    levelTime: 0,
    paused: false,
    pauseAt: 0,
    pauseMenu: 0,
    rules: "original",
    menu: 0,
    menuDir: null,
    menuHold: 0,
    shovelSteel: true,
  };

  function parseMap(rows) {
    const map = [];
    const mask = [];
    for (const row of rows) {
      const tiles = [];
      const bits = [];
      for (const ch of row) {
        const part = PARTS[ch];
        if (!part) throw new Error("Bad tile " + ch);
        tiles.push(part[0]);
        bits.push(part[1]);
      }
      map.push(tiles);
      mask.push(bits);
    }
    return { map, mask };
  }

  function findBase(grid) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (grid[r][c] === BASE) return { c, r };
      }
    }
    return null;
  }

  function buildQueue(levelIndex, count) {
    const rom = ROM_WAVES[levelIndex];
    const pattern = rom || WAVES[(levelIndex - ROM_WAVES.length) % WAVES.length];
    const queue = [];
    for (let i = 0; i < count; i++) {
      queue.push({
        kind: rom ? rom[i] : pattern[i % pattern.length],
        carrier: i === 3 || i === 10 || i === 17,
      });
    }
    return queue;
  }

  function makePlayer(cell) {
    return {
      x: cell.c * TILE + INSET,
      y: cell.r * TILE + INSET,
      dir: UP,
      speed: 90,
      stars: 0,
      helmet: 0,
      alive: true,
      invuln: 3 * GAME_SEC,
      ghost: false,
      travel: 0,
      warm: 0,
      shotWait: 0,
      boat: false,
      cutsTrees: false,
      coast: false,
      slide: 0,
    };
  }

  function makeEnemy(cell, kind, carrier) {
    const spec = KINDS[kind];
    return {
      x: cell.c * TILE + INSET,
      y: cell.r * TILE + INSET,
      dir: DOWN,
      speed: spec.speed,
      hp: spec.hp,
      kind,
      carrier,
      score: spec.score,
      alive: true,
      invuln: 0,
      helmet: 0,
      stars: 0,
      boat: false,
      cutsTrees: false,
      travel: 0,
      warm: 0.45,
      wish: DOWN,
      shotWait: 0,
    };
  }

  function startGame() {
    if (game.mode === "over") game.levelIndex = Math.max(0, game.levelIndex - 1);
    else game.score = 0;
    game.reserves = 3;
    game.player = null;
    game.paused = false;
    play(stopAllSounds);
    beginLevel();
  }

  function beginLevel() {
    const level = LEVELS[game.levelIndex];
    const keptStars = game.player ? game.player.stars : 0;
    const keptBoat = game.player ? game.player.boat : false;
    const keptCut = game.player ? game.player.cutsTrees : false;
    const parsed = parseMap(level.rows);
    game.map = parsed.map;
    game.mask = parsed.mask;
    game.baseCell = findBase(game.map);
    if (!game.baseCell) throw new Error("Level " + (game.levelIndex + 1) + " has no base");
    game.baseAlive = true;
    game.player = makePlayer(level.player);
    game.player.stars = keptStars;
    game.player.boat = keptBoat;
    game.player.cutsTrees = keptCut;
    game.enemies = [];
    game.bullets = [];
    game.explosions = [];
    game.queue = buildQueue(game.levelIndex, level.foes);
    game.pickup = null;
    game.freeze = 0;
    game.playerFreeze = 0;
    game.shovel = 0;
    game.fortified = [];
    paintNest(false);
    game.spawnTimer = 0.35;
    game.spawnCursor = 0;
    game.levelTime = 0;
    game.introTimer = 1.5;
    game.floaters = [];
    game.engine = false;
    game.mode = "intro";
    play(startBGM);
  }

  function respawn() {
    const level = LEVELS[game.levelIndex];
    game.player.x = level.player.c * TILE + INSET;
    game.player.y = level.player.r * TILE + INSET;
    game.player.dir = UP;
    game.player.stars = 0;
    game.player.helmet = 0;
    game.player.boat = false;
    game.player.cutsTrees = false;
    game.player.coast = false;
    game.player.slide = 0;
    game.player.alive = true;
    game.player.invuln = 3 * GAME_SEC;
    game.player.ghost = true;
    game.player.travel = 0;
    game.mode = "play";
  }

  const SLOT = TILE / 2;
  const ALIGN = 0.75;
  const SNAP = SLOT / 2;
  const FIRST_SLOT = INSET;
  const LAST_SLOT = (COLS - 1) * TILE + INSET;

  function nearestSlot(pos) {
    const slot = Math.round((pos - INSET) / SLOT) * SLOT + INSET;
    return Math.max(FIRST_SLOT, Math.min(LAST_SLOT, slot));
  }

  function misalign(pos) {
    return Math.abs(pos - nearestSlot(pos));
  }

  function isHorizontal(dir) {
    return dir === LEFT || dir === RIGHT;
  }

  function opposite(dir) {
    return (dir + 2) % 4;
  }

  function crossAxis(dir) {
    return isHorizontal(dir) ? "y" : "x";
  }

  function travelAxis(dir) {
    return isHorizontal(dir) ? "x" : "y";
  }

  function nextSlot(pos, sign) {
    let slot = nearestSlot(pos);
    if (sign > 0 && slot <= pos + ALIGN) slot += SLOT;
    if (sign < 0 && slot >= pos - ALIGN) slot -= SLOT;
    return Math.max(FIRST_SLOT, Math.min(LAST_SLOT, slot));
  }

  function brickBit(col, row) {
    return 1 << (row * 4 + col);
  }

  function brickBlocks(x, y, c, r) {
    const mask = game.mask[r][c];
    if (!mask) return false;
    const ox = c * TILE;
    const oy = r * TILE;
    // A tank fits a cleared half of a brick. A one-cell notch still counts as solid.
    for (let qr = 0; qr < 2; qr++) {
      for (let qc = 0; qc < 2; qc++) {
        let solid = false;
        for (let row = qr * 2; row < qr * 2 + 2 && !solid; row++) {
          for (let col = qc * 2; col < qc * 2 + 2; col++) {
            if ((mask & brickBit(col, row)) !== 0) solid = true;
          }
        }
        if (!solid) continue;
        const rx = ox + qc * HALF;
        const ry = oy + qr * HALF;
        if (x < rx + HALF - 0.5 && x + TANK - 0.5 > rx && y < ry + HALF - 0.5 && y + TANK - 0.5 > ry) return true;
      }
    }
    return false;
  }

  // One layer forward from the cell the bullet is in, and a full tile across.
  // The strip is centered on the bullet, so a shot on the line between two squares hits both.
  function shotRect(bullet) {
    const sign = bullet.dir === RIGHT || bullet.dir === DOWN ? 1 : -1;
    const alongX = bullet.dir === LEFT || bullet.dir === RIGHT;
    if (alongX) {
      const face = sign > 0 ? Math.floor(bullet.x / CELL) * CELL : Math.ceil(bullet.x / CELL) * CELL;
      const x0 = sign > 0 ? face : face - CELL;
      const mid = Math.round(bullet.y / HALF) * HALF;
      return [x0, mid - HALF, x0 + CELL, mid + HALF];
    }
    const face = sign > 0 ? Math.floor(bullet.y / CELL) * CELL : Math.ceil(bullet.y / CELL) * CELL;
    const y0 = sign > 0 ? face : face - CELL;
    const mid = Math.round(bullet.x / HALF) * HALF;
    return [mid - HALF, y0, mid + HALF, y0 + CELL];
  }

  function rectHitsMask(bits, c, r, x0, y0, x1, y1) {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if ((bits & brickBit(col, row)) === 0) continue;
        const rx = c * TILE + col * CELL;
        const ry = r * TILE + row * CELL;
        if (rx < x1 && rx + CELL > x0 && ry < y1 && ry + CELL > y0) return true;
      }
    }
    return false;
  }

  function chipShot(bullet) {
    const [x0, y0] = shotRect(bullet);
    const alongX = bullet.dir === LEFT || bullet.dir === RIGHT;
    let hitBrick = false;
    let hitSteel = false;
    for (let across = 0; across < 4; across++) {
      const px = alongX ? x0 : x0 + across * CELL;
      const py = alongX ? y0 + across * CELL : y0;
      const c = Math.floor(px / TILE);
      const r = Math.floor(py / TILE);
      if (r < 0 || c < 0 || r >= ROWS || c >= COLS) continue;
      const tile = game.map[r][c];
      if (tile === BASE) return "base";
      const col = Math.floor((px - c * TILE) / CELL);
      const row = Math.floor((py - r * TILE) / CELL);
      if (col < 0 || row < 0 || col > 3 || row > 3) continue;
      const bit = brickBit(col, row);
      if (tile === STEEL) {
        const bits = game.mask[r][c] || BRICK_FULL;
        if ((bits & bit) !== 0) hitSteel = true;
        continue;
      }
      if (tile !== BRICK) continue;
      let mask = game.mask[r][c] || 0;
      if ((mask & bit) === 0) continue;
      mask = (mask & ~bit) & BRICK_FULL;
      game.mask[r][c] = mask;
      if (mask === 0) game.map[r][c] = EMPTY;
      hitBrick = true;
    }
    if (hitBrick) return "brick";
    if (hitSteel) return "steel";
    return null;
  }

  function blocked(x, y, self) {
    if (!(x >= 0 && y >= 0 && x + TANK <= FIELD && y + TANK <= FIELD)) return true;
    const c0 = Math.floor(x / TILE);
    const c1 = Math.floor((x + TANK - 0.001) / TILE);
    const r0 = Math.floor(y / TILE);
    const r1 = Math.floor((y + TANK - 0.001) / TILE);
    for (let r = r0; r <= r1; r++) {
      for (let c = c0; c <= c1; c++) {
        if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return true;
        const t = game.map[r][c];
        if (t === BRICK) {
          if (brickBlocks(x, y, c, r)) return true;
        } else if (t === STEEL) {
          if (brickBlocks(x, y, c, r)) return true;
        } else if (t === WATER) {
          if (!self || !self.boat) return true;
        } else if (t === BASE) return true;
      }
    }
    const bodies = [game.player, ...game.enemies];
    for (const other of bodies) {
      if (!other || other === self || !other.alive) continue;
      if (game.player && game.player.ghost && (self === game.player || other === game.player)) continue;
      if (
        x < other.x + TANK - 0.5 &&
        x + TANK - 0.5 > other.x &&
        y < other.y + TANK - 0.5 &&
        y + TANK - 0.5 > other.y
      ) {
        return true;
      }
    }
    return false;
  }

  function step(tank, dir, dist) {
    const v = DIR[dir];
    let left = dist;
    let moved = false;
    let guard = 0;
    while (left > 0.001 && guard++ < 8) {
      const hop = Math.min(2, left);
      const nx = tank.x + v.x * hop;
      const ny = tank.y + v.y * hop;
      if (blocked(nx, ny, tank)) break;
      tank.x = nx;
      tank.y = ny;
      left -= hop;
      moved = true;
    }
    if (moved) tank.travel += dist - left;
    return moved;
  }

  function attemptMove(tank, dir, dt) {
    const dist = tank.speed * dt;
    if (dir === opposite(tank.dir)) {
      tank.dir = dir;
      return step(tank, dir, dist);
    }

    const axis = crossAxis(dir);
    if (dir !== tank.dir && misalign(tank[axis]) > ALIGN) {
      return slideToTurn(tank, dir, dist);
    }
    if (dir !== tank.dir) {
      tank[axis] = nearestSlot(tank[axis]);
      tank.dir = dir;
    }
    return step(tank, tank.dir, dist);
  }

  function slideToTurn(tank, dir, dist) {
    const along = travelAxis(tank.dir);
    const sign = DIR[tank.dir].x + DIR[tank.dir].y;
    const target = nextSlot(tank[along], sign);
    const moved = step(tank, tank.dir, Math.min(dist, Math.abs(target - tank[along])));
    if (moved && Math.abs(tank[along] - target) <= ALIGN) {
      tank[along] = target;
      tank.dir = dir;
      return true;
    }

    const axis = crossAxis(dir);
    if (!moved && misalign(tank[axis]) <= SNAP) {
      const x = axis === "x" ? nearestSlot(tank.x) : tank.x;
      const y = axis === "y" ? nearestSlot(tank.y) : tank.y;
      if (!blocked(x, y, tank)) {
        tank.x = x;
        tank.y = y;
        tank.dir = dir;
        return step(tank, dir, dist);
      }
    }
    return moved;
  }

  function onIce(tank) {
    const c = Math.floor((tank.x + TANK / 2) / TILE);
    const r = Math.floor((tank.y + TANK / 2) / TILE);
    return r >= 0 && c >= 0 && r < ROWS && c < COLS && game.map[r][c] === ICE;
  }

  // After the player lets go on ice, the tank coasts for 28 frames or until it leaves the ice.
  // Tracks stay put and the engine stays quiet for that stretch.
  function drive(tank, dir, dt) {
    if (tank === game.player) return drivePlayer(tank, dir, dt);
    if (!onIce(tank)) {
      if (dir === null) return false;
      return attemptMove(tank, dir, dt);
    }
    const dist = tank.speed * dt;
    if (dir === null || dir === tank.dir) return step(tank, tank.dir, dist);
    const along = travelAxis(tank.dir);
    if (misalign(tank[along]) > ALIGN) {
      const sign = DIR[tank.dir].x + DIR[tank.dir].y;
      const remain = Math.abs(nextSlot(tank[along], sign) - tank[along]);
      if (step(tank, tank.dir, Math.min(dist, remain))) return true;
    }
    return attemptMove(tank, dir, dt);
  }

  function drivePlayer(tank, dir, dt) {
    if (!onIce(tank)) {
      tank.coast = false;
      tank.slide = 0;
      if (dir === null) return false;
      const moved = attemptMove(tank, dir, dt);
      if (!moved) tank.travel += tank.speed * dt;
      return moved;
    }
    if (dir !== null && !(tank.coast && tank.slide > 0)) {
      tank.coast = false;
      tank.slide = 0;
      const moved = attemptMove(tank, dir, dt);
      if (!moved) tank.travel += tank.speed * dt;
      return moved;
    }
    if (!tank.coast) {
      tank.coast = true;
      tank.slide = 28 / 60;
    }
    tank.slide -= dt;
    if (tank.slide <= 0) {
      tank.coast = false;
      tank.slide = 0;
      return false;
    }
    const travel = tank.travel;
    const moved = step(tank, tank.dir, tank.speed * dt);
    tank.travel = travel;
    return moved;
  }

  function wantedDir() {
    for (let i = order.length - 1; i >= 0; i--) {
      const dir = CODE_DIR[order[i]];
      if (dir !== undefined) return dir;
    }
    return null;
  }

  // Respawn gap from the NES formula, in seconds. Later stages spawn sooner.
  function enemyRespawnDelay() {
    return Math.max(50, 190 - game.levelIndex * 4) / 60;
  }

  // First stretch: wander. Second: chase the player. After that: head for the base.
  // Each of the first two lasts respawnFrames/8 seconds. The clock then wraps like the NES seconds counter.
  function enemyPeriod() {
    const clock = (game.levelTime * (60 / 64)) % 256;
    const period = Math.max(50, 190 - game.levelIndex * 4) / 8;
    if (clock < period) return 1;
    if (clock < period * 2) return 2;
    return 3;
  }

  function frameChance(n, dt) {
    const frames = Math.min(dt, 0.05) * 60;
    return Math.random() < 1 - Math.pow(1 - 1 / n, frames);
  }

  function frontBlocked(enemy) {
    const v = DIR[enemy.dir];
    return blocked(enemy.x + v.x * 3, enemy.y + v.y * 3, enemy);
  }

  function randomFreeDir(enemy) {
    const free = [];
    for (let d = 0; d < 4; d++) {
      const v = DIR[d];
      if (!blocked(enemy.x + v.x * 3, enemy.y + v.y * 3, enemy)) free.push(d);
    }
    const pool = free.length ? free : [UP, RIGHT, DOWN, LEFT];
    return pool[(Math.random() * pool.length) | 0];
  }

  function changeDirection(enemy) {
    const period = enemyPeriod();
    if (period === 1 || !game.baseCell) {
      enemy.wish = randomFreeDir(enemy);
      return;
    }
    let tx = game.baseCell.c * TILE + TILE / 2;
    let ty = game.baseCell.r * TILE + TILE / 2;
    if (period === 2 && game.player && game.player.alive) {
      tx = game.player.x + TANK / 2;
      ty = game.player.y + TANK / 2;
    }
    const dx = tx - (enemy.x + TANK / 2);
    const dy = ty - (enemy.y + TANK / 2);
    const prefs =
      Math.abs(dx) > Math.abs(dy)
        ? [dx > 0 ? RIGHT : LEFT, dy > 0 ? DOWN : UP]
        : [dy > 0 ? DOWN : UP, dx > 0 ? RIGHT : LEFT];
    for (const d of prefs) {
      const v = DIR[d];
      if (!blocked(enemy.x + v.x * 3, enemy.y + v.y * 3, enemy)) {
        enemy.wish = d;
        return;
      }
    }
    enemy.wish = randomFreeDir(enemy);
  }

  // Half the time pick a fresh goal. Otherwise turn one step around the up-left-down-right ring.
  function turnCommand(enemy) {
    const roll = Math.random();
    if (roll < 0.5) changeDirection(enemy);
    else if (roll < 0.75) enemy.wish = (enemy.dir + 3) % 4;
    else enemy.wish = (enemy.dir + 1) % 4;
  }

  function fire(tank, ownerType) {
    const d = DIR[tank.dir];
    const stars = tank.stars || 0;
    game.bullets.push({
      x: tank.x + TANK / 2 + d.x * (TANK / 2 + 4),
      y: tank.y + TANK / 2 + d.y * (TANK / 2 + 4),
      dir: tank.dir,
      owner: tank,
      ownerType,
      alive: true,
      // Power tanks and a starred player shoot the fast shell (4px/frame). Everyone else shoots the slow one.
      speed: stars >= 1 || tank.kind === "rapid" ? 480 : 240,
      breaksSteel: stars >= 3,
    });
    play(ownerType === "player" ? sfxPlayerFire : sfxEnemyFire);
  }

  function tryShoot() {
    if (game.paused || game.mode !== "play" || !game.player || !game.player.alive) return;
    if (game.player.shotWait > 0) return;
    const slots = game.player.stars >= 2 ? 2 : 1;
    const used = game.bullets.filter((b) => b.alive && b.owner === game.player).length;
    if (used >= slots) return;
    fire(game.player, "player");
    game.player.shotWait = 0.22;
  }

  function boom(x, y, big, dir) {
    game.explosions.push({
      x,
      y,
      life: big ? 0.7 : 0.22,
      max: big ? 0.7 : 0.22,
      big,
      dir: dir || 0,
    });
  }

  function floatScore(score, x, y) {
    const tile = score === 100 ? 0xb8 : score === 200 ? 0xbc : score === 300 ? 0xc0 : score === 400 ? 0xc4 : 0;
    if (!tile) return;
    game.floaters.push({ tile, x, y, life: 0.7, max: 0.7 });
  }

  function spawnPickup(enemy) {
    const table = game.rules === "pirate"
      ? ["helmet", "clock", "shovel", "star", "grenade", "life", "pistol", "boat"]
      : ["helmet", "clock", "shovel", "star", "grenade", "life", "grenade", "star"];
    game.pickup = {
      kind: table[(Math.random() * table.length) | 0],
      x: enemy.x,
      y: enemy.y,
    };
  }

  function killEnemy(enemy, award) {
    if (!enemy.alive) return;
    enemy.alive = false;
    if (award !== false) {
      game.score += enemy.score || 100;
      floatScore(enemy.score || 100, enemy.x, enemy.y);
    }
    boom(enemy.x + TANK / 2, enemy.y + TANK / 2, true);
    play(sfxEntityKill);
    if (award !== false && enemy.carrier) {
      spawnPickup(enemy);
      play(sfxPowerUpAppear);
    }
  }

  function hurtEnemy(enemy) {
    enemy.hp -= 1;
    boom(enemy.x + TANK / 2, enemy.y + TANK / 2, false);
    if (enemy.hp <= 0) killEnemy(enemy);
    else play(sfxArmorHit);
  }

  // ROM eagle wall: a thin Π of brick quarters around the base.
  // Bits are NES subtiles: 0 TL, 1 TR, 2 BL, 3 BR. Each one is a 16px quadrant here.
  const NEST = [
    { r: 11, c: 5, bits: 0b1000 },
    { r: 11, c: 6, bits: 0b1100 },
    { r: 11, c: 7, bits: 0b0100 },
    { r: 12, c: 5, bits: 0b1010 },
    { r: 12, c: 7, bits: 0b0101 },
  ];

  function nestMask(bits) {
    let mask = 0;
    const origin = [
      [0, 0],
      [2, 0],
      [0, 2],
      [2, 2],
    ];
    for (let i = 0; i < 4; i++) {
      if ((bits & (1 << i)) === 0) continue;
      const [c0, r0] = origin[i];
      for (let row = r0; row < r0 + 2; row++) {
        for (let col = c0; col < c0 + 2; col++) mask |= brickBit(col, row);
      }
    }
    return mask;
  }

  function paintNest(steel) {
    game.fortified = [];
    for (const wall of NEST) {
      game.map[wall.r][wall.c] = steel ? STEEL : BRICK;
      game.mask[wall.r][wall.c] = steel ? BRICK_FULL : nestMask(wall.bits);
      game.fortified.push({ c: wall.c, r: wall.r });
    }
  }

  function fortifyBase() {
    paintNest(true);
    game.shovel = 20 * GAME_SEC;
    game.shovelSteel = true;
  }

  function tickShovel(dt) {
    const blink = 4 * GAME_SEC;
    const wasBlink = game.shovel < blink;
    game.shovel -= dt;
    if (game.shovel <= 0) {
      paintNest(false);
      game.shovel = 0;
      game.fortified = [];
      return;
    }
    if (game.shovel >= blink) return;
    const steel = Math.floor((blink - game.shovel) / (16 / 60)) % 2 === 0;
    if (!wasBlink || steel !== game.shovelSteel) {
      game.shovelSteel = steel;
      paintNest(steel);
    }
  }

  function applyPickup(kind) {
    const player = game.player;
    if (kind === "star") {
      player.stars = Math.min(3, player.stars + 1);
    } else if (kind === "life") {
      game.reserves = Math.min(9, game.reserves + 1);
    } else if (kind === "helmet") {
      player.helmet = 10 * GAME_SEC;
      player.invuln = Math.max(player.invuln, 10 * GAME_SEC);
    } else if (kind === "shovel") {
      fortifyBase();
    } else if (kind === "clock") {
      game.freeze = 10 * GAME_SEC;
    } else if (kind === "grenade") {
      for (const enemy of game.enemies) {
        if (enemy.alive) killEnemy(enemy, false);
      }
    } else if (kind === "pistol") {
      player.stars = 3;
      player.cutsTrees = true;
    } else if (kind === "boat") {
      player.boat = true;
    }
    play(kind === "life" ? () => sfxLifeUp(0) : sfxPowerUpCollect);
  }

  function overlapsPickup(tank, item) {
    return (
      tank.x < item.x + TANK &&
      tank.x + TANK > item.x &&
      tank.y < item.y + TANK &&
      tank.y + TANK > item.y
    );
  }

  function rankUpEnemy(enemy) {
    const rank = ["basic", "fast", "rapid", "armor"];
    const next = rank[rank.indexOf(enemy.kind) + 1];
    if (next) {
      const spec = KINDS[next];
      enemy.kind = next;
      enemy.speed = spec.speed;
      enemy.hp = spec.hp;
      enemy.score = spec.score;
    } else {
      enemy.hp = Math.min(4, enemy.hp + 1);
    }
    enemy.stars = Math.min(3, (enemy.stars || 0) + 1);
  }

  function applyEnemyPickup(enemy, kind) {
    if (kind === "star") {
      rankUpEnemy(enemy);
    } else if (kind === "life") {
      game.queue.push({ kind: "basic", carrier: false });
    } else if (kind === "helmet") {
      enemy.helmet = 10 * GAME_SEC;
      enemy.invuln = Math.max(enemy.invuln || 0, 10 * GAME_SEC);
    } else if (kind === "shovel") {
      game.shovel = 0;
      game.fortified = [];
      paintNest(false);
    } else if (kind === "clock") {
      game.playerFreeze = 10 * GAME_SEC;
    } else if (kind === "grenade") {
      killPlayer();
    } else if (kind === "pistol") {
      enemy.stars = 3;
      enemy.cutsTrees = true;
    } else if (kind === "boat") {
      enemy.boat = true;
    }
    play(sfxPowerUpCollect);
  }

  function collectPickup() {
    const item = game.pickup;
    const player = game.player;
    if (!item || !player || !player.alive) return;
    if (!overlapsPickup(player, item)) return;
    game.pickup = null;
    applyPickup(item.kind);
  }

  function collectEnemyPickup(enemy) {
    if (game.rules !== "pirate" || !game.pickup || !enemy.alive) return;
    if (!overlapsPickup(enemy, game.pickup)) return;
    const kind = game.pickup.kind;
    game.pickup = null;
    applyEnemyPickup(enemy, kind);
  }

  function killPlayer() {
    if (!game.player.alive || game.player.invuln > 0 || game.player.helmet > 0) return;
    game.player.alive = false;
    game.reserves -= 1;
    game.engine = false;
    play(sfxStopEngine);
    boom(game.player.x + TANK / 2, game.player.y + TANK / 2, true);
    for (const b of game.bullets) {
      if (b.owner === game.player) b.alive = false;
    }
    play(sfxEntityKill);
    if (game.reserves <= 0) {
      game.mode = "over";
      play(sfxGameOver);
    }
    else {
      game.mode = "dead";
      game.deadTimer = 1.15;
    }
  }

  function destroyBase() {
    if (!game.baseAlive) return;
    game.baseAlive = false;
    game.engine = false;
    play(sfxStopEngine);
    boom(game.baseCell.c * TILE + TILE / 2, game.baseCell.r * TILE + TILE / 2, true);
    play(sfxEagleHit);
    game.mode = "over";
  }

  function endBullet(b) {
    if (!b.alive || b.spent) return;
    b.spent = true;
    b.hold = 0.28;
  }

  function pointInTank(px, py, tank) {
    if (!tank || !tank.alive) return false;
    const tx = tank.x - INSET;
    const ty = tank.y - INSET;
    return px + 3 > tx && px - 3 < tx + TILE && py + 3 > ty && py - 3 < ty + TILE;
  }

  function hitBullet(b) {
    if (b.spent) return;
    if (!(b.x >= 0 && b.y >= 0 && b.x < FIELD && b.y < FIELD)) {
      endBullet(b);
      return;
    }
    const c = Math.floor(b.x / TILE);
    const r = Math.floor(b.y / TILE);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) {
      endBullet(b);
      return;
    }
    if (b.ownerType === "player") {
      for (const enemy of game.enemies) {
        if (pointInTank(b.x, b.y, enemy)) {
          endBullet(b);
          if ((enemy.invuln || 0) <= 0 && (enemy.helmet || 0) <= 0) hurtEnemy(enemy);
          return;
        }
      }
    } else if (game.player && game.player.invuln <= 0 && pointInTank(b.x, b.y, game.player)) {
      endBullet(b);
      killPlayer();
      return;
    }

    const t = game.map[r][c];
    if (b.breaksSteel) {
      const [x0, y0, x1, y1] = shotRect(b);
      const c0 = Math.max(0, Math.floor(x0 / TILE));
      const c1 = Math.min(COLS - 1, Math.floor((x1 - 0.001) / TILE));
      const r0 = Math.max(0, Math.floor(y0 / TILE));
      const r1 = Math.min(ROWS - 1, Math.floor((y1 - 0.001) / TILE));
      let broke = false;
      for (let rr = r0; rr <= r1; rr++) {
        for (let cc = c0; cc <= c1; cc++) {
          const tile = game.map[rr][cc];
          if (tile === BASE) {
            endBullet(b);
            destroyBase();
            return;
          }
          if (tile !== BRICK && tile !== STEEL) continue;
          const bits = game.mask[rr][cc] || (tile === STEEL ? BRICK_FULL : 0);
          if (!rectHitsMask(bits, cc, rr, x0, y0, x1, y1)) continue;
          game.mask[rr][cc] = 0;
          game.map[rr][cc] = EMPTY;
          broke = true;
        }
      }
      if (broke) {
        endBullet(b);
        boom(b.x, b.y, false, b.dir);
        play(sfxBrickHit);
        return;
      }
    }
    const struck = chipShot(b);
    if (struck === "base") {
      endBullet(b);
      destroyBase();
      return;
    }
    if (struck) {
      endBullet(b);
      boom(b.x, b.y, false, b.dir);
      play(struck === "steel" ? sfxSteelHit : sfxBrickHit);
      return;
    }
    if (t === BASE) {
      endBullet(b);
      destroyBase();
      return;
    }

    for (const other of game.bullets) {
      if (other === b || !other.alive || other.spent || other.ownerType === b.ownerType) continue;
      const dx = other.x - b.x;
      const dy = other.y - b.y;
      if (dx * dx + dy * dy < 49) {
        endBullet(b);
        endBullet(other);
        boom((b.x + other.x) / 2, (b.y + other.y) / 2, false);
        return;
      }
    }
  }

  function cutBush(bullet) {
    if (!bullet.owner || !bullet.owner.cutsTrees || bullet.spent) return;
    const c = Math.floor(bullet.x / TILE);
    const r = Math.floor(bullet.y / TILE);
    if (r < 0 || c < 0 || r >= ROWS || c >= COLS) return;
    if (game.map[r][c] === BUSH) game.map[r][c] = EMPTY;
  }

  function updateBullets(dt) {
    for (const b of game.bullets) {
      if (!b.alive || game.mode !== "play") continue;
      if (b.spent) {
        b.hold -= dt;
        if (b.hold <= 0) b.alive = false;
        continue;
      }
      let left = (b.speed || 240) * dt;
      const v = DIR[b.dir];
      const horizontal = b.dir === LEFT || b.dir === RIGHT;
      const sign = v.x + v.y;
      hitBullet(b);
      while (left > 0 && b.alive && !b.spent && game.mode === "play") {
        let hop = Math.min(8, left);
        const axis = horizontal ? b.x : b.y;
        const tile0 = Math.floor(axis / TILE) * TILE;
        const edges = [tile0, tile0 + CELL, tile0 + HALF, tile0 + CELL * 3, tile0 + TILE];
        if (sign > 0) {
          for (const edge of edges) {
            if (axis < edge - 0.02 && axis + hop > edge + 0.02) {
              hop = edge + 0.02 - axis;
              break;
            }
          }
        } else {
          for (let i = edges.length - 1; i >= 0; i--) {
            const edge = edges[i];
            if (axis > edge + 0.02 && axis - hop < edge - 0.02) {
              hop = axis - (edge - 0.02);
              break;
            }
          }
        }
        if (!(hop > 0)) hop = Math.min(8, left);
        b.x += v.x * hop;
        b.y += v.y * hop;
        left -= hop;
        cutBush(b);
        hitBullet(b);
      }
    }
  }

  function updateEnemy(enemy, dt) {
    if (!enemy.alive) return;
    if (enemy.helmet > 0) enemy.helmet -= dt;
    if (enemy.invuln > 0) enemy.invuln -= dt;
    if (enemy.shotWait > 0) enemy.shotWait -= dt;
    if (game.freeze > 0) return;
    if (enemy.warm > 0) {
      enemy.warm -= dt;
      return;
    }
    const onGrid = misalign(enemy.x) <= ALIGN && misalign(enemy.y) <= ALIGN;
    if (onGrid && frameChance(16, dt)) changeDirection(enemy);
    else if (frontBlocked(enemy) && frameChance(4, dt)) {
      if (onGrid) turnCommand(enemy);
      else enemy.wish = opposite(enemy.dir);
    }
    drive(enemy, enemy.wish, dt);
    collectEnemyPickup(enemy);
    const slots = (enemy.stars || 0) >= 2 ? 2 : 1;
    // A shell that just hit still holds its slot, same as the player's.
    const used = game.bullets.filter((b) => b.alive && b.owner === enemy).length;
    if (enemy.shotWait <= 0 && used < slots && game.mode === "play" && frameChance(32, dt)) {
      fire(enemy, "enemy");
      enemy.shotWait = 0.22;
    }
  }

  function updateSpawns(dt) {
    const level = LEVELS[game.levelIndex];
    if (game.queue.length === 0) return;
    if (game.enemies.filter((e) => e.alive).length >= level.maxAlive) return;
    game.spawnTimer -= dt;
    if (game.spawnTimer > 0) return;
    const spot = SPAWNS[game.spawnCursor % SPAWNS.length];
    const next = game.queue[0];
    const enemy = makeEnemy(spot, next.kind, next.carrier);
    if (blocked(enemy.x, enemy.y, enemy)) {
      game.spawnCursor += 1;
      game.spawnTimer = 0.35;
      return;
    }
    game.enemies.push(enemy);
    game.queue.shift();
    game.spawnCursor += 1;
    game.spawnTimer = enemyRespawnDelay();
  }

  function updateExplosions(dt) {
    for (const ex of game.explosions) ex.life -= dt;
    game.explosions = game.explosions.filter((ex) => ex.life > 0);
    for (const floater of game.floaters) {
      floater.life -= dt;
      floater.y -= dt * 16;
    }
    game.floaters = game.floaters.filter((floater) => floater.life > 0);
  }

  function discardDead() {
    game.enemies = game.enemies.filter((enemy) => enemy.alive);
    game.bullets = game.bullets.filter((bullet) => bullet.alive);
  }

  function updatePlay(dt) {
    game.levelTime += dt;
    if (game.freeze > 0) game.freeze -= dt;
    if (game.playerFreeze > 0) game.playerFreeze -= dt;
    if (game.shovel > 0) tickShovel(dt);
    if (game.player.alive) {
      if (game.player.shotWait > 0) game.player.shotWait -= dt;
      if (game.player.invuln > 0) game.player.invuln -= dt;
      if (game.player.helmet > 0) game.player.helmet -= dt;
      const frozen = game.playerFreeze > 0;
      const x0 = game.player.x;
      const y0 = game.player.y;
      if (!frozen) drive(game.player, wantedDir(), dt);
      const moved = game.player.x !== x0 || game.player.y !== y0;
      const pushing = wantedDir() !== null;
      if (frozen || game.player.coast) {
        if (game.engine) {
          game.engine = false;
          play(sfxStopEngine);
        }
      } else if ((moved || pushing) && !game.engine) {
        game.engine = true;
        play(sfxStartEngine);
      } else if (!moved && !pushing && game.engine) {
        game.engine = false;
        play(sfxStopEngine);
      }
      if (!frozen && (held.has("Space") || held.has("Fire"))) tryShoot();
      collectPickup();
      if (game.player.ghost) {
        const overlapping = game.enemies.some(
          (enemy) =>
            enemy.alive &&
            game.player.x < enemy.x + TANK &&
            game.player.x + TANK > enemy.x &&
            game.player.y < enemy.y + TANK &&
            game.player.y + TANK > enemy.y
        );
        if (!overlapping) game.player.ghost = false;
      }
    }

    for (const enemy of game.enemies) updateEnemy(enemy, dt);
    updateBullets(dt);
    updateExplosions(dt);
    discardDead();
    if (game.mode !== "play") return;

    updateSpawns(dt);
    if (game.baseAlive && game.queue.length === 0 && game.enemies.length === 0) {
      game.mode = "cleared";
      game.clearTimer = 1.6;
      play(sfxStageClear);
    }
  }

  function nudgeMenu(dir) {
    if (game.mode === "title") {
      game.menu = dir === UP ? 0 : 1;
      return;
    }
    const count = LEVELS.length;
    game.levelIndex = (game.levelIndex + (dir === UP ? 1 : count - 1)) % count;
  }

  function steerMenu(dt) {
    const dir = wantedDir();
    if (dir !== UP && dir !== DOWN) {
      game.menuDir = null;
      game.menuHold = 0;
      return;
    }
    if (dir !== game.menuDir) {
      game.menuDir = dir;
      game.menuHold = 0;
      nudgeMenu(dir);
      return;
    }
    game.menuHold += dt;
    if (game.menuHold < 0.18) return;
    game.menuHold = 0;
    nudgeMenu(dir);
  }

  function confirmMenu() {
    if (game.mode === "title") {
      game.rules = game.menu === 0 ? "original" : "pirate";
      game.mode = "select";
      game.menuDir = null;
      game.menuHold = 0;
      return;
    }
    if (game.mode === "win") {
      game.mode = "title";
      game.menuDir = null;
      game.menuHold = 0;
      return;
    }
    if (game.mode === "select" || game.mode === "over") startGame();
  }

  function steerPause(dt) {
    const dir = wantedDir();
    if (dir !== UP && dir !== DOWN) {
      game.menuDir = null;
      game.menuHold = 0;
      return;
    }
    if (dir !== game.menuDir) {
      game.menuDir = dir;
      game.menuHold = 0;
      game.pauseMenu = dir === UP ? 0 : 1;
      return;
    }
    game.menuHold += dt;
    if (game.menuHold < 0.18) return;
    game.menuHold = 0;
    game.pauseMenu = dir === UP ? 0 : 1;
  }

  function resumePlay() {
    game.paused = false;
    game.menuDir = null;
    game.menuHold = 0;
    play(sfxPause);
  }

  function leaveToTitle() {
    game.paused = false;
    game.pauseMenu = 0;
    game.mode = "title";
    game.menuDir = null;
    game.menuHold = 0;
    game.engine = false;
    play(stopAllSounds);
  }

  function confirmPause() {
    if (game.pauseMenu === 1) leaveToTitle();
    else resumePlay();
  }

  function update(dt) {
    if (game.paused) {
      steerPause(dt);
      return;
    }
    if (game.mode === "title" || game.mode === "select") steerMenu(dt);
    switch (game.mode) {
      case "intro":
        game.introTimer -= dt;
        if (game.introTimer <= 0) game.mode = "play";
        break;
      case "cleared":
        game.clearTimer -= dt;
        updateExplosions(dt);
        if (game.clearTimer <= 0) {
          if (game.levelIndex + 1 >= LEVELS.length) {
            game.mode = "win";
            play(sfxVictory);
          }
          else {
            game.levelIndex += 1;
            beginLevel();
          }
        }
        break;
      case "dead":
        game.deadTimer -= dt;
        updateBullets(dt);
        updateExplosions(dt);
        discardDead();
        if (game.mode === "dead" && game.deadTimer <= 0) respawn();
        break;
      case "play":
        updatePlay(dt);
        break;
      default:
        updateExplosions(dt);
        break;
    }
  }

  function theme() {
    const level = LEVELS[game.levelIndex] || LEVELS[0];
    return THEMES[level.theme] || THEMES.city;
  }

  const NES_HEX = ["#7C7C7C","#0000FC","#0000BC","#4428BC","#940084","#A80020","#A81000","#881400","#503000","#007800","#006800","#005800","#004058","#000000","#000000","#000000","#BCBCBC","#0078F8","#0058F8","#6844FC","#D800CC","#E40058","#F83800","#E45C10","#AC7C00","#00B800","#00A800","#00A844","#008888","#000000","#000000","#000000","#F8F8F8","#3CBCFC","#6888FC","#9878F8","#F878F8","#F85898","#F87858","#FCA044","#F8B800","#B8F818","#58D854","#58F898","#00E8D8","#787878","#000000","#000000","#FCFCFC","#A4E4FC","#B8B8F8","#D8B8F8","#F8B8F8","#F8A4C0","#F0D0B0","#FCE0A8","#F8D878","#D8F878","#B8F8B8","#B8F8D8","#00FCFC","#F8D8F8","#000000","#000000"];
  const NES_PAL = [
    [0x0f, 0x17, 0x06, 0x00],
    [0x0f, 0x3c, 0x10, 0x12],
    [0x0f, 0x29, 0x09, 0x0b],
    [0x0f, 0x00, 0x10, 0x20],
    [0x0f, 0x18, 0x27, 0x38],
    [0x0f, 0x0a, 0x1b, 0x3b],
    [0x0f, 0x0c, 0x10, 0x20],
    [0x0f, 0x04, 0x16, 0x20],
  ].map((slot) => slot.map((c) => NES_HEX[c & 0x3f]));
  const ARMOR_PAL = [
    ["#000000", "#881400", "#F83800", "#FCE0A8"],
    ["#000000", "#7C7C7C", "#BCBCBC", "#FCFCFC"],
    ["#000000", "#503000", "#AC7C00", "#F8D878"],
    ["#000000", "#005800", "#00A800", "#B8F818"],
  ];
  const NES_DIR = [0, 3, 2, 1];
  const PLAYER_BASE = [0x00, 0x20, 0x40, 0x60];
  const ENEMY_BASE = { basic: 0x80, fast: 0xa0, rapid: 0xc0, armor: 0xe0 };
  const PICKUP_TILE = { helmet: 0x80, clock: 0x84, shovel: 0x88, star: 0x8c, grenade: 0x90, life: 0x94 };
  const CHR_CELL = 9;

  let chrReady = false;
  const chrImg = new Image();
  const tileCache = new Map();
  chrImg.onload = () => {
    chrReady = true;
  };
  chrImg.src = "tiles/chr_all.png";
  const BONUS_FILE = {
    helmet: "tiles/bonus_helmet.png",
    clock: "tiles/bonus_clock.png",
    shovel: "tiles/bonus_shovel.png",
    star: "tiles/bonus_star.png",
    grenade: "tiles/bonus_grenade.png",
    life: "tiles/bonus_tank.png",
    pistol: "tiles/bonus_gun.png",
    boat: "tiles/bonus_boat.png",
  };
  const bonusImg = {};
  const bonusReady = {};
  Object.keys(BONUS_FILE).forEach((kind) => {
    const img = new Image();
    img.onload = () => {
      bonusReady[kind] = true;
    };
    img.src = BONUS_FILE[kind];
    bonusImg[kind] = img;
  });

  function paletteOf(pal) {
    return Array.isArray(pal) ? pal : NES_PAL[pal];
  }

  function bakedTile(tile, pal, transparent, ink) {
    const colors = paletteOf(pal);
    const key = tile + "|" + colors.join("|") + "|" + (transparent ? 1 : 0) + "|" + (ink || "");
    const cached = tileCache.get(key);
    if (cached) return cached;
    const sheet = document.createElement("canvas");
    sheet.width = 16;
    sheet.height = 16;
    const tctx = sheet.getContext("2d");
    const col = tile % 32;
    const row = (tile / 32) | 0;
    tctx.drawImage(chrImg, col * CHR_CELL + 1, row * CHR_CELL + 1, 8, 8, 0, 0, 8, 8);
    const data = tctx.getImageData(0, 0, 8, 8).data;
    tctx.clearRect(0, 0, 16, 16);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const i = (y * 8 + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // The sheet uses pure black for ink and #202020 for the empty cell.
        if (r < 0x10 && g < 0x10 && b < 0x10) {
          if (ink) {
            tctx.fillStyle = ink;
            tctx.fillRect(x * 2, y * 2, 2, 2);
          } else if (!transparent) {
            tctx.fillStyle = colors[0];
            tctx.fillRect(x * 2, y * 2, 2, 2);
          }
          continue;
        }
        const idx = r < 0x2b ? 0 : r < 0x7f ? 1 : r < 0xd5 ? 2 : 3;
        if (transparent && idx === 0) continue;
        tctx.fillStyle = colors[idx];
        tctx.fillRect(x * 2, y * 2, 2, 2);
      }
    }
    tileCache.set(key, sheet);
    return sheet;
  }

  function blitTile(tile, pal, x, y, transparent, scale, ink) {
    if (!chrReady) return false;
    const img = bakedTile(tile, pal, transparent, ink);
    const s = scale || 2;
    if (s === 2) ctx.drawImage(img, x, y);
    else ctx.drawImage(img, x, y, 8 * s, 8 * s);
    return true;
  }

  function blitSprite(tiles, pal, x, y, pt1, ink) {
    if (!chrReady) return false;
    const bank = pt1 ? 256 : 0;
    for (let i = 0; i < tiles.length; i++) {
      blitTile(bank + tiles[i], pal, x + (i % 2) * 16, y + ((i / 2) | 0) * 16, true, 2, ink);
    }
    return true;
  }

  function quadFrom(tile) {
    return [tile, tile + 2, tile + 1, tile + 3];
  }

  function spriteOrigin(tank) {
    return [tank.x - 3, tank.y - 3];
  }

  const GLYPH = {
    X: [".##...##", "..##.##.", "...###..", "...###..", "...###..", "..##.##.", ".##...##", "........"],
    Z: [".######.", ".....##.", "....##..", "...##...", "..##....", ".##.....", ".######.", "........"],
  };

  function drawGlyph(rows, x, y, scale) {
    const s = scale || 2;
    ctx.fillStyle = NES_PAL[0][3];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (rows[r][c] !== "#") continue;
        ctx.fillRect(x + c * s, y + r * s, s, s);
      }
    }
  }

  function drawNesText(str, x, y, scale) {
    const step = 8 * (scale || 2);
    let cx = x;
    for (const ch of str) {
      if (ch === " ") {
        cx += step;
        continue;
      }
      if (GLYPH[ch]) {
        const s = scale || 2;
        drawGlyph(GLYPH[ch], cx, y, s);
        // The sheet has no X, and T sits two pixels in from the left of its cell.
        cx += step - (ch === "X" ? s * 2 : 0);
        continue;
      }
      let tile = -1;
      if (ch >= "0" && ch <= "9") tile = 0x30 + ch.charCodeAt(0) - 48;
      else if (ch >= "A" && ch <= "Z") tile = 0x41 + ch.charCodeAt(0) - 65;
      else if (ch === "-") tile = 0x6b;
      if (tile >= 0) blitTile(tile, 0, cx, y, true, scale || 2);
      cx += step;
    }
  }

  function drawNesTextCenter(str, y, scale) {
    drawNesText(str, (FIELD - str.length * 8 * (scale || 2)) / 2, y, scale);
  }

  function drawBrick(x, y, colors, mask) {
    const bits = mask == null ? BRICK_FULL : mask;
    if (chrReady) {
      const img = bakedTile(0x0f, 0, false);
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          if ((bits & brickBit(col, row)) === 0) continue;
          ctx.drawImage(img, (col % 2) * 8, (row % 2) * 8, 8, 8, x + col * CELL, y + row * CELL, 8, 8);
        }
      }
      return;
    }
    const [mortar, face] = colors || theme().brick;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if ((bits & brickBit(col, row)) === 0) continue;
        const px = x + col * CELL;
        const py = y + row * CELL;
        ctx.fillStyle = face;
        ctx.fillRect(px, py, CELL, CELL);
        ctx.fillStyle = mortar;
        ctx.fillRect(px, py + CELL - 1, CELL, 1);
        const seam = row % 2 === 0 ? col % 2 === 1 : col % 2 === 0;
        if (seam) ctx.fillRect(px + CELL - 1, py, 1, CELL - 1);
      }
    }
  }

  function drawSteel(x, y, colors, mask) {
    const bits = mask == null || mask === 0 ? BRICK_FULL : mask;
    if (chrReady) {
      for (let row = 0; row < 2; row++) {
        for (let col = 0; col < 2; col++) {
          let on = false;
          for (let rr = row * 2; rr < row * 2 + 2 && !on; rr++) {
            for (let cc = col * 2; cc < col * 2 + 2; cc++) {
              if (bits & brickBit(cc, rr)) on = true;
            }
          }
          if (on) blitTile(0x10, 3, x + col * 16, y + row * 16, false);
        }
      }
      return;
    }
    const [edge, face, , shine] = colors || theme().steel;
    for (let row = 0; row < 2; row++) {
      for (let col = 0; col < 2; col++) {
        let on = false;
        for (let rr = row * 2; rr < row * 2 + 2 && !on; rr++) {
          for (let cc = col * 2; cc < col * 2 + 2; cc++) {
            if (bits & brickBit(cc, rr)) on = true;
          }
        }
        if (!on) continue;
        const px = x + col * HALF;
        const py = y + row * HALF;
        ctx.fillStyle = edge;
        ctx.fillRect(px, py, HALF, HALF);
        ctx.fillStyle = face;
        ctx.fillRect(px + 2, py + 2, HALF - 4, HALF - 4);
        ctx.fillStyle = shine;
        ctx.fillRect(px + 2, py + 2, HALF - 4, 2);
      }
    }
  }

  function drawWater(x, y, t, colors) {
    if (blitSprite([0x12, 0x12, 0x12, 0x12], 1, x, y, false)) return;
    const [deep, crest] = colors || theme().water;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, TILE, TILE);
    ctx.clip();
    ctx.fillStyle = deep;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = crest;
    const shift = Math.floor(t * 10) % 8;
    for (let i = -1; i < 5; i++) ctx.fillRect(x, y + i * 8 + shift, TILE, 3);
    ctx.restore();
  }

  function drawBush(x, y, colors) {
    if (blitSprite([0x22, 0x22, 0x22, 0x22], 2, x, y, false)) return;
    const [leaf, light] = colors || theme().bush;
    ctx.fillStyle = leaf;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(x + col * 8, y + row * 8, 6, 6);
      }
    }
    ctx.fillStyle = light;
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        ctx.fillRect(x + col * 8 + 1, y + row * 8 + 1, 4, 4);
      }
    }
  }

  function drawIce(x, y, colors) {
    if (blitSprite([0x21, 0x21, 0x21, 0x21], 3, x, y, false)) return;
    const [sheet, shine, crack] = colors || theme().ice;
    ctx.fillStyle = sheet;
    ctx.fillRect(x, y, TILE, TILE);
    ctx.fillStyle = shine;
    ctx.fillRect(x + 2, y + 2, TILE - 8, 5);
    ctx.fillRect(x + 2, y + 2, 5, TILE - 8);
    ctx.fillStyle = crack;
    const n = (x / TILE + y / TILE * 3) % 4;
    if (n === 0) {
      ctx.fillRect(x + 8, y + 16, 16, 2);
      ctx.fillRect(x + 20, y + 8, 2, 10);
    } else if (n === 1) {
      ctx.fillRect(x + 6, y + 10, 12, 2);
      ctx.fillRect(x + 6, y + 10, 2, 14);
    } else if (n === 2) {
      ctx.fillRect(x + 10, y + 22, 16, 2);
      ctx.fillRect(x + 12, y + 8, 2, 14);
    } else {
      ctx.fillRect(x + 14, y + 6, 2, 12);
      ctx.fillRect(x + 8, y + 18, 16, 2);
    }
  }

  function drawBase(c, r) {
    const x = c * TILE;
    const y = r * TILE;
    if (!game.baseAlive && blitSprite([0xcc, 0xce, 0xcd, 0xcf], 0, x, y, false)) return;
    const alive = game.baseAlive;
    ctx.fillStyle = alive ? "#120e0a" : "#161412";
    ctx.fillRect(x, y, TILE, TILE);
    const sprite = [
      "..dddd.........",
      ".dlllld........",
      ".e.leld........",
      "kkkllld........",
      "...dggd........",
      "..dggggd.......",
      ".dpppppd.......",
      "dllppplldd.....",
      "dlllldldlld....",
      "dllllddllddd...",
      "dllllmdlddlld..",
      ".dmlmlmddlld...",
      ".dlmlmmmmddd...",
      "..dmmmmmmdmmd..",
      "...ddddddmmmmd.",
      "...kk.kkk......",
    ];
    const ink = alive
      ? {
          d: "#4e565e",
          l: "#aaaeb4",
          m: "#848a92",
          e: "#101014",
          k: "#c69664",
          g: "#70ae8e",
          p: "#b888ac",
        }
      : {
          d: "#3c3c3c",
          l: "#8d8d8d",
          m: "#6a6a6a",
          e: "#1a1a1a",
          k: "#7a756c",
          g: "#6e6e6e",
          p: "#7a7a7a",
        };
    for (let row = 0; row < sprite.length; row++) {
      for (let col = 0; col < sprite[row].length; col++) {
        const ch = sprite[row][col];
        if (ch === ".") continue;
        ctx.fillStyle = ink[ch];
        ctx.fillRect(x + 1 + col * 2, y + row * 2, 2, 2);
      }
    }
    if (!alive) {
      ctx.fillStyle = "#2a241c";
      ctx.fillRect(x + 4, y + 14, 22, 2);
      ctx.fillRect(x + 12, y + 4, 2, 22);
    }
  }

  function drawSpawn(tank) {
    const seq = [0xad, 0xad, 0xa9, 0xa9, 0xa5, 0xa5, 0xa1, 0xa1, 0xa1, 0xa5, 0xa5, 0xa9, 0xa9, 0xad, 0xad];
    const step = Math.max(0, Math.min(14, Math.floor((1 - tank.warm / 0.45) * 15)));
    const tile = seq[step];
    const [x, y] = spriteOrigin(tank);
    const tl = tile & 0xfe;
    const tr = (tile + 2) & 0xfe;
    blitTile(tl, 7, x, y, true);
    blitTile(tl + 1, 7, x, y + 16, true);
    blitTile(tr, 7, x + 16, y, true);
    blitTile(tr + 1, 7, x + 16, y + 16, true);
  }

  function drawShield(x, y, t) {
    const tiles = Math.floor(t * 15) % 2 === 0 ? [0x28, 0x2a, 0x29, 0x2b] : [0x2c, 0x2e, 0x2d, 0x2f];
    blitSprite(tiles, 6, x, y, false);
  }

  function drawNesTank(tank, t) {
    const [x, y] = spriteOrigin(tank);
    const dir = NES_DIR[tank.dir] || 0;
    const anim = (Math.floor((tank.travel || 0) / 6) % 2) * 4;
    let base = PLAYER_BASE[Math.max(0, Math.min(3, tank.stars || 0))];
    let pal = 4;
    if (tank.kind) {
      base = ENEMY_BASE[tank.kind] || 0x80;
      pal = 6;
      if (tank.kind === "armor") pal = ARMOR_PAL[Math.max(0, Math.min(3, (tank.hp || 1) - 1))];
      if (tank.carrier && Math.floor(t * 8) % 2 === 0) pal = 7;
    }
    blitSprite(quadFrom(base + dir * 8 + anim), pal, x, y, true);
    if (tank.invuln > 0 || tank.helmet > 0) drawShield(x, y, t);
  }

  function drawExplosion(ex) {
    const p = 1 - ex.life / ex.max;
    if (!chrReady) {
      const s = (ex.big ? 30 : 14) * (0.4 + p);
      ctx.globalAlpha = 1 - p;
      ctx.fillStyle = "#fff1c2";
      ctx.fillRect(ex.x - s / 2, ex.y - s / 2, s, s);
      ctx.fillStyle = "#e25822";
      ctx.fillRect(ex.x - s / 4, ex.y - s / 4, s / 2, s / 2);
      ctx.globalAlpha = 1;
      return;
    }
    if (!ex.big) {
      const top = (0xb1 + (NES_DIR[ex.dir] || 0) * 2) & 0xfe;
      blitTile(top, 7, ex.x - 8, ex.y - 16, true);
      blitTile(top + 1, 7, ex.x - 8, ex.y, true);
      return;
    }
    const phase = Math.max(0, Math.min(6, Math.floor(p * 7)));
    if (phase === 3) {
      for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
          const tile = 0xe0 + col * 2 + (row & 1) + (row >> 1) * 8;
          blitTile(tile, 7, ex.x - 32 + col * 16, ex.y - 32 + row * 16, true);
        }
      }
      return;
    }
    const tile =
      phase === 0 || phase === 6 ? 0xf0 : phase === 1 || phase === 5 ? 0xf4 : 0xf8;
    blitSprite(quadFrom(tile), 7, ex.x - 16, ex.y - 16, false);
  }

  function drawGameOverBanner() {
    if (!chrReady) return false;
    const scale = 4;
    const x = (FIELD - 32 * scale) / 2;
    const y = FIELD / 2 - 16 * scale - 12;
    for (let col = 0; col < 4; col++) {
      blitTile(0x78 + col * 2, 7, x + col * 8 * scale, y, true, scale);
      blitTile(0x78 + col * 2 + 1, 7, x + col * 8 * scale, y + 8 * scale, true, scale);
    }
    return true;
  }

  function drawTank(tank, body, turret, t) {
    if (!tank) return;
    if (tank.warm > 0) {
      drawSpawn(tank);
      return;
    }
    if (chrReady) {
      drawNesTank(tank, t);
      return;
    }
    if (tank.invuln > 0 && Math.floor(tank.invuln * 12) % 2 === 0) return;
    ctx.save();
    ctx.translate(tank.x + TANK / 2, tank.y + TANK / 2);
    ctx.rotate((tank.dir * Math.PI) / 2);
    const phase = Math.floor((tank.travel + t * 10) / 5) % 2 === 0;
    ctx.fillStyle = "#111";
    ctx.fillRect(-13, -13, 5, 26);
    ctx.fillRect(8, -13, 5, 26);
    ctx.fillStyle = phase ? "#3a3a3a" : "#222";
    ctx.fillRect(-13, -11, 5, 4);
    ctx.fillRect(-13, -1, 5, 4);
    ctx.fillRect(-13, 8, 5, 4);
    ctx.fillRect(8, -8, 5, 4);
    ctx.fillRect(8, 2, 5, 4);
    ctx.fillStyle = body;
    ctx.fillRect(-8, -10, 16, 20);
    ctx.fillStyle = turret;
    ctx.fillRect(-5, -5, 10, 10);
    ctx.fillStyle = body;
    ctx.fillRect(-2, -16, 4, 12);
    if (tank.stars) {
      ctx.fillStyle = "#fff8e8";
      for (let i = 0; i < tank.stars; i++) ctx.fillRect(-6 + i * 4, 4, 3, 3);
    }
    ctx.restore();
  }

  function enemyLook(enemy, t) {
    if (enemy.carrier && Math.floor(t * 8) % 2 === 0) {
      return { body: "#fff6d8", turret: "#c0392b" };
    }
    if (enemy.kind === "armor") {
      const bodies = ["#a33b32", "#d97848", "#d4c15a", "#6fbf73"];
      return { body: bodies[Math.max(0, Math.min(3, enemy.hp - 1))], turret: "#102416" };
    }
    const spec = KINDS[enemy.kind] || KINDS.basic;
    return { body: spec.body, turret: spec.turret };
  }

  function drawBonus(kind, x, y) {
    if (!bonusReady[kind]) return false;
    ctx.drawImage(bonusImg[kind], x, y);
    return true;
  }

  function drawPistol(x, y) {
    ctx.fillStyle = "#d5d5d5";
    ctx.fillRect(x + 4, y + 8, 12, 3);
    ctx.fillRect(x + 12, y + 6, 4, 5);
    ctx.fillStyle = "#6e3014";
    ctx.fillRect(x + 6, y + 11, 3, 5);
  }

  function drawPickup(item, t) {
    if (Math.floor(t * 6) % 2 === 0) return;
    if (drawBonus(item.kind, item.x - 3, item.y - 3)) return;
    const tile = PICKUP_TILE[item.kind];
    if (tile != null && blitSprite(quadFrom(tile), 6, item.x - 3, item.y - 3, false)) return;
    const x = item.x + 3;
    const y = item.y + 3;
    ctx.fillStyle = "#1a140c";
    ctx.fillRect(x, y, 20, 20);
    ctx.strokeStyle = "#fff4c8";
    ctx.strokeRect(x + 0.5, y + 0.5, 19, 19);
    if (item.kind === "star") {
      ctx.fillStyle = "#f2c31a";
      ctx.fillRect(x + 8, y + 3, 4, 14);
      ctx.fillRect(x + 3, y + 8, 14, 4);
    } else if (item.kind === "life") {
      ctx.fillStyle = "#f2c31a";
      ctx.fillRect(x + 5, y + 7, 10, 8);
      ctx.fillRect(x + 8, y + 3, 4, 6);
    } else if (item.kind === "helmet") {
      ctx.fillStyle = "#d5d5d5";
      ctx.fillRect(x + 5, y + 8, 10, 7);
      ctx.fillRect(x + 7, y + 4, 6, 5);
    } else if (item.kind === "shovel") {
      ctx.fillStyle = "#c45c28";
      ctx.fillRect(x + 9, y + 3, 3, 12);
      ctx.fillRect(x + 5, y + 13, 11, 3);
    } else if (item.kind === "clock") {
      ctx.strokeStyle = "#fff8e8";
      ctx.strokeRect(x + 5.5, y + 5.5, 9, 9);
      ctx.fillStyle = "#fff8e8";
      ctx.fillRect(x + 9, y + 7, 2, 4);
    } else if (item.kind === "pistol") {
      drawPistol(x, y);
    } else {
      ctx.fillStyle = "#d64545";
      ctx.fillRect(x + 6, y + 7, 8, 8);
      ctx.fillStyle = "#f2c31a";
      ctx.fillRect(x + 9, y + 3, 2, 4);
    }
  }

  function drawGround() {
    const look = theme();
    ctx.fillStyle = look.ground;
    ctx.fillRect(0, 0, FIELD, FIELD);
    if (!look.fleck) return;
    ctx.fillStyle = look.fleck;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (game.map[r][c] !== EMPTY) continue;
        const x = c * TILE;
        const y = r * TILE;
        const n = (r * 5 + c * 3) % 4;
        ctx.fillRect(x + 6 + n * 4, y + 8, 2, 2);
        ctx.fillRect(x + 18, y + 20 - n, 2, 2);
      }
    }
  }

  function drawWorld(t) {
    const look = theme();
    drawGround();
    const bushes = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const tile = game.map[r][c];
        const x = c * TILE;
        const y = r * TILE;
        if (tile === BRICK) drawBrick(x, y, look.brick, game.mask[r][c]);
        else if (tile === STEEL) drawSteel(x, y, look.steel, game.mask[r][c]);
        else if (tile === WATER) drawWater(x, y, t, look.water);
        else if (tile === ICE) drawIce(x, y, look.ice);
        else if (tile === BASE) drawBase(c, r);
        else if (tile === BUSH) bushes.push([x, y]);
      }
    }
    if (game.player && game.player.alive) drawTank(game.player, "#f2c31a", "#8d6a0b", t);
    for (const enemy of game.enemies) {
      if (!enemy.alive) continue;
      const colors = enemyLook(enemy, t);
      drawTank(enemy, colors.body, colors.turret, t);
    }
    for (const b of game.bullets) {
      if (!b.alive || b.spent) continue;
      ctx.fillStyle = b.ownerType !== "player" ? "#ffc9c0" : b.breaksSteel ? "#ffffff" : "#fff4c2";
      ctx.fillRect(b.x - 3, b.y - 3, 6, 6);
    }
    for (const bush of bushes) drawBush(bush[0], bush[1], look.bush);
    for (const ex of game.explosions) drawExplosion(ex);
    for (const floater of game.floaters) {
      if (floater.tile) blitSprite(quadFrom(floater.tile), 6, floater.x - 3, floater.y - 3, false);
    }
    if (game.pickup) drawPickup(game.pickup, t);
  }

  function drawTitle(t) {
    ctx.fillStyle = "#070707";
    ctx.fillRect(0, 0, FIELD, FIELD);
    for (let c = 0; c < COLS; c++) {
      if (c % 2 === 0) drawBrick(c * TILE, 318, THEMES.city.brick);
    }
    drawTank({ x: 78, y: 188, dir: RIGHT, travel: t * 50, invuln: 0, warm: 0, stars: 0 }, "#f2c31a", "#8d6a0b", t);
    drawTank({ x: 300, y: 188, dir: LEFT, travel: t * 36, invuln: 0, warm: 0, kind: "basic" }, "#dedede", "#7a1f1f", t);
    ctx.fillStyle = "#fff4c2";
    const shot = 150 + ((t * 90) % 120);
    ctx.fillRect(shot, 198, 6, 6);

    if (chrReady) {
      drawNesTextCenter("BATTLE CITY", 48, 4);
      drawNesTextCenter("DEFEND THE EAGLE", 108, 2);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#f2c31a";
      ctx.font = 'bold 40px "Courier New", Courier, monospace';
      ctx.fillText("BATTLE CITY", FIELD / 2, 58);
      ctx.fillStyle = "#e6d7a2";
      ctx.font = 'bold 16px "Courier New", Courier, monospace';
      ctx.fillText("DEFEND THE EAGLE", FIELD / 2, 112);
    }
    drawMenuRows(["ORIGINAL", "EXTRAS"], 236);
    drawExtraMarks(236 + 28);
  }

  function drawExtraMarks(y) {
    const textLeft = (FIELD - "EXTRAS".length * 16) / 2;
    const textRight = textLeft + "EXTRAS".length * 16;
    drawBonus("pistol", textLeft - 44, y - 8);
    drawBonus("boat", textRight + 16, y - 8);
  }

  function drawMenuRows(rows, top, selected) {
    const cursor = selected == null ? game.menu : selected;
    rows.forEach((name, i) => {
      const y = top + i * 28;
      if (i === cursor) {
        ctx.fillStyle = "#f2c31a";
        ctx.fillRect(FIELD / 2 - 108, y + 2, 12, 12);
      }
      if (chrReady) {
        drawNesTextCenter(name, y, 2);
        return;
      }
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = i === cursor ? "#fff8e8" : "#e6d7a2";
      ctx.font = 'bold 20px "Courier New", Courier, monospace';
      ctx.fillText(name, FIELD / 2, y);
    });
  }

  function drawStageSelect() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) drawSteel(c * TILE, r * TILE, THEMES.city.steel, BRICK_FULL);
    }
    ctx.fillStyle = "#000";
    ctx.fillRect(64, 156, FIELD - 128, 88);
    const stage = "STAGE  " + (game.levelIndex + 1);
    const name = theme().name;
    if (chrReady) {
      drawNesTextCenter(stage, 176, 2);
      drawNesTextCenter(name, 208, 2);
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#111";
    ctx.font = 'bold 28px "Courier New", Courier, monospace';
    ctx.fillText(stage, FIELD / 2, 176);
    ctx.font = 'bold 16px "Courier New", Courier, monospace';
    ctx.fillText(name, FIELD / 2, 214);
  }

  function overlay(line1, line2) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, FIELD / 2 - 64, FIELD, line2 ? 128 : 100);
    if (chrReady) {
      if (line1) drawNesTextCenter(line1, FIELD / 2 - (line2 ? 28 : 12), 2);
      if (line2) drawNesTextCenter(line2, FIELD / 2 + 8, 2);
      return;
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#fff4c8";
    ctx.font = 'bold 36px "Courier New", Courier, monospace';
    ctx.fillText(line1, FIELD / 2, FIELD / 2 - (line2 ? 16 : 8));
    if (line2) {
      ctx.fillStyle = "#e6d7a2";
      ctx.font = 'bold 16px "Courier New", Courier, monospace';
      ctx.fillText(line2, FIELD / 2, FIELD / 2 + 24);
    }
  }

  function label(str, x, y, size, color) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = color;
    ctx.font = 'bold ' + size + 'px "Courier New", Courier, monospace';
    ctx.fillText(str, x, y);
  }

  function drawHudNes() {
    const x = FIELD;
    ctx.fillStyle = "#000000";
    ctx.fillRect(x, 0, HUD, FIELD);
    ctx.fillStyle = "#3c3420";
    ctx.fillRect(x, 0, 4, FIELD);
    const left = x + 20;
    drawNesText("BATTLE", left, 8, 2);
    drawNesText("CITY", left, 26, 2);
    drawNesText("SCORE", left, 46, 2);
    drawNesText(String(game.score), left, 64, 2);
    drawNesText("STAGE", left, 84, 2);
    // Light cloth and a visible pole. Pure black in the sheet used to vanish on this panel.
    const mark = ["#000000", "#E45C10", "#F83800", "#000000"];
    const ink = "#8d8272";
    blitSprite([0x6c, 0xfc, 0x6d, 0xfd], mark, left, 100, false, ink);
    drawNesText(String(game.mode === "title" ? 1 : game.levelIndex + 1), left + 40, 108, 2);
    if (game.mode !== "title") drawNesText(theme().name, left, 136, 2);
    const roster =
      game.mode === "title" || game.mode === "select"
        ? []
        : game.enemies
            .filter((enemy) => enemy.alive)
            .map(() => true)
            .concat(game.queue.map(() => true));
    for (let i = 0; i < roster.length; i++) {
      blitTile(0x6a, mark, left + (i % 2) * 18, 154 + Math.floor(i / 2) * 16, true, 2, ink);
    }
    const icons = [];
    if (game.player && game.player.helmet > 0) icons.push("helmet");
    if (game.freeze > 0 || game.playerFreeze > 0) icons.push("clock");
    if (game.shovel > 0) icons.push("shovel");
    if (game.player && game.player.cutsTrees) icons.push("pistol");
    if (game.player && game.player.boat) icons.push("boat");
    icons.forEach((kind, i) => {
      const x = left + i * 36;
      if (!drawBonus(kind, x, 322)) {
        const tile = PICKUP_TILE[kind];
        if (tile != null) blitSprite(quadFrom(tile), 6, x, 322, false);
      }
    });
    blitTile(0x14, ["#000000", "#f2c31a", "#8d6a0b", "#000000"], left, FIELD - 52, true, 2, ink);
    drawNesText(String(game.reserves), left + 22, FIELD - 56, 2);
  }

  function drawHud() {
    if (chrReady) {
      drawHudNes();
      return;
    }
    const x = FIELD;
    ctx.fillStyle = "#12100e";
    ctx.fillRect(x, 0, HUD, FIELD);
    ctx.fillStyle = "#3c3420";
    ctx.fillRect(x, 0, 4, FIELD);

    label("BATTLE", x + 18, 16, 18, "#f2c31a");
    label("CITY", x + 18, 38, 18, "#f2c31a");
    label("SCORE", x + 18, 64, 13, "#b7aa8a");
    label(String(game.score), x + 18, 80, 22, "#fff4c8");
    label("STAGE", x + 18, 112, 13, "#b7aa8a");
    label(String(game.mode === "title" ? 1 : game.levelIndex + 1), x + 78, 108, 22, "#fff4c8");
    if (game.mode !== "title") label(theme().name, x + 18, 136, 12, theme().accent);

    const roster =
      game.mode === "title" || game.mode === "select"
        ? []
        : game.enemies
            .filter((enemy) => enemy.alive)
            .map((enemy) => enemy.kind)
            .concat(game.queue.map((item) => item.kind));
    for (let i = 0; i < roster.length; i++) {
      const cx = x + 18 + (i % 2) * 22;
      const cy = 156 + Math.floor(i / 2) * 12;
      const spec = KINDS[roster[i]] || KINDS.basic;
      ctx.fillStyle = spec.body;
      ctx.fillRect(cx, cy, 14, 9);
      ctx.fillStyle = spec.turret;
      ctx.fillRect(cx + 5, cy + 1, 4, 6);
    }

    const stars = game.player ? game.player.stars : 0;
    if (stars > 0) {
      label("STAR", x + 18, 304, 13, "#b7aa8a");
      ctx.fillStyle = "#f2c31a";
      for (let i = 0; i < stars; i++) ctx.fillRect(x + 62 + i * 10, 307, 7, 7);
    }
    const flags = [];
    if (game.player && game.player.helmet > 0) flags.push("HELM");
    if (game.freeze > 0 || game.playerFreeze > 0) flags.push("STOP");
    if (game.shovel > 0) flags.push("WALL");
    if (game.player && game.player.boat) flags.push("BOAT");
    if (game.player && game.player.cutsTrees) flags.push("GUN");
    if (flags.length) label(flags.join(" "), x + 18, 322, 12, "#fff4c8");

    label("LIVES", x + 18, FIELD - 72, 13, "#b7aa8a");
    label(String(game.reserves), x + 18, FIELD - 52, 22, "#f2c31a");
  }

  function syncFireLabel() {
    const fire = document.querySelector(".fire");
    if (!fire) return;
    const starting = game.mode === "title" || game.mode === "select" || game.mode === "over" || game.mode === "win";
    const label = game.paused ? "OK" : game.mode === "win" ? "MENU" : starting ? "START" : "FIRE";
    if (fire.textContent !== label) {
      fire.textContent = label;
      fire.setAttribute("aria-label", label.charAt(0) + label.slice(1).toLowerCase());
    }
  }

  function syncPauseButton() {
    const button = document.querySelector(".pause");
    if (!button) return;
    button.classList.toggle("is-down", game.paused);
  }

  function syncHint() {
    const hint = document.getElementById("hint");
    if (!hint) return;
    const rows = {
      title: [["UP DOWN", "Select"], ["ENTER", "Start"]],
      select: [["UP DOWN", "Stage"], ["ENTER", "Start"]],
      play: [["ARROWS", "Move"], ["SPACE", "Fire"], ["ESC", "Pause"]],
      intro: [["ARROWS", "Move"], ["SPACE", "Fire"], ["ESC", "Pause"]],
      over: [["ENTER", "Continue"]],
      win: [["ENTER", "Menu"]],
      paused: [["UP DOWN", "Select"], ["ENTER", "Choose"], ["ESC", "Resume"]],
      cleared: [],
      dead: [],
    };
    const key = game.paused ? "paused" : Object.prototype.hasOwnProperty.call(rows, game.mode) ? game.mode : "play";
    if (hint.dataset.mode === key) return;
    hint.dataset.mode = key;
    hint.innerHTML = rows[key].map((pair) => "<span><kbd>" + pair[0] + "</kbd>" + pair[1] + "</span>").join("");
  }

  function render(t) {
    const shown = game.paused ? game.pauseAt : t;
    if (game.mode === "title") drawTitle(shown);
    else if (game.mode === "select") drawStageSelect();
    else drawWorld(shown);
    drawHud();
    syncFireLabel();
    syncPauseButton();
    syncHint();
    if (game.mode === "intro") overlay("STAGE " + (game.levelIndex + 1), theme().name);
    if (game.mode === "cleared") overlay("STAGE CLEAR");
    if (game.mode === "over") {
      if (drawGameOverBanner()) overlay("", "ENTER TO RESTART");
      else overlay("GAME OVER", "ENTER TO RESTART");
    }
    if (game.mode === "win") overlay("YOU WIN", "SCORE " + game.score + "   ENTER");
    if (game.paused) drawPauseMenu();
  }

  function drawPauseMenu() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(0, FIELD / 2 - 78, FIELD, 168);
    if (chrReady) {
      drawNesTextCenter("PAUSED", FIELD / 2 - 58, 2);
    } else {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#fff4c8";
      ctx.font = 'bold 28px "Courier New", Courier, monospace';
      ctx.fillText("PAUSED", FIELD / 2, FIELD / 2 - 58);
    }
    drawMenuRows(["CONTINUE", "MENU"], FIELD / 2 - 16, game.pauseMenu);
  }

  function play(fn) {
    try {
      if (typeof initAudio === "function") initAudio();
      if (typeof fn === "function") fn();
    } catch (err) {
      /* sound is optional */
    }
  }

  function holdCode(code) {
    if (held.has(code)) return;
    held.add(code);
    order.push(code);
  }

  function dropCode(code) {
    if (!held.delete(code)) return;
    const i = order.indexOf(code);
    if (i >= 0) order.splice(i, 1);
  }

  function togglePause() {
    if (game.mode === "title" || game.mode === "select" || game.mode === "over" || game.mode === "win") return;
    game.paused = !game.paused;
    if (game.paused) {
      game.pauseAt = clock;
      game.pauseMenu = 0;
      game.menuDir = null;
      game.menuHold = 0;
      game.engine = false;
      play(sfxStopEngine);
    }
    play(sfxPause);
  }

  window.addEventListener("keydown", (e) => {
    if (CODE_DIR[e.code] !== undefined || e.code === "Space" || e.code === "Escape") e.preventDefault();
    if (e.repeat) return;
    if (e.code === "Escape") {
      togglePause();
      return;
    }
    if (game.paused && e.code === "Enter") {
      confirmPause();
      return;
    }
    holdCode(e.code);
    if (e.code === "Enter" && (game.mode === "title" || game.mode === "select" || game.mode === "over" || game.mode === "win")) {
      confirmMenu();
    }
  });

  window.addEventListener("keyup", (e) => {
    dropCode(e.code);
  });

  window.addEventListener("blur", () => {
    held.clear();
    order.length = 0;
    document.querySelectorAll(".pad button.is-down, .fire.is-down").forEach((button) => button.classList.remove("is-down"));
  });

  const TOUCH_DIR = {
    up: "ArrowUp",
    right: "ArrowRight",
    down: "ArrowDown",
    left: "ArrowLeft",
  };

  document.querySelectorAll(".pad button").forEach((button) => {
    const code = TOUCH_DIR[button.dataset.dir];
    button.addEventListener("contextmenu", (e) => e.preventDefault());
    button.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      button.classList.add("is-down");
      holdCode(code);
      try { button.setPointerCapture(e.pointerId); } catch (err) { /* finger already up */ }
    }, { passive: false });
    const release = () => {
      button.classList.remove("is-down");
      dropCode(code);
    };
    button.addEventListener("pointerup", release);
    button.addEventListener("pointercancel", release);
  });

  const pauseButton = document.querySelector(".pause");
  if (pauseButton) {
    pauseButton.addEventListener("contextmenu", (e) => e.preventDefault());
    pauseButton.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      togglePause();
    }, { passive: false });
  }

  const fireButton = document.querySelector(".fire");
  if (fireButton) {
    fireButton.addEventListener("contextmenu", (e) => e.preventDefault());
    fireButton.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      e.preventDefault();
      if (game.paused) {
        confirmPause();
        return;
      }
      if (game.mode === "title" || game.mode === "select" || game.mode === "over" || game.mode === "win") {
        confirmMenu();
        return;
      }
      fireButton.classList.add("is-down");
      holdCode("Fire");
      try { fireButton.setPointerCapture(e.pointerId); } catch (err) { /* finger already up */ }
    }, { passive: false });
    const releaseFire = () => {
      fireButton.classList.remove("is-down");
      dropCode("Fire");
    };
    fireButton.addEventListener("pointerup", releaseFire);
    fireButton.addEventListener("pointercancel", releaseFire);
  }

  canvas.addEventListener("click", () => {
    canvas.focus();
    if (game.paused) confirmPause();
    else if (game.mode === "title" || game.mode === "select" || game.mode === "over" || game.mode === "win") confirmMenu();
  });

  let last = performance.now();
  let clock = 0;
  let soundAcc = 0;
  function frame(now) {
    const frameDt = Math.max(0, (now - last) / 1000) || 0;
    const dt = Math.min(0.033, frameDt);
    last = now;
    clock = now / 1000;
    update(dt);
    render(clock);
    // The sound engine counts NES frames. The screen may refresh faster than 60 Hz.
    soundAcc = Math.min(0.25, soundAcc + frameDt);
    while (soundAcc >= 1 / 60) {
      soundAcc -= 1 / 60;
      if (typeof soundTick === "function") soundTick();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
