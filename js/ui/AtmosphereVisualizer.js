/**
 * AtmosphereVisualizer.js
 * Pixel-Art Weather, Time-of-Day, and Audio Spectrum Visualizer with Full-UI Bleeding Glow
 * and Full-Viewport Ambient Background Visualizer (#ambient-bleed-canvas).
 */
export class AtmosphereVisualizer {
  constructor(skyCanvas, bleedCanvas) {
    this.skyCanvas = skyCanvas;
    this.bleedCanvas = bleedCanvas;
    this.screenMode = 'MAP';
    this.weather = 'DRIZZLE';
    this.timeOfDay = 'DUSK';
    this.environment = 'OUTDOOR';
    this.particles = [];
    this.bgParticles = [];
    this.mapRipples = [];
    this.tick = 0;

    for (let i = 0; i < 76; i += 1) {
      this.particles.push({
        x: Math.random() * 640,
        y: Math.random() * 132,
        speedX: -0.6 - Math.random() * 1.4,
        speedY: 1.4 + Math.random() * 2.4,
        size: Math.random() > 0.45 ? 2 : 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 110; i += 1) {
      this.bgParticles.push({
        x: Math.random() * 480,
        y: Math.random() * 270,
        speedX: -0.4 - Math.random() * 1.1,
        speedY: 0.9 + Math.random() * 1.8,
        size: Math.random() > 0.5 ? 2 : 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 18; i += 1) {
      this.mapRipples.push({
        x: 40 + Math.random() * 400,
        y: 25 + Math.random() * 220,
        r: Math.random() * 7,
        maxR: 5 + Math.random() * 5
      });
    }

    this._initArchipelagoGeometry();
    this.targetColorState = this._computeTargetColorState();
    this.currentColorState = this._cloneColorState(this.targetColorState);
    this.targetWeatherState = this._computeTargetWeatherState();
    this.currentWeatherState = { ...this.targetWeatherState };
    this._applyCssVariablesFromState(this.currentColorState);
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  startLoop() {
    // Loop is already running via requestAnimationFrame
  }

  setScreenMode(mode) {
    this.screenMode = mode === 'GAMEPLAY' ? 'GAMEPLAY' : 'MAP';
    this._syncBleedingGlow();
  }

  _initArchipelagoGeometry() {
    // Comprehensive pixel-art polygon silhouettes for the Philippine Archipelago
    // and surrounding Western, Northern, Southern, and Eastern sea island chains
    // spanning the entire 480x270 canvas.
    this.archipelagoIslands = [
      // --- FAR NORTH & BATANES / BABUYAN CHAINS ---
      {
        name: 'NORTH_CAPE_ISLE',
        pts: [[204, 4], [224, 4], [228, 12], [212, 14], [202, 9]],
        peaks: [[214, 8]]
      },
      {
        name: 'ITBAYAT',
        pts: [[222, 16], [228, 16], [227, 21], [221, 20]],
        peaks: []
      },
      {
        name: 'BATAN_SABTANG',
        pts: [[231, 20], [237, 20], [236, 25], [230, 24]],
        peaks: []
      },
      {
        name: 'CALAYAN',
        pts: [[214, 24], [222, 24], [221, 29], [213, 28]],
        peaks: []
      },
      {
        name: 'BABUYAN_CLARO',
        pts: [[228, 26], [235, 26], [234, 31], [227, 30]],
        peaks: []
      },
      {
        name: 'CAMIGUIN_NORTE',
        pts: [[222, 30], [228, 30], [227, 34], [221, 34]],
        peaks: []
      },

      // --- LUZON & SURROUNDING ISLANDS ---
      {
        name: 'LUZON',
        pts: [
          [206, 34], [236, 34], [244, 48], [242, 70], [236, 84],
          [250, 94], [270, 104], [280, 116], [264, 120], [248, 108],
          [230, 104], [220, 94], [210, 88], [214, 78], [204, 68],
          [200, 48]
        ],
        peaks: [[218, 44], [226, 54], [234, 66], [216, 82], [264, 110]]
      },
      {
        name: 'POLILLO',
        pts: [[246, 78], [254, 78], [255, 86], [247, 86]],
        peaks: []
      },
      {
        name: 'CATANDUANES',
        pts: [[278, 96], [288, 98], [288, 108], [278, 106]],
        peaks: [[283, 102]]
      },
      {
        name: 'LUBANG',
        pts: [[192, 96], [200, 96], [199, 101], [191, 100]],
        peaks: []
      },
      {
        name: 'MARINDUQUE',
        pts: [[228, 104], [235, 104], [235, 111], [228, 111]],
        peaks: []
      },
      {
        name: 'MINDORO',
        pts: [
          [198, 104], [214, 104], [220, 120], [210, 130], [196, 118]
        ],
        peaks: [[208, 116], [212, 122]]
      },
      {
        name: 'TABLAS_ROMBLON',
        pts: [[224, 116], [230, 116], [230, 126], [224, 126]],
        peaks: []
      },
      {
        name: 'SIBUYAN',
        pts: [[233, 118], [241, 118], [241, 125], [233, 125]],
        peaks: [[237, 121]]
      },
      {
        name: 'BURIAS_TICAO',
        pts: [[244, 110], [252, 112], [250, 118], [242, 116]],
        peaks: []
      },
      {
        name: 'MASBATE',
        pts: [
          [246, 120], [258, 122], [256, 132], [245, 128]
        ],
        peaks: [[251, 125]]
      },

      // --- PALAWAN, CALAMIAN, CUYO & BALABAC ---
      {
        name: 'BUSUANGA_CORON',
        pts: [[184, 122], [195, 124], [193, 132], [182, 129]],
        peaks: [[188, 127]]
      },
      {
        name: 'CUYO_ISLES',
        pts: [[202, 136], [210, 136], [209, 142], [201, 142]],
        peaks: []
      },
      {
        name: 'CAGAYANCILLO',
        pts: [[206, 156], [213, 156], [212, 162], [205, 161]],
        peaks: []
      },
      {
        name: 'PALAWAN',
        pts: [
          [184, 134], [192, 138], [168, 170], [142, 198], [134, 192], [160, 164]
        ],
        peaks: [[176, 150], [164, 166], [148, 184]]
      },
      {
        name: 'BALABAC',
        pts: [[126, 202], [134, 202], [132, 210], [124, 209]],
        peaks: []
      },

      // --- VISAYAS ARCHIPELAGO ---
      {
        name: 'PANAY',
        pts: [
          [218, 132], [236, 132], [236, 150], [222, 154], [216, 142]
        ],
        peaks: [[224, 142], [228, 138]]
      },
      {
        name: 'GUIMARAS',
        pts: [[231, 150], [236, 150], [235, 155], [230, 154]],
        peaks: []
      },
      {
        name: 'NEGROS',
        pts: [
          [238, 140], [248, 140], [248, 166], [236, 168], [234, 156]
        ],
        peaks: [[242, 148], [241, 160]]
      },
      {
        name: 'BANTAYAN',
        pts: [[246, 132], [251, 132], [251, 137], [246, 137]],
        peaks: []
      },
      {
        name: 'CEBU',
        pts: [
          [250, 138], [256, 138], [253, 168], [248, 166]
        ],
        peaks: [[252, 152]]
      },
      {
        name: 'CAMOTES',
        pts: [[258, 146], [263, 146], [263, 151], [258, 151]],
        peaks: []
      },
      {
        name: 'BOHOL',
        pts: [
          [256, 156], [267, 156], [267, 165], [256, 165]
        ],
        peaks: [[261, 160]]
      },
      {
        name: 'SIQUIJOR',
        pts: [[248, 168], [254, 168], [254, 172], [248, 172]],
        peaks: []
      },
      {
        name: 'SAMAR',
        pts: [
          [268, 120], [286, 124], [290, 144], [276, 146], [266, 132]
        ],
        peaks: [[276, 130], [282, 138]]
      },
      {
        name: 'BILIRAN',
        pts: [[263, 133], [269, 133], [269, 138], [263, 138]],
        peaks: []
      },
      {
        name: 'LEYTE',
        pts: [
          [264, 139], [275, 141], [276, 162], [265, 160]
        ],
        peaks: [[269, 148], [271, 155]]
      },
      {
        name: 'HOMONHON_DINAGAT',
        pts: [[282, 148], [289, 148], [290, 162], [283, 160]],
        peaks: [[286, 155]]
      },
      {
        name: 'SIARGAO',
        pts: [[292, 156], [300, 156], [300, 165], [292, 164]],
        peaks: []
      },

      // --- MINDANAO, SULU & SOUTHERN SEAS ---
      {
        name: 'CAMIGUIN_SUR',
        pts: [[266, 167], [272, 167], [272, 172], [266, 172]],
        peaks: [[269, 169]]
      },
      {
        name: 'MINDANAO',
        pts: [
          [266, 172], [292, 170], [304, 184], [306, 214], [292, 228],
          [276, 236], [260, 228], [250, 212], [238, 206], [218, 214],
          [212, 206], [228, 194], [248, 192], [254, 180]
        ],
        peaks: [[276, 184], [288, 198], [270, 214], [256, 196], [294, 212]]
      },
      {
        name: 'SAMAL',
        pts: [[286, 206], [291, 206], [291, 213], [286, 213]],
        peaks: []
      },
      {
        name: 'SARANGANI_ISLES',
        pts: [[274, 239], [282, 239], [281, 245], [273, 245]],
        peaks: []
      },
      {
        name: 'BASILAN',
        pts: [[210, 215], [220, 215], [219, 222], [209, 222]],
        peaks: [[214, 218]]
      },
      {
        name: 'SULU_JOLO',
        pts: [[196, 223], [207, 223], [205, 230], [194, 230]],
        peaks: [[201, 226]]
      },
      {
        name: 'PANGUTARAN',
        pts: [[184, 216], [192, 216], [191, 222], [183, 221]],
        peaks: []
      },
      {
        name: 'TAWITAWI',
        pts: [[178, 231], [190, 231], [188, 238], [176, 238]],
        peaks: []
      },
      {
        name: 'SIBUTU',
        pts: [[166, 238], [173, 238], [172, 246], [165, 246]],
        peaks: []
      },
      {
        name: 'MAPUN_CAGAYAN_SULU',
        pts: [[156, 198], [164, 198], [163, 204], [155, 204]],
        peaks: []
      },

      // --- SOUTHWESTERN BORNEO / SABAH & KARIMATA CHAIN (LEFT/BOTTOM-LEFT SCREEN) ---
      {
        name: 'NORTH_BORNEO_CAPE',
        pts: [
          [56, 264], [78, 242], [104, 232], [126, 218], [146, 224],
          [158, 242], [152, 264]
        ],
        peaks: [[96, 248], [122, 236], [138, 248]]
      },
      {
        name: 'BANGGI_BALAMBANGAN',
        pts: [[118, 210], [126, 210], [125, 216], [117, 216]],
        peaks: []
      },
      {
        name: 'LABUAN_BRUNEI_ISLES',
        pts: [[64, 234], [74, 232], [72, 239], [62, 239]],
        peaks: []
      },
      {
        name: 'NATUNA_NORTH',
        pts: [[24, 204], [38, 202], [42, 214], [28, 218], [20, 210]],
        peaks: [[31, 210]]
      },
      {
        name: 'ANAMBAS_ISLES',
        pts: [[14, 232], [26, 230], [28, 240], [16, 242]],
        peaks: []
      },

      // --- WEST PHILIPPINE SEA / KALAYAAN / BAJO DE MASINLOC CHAINS (LEFT SCREEN) ---
      {
        name: 'BAJO_DE_MASINLOC',
        pts: [[164, 68], [174, 68], [176, 76], [162, 76]],
        peaks: []
      },
      {
        name: 'PAGASA_THITU',
        pts: [[108, 134], [118, 132], [120, 140], [106, 142]],
        peaks: []
      },
      {
        name: 'LIKAS_PAROLA',
        pts: [[122, 122], [131, 122], [130, 129], [121, 128]],
        peaks: []
      },
      {
        name: 'PATAG_LAWAAN',
        pts: [[134, 138], [144, 138], [142, 146], [132, 145]],
        peaks: []
      },
      {
        name: 'RIZAL_AYUNGIN_REEF',
        pts: [[138, 154], [148, 154], [146, 162], [136, 160]],
        peaks: []
      },
      {
        name: 'LAGOS_WEST_ATOLL',
        pts: [[82, 152], [94, 150], [98, 160], [86, 164], [78, 158]],
        peaks: [[88, 157]]
      },
      {
        name: 'WESTERN_SHOAL_01',
        pts: [[52, 118], [66, 116], [70, 126], [56, 130], [48, 124]],
        peaks: [[59, 122]]
      },
      {
        name: 'WESTERN_SHOAL_02',
        pts: [[32, 78], [46, 76], [50, 88], [36, 92], [28, 84]],
        peaks: [[39, 84]]
      },
      {
        name: 'NORTHWEST_ARCHIPELAGO_01',
        pts: [[64, 34], [82, 30], [88, 44], [72, 50], [58, 42]],
        peaks: [[73, 39]]
      },
      {
        name: 'NORTHWEST_ARCHIPELAGO_02',
        pts: [[118, 22], [132, 20], [136, 30], [122, 34]],
        peaks: [[127, 27]]
      },
      {
        name: 'PRATAS_DONGSHA_ATOLL',
        pts: [[154, 18], [166, 18], [168, 26], [152, 26]],
        peaks: []
      },
      {
        name: 'WEST_MARGIN_ISLE_01',
        pts: [[18, 44], [30, 42], [32, 54], [20, 56]],
        peaks: []
      },
      {
        name: 'WEST_MARGIN_ISLE_02',
        pts: [[22, 148], [36, 146], [40, 158], [26, 162]],
        peaks: [[31, 154]]
      },
      {
        name: 'WEST_MARGIN_ISLE_03',
        pts: [[54, 178], [68, 176], [72, 188], [58, 190]],
        peaks: []
      },

      // --- SANGIHE, TALAUD, MIANGAS & CELEBES SEA ISLANDS (SOUTH / SOUTHEAST) ---
      {
        name: 'MIANGAS_PALMAS',
        pts: [[296, 244], [304, 244], [303, 250], [295, 250]],
        peaks: []
      },
      {
        name: 'TALAUD_ISLANDS',
        pts: [[306, 250], [318, 248], [322, 260], [308, 262]],
        peaks: [[314, 255]]
      },
      {
        name: 'SANGIHE_CHAIN',
        pts: [[272, 252], [284, 250], [286, 262], [274, 264]],
        peaks: [[279, 257]]
      },
      {
        name: 'MOROTAI_HALMAHERA_NORTH',
        pts: [[336, 246], [354, 242], [362, 256], [346, 264], [332, 258]],
        peaks: [[346, 252], [352, 258]]
      },

      // --- PHILIPPINE RISE, PALAU, YAP & PACIFIC VOLCANIC ARCS (RIGHT SCREEN) ---
      {
        name: 'BENHAM_RISE_SEAMOUNT_01',
        pts: [[292, 58], [306, 56], [310, 66], [296, 70], [288, 64]],
        peaks: [[299, 62]]
      },
      {
        name: 'BENHAM_RISE_SEAMOUNT_02',
        pts: [[316, 72], [328, 70], [330, 80], [318, 82]],
        peaks: []
      },
      {
        name: 'EASTERN_ATOLL_01',
        pts: [[334, 34], [348, 32], [352, 42], [338, 46]],
        peaks: [[343, 39]]
      },
      {
        name: 'EASTERN_ATOLL_02',
        pts: [[376, 22], [392, 20], [398, 32], [382, 36], [372, 28]],
        peaks: [[384, 28]]
      },
      {
        name: 'MARIANA_ARC_01',
        pts: [[422, 16], [436, 14], [440, 26], [426, 28]],
        peaks: [[431, 21]]
      },
      {
        name: 'MARIANA_ARC_02',
        pts: [[438, 42], [452, 40], [456, 54], [442, 58], [434, 50]],
        peaks: [[445, 48]]
      },
      {
        name: 'MARIANA_ARC_03',
        pts: [[444, 76], [458, 74], [462, 88], [448, 92]],
        peaks: [[453, 83]]
      },
      {
        name: 'MARIANA_ARC_04',
        pts: [[432, 110], [448, 108], [452, 122], [436, 126]],
        peaks: [[442, 117]]
      },
      {
        name: 'PALAU_BABELDAOB',
        pts: [
          [364, 186], [380, 182], [386, 198], [376, 212], [362, 206], [358, 194]
        ],
        peaks: [[372, 194], [375, 202]]
      },
      {
        name: 'KOROR_PELELIU',
        pts: [[354, 214], [364, 214], [362, 224], [352, 222]],
        peaks: []
      },
      {
        name: 'SONSOROL_TOBI',
        pts: [[336, 226], [344, 226], [343, 233], [335, 232]],
        peaks: []
      },
      {
        name: 'YAP_ISLANDS',
        pts: [[398, 152], [414, 148], [418, 160], [404, 166], [394, 158]],
        peaks: [[406, 156]]
      },
      {
        name: 'ULITHI_ATOLL',
        pts: [[418, 136], [428, 134], [430, 142], [420, 144]],
        peaks: []
      },
      {
        name: 'NGULU_ATOLL',
        pts: [[384, 168], [392, 168], [391, 175], [383, 174]],
        peaks: []
      },
      {
        name: 'CAROLINE_WEST_01',
        pts: [[434, 174], [450, 170], [456, 184], [440, 188]],
        peaks: [[445, 179]]
      },
      {
        name: 'CAROLINE_WEST_02',
        pts: [[412, 212], [428, 208], [434, 222], [418, 226]],
        peaks: [[423, 217]]
      },
      {
        name: 'CAROLINE_SOUTH_03',
        pts: [[388, 240], [404, 238], [408, 250], [392, 254]],
        peaks: []
      },
      {
        name: 'PACIFIC_OUTER_ISLE',
        pts: [[442, 232], [458, 228], [464, 244], [448, 250]],
        peaks: [[453, 239]]
      }
    ];

    // Dense scatter of smaller pixel-art islets, coral atolls, and volcanic rocks
    // across every quadrant of the 480x270 map canvas.
    this.scatteredIslets = [
      // Northwest & West Sea Islets
      [42, 24, 4, 3], [50, 28, 3, 2], [96, 18, 4, 3], [104, 24, 3, 3],
      [142, 42, 4, 3], [148, 48, 3, 2], [178, 36, 4, 3], [186, 44, 3, 3],
      [84, 68, 4, 3], [92, 74, 3, 2], [116, 62, 5, 3], [126, 68, 3, 3],
      [144, 88, 4, 3], [152, 94, 3, 3], [72, 98, 4, 3], [80, 104, 3, 2],
      [104, 108, 4, 3], [162, 112, 4, 3], [172, 118, 3, 2],
      // Southwest & Sulu Sea Islets
      [44, 168, 4, 3], [52, 172, 3, 2], [96, 182, 4, 3], [106, 188, 3, 3],
      [118, 174, 4, 3], [154, 178, 3, 3], [188, 172, 4, 3], [196, 178, 3, 2],
      [176, 192, 4, 3], [184, 198, 3, 3], [142, 212, 4, 3], [150, 218, 3, 2],
      [88, 216, 4, 3], [96, 222, 3, 3], [46, 246, 5, 3], [54, 252, 3, 2],
      // Central & Visayan / Sibuyan / Bohol Sea Islets
      [218, 112, 3, 2], [238, 112, 3, 2], [242, 132, 3, 2], [258, 132, 3, 2],
      [226, 162, 4, 2], [232, 168, 3, 2], [242, 178, 4, 3], [256, 174, 3, 2],
      [224, 184, 3, 2], [202, 206, 4, 3], [232, 222, 4, 3], [244, 228, 3, 2],
      [254, 242, 4, 3], [262, 248, 3, 2],
      // Northeast & Philippine Sea Islets
      [256, 22, 4, 3], [264, 28, 3, 2], [278, 42, 4, 3], [286, 48, 3, 2],
      [262, 64, 4, 3], [270, 70, 3, 3], [312, 24, 4, 3], [320, 30, 3, 2],
      [356, 54, 4, 3], [364, 60, 3, 3], [398, 52, 4, 3], [406, 58, 3, 2],
      [344, 88, 4, 3], [352, 94, 3, 3], [378, 82, 5, 3], [388, 88, 3, 2],
      [414, 86, 4, 3], [422, 92, 3, 2],
      // East & Southeast Pacific / Caroline Islets
      [304, 108, 4, 3], [312, 114, 3, 2], [336, 118, 4, 3], [344, 124, 3, 3],
      [368, 114, 4, 3], [376, 120, 3, 2], [398, 122, 4, 3], [318, 142, 4, 3],
      [326, 148, 3, 2], [352, 146, 4, 3], [360, 152, 3, 3], [374, 142, 3, 2],
      [322, 176, 4, 3], [330, 182, 3, 2], [344, 172, 4, 3], [318, 204, 4, 3],
      [326, 210, 3, 3], [374, 228, 4, 3], [382, 234, 3, 2], [432, 198, 4, 3],
      [440, 204, 3, 2], [456, 152, 4, 3], [462, 158, 3, 2]
    ];

    this.mapLoreBeacons = [
      { x: 222, y: 48, label: 'CORDILLERA' },
      { x: 224, y: 88, label: 'MAYON / TUNDO' },
      { x: 266, y: 108, label: 'IBALONG' },
      { x: 226, y: 142, label: 'MADJA-AS' },
      { x: 278, y: 196, label: 'MINDANAO' },
      { x: 162, y: 168, label: 'PALAWAN' },
      { x: 200, y: 226, label: 'SULU' }
    ];
  }

  _getSkyPalette() {
    const palettes = {
      DUSK: {
        bands: ['#180b16', '#331618', '#5c281b', '#8c4326'],
        rgbBands: [
          [24, 11, 22],
          [51, 22, 24],
          [92, 40, 27],
          [140, 67, 38]
        ],
        rgbHorizon: [140, 67, 38],
        rgbMid: [92, 40, 27],
        rgbTop: [51, 22, 24]
      },
      NIGHT: {
        bands: ['#05070d', '#0b101e', '#131d31', '#1d2c45'],
        rgbBands: [
          [5, 7, 13],
          [11, 16, 30],
          [19, 29, 49],
          [29, 44, 69]
        ],
        rgbHorizon: [29, 44, 69],
        rgbMid: [19, 29, 49],
        rgbTop: [11, 16, 30]
      },
      MIDNIGHT: {
        bands: ['#090305', '#1a060a', '#320b12', '#52141d'],
        rgbBands: [
          [9, 3, 5],
          [26, 6, 10],
          [50, 11, 18],
          [82, 20, 29]
        ],
        rgbHorizon: [142, 28, 36],
        rgbMid: [82, 20, 29],
        rgbTop: [26, 6, 10]
      },
      'PRE-DAWN': {
        bands: ['#0e0a18', '#211630', '#3d2642', '#633d52'],
        rgbBands: [
          [14, 10, 24],
          [33, 22, 48],
          [61, 38, 66],
          [99, 61, 82]
        ],
        rgbHorizon: [99, 61, 82],
        rgbMid: [61, 38, 66],
        rgbTop: [33, 22, 48]
      },
      DAY: {
        bands: ['#172630', '#263e4d', '#3b5b6b', '#587c8c'],
        rgbBands: [
          [23, 38, 48],
          [38, 62, 77],
          [59, 91, 107],
          [88, 124, 140]
        ],
        rgbHorizon: [88, 124, 140],
        rgbMid: [59, 91, 107],
        rgbTop: [38, 62, 77]
      },
      DAWN: {
        bands: ['#1a0f1e', '#3d1c28', '#733328', '#b85c32'],
        rgbBands: [
          [26, 15, 30],
          [61, 28, 40],
          [115, 51, 40],
          [184, 92, 50]
        ],
        rgbHorizon: [184, 92, 50],
        rgbMid: [115, 51, 40],
        rgbTop: [61, 28, 40]
      },
      ECLIPSE: {
        bands: ['#080205', '#1e050b', '#3d0812', '#6b111d'],
        rgbBands: [
          [8, 2, 5],
          [30, 5, 11],
          [61, 8, 18],
          [107, 17, 29]
        ],
        rgbHorizon: [168, 26, 38],
        rgbMid: [107, 17, 29],
        rgbTop: [30, 5, 11]
      }
    };
    return palettes[this.timeOfDay] || palettes.DUSK;
  }

  setEnvironment(weather, timeOfDay, environment = 'OUTDOOR') {
    if (weather) {
      this.weather = weather === 'SPIRIT_FOG' ? 'SPIRIT FOG' : weather;
    }
    if (timeOfDay) this.timeOfDay = timeOfDay;
    if (environment) this.environment = environment;
    this._syncBleedingGlow();
  }

  _cloneColorState(st) {
    return {
      band0: [...st.band0],
      band1: [...st.band1],
      band2: [...st.band2],
      band3: [...st.band3],
      rgbTop: [...st.rgbTop],
      rgbMid: [...st.rgbMid],
      rgbHor: [...st.rgbHor],
      bgDeep: [...st.bgDeep],
      bgMid: [...st.bgMid],
      borderRgb: [...st.borderRgb]
    };
  }

  _computeTargetColorState() {
    if (this.screenMode === 'MAP') {
      return {
        band0: [9, 9, 8],
        band1: [15, 14, 13],
        band2: [22, 20, 18],
        band3: [30, 28, 25],
        rgbTop: [14, 13, 12],
        rgbMid: [28, 26, 23],
        rgbHor: [52, 48, 42],
        bgDeep: [7, 7, 6],
        bgMid: [13, 12, 11],
        borderRgb: [92, 86, 76]
      };
    }

    const pal = this._getSkyPalette();
    let [rTop, gTop, bTop] = pal.rgbTop;
    let [rMid, gMid, bMid] = pal.rgbMid;
    let [rHor, gHor, bHor] = pal.rgbHorizon;
    let b0 = [...pal.rgbBands[0]];
    let b1 = [...pal.rgbBands[1]];
    let b2 = [...pal.rgbBands[2]];
    let b3 = [...pal.rgbBands[3]];

    if (this.environment === 'CABIN') {
      // Warm wooden Bahay Kubo & crackling hearth-fire palette
      b0 = [28, 14, 8];
      b1 = [54, 26, 12];
      b2 = [94, 45, 18];
      b3 = [152, 74, 26];
      rTop = 58;
      gTop = 28;
      bTop = 13;
      rMid = 118;
      gMid = 56;
      bMid = 22;
      rHor = 186;
      gHor = 96;
      bHor = 38;
    } else if (this.environment === 'TENT') {
      // Wind-lashed woven canvas & storm-lantern palette
      b0 = [18, 21, 16];
      b1 = [36, 40, 28];
      b2 = [64, 62, 42];
      b3 = [104, 92, 56];
      rTop = Math.round(rTop * 0.45 + 38 * 0.55);
      gTop = Math.round(gTop * 0.45 + 42 * 0.55);
      bTop = Math.round(bTop * 0.45 + 28 * 0.55);
      rMid = Math.round(rMid * 0.45 + 76 * 0.55);
      gMid = Math.round(gMid * 0.45 + 70 * 0.55);
      bMid = Math.round(bMid * 0.45 + 44 * 0.55);
      rHor = Math.round(rHor * 0.45 + 138 * 0.55);
      gHor = Math.round(gHor * 0.45 + 112 * 0.55);
      bHor = Math.round(bHor * 0.45 + 62 * 0.55);
    } else if (this.environment === 'CITY') {
      // Bustling Philippine Kingdom / Kedatuan lantern-lit night market palette
      b0 = [18, 13, 26];
      b1 = [40, 25, 44];
      b2 = [84, 46, 38];
      b3 = [148, 92, 42];
      rTop = 44;
      gTop = 26;
      bTop = 46;
      rMid = 106;
      gMid = 62;
      bMid = 38;
      rHor = 184;
      gHor = 122;
      bHor = 52;
    } else if (this.environment === 'COAST') {
      b0 = [12, 18, 26];
      b1 = [24, 38, 48];
      b2 = [42, 64, 76];
      b3 = [68, 102, 118];
      rMid = Math.round(rMid * 0.5 + 42 * 0.5);
      gMid = Math.round(gMid * 0.5 + 84 * 0.5);
      bMid = Math.round(bMid * 0.5 + 98 * 0.5);
    } else if (this.environment === 'MANGROVE') {
      b0 = [10, 16, 14];
      b1 = [20, 32, 26];
      b2 = [36, 56, 44];
      b3 = [58, 88, 68];
      rMid = Math.round(rMid * 0.5 + 32 * 0.5);
      gMid = Math.round(gMid * 0.5 + 72 * 0.5);
      bMid = Math.round(bMid * 0.5 + 56 * 0.5);
    } else if (this.environment === 'BALETE') {
      b0 = [14, 10, 20];
      b1 = [28, 20, 36];
      b2 = [48, 36, 58];
      b3 = [78, 56, 92];
      rMid = Math.round(rMid * 0.5 + 52 * 0.5);
      gMid = Math.round(gMid * 0.5 + 42 * 0.5);
      bMid = Math.round(bMid * 0.5 + 68 * 0.5);
    } else if (this.environment === 'TERRACES') {
      b0 = [14, 20, 22];
      b1 = [26, 38, 40];
      b2 = [46, 64, 66];
      b3 = [74, 102, 104];
      rMid = Math.round(rMid * 0.5 + 46 * 0.5);
      gMid = Math.round(gMid * 0.5 + 74 * 0.5);
      bMid = Math.round(bMid * 0.5 + 78 * 0.5);
    } else if (this.environment === 'RUINS') {
      b0 = [16, 15, 14];
      b1 = [32, 30, 26];
      b2 = [58, 54, 46];
      b3 = [94, 88, 72];
      rMid = Math.round(rMid * 0.5 + 64 * 0.5);
      gMid = Math.round(gMid * 0.5 + 60 * 0.5);
      bMid = Math.round(bMid * 0.5 + 48 * 0.5);
    } else if (this.environment === 'MAW') {
      b0 = [12, 4, 8];
      b1 = [26, 8, 14];
      b2 = [48, 14, 22];
      b3 = [82, 22, 34];
      rMid = Math.round(rMid * 0.5 + 78 * 0.5);
      gMid = Math.round(gMid * 0.5 + 24 * 0.5);
      bMid = Math.round(bMid * 0.5 + 32 * 0.5);
    } else if (this.environment === 'VILLAGE') {
      b0 = [20, 16, 12];
      b1 = [42, 32, 22];
      b2 = [76, 56, 36];
      b3 = [122, 88, 54];
      rMid = Math.round(rMid * 0.5 + 86 * 0.5);
      gMid = Math.round(gMid * 0.5 + 64 * 0.5);
      bMid = Math.round(bMid * 0.5 + 38 * 0.5);
    } else if (this.weather === 'SPIRIT FOG') {
      rTop = Math.round(rTop * 0.72 + 24 * 0.28);
      gTop = Math.round(gTop * 0.72 + 54 * 0.28);
      bTop = Math.round(bTop * 0.72 + 44 * 0.28);
      rMid = Math.round(rMid * 0.65 + 38 * 0.35);
      gMid = Math.round(gMid * 0.65 + 88 * 0.35);
      bMid = Math.round(bMid * 0.65 + 68 * 0.35);
      rHor = Math.round(rHor * 0.6 + 72 * 0.4);
      gHor = Math.round(gHor * 0.6 + 150 * 0.4);
      bHor = Math.round(bHor * 0.6 + 116 * 0.4);
    } else if (this.weather === 'MONSOON') {
      rTop = Math.round(rTop * 0.75 + 16 * 0.25);
      gTop = Math.round(gTop * 0.75 + 26 * 0.25);
      bTop = Math.round(bTop * 0.75 + 38 * 0.25);
      rMid = Math.round(rMid * 0.7 + 34 * 0.3);
      gMid = Math.round(gMid * 0.7 + 52 * 0.3);
      bMid = Math.round(bMid * 0.7 + 72 * 0.3);
    }

    const bgDeep = [
      Math.max(8, Math.round(rTop * 0.58)),
      Math.max(6, Math.round(gTop * 0.58)),
      Math.max(9, Math.round(bTop * 0.58))
    ];
    const bgMid = [
      Math.max(12, Math.round(rMid * 0.52)),
      Math.max(9, Math.round(gMid * 0.52)),
      Math.max(13, Math.round(bMid * 0.52))
    ];
    const borderRgb = [
      Math.min(255, rHor + 18),
      Math.min(255, gHor + 18),
      Math.min(255, bHor + 16)
    ];

    return {
      band0: b0,
      band1: b1,
      band2: b2,
      band3: b3,
      rgbTop: [rTop, gTop, bTop],
      rgbMid: [rMid, gMid, bMid],
      rgbHor: [rHor, gHor, bHor],
      bgDeep,
      bgMid,
      borderRgb
    };
  }

  _computeTargetWeatherState() {
    if (this.weather === 'MONSOON') {
      return {
        rainIntensity: 1.0,
        fogIntensity: 0.08,
        clearIntensity: 0.0,
        stormIntensity: 1.0
      };
    }
    if (this.weather === 'DRIZZLE') {
      return {
        rainIntensity: 0.44,
        fogIntensity: 0.14,
        clearIntensity: 0.0,
        stormIntensity: 0.0
      };
    }
    if (this.weather === 'SPIRIT FOG') {
      return {
        rainIntensity: 0.0,
        fogIntensity: 1.0,
        clearIntensity: 0.16,
        stormIntensity: 0.0
      };
    }
    return {
      rainIntensity: 0.0,
      fogIntensity: 0.0,
      clearIntensity: 1.0,
      stormIntensity: 0.0
    };
  }

  _stepWeatherTransition() {
    if (!this.currentWeatherState || !this.targetWeatherState) return;
    const rate = 0.009;
    const keys = ['rainIntensity', 'fogIntensity', 'clearIntensity', 'stormIntensity'];
    for (const k of keys) {
      const cur = this.currentWeatherState[k];
      const tgt = this.targetWeatherState[k];
      const diff = tgt - cur;
      if (Math.abs(diff) > 0.002) {
        this.currentWeatherState[k] += diff * rate;
      } else {
        this.currentWeatherState[k] = tgt;
      }
    }
  }

  _syncBleedingGlow() {
    this.targetColorState = this._computeTargetColorState();
    this.targetWeatherState = this._computeTargetWeatherState();
    if (!this.currentColorState) {
      this.currentColorState = this._cloneColorState(this.targetColorState);
      this._applyCssVariablesFromState(this.currentColorState);
    }
    if (!this.currentWeatherState) {
      this.currentWeatherState = { ...this.targetWeatherState };
    }
  }

  _rgbStr(arr) {
    return `rgb(${Math.round(arr[0])}, ${Math.round(arr[1])}, ${Math.round(arr[2])})`;
  }

  _applyCssVariablesFromState(st) {
    const root = document.documentElement;
    if (!root || !root.style || !st) return;
    const rTop = Math.round(st.rgbTop[0]);
    const gTop = Math.round(st.rgbTop[1]);
    const bTop = Math.round(st.rgbTop[2]);
    const rMid = Math.round(st.rgbMid[0]);
    const gMid = Math.round(st.rgbMid[1]);
    const bMid = Math.round(st.rgbMid[2]);
    const rBrd = Math.round(st.borderRgb[0]);
    const gBrd = Math.round(st.borderRgb[1]);
    const bBrd = Math.round(st.borderRgb[2]);

    root.style.setProperty('--ambient-sky-top', this._rgbStr(st.band0));
    root.style.setProperty('--ambient-sky-mid', this._rgbStr(st.band1));
    root.style.setProperty('--ambient-sky-horizon', this._rgbStr(st.band3));
    root.style.setProperty('--ambient-bg-deep', this._rgbStr(st.bgDeep));
    root.style.setProperty('--ambient-bg-mid', this._rgbStr(st.bgMid));
    root.style.setProperty('--ambient-glow-primary', `rgba(${rMid}, ${gMid}, ${bMid}, 0.42)`);
    root.style.setProperty('--ambient-glow-secondary', `rgba(${rTop}, ${gTop}, ${bTop}, 0.52)`);
    root.style.setProperty('--ambient-glow-border', `rgba(${rBrd}, ${gBrd}, ${bBrd}, 0.52)`);
  }

  _stepColorTransition() {
    if (!this.currentColorState || !this.targetColorState) return;
    const rate = 0.024;
    let changed = false;
    const keys = [
      'band0',
      'band1',
      'band2',
      'band3',
      'rgbTop',
      'rgbMid',
      'rgbHor',
      'bgDeep',
      'bgMid',
      'borderRgb'
    ];
    for (const k of keys) {
      const cur = this.currentColorState[k];
      const tgt = this.targetColorState[k];
      for (let i = 0; i < 3; i += 1) {
        const diff = tgt[i] - cur[i];
        if (Math.abs(diff) > 0.15) {
          cur[i] += diff * rate;
          changed = true;
        } else if (cur[i] !== tgt[i]) {
          cur[i] = tgt[i];
          changed = true;
        }
      }
    }
    if (changed && this.tick % 2 === 0) {
      this._applyCssVariablesFromState(this.currentColorState);
    }
  }

  _animate() {
    this.tick += 1;
    this._stepColorTransition();
    this._stepWeatherTransition();
    this._drawSky();
    this._drawAmbientBleed();
    requestAnimationFrame(this._animate);
  }

  _drawAncientArchipelagoMap(ctx, w, h) {
    // 1. Deep, Desaturated Ash-Parchment / Dark Slate-Umber Carta Base (darker and less warm)
    const paperGrad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      18,
      w * 0.5,
      h * 0.5,
      w * 0.68
    );
    paperGrad.addColorStop(0, '#191714');
    paperGrad.addColorStop(0.45, '#13120f');
    paperGrad.addColorStop(0.78, '#0c0b0a');
    paperGrad.addColorStop(1, '#060605');
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Weathered Paper Fiber Grain & Fold Creases
    ctx.fillStyle = 'rgba(6, 6, 5, 0.34)';
    for (let y = 0; y < h; y += 6) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.fillStyle = 'rgba(54, 50, 44, 0.11)';
    for (let x = 0; x < w; x += 16) {
      ctx.fillRect(x, 0, 1, h);
    }
    // Fold lines
    ctx.fillStyle = 'rgba(4, 4, 3, 0.48)';
    ctx.fillRect(Math.floor(w * 0.5), 8, 1, h - 16);
    ctx.fillRect(10, Math.floor(h * 0.5), w - 20, 1);

    // 3. Cartographic Latitude / Longitude Grid & Rhumb Lines (desaturated, cool-ash tint)
    ctx.strokeStyle = 'rgba(92, 86, 76, 0.13)';
    ctx.lineWidth = 1;
    for (let gx = 60; gx < w; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 10);
      ctx.lineTo(gx, h - 10);
      ctx.stroke();
    }
    for (let gy = 45; gy < h; gy += 45) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(w - 10, gy);
      ctx.stroke();
    }

    // Radiating Rhumb Lines from West Philippine Sea Compass Rose (x: 108, y: 112)
    const compassX = 108;
    const compassY = 112;
    ctx.strokeStyle = 'rgba(104, 96, 84, 0.14)';
    for (let a = 0; a < 16; a += 1) {
      const angle = (a * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + Math.cos(angle) * 440, compassY + Math.sin(angle) * 440);
      ctx.stroke();
    }

    // 4. Compass Rose Ornament (muted antique pewter-brass)
    ctx.strokeStyle = 'rgba(128, 118, 102, 0.38)';
    ctx.beginPath();
    ctx.arc(compassX, compassY, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(compassX, compassY, 12, 0, Math.PI * 2);
    ctx.stroke();

    const needleSpin = Math.sin(this.tick * 0.012) * 0.08;
    ctx.strokeStyle = 'rgba(154, 142, 122, 0.52)';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 22);
    ctx.lineTo(compassX, compassY + 22);
    ctx.moveTo(compassX - 22, compassY);
    ctx.lineTo(compassX + 22, compassY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 108, 78, 0.58)';
    ctx.fillRect(
      Math.floor(compassX + Math.sin(needleSpin) * 3) - 1,
      compassY - 16,
      3,
      7
    );

    // 5. Animated Coastal Wave Rings & Archipelago Islands Across the Entire Screen
    const wavePulse = (Math.sin(this.tick * 0.035) + 1) * 0.5;
    for (const isl of this.archipelagoIslands) {
      if (!isl.pts || isl.pts.length < 3) continue;

      // Outer shallow-water cartographic contour ring
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(isl.pts[0][0], isl.pts[0][1]);
      for (let i = 1; i < isl.pts.length; i += 1) {
        ctx.lineTo(isl.pts[i][0], isl.pts[i][1]);
      }
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      ctx.strokeStyle = `rgba(92, 86, 74, ${0.11 + wavePulse * 0.06})`;
      ctx.stroke();

      // Dark, cool-toned weathered stone-umber island landmass fill
      ctx.fillStyle = '#25221d';
      ctx.fill();

      // Inner highland tint
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#36312a';
      ctx.stroke();

      // Dark charcoal inked coastline
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#0c0a08';
      ctx.stroke();
      ctx.restore();

      // Cartographic mountain ridge chevrons (^)
      if (isl.peaks && isl.peaks.length > 0) {
        ctx.strokeStyle = '#14110e';
        ctx.lineWidth = 1;
        for (const [px, py] of isl.peaks) {
          ctx.beginPath();
          ctx.moveTo(px - 3, py + 2);
          ctx.lineTo(px, py - 2);
          ctx.lineTo(px + 3, py + 2);
          ctx.stroke();
        }
      }
    }

    // 5b. Scattered Islets, Coral Atolls & Volcanic Rocks Across All Quadrants
    if (this.scatteredIslets) {
      for (const [ix, iy, iw, ih] of this.scatteredIslets) {
        // Shallow reef halo
        ctx.fillStyle = `rgba(88, 82, 72, ${0.12 + wavePulse * 0.05})`;
        ctx.fillRect(ix - 1, iy - 1, iw + 2, ih + 2);
        // Islet fill
        ctx.fillStyle = '#28241e';
        ctx.fillRect(ix, iy, iw, ih);
        // Dark ink rim on top/left
        ctx.fillStyle = '#0d0b09';
        ctx.fillRect(ix, iy, iw, 1);
      }
    }

    // 6. Dotted Ancient Sea-Trade / Spirit Routes & Subtle Lore Beacons
    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(128, 116, 98, 0.26)';
    ctx.beginPath();
    ctx.moveTo(222, 48);
    ctx.lineTo(224, 88);
    ctx.lineTo(266, 108);
    ctx.lineTo(226, 142);
    ctx.lineTo(278, 196);
    ctx.moveTo(226, 142);
    ctx.lineTo(162, 168);
    ctx.lineTo(200, 226);
    ctx.lineTo(278, 196);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < this.mapLoreBeacons.length; i += 1) {
      const b = this.mapLoreBeacons[i];
      const glow = 0.35 + 0.25 * Math.sin(this.tick * 0.05 + i * 1.4);
      ctx.fillStyle = `rgba(142, 118, 88, ${glow * 0.36})`;
      ctx.fillRect(b.x - 3, b.y - 3, 7, 7);
      ctx.fillStyle = `rgba(188, 172, 142, ${glow})`;
      ctx.fillRect(b.x - 1, b.y - 1, 3, 3);
    }

    // 7. Coiled Bakunawa Sea-Serpent Cartographic Illustration in the Eastern Philippine Sea
    const serpX = 338;
    const serpY = 98 + Math.floor(Math.sin(this.tick * 0.025) * 2);
    ctx.strokeStyle = 'rgba(112, 102, 88, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(serpX, serpY, 9, Math.PI, 0);
    ctx.arc(serpX + 16, serpY, 8, Math.PI, 0);
    ctx.arc(serpX + 30, serpY, 6, Math.PI, 0);
    ctx.stroke();

    // 8. Drifting Dark Storm-Cloud Shadows Across the Map
    const cloudShift = (this.tick * 0.25) % (w + 180);
    const cloudGrad = ctx.createRadialGradient(
      w - cloudShift + 60,
      h * 0.42,
      10,
      w - cloudShift + 60,
      h * 0.42,
      125
    );
    cloudGrad.addColorStop(0, 'rgba(4, 4, 3, 0.52)');
    cloudGrad.addColorStop(1, 'rgba(4, 4, 3, 0)');
    ctx.fillStyle = cloudGrad;
    ctx.fillRect(0, 0, w, h);

    // 9. Raindrop Impact Ripples on the Ancient Map
    ctx.lineWidth = 1;
    for (const rip of this.mapRipples) {
      rip.r += 0.14;
      if (rip.r > rip.maxR) {
        rip.r = 0.5;
        rip.x = 20 + Math.random() * (w - 40);
        rip.y = 16 + Math.random() * (h - 32);
      }
      const alpha = Math.max(0, (1 - rip.r / rip.maxR) * 0.28);
      ctx.strokeStyle = `rgba(164, 158, 146, ${alpha})`;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 10. Continuous Falling Rain Streaks Across the Parchment Map
    ctx.fillStyle = 'rgba(168, 166, 158, 0.28)';
    for (const p of this.bgParticles) {
      p.x -= 1.15;
      p.y += 2.65;
      if (p.y > h) {
        p.y = -6;
        p.x = Math.random() * w;
      }
      if (p.x < 0) p.x = w;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 6);
    }

    // 11. Antique Double-Line Map Border & Stronger Dark Vignette
    ctx.strokeStyle = 'rgba(104, 96, 82, 0.34)';
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = 'rgba(72, 66, 56, 0.26)';
    ctx.strokeRect(12, 12, w - 24, h - 24);

    const vignette = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      w * 0.2,
      w * 0.5,
      h * 0.5,
      w * 0.65
    );
    vignette.addColorStop(0, 'rgba(6, 6, 5, 0.24)');
    vignette.addColorStop(0.6, 'rgba(5, 5, 4, 0.56)');
    vignette.addColorStop(1, 'rgba(3, 3, 2, 0.86)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  _drawAmbientBleed() {
    if (!this.bleedCanvas) return;
    const ctx = this.bleedCanvas.getContext('2d');
    const w = this.bleedCanvas.width;
    const h = this.bleedCanvas.height;

    if (this.screenMode === 'MAP') {
      this._drawAncientArchipelagoMap(ctx, w, h);
      return;
    }

    const st = this.currentColorState || this._computeTargetColorState();
    const b0 = this._rgbStr(st.band0);
    const b1 = this._rgbStr(st.band1);
    const rTop = Math.round(st.rgbTop[0]);
    const gTop = Math.round(st.rgbTop[1]);
    const bTop = Math.round(st.rgbTop[2]);
    const rMid = Math.round(st.rgbMid[0]);
    const gMid = Math.round(st.rgbMid[1]);
    const bMid = Math.round(st.rgbMid[2]);

    ctx.clearRect(0, 0, w, h);

    // 1. Utilize the smoothly interpolated darker color bands from the ambience visualizer
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, b0);
    grad.addColorStop(0.38, b1);
    grad.addColorStop(
      0.72,
      `rgb(${Math.max(10, Math.round(rMid * 0.55))}, ${Math.max(8, Math.round(gMid * 0.55))}, ${Math.max(11, Math.round(bMid * 0.55))})`
    );
    grad.addColorStop(1, b0);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Darkening wash so the environment stays moody while preserving visualizer hue
    ctx.fillStyle = 'rgba(6, 4, 5, 0.38)';
    ctx.fillRect(0, 0, w, h);

    // 3. Subtle radial bloom centered behind the centered main narrative panel
    const rad = ctx.createRadialGradient(w * 0.5, h * 0.22, 8, w * 0.5, h * 0.38, w * 0.58);
    rad.addColorStop(0, `rgba(${rMid}, ${gMid}, ${bMid}, 0.34)`);
    rad.addColorStop(0.55, `rgba(${rTop}, ${gTop}, ${bTop}, 0.22)`);
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    const ws = this.currentWeatherState || this._computeTargetWeatherState();

    // Synchronized lightning pulse across the whole UI background in MONSOON (scaled by stormIntensity)
    if (this.environment !== 'CABIN' && ws.stormIntensity > 0.35 && this.tick % 190 < 3) {
      ctx.fillStyle = `rgba(220, 232, 245, ${(0.26 * ws.stormIntensity).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Environment-Specific Full-Viewport Ambient Background Portrayal
    if (this.environment === 'CABIN') {
      // Warm woven sawali bamboo texture in dark margins + flickering hearth-fire bloom from bottom
      ctx.fillStyle = 'rgba(42, 20, 9, 0.22)';
      for (let y = 0; y < h; y += 8) {
        ctx.fillRect(0, y, w, 2);
      }
      ctx.fillStyle = 'rgba(68, 32, 14, 0.16)';
      for (let x = 0; x < w; x += 12) {
        ctx.fillRect(x, 0, 2, h);
      }

      const flicker = 0.28 + Math.sin(this.tick * 0.11) * 0.05 + Math.cos(this.tick * 0.19) * 0.04;
      const hearthGlow = ctx.createRadialGradient(w * 0.5, h * 0.92, 6, w * 0.5, h * 0.85, w * 0.52);
      hearthGlow.addColorStop(0, `rgba(235, 118, 42, ${flicker})`);
      hearthGlow.addColorStop(0.5, `rgba(168, 64, 22, ${flicker * 0.55})`);
      hearthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hearthGlow;
      ctx.fillRect(0, 0, w, h);

      // Rising warm hearth embers across the background
      for (let i = 0; i < 42; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.sin(this.tick * 0.03 + p.phase) * 0.45;
        p.y -= 0.45 + (i % 3) * 0.18;
        if (p.y < 0) {
          p.y = h;
          p.x = w * 0.2 + Math.random() * (w * 0.6);
        }
        ctx.fillStyle = i % 2 === 0 ? 'rgba(242, 148, 58, 0.48)' : 'rgba(223, 192, 98, 0.38)';
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
      return;
    }

    if (this.environment === 'TENT') {
      // Billowing tent canvas upper-corner shadows + fast wind-whipped streaks across the viewport
      const flapSway = Math.sin(this.tick * 0.07) * 8;
      ctx.fillStyle = 'rgba(12, 11, 8, 0.46)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.34 + flapSway, 0);
      ctx.lineTo(0, h * 0.48);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w * 0.66 + flapSway, 0);
      ctx.lineTo(w, h * 0.48);
      ctx.closePath();
      ctx.fill();

      // Fast horizontal wind streaks & blown rain/debris scaled by rainIntensity
      const streakR = Math.round(210 * (1 - ws.rainIntensity) + 195 * ws.rainIntensity);
      const streakG = Math.round(198 * (1 - ws.rainIntensity) + 220 * ws.rainIntensity);
      const streakB = Math.round(165 * (1 - ws.rainIntensity) + 238 * ws.rainIntensity);
      ctx.fillStyle = `rgba(${streakR}, ${streakG}, ${streakB}, ${(0.22 + ws.rainIntensity * 0.12).toFixed(3)})`;
      for (let i = 0; i < 55; i += 1) {
        const p = this.bgParticles[i];
        p.x -= 2.8 + ws.rainIntensity * 1.4 + (i % 3) * 0.8;
        p.y += Math.sin(this.tick * 0.05 + p.phase) * 0.4 + 0.35 + ws.rainIntensity * 0.9;
        if (p.x < -12) {
          p.x = w + 8;
          p.y = Math.random() * h;
        }
        if (p.y > h) p.y = 0;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 7 + (i % 5), 1);
      }
      return;
    }

    if (this.environment === 'CITY') {
      // Golden lantern bloom from the bustling settlement below + distant glowing windows & rising lantern sparks
      const cityBloom = ctx.createLinearGradient(0, h * 0.45, 0, h);
      cityBloom.addColorStop(0, 'rgba(0, 0, 0, 0)');
      cityBloom.addColorStop(0.65, 'rgba(168, 96, 36, 0.18)');
      cityBloom.addColorStop(1, 'rgba(218, 138, 52, 0.32)');
      ctx.fillStyle = cityBloom;
      ctx.fillRect(0, 0, w, h);

      // Soft bokeh-like distant market lanterns along the lower background
      for (let i = 0; i < 24; i += 1) {
        const lx = (i * 47 + 18) % w;
        const ly = h - 18 - ((i * 23) % 48);
        const pulse = 0.25 + 0.15 * Math.sin(this.tick * 0.04 + i);
        ctx.fillStyle = `rgba(238, 182, 84, ${pulse})`;
        ctx.fillRect(lx, ly, 3, 3);
      }

      // Drifting market smoke & lantern sparks
      for (let i = 0; i < 32; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.cos(this.tick * 0.02 + p.phase) * 0.35;
        p.y -= 0.28;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(238, 185, 92, 0.38)' : 'rgba(217, 114, 54, 0.32)';
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }

    // 5. Smoothly Interpolated Full-Screen Weather Layers (Gradual Rain Build-Up / Calm-Down, Fog, and Clear Embers)
    if (ws.rainIntensity > 0.015) {
      const floatCount = ws.rainIntensity * this.bgParticles.length;
      const maxIdx = Math.min(this.bgParticles.length, Math.ceil(floatCount));
      const vx = -(0.45 + ws.rainIntensity * 1.35);
      const vy = 1.15 + ws.rainIntensity * 2.25;
      const streakLen = Math.max(2, Math.round(3 + ws.rainIntensity * 4));
      const baseAlpha = 0.14 + ws.rainIntensity * 0.2;

      for (let i = 0; i < maxIdx; i += 1) {
        const p = this.bgParticles[i];
        p.x += vx;
        p.y += vy;
        if (p.y > h) {
          p.y = -6;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        const dropWeight = Math.min(1, Math.max(0, floatCount - i));
        const alpha = (baseAlpha * dropWeight).toFixed(3);
        ctx.fillStyle = `rgba(190, 215, 235, ${alpha})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, streakLen);
      }
    }

    if (ws.fogIntensity > 0.02) {
      const fogAlpha = (0.08 * ws.fogIntensity).toFixed(3);
      ctx.fillStyle = `rgba(140, 224, 184, ${fogAlpha})`;
      const wave1 = Math.floor(Math.sin(this.tick * 0.018) * 30);
      const wave2 = Math.floor(Math.cos(this.tick * 0.014) * 35);
      ctx.fillRect(wave1, Math.floor(h * 0.28), w, 26);
      ctx.fillRect(wave2, Math.floor(h * 0.62), w, 32);

      const moteFloat = ws.fogIntensity * 40;
      const moteMax = Math.ceil(moteFloat);
      for (let i = 0; i < moteMax; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.sin(this.tick * 0.018 + p.phase) * 0.35;
        p.y -= 0.22;
        if (p.y < 0) p.y = h;
        const wgt = Math.min(1, Math.max(0, moteFloat - i)) * ws.fogIntensity;
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(140, 224, 184, ${(0.45 * wgt).toFixed(3)})`
            : `rgba(223, 177, 91, ${(0.38 * wgt).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }

    if (this.environment !== 'CITY' && ws.clearIntensity > 0.02) {
      const emberFloat = ws.clearIntensity * 36;
      const emberMax = Math.ceil(emberFloat);
      for (let i = 0; i < emberMax; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.cos(this.tick * 0.016 + p.phase) * 0.3;
        p.y += Math.sin(this.tick * 0.022 + p.phase) * 0.22;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        const wgt = Math.min(1, Math.max(0, emberFloat - i)) * ws.clearIntensity;
        ctx.fillStyle =
          i % 3 === 0
            ? `rgba(217, 114, 54, ${(0.42 * wgt).toFixed(3)})`
            : `rgba(223, 177, 91, ${(0.36 * wgt).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }
  }

  _drawCabinScene(ctx, w, h) {
    // 1. Warm Woven Sawali (Bamboo Weave) Interior Wall Background
    ctx.fillStyle = '#241209';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 16) {
        const shift = (y / 8) % 2 === 0 ? 0 : 8;
        ctx.fillStyle = '#331a0d';
        ctx.fillRect(x + shift, y, 8, 4);
        ctx.fillStyle = '#2b150a';
        ctx.fillRect(x + shift, y + 4, 8, 4);
      }
    }

    // 2. Warm Radial Hearth Firelight Glow on the Wooden Walls
    const firePulse = 0.42 + Math.sin(this.tick * 0.14) * 0.07 + Math.cos(this.tick * 0.23) * 0.05;
    const hearthX = Math.floor(w * 0.5);
    const hearthY = h - 14;
    const rad = ctx.createRadialGradient(hearthX, hearthY, 8, hearthX, hearthY - 20, 240);
    rad.addColorStop(0, `rgba(245, 148, 56, ${firePulse})`);
    rad.addColorStop(0.5, `rgba(186, 74, 24, ${firePulse * 0.6})`);
    rad.addColorStop(1, 'rgba(18, 8, 4, 0.45)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // 3. Capiz & Bamboo-Slat Window on the Right Looking Out at Outdoor Sky/Weather
    const winX = w - 168;
    const winY = 20;
    const winW = 112;
    const winH = 58;
    const skyPal = this._getSkyPalette();
    ctx.fillStyle = skyPal.bands[1];
    ctx.fillRect(winX, winY, winW, Math.floor(winH * 0.55));
    ctx.fillStyle = skyPal.bands[3];
    ctx.fillRect(winX, winY + Math.floor(winH * 0.55), winW, Math.ceil(winH * 0.45));

    // Outdoor weather visible through the cabin window (gradually builds up or calms down)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    if (ws.rainIntensity < 0.85) {
      // Moon/stars outside window fade smoothly as rain intensifies
      ctx.fillStyle = `rgba(223, 211, 190, ${(1 - ws.rainIntensity * 0.85).toFixed(3)})`;
      ctx.fillRect(winX + winW - 26, winY + 10, 10, 10);
    }
    if (ws.rainIntensity > 0.02) {
      const floatDrops = ws.rainIntensity * 18;
      const maxDrops = Math.ceil(floatDrops);
      const dropLen = Math.round(3 + ws.rainIntensity * 4);
      const speedY = 1.6 + ws.rainIntensity * 2.4;
      for (let i = 0; i < maxDrops; i += 1) {
        const wgt = Math.min(1, Math.max(0, floatDrops - i));
        ctx.fillStyle = `rgba(195, 220, 238, ${(0.68 * ws.rainIntensity * wgt).toFixed(3)})`;
        const rx = winX + (((i * 19 - this.tick * (1 + ws.rainIntensity * 1.5)) % winW) + winW) % winW;
        const ry = winY + ((i * 13 + this.tick * speedY) % winH);
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 1, dropLen);
      }
    }

    // Window lattice frame & propped nipa shutter
    ctx.strokeStyle = '#4a2612';
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(235, 198, 138, 0.28)';
    for (let gx = winX + 28; gx < winX + winW; gx += 28) {
      ctx.beginPath();
      ctx.moveTo(gx, winY);
      ctx.lineTo(gx, winY + winH);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(winX, winY + Math.floor(winH * 0.5));
    ctx.lineTo(winX + winW, winY + Math.floor(winH * 0.5));
    ctx.stroke();

    // 4. Heavy Narra & Bamboo Rafters, Pillars, and Floorboards
    ctx.fillStyle = '#1a0c06';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillRect(0, h - 14, w, 14);
    ctx.fillRect(36, 0, 16, h);
    ctx.fillRect(w - 36, 0, 16, h);
    // Bamboo tie-lashed beam joints
    ctx.fillStyle = '#6e3c1b';
    for (let bx = 64; bx < w - 40; bx += 96) {
      ctx.fillRect(bx, 0, 8, 18);
    }

    // Hanging braided garlic & dried bayabas herb bundles from rafters
    ctx.fillStyle = '#cbb78c';
    ctx.fillRect(148, 14, 4, 16);
    ctx.fillRect(146, 26, 8, 8);
    ctx.fillStyle = '#4e6b3a';
    ctx.fillRect(184, 14, 6, 18);

    // 5. Clay Dapugan Hearth & Crackling Fire in Center-Left Foreground
    ctx.fillStyle = '#3b2316';
    ctx.fillRect(hearthX - 54, h - 20, 108, 10);
    ctx.fillStyle = '#1f1009';
    ctx.fillRect(hearthX - 42, h - 24, 84, 6);
    // Glowing red-orange coals
    ctx.fillStyle = '#c9382c';
    ctx.fillRect(hearthX - 34, h - 24, 68, 5);

    // Animated flickering pixel-art flame tongues
    for (let f = -30; f <= 30; f += 6) {
      const centerWeight = 1 - Math.abs(f) / 36;
      const flameH = Math.floor(
        (14 + Math.sin(this.tick * 0.22 + f) * 7 + Math.cos(this.tick * 0.31 - f * 0.5) * 5) *
          centerWeight
      );
      ctx.fillStyle = '#e05326';
      ctx.fillRect(hearthX + f - 3, h - 22 - flameH, 6, flameH);
      ctx.fillStyle = '#f29f38';
      ctx.fillRect(hearthX + f - 2, h - 22 - Math.floor(flameH * 0.72), 4, Math.floor(flameH * 0.72));
      ctx.fillStyle = '#fae17c';
      ctx.fillRect(hearthX + f - 1, h - 22 - Math.floor(flameH * 0.38), 2, Math.floor(flameH * 0.38));
    }

    // Rising crackling fire sparks & embers inside the kubo
    for (let i = 0; i < 26; i += 1) {
      const p = this.particles[i];
      p.x += Math.sin(this.tick * 0.08 + p.phase) * 0.8;
      p.y -= 0.9 + (i % 3) * 0.35;
      if (p.y < 14 || Math.abs(p.x - hearthX) > 140) {
        p.x = hearthX - 28 + Math.random() * 56;
        p.y = h - 24;
      }
      ctx.fillStyle = i % 2 === 0 ? '#f7b94a' : '#e85d2a';
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
    }
  }

  _drawTentScene(ctx, w, h, st) {
    // 1. Outdoor Wind-Swept Sky Visible Through the Parted Tent Opening
    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.3));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.3), w, Math.floor(h * 0.28));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.58), w, Math.floor(h * 0.22));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.8), w, h);

    // Distant wind-lashed ridge & bending cogon grass outside tent opening
    ctx.fillStyle = '#120e09';
    for (let x = 140; x < w - 140; x += 18) {
      const hillH = 12 + ((x * 9) % 16);
      ctx.fillRect(x, h - 12 - hillH, 20, hillH + 12);
    }

    // 2. Fast Wind-Whipped Streaks & Rain Blowing Across the Tent Opening (gradually scales with rainIntensity)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    const rCol = Math.round(222 * (1 - ws.rainIntensity) + 200 * ws.rainIntensity);
    const gCol = Math.round(206 * (1 - ws.rainIntensity) + 220 * ws.rainIntensity);
    const bCol = Math.round(172 * (1 - ws.rainIntensity) + 235 * ws.rainIntensity);
    const alphaCol = (0.42 + ws.rainIntensity * 0.32).toFixed(3);
    ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alphaCol})`;
    for (const p of this.particles) {
      p.x -= 3.6 + ws.rainIntensity * 1.8;
      p.y += 0.8 + ws.rainIntensity * 1.4 + Math.sin(this.tick * 0.06 + p.phase) * 0.4;
      if (p.x < 0) {
        p.x = w;
        p.y = Math.random() * h;
      }
      if (p.y > h) p.y = 0;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.round(7 + ws.rainIntensity * 4), 1);
    }

    // 3. Pitched Abaca-Canvas Tent Flaps Billowing in the Wind (Left & Right)
    const windBillowL = Math.sin(this.tick * 0.095) * 9 + Math.cos(this.tick * 0.17) * 4;
    const windBillowR = Math.sin(this.tick * 0.095 + 0.8) * 9 + Math.sin(this.tick * 0.15) * 4;

    // Left Tent Canvas Wall & Flap
    ctx.fillStyle = '#292216';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.floor(w * 0.46), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.34 + windBillowL),
      Math.floor(h * 0.52),
      Math.floor(w * 0.22 + windBillowL * 1.2),
      h
    );
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Right Tent Canvas Wall & Flap
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(Math.floor(w * 0.54), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.66 + windBillowR),
      Math.floor(h * 0.52),
      Math.floor(w * 0.78 + windBillowR * 1.2),
      h
    );
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Woven canvas seam lines & guy-ropes
    ctx.strokeStyle = '#4a3d28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.floor(w * 0.46), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.34 + windBillowL),
      Math.floor(h * 0.52),
      Math.floor(w * 0.22 + windBillowL * 1.2),
      h
    );
    ctx.moveTo(Math.floor(w * 0.54), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.66 + windBillowR),
      Math.floor(h * 0.52),
      Math.floor(w * 0.78 + windBillowR * 1.2),
      h
    );
    ctx.stroke();

    // 4. Bamboo Ridgepole & Swaying Brass Storm-Lantern Inside Tent Peak
    const lanternSway = Math.sin(this.tick * 0.08) * 7;
    const lanX = Math.floor(w * 0.5 + lanternSway);
    const lanY = 26;
    ctx.strokeStyle = '#6e5636';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.floor(w * 0.5), 0);
    ctx.lineTo(lanX, lanY);
    ctx.stroke();

    const lanGlow = ctx.createRadialGradient(lanX, lanY + 6, 2, lanX, lanY + 6, 48);
    lanGlow.addColorStop(0, 'rgba(245, 196, 98, 0.55)');
    lanGlow.addColorStop(1, 'rgba(245, 196, 98, 0)');
    ctx.fillStyle = lanGlow;
    ctx.fillRect(lanX - 48, 0, 96, 84);

    ctx.fillStyle = '#dfb15b';
    ctx.fillRect(lanX - 4, lanY, 8, 10);
    ctx.fillStyle = '#fff1b5';
    ctx.fillRect(lanX - 2, lanY + 2, 4, 6);

    // Tent groundsheet & staked pegs at bottom
    ctx.fillStyle = '#14100a';
    ctx.fillRect(0, h - 10, w, 10);
  }

  _drawCityScene(ctx, w, h, st) {
    // 1. Kingdom / Port Sky Gradient
    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.28));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.28), w, Math.floor(h * 0.26));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.54), w, Math.floor(h * 0.24));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.78), w, h);

    // 2. Pre-Colonial Philippine Kingdom Skyline (Stepped Torogan & Kota Roofs + Balangay Masts)
    const buildings = [
      { x: 18, w: 68, h: 46, roofH: 18 },
      { x: 96, w: 88, h: 58, roofH: 22 },
      { x: 196, w: 116, h: 68, roofH: 26 }, // Grand Royal Torogan
      { x: 324, w: 82, h: 52, roofH: 18 },
      { x: 416, w: 74, h: 48, roofH: 16 }
    ];

    for (const b of buildings) {
      const baseY = h - 16;
      const topY = baseY - b.h;
      // Building timber body
      ctx.fillStyle = '#170d09';
      ctx.fillRect(b.x, topY + b.roofH, b.w, b.h - b.roofH);

      // Sweeping Torogan pitched roof with upturned panolong wing-tips
      ctx.fillStyle = '#24130c';
      ctx.beginPath();
      ctx.moveTo(b.x - 10, topY + b.roofH + 2);
      ctx.lineTo(b.x + Math.floor(b.w * 0.5), topY);
      ctx.lineTo(b.x + b.w + 10, topY + b.roofH + 2);
      ctx.closePath();
      ctx.fill();

      // Warm glowing palace & market-house windows
      for (let wx = b.x + 10; wx < b.x + b.w - 12; wx += 16) {
        for (let wy = topY + b.roofH + 8; wy < baseY - 14; wy += 14) {
          const flicker = 0.65 + 0.25 * Math.sin(this.tick * 0.05 + wx * 0.2 + wy);
          ctx.fillStyle = `rgba(242, 184, 82, ${flicker})`;
          ctx.fillRect(wx, wy, 6, 7);
        }
      }
    }

    // Tall Balangay Ship Masts & Rigging at the Right Harbor Wharf
    for (let mx = 516; mx <= 596; mx += 38) {
      const sway = Math.sin(this.tick * 0.03 + mx) * 2;
      ctx.fillStyle = '#1c100a';
      ctx.fillRect(Math.floor(mx + sway), 24, 3, h - 38);
      ctx.fillRect(Math.floor(mx - 16 + sway), 42, 34, 2);
      ctx.fillStyle = 'rgba(72, 44, 28, 0.78)';
      ctx.fillRect(Math.floor(mx - 14 + sway), 44, 30, 18);
    }

    // 3. Overhead Festive Market Lantern Strings Swaying Across the Plaza
    ctx.strokeStyle = 'rgba(42, 24, 14, 0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.quadraticCurveTo(Math.floor(w * 0.5), 32, w, 16);
    ctx.stroke();

    for (let lx = 44; lx < w - 30; lx += 52) {
      const tNorm = lx / w;
      const ly = Math.floor(14 + Math.sin(tNorm * Math.PI) * 14 + Math.sin(this.tick * 0.06 + lx) * 1.5);
      ctx.fillStyle = 'rgba(235, 134, 52, 0.35)';
      ctx.fillRect(lx - 4, ly - 2, 10, 12);
      ctx.fillStyle = '#f5c25b';
      ctx.fillRect(lx - 1, ly, 4, 7);
    }

    // 4. Bustling Crowd of Townsfolk & Merchants Moving Along the Lower Boardwalk
    ctx.fillStyle = '#0d0705';
    ctx.fillRect(0, h - 16, w, 16);

    for (let c = 0; c < 28; c += 1) {
      const dir = c % 2 === 0 ? 1 : -1;
      const speed = 0.25 + (c % 4) * 0.08;
      const rawX = (c * 29 + this.tick * speed * dir) % (w + 20);
      const cx = rawX < -10 ? rawX + w + 20 : rawX;
      const bob = Math.abs(Math.sin(this.tick * 0.12 + c)) * 2;
      const cy = Math.floor(h - 15 - bob);

      // Silhouette head (some wearing conical salakot hats or carrying shoulder poles)
      ctx.fillStyle = '#090403';
      ctx.fillRect(Math.floor(cx), cy - 9, 4, 4);
      if (c % 3 === 0) {
        // Woven Salakot hat brim
        ctx.fillRect(Math.floor(cx) - 2, cy - 10, 8, 2);
      }
      // Silhouette torso/cloak
      ctx.fillRect(Math.floor(cx) - 1, cy - 5, 6, 8);
    }

    // 5. Smooth Weather Overlay (Rain / Spirit Mist) Across the Kingdom Skyline
    this._drawWeatherParticlesOnSky(ctx, w, h);
  }

  _drawWeatherParticlesOnSky(ctx, w, h) {
    const ws = this.currentWeatherState || this._computeTargetWeatherState();

    // 1. Gradual Rain Build-Up & Calm-Down
    if (ws.rainIntensity > 0.015) {
      const floatDrops = ws.rainIntensity * this.particles.length;
      const maxDrops = Math.min(this.particles.length, Math.ceil(floatDrops));
      const vx = -(0.65 + ws.rainIntensity * 2.15);
      const vy = 1.65 + ws.rainIntensity * 3.15;
      const dropW = ws.rainIntensity > 0.72 ? 2 : 1;
      const dropH = Math.max(3, Math.round(3 + ws.rainIntensity * 6));
      const baseAlpha = 0.25 + ws.rainIntensity * 0.55;

      for (let i = 0; i < maxDrops; i += 1) {
        const p = this.particles[i];
        p.x += vx;
        p.y += vy;
        if (p.y > h) {
          p.y = -4;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        const dropWeight = Math.min(1, Math.max(0, floatDrops - i));
        ctx.fillStyle = `rgba(195, 218, 236, ${(baseAlpha * dropWeight).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), dropW, dropH);
      }
    }

    // 2. Gradual Spirit Fog Bands & Bioluminescent Motes
    if (ws.fogIntensity > 0.02) {
      ctx.fillStyle = `rgba(140, 224, 184, ${(0.16 * ws.fogIntensity).toFixed(3)})`;
      const bandOffset = Math.floor(Math.sin(this.tick * 0.025) * 24);
      ctx.fillRect(0, Math.floor(h * 0.42), w, 16);
      ctx.fillRect(bandOffset, Math.floor(h * 0.65), w, 20);

      const moteFloat = ws.fogIntensity * 28;
      const moteMax = Math.ceil(moteFloat);
      for (let i = 0; i < moteMax; i += 1) {
        const p = this.particles[i];
        p.x += Math.sin(this.tick * 0.02 + p.phase) * 0.55;
        p.y -= 0.35;
        if (p.y < 4) p.y = h - 12;
        const wgt = Math.min(1, Math.max(0, moteFloat - i)) * ws.fogIntensity;
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(140, 224, 184, ${wgt.toFixed(3)})`
            : `rgba(223, 177, 91, ${wgt.toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
      }
    }

    // 3. Gradual Clear Sky Fireflies / Drifting Embers
    if (ws.clearIntensity > 0.02 && this.environment !== 'CITY') {
      const fireflyFloat = ws.clearIntensity * 24;
      const fireflyMax = Math.ceil(fireflyFloat);
      for (let i = 0; i < fireflyMax; i += 1) {
        const p = this.particles[i];
        p.x += Math.cos(this.tick * 0.02 + p.phase) * 0.4;
        p.y += Math.sin(this.tick * 0.03 + p.phase) * 0.3;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        const wgt = Math.min(1, Math.max(0, fireflyFloat - i)) * ws.clearIntensity;
        ctx.fillStyle =
          i % 3 === 0
            ? `rgba(217, 114, 54, ${wgt.toFixed(3)})`
            : `rgba(223, 177, 91, ${wgt.toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }
  }

  _drawSky() {
    if (!this.skyCanvas) return;
    const ctx = this.skyCanvas.getContext('2d');
    const w = this.skyCanvas.width;
    const h = this.skyCanvas.height;

    const st = this.currentColorState || this._computeTargetColorState();

    if (this.environment === 'CABIN') {
      this._drawCabinScene(ctx, w, h, st);
      return;
    }
    if (this.environment === 'TENT') {
      this._drawTentScene(ctx, w, h, st);
      return;
    }
    if (this.environment === 'CITY') {
      this._drawCityScene(ctx, w, h, st);
      return;
    }

    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.28));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.28), w, Math.floor(h * 0.26));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.54), w, Math.floor(h * 0.24));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.78), w, h);

    // Subtle stars at NIGHT / MIDNIGHT / PRE-DAWN (fade smoothly as stormIntensity rises)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    if (this.timeOfDay !== 'DAY' && ws.stormIntensity < 0.92) {
      const starAlpha = 0.55 * (1 - ws.stormIntensity * 0.9);
      ctx.fillStyle = `rgba(245, 234, 216, ${starAlpha.toFixed(3)})`;
      for (let s = 0; s < 22; s += 1) {
        const sx = (s * 73 + 19) % w;
        const sy = (s * 29 + 7) % Math.floor(h * 0.52);
        if ((this.tick + s * 13) % 60 < 45) {
          ctx.fillRect(sx, sy, 2, 2);
        }
      }
    }

    // Occasional lightning flash in MONSOON (scaled by stormIntensity)
    if (ws.stormIntensity > 0.35 && this.tick % 190 < 3) {
      ctx.fillStyle = `rgba(245, 234, 216, ${(0.5 * ws.stormIntensity).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Celestial Body (Sun / Crescent Moon / Bleeding Bakunawa Eclipse)
    const celestialX = w - 96;
    const celestialY = 18;
    if (this.timeOfDay === 'ECLIPSE') {
      // Blood-red eclipsed moon engulfed by Bakunawa's silhouette
      ctx.fillStyle = 'rgba(192, 57, 43, 0.45)';
      ctx.fillRect(celestialX - 8, celestialY - 8, 40, 40);
      ctx.fillStyle = '#900c3f';
      ctx.fillRect(celestialX, celestialY, 24, 24);
      // Coiled serpent body covering center
      ctx.fillStyle = '#050203';
      ctx.fillRect(celestialX + 3, celestialY + 3, 18, 18);
      // Dragon serpent eye
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(celestialX + 8, celestialY + 7, 3, 3);
    } else if (this.timeOfDay === 'DAWN') {
      ctx.fillStyle = 'rgba(243, 156, 18, 0.35)';
      ctx.fillRect(celestialX - 6, celestialY - 6, 34, 34);
      ctx.fillStyle = '#f39c12';
      ctx.fillRect(celestialX, celestialY, 22, 22);
    } else if (this.timeOfDay === 'DAY') {
      ctx.fillStyle = 'rgba(235, 183, 107, 0.28)';
      ctx.fillRect(celestialX - 5, celestialY - 5, 32, 32);
      ctx.fillStyle = '#e6b968';
      ctx.fillRect(celestialX, celestialY, 22, 22);
    } else if (this.timeOfDay === 'DUSK') {
      ctx.fillStyle = 'rgba(211, 84, 0, 0.32)';
      ctx.fillRect(celestialX - 6, celestialY - 6, 34, 34);
      ctx.fillStyle = '#d35400';
      ctx.fillRect(celestialX, celestialY, 22, 22);
      ctx.fillStyle = pal0;
      ctx.fillRect(celestialX + 6, celestialY + 2, 14, 14);
    } else {
      ctx.fillStyle = 'rgba(223, 211, 190, 0.2)';
      ctx.fillRect(celestialX - 4, celestialY - 4, 28, 28);
      ctx.fillStyle = '#dfd3be';
      ctx.fillRect(celestialX, celestialY, 20, 20);
      ctx.fillStyle = pal0;
      ctx.fillRect(celestialX + 6, celestialY + 2, 12, 12);
    }

    // 3. Biome Silhouette based on Environment
    if (this.environment === 'COAST') {
      // Horizon ocean sea surface with gentle tide line and distant outrigger silhouette
      ctx.fillStyle = '#060e14';
      ctx.fillRect(0, h - 14, w, 14);
      ctx.fillStyle = '#0f1c26';
      for (let x = 0; x < w; x += 16) {
        const tide = Math.sin((this.tick * 0.04) + x * 0.08) * 2;
        ctx.fillRect(x, h - 14 + Math.round(tide), 12, 3);
      }
      // Distant Bancâ Outrigger fishing canoe silhouette
      const boatX = (w * 0.4) | 0;
      ctx.fillStyle = '#03080c';
      ctx.fillRect(boatX, h - 22, 28, 8);
      ctx.fillRect(boatX + 6, h - 30, 2, 8);
      ctx.fillRect(boatX - 6, h - 17, 38, 2);
    } else if (this.environment === 'MANGROVE') {
      // Muddy estuary water line with arching stilt roots and tangled mangrove clusters
      ctx.fillStyle = '#060a08';
      ctx.fillRect(0, h - 12, w, 12);
      ctx.fillStyle = '#0b140f';
      for (let x = 0; x < w; x += 22) {
        const rootH = 14 + ((x * 5) % 16);
        ctx.fillRect(x, h - 12 - rootH, 18, rootH + 12);
        ctx.fillRect(x + 4, h - 12 - rootH - 8, 10, 8);
      }
    } else if (this.environment === 'BALETE') {
      // Gigantic banyan tree canopy silhouette with hanging strangler fig roots
      ctx.fillStyle = '#08050a';
      for (let x = 0; x < w; x += 28) {
        const canopyH = 22 + ((x * 9) % 20);
        ctx.fillRect(x, h - 12 - canopyH, 30, canopyH + 12);
      }
      ctx.fillStyle = '#040205';
      for (let x = 12; x < w; x += 32) {
        ctx.fillRect(x, h - 38, 2, 26);
      }
      ctx.fillRect(0, h - 12, w, 12);
    } else if (this.environment === 'TERRACES') {
      // Stepped horizontal Cordillera rice terraces ascending into the ridges
      ctx.fillStyle = '#0b1410';
      ctx.fillRect(0, h - 28, w, 10);
      ctx.fillStyle = '#070d0a';
      ctx.fillRect(0, h - 18, w, 10);
      ctx.fillStyle = '#040705';
      ctx.fillRect(0, h - 8, w, 8);
      ctx.fillStyle = '#18241c';
      for (let x = 0; x < w; x += 14) {
        ctx.fillRect(x, h - 28, 2, 10);
        ctx.fillRect(x + 6, h - 18, 2, 10);
      }
    } else if (this.environment === 'RUINS') {
      // Ancient cracked stone megalith pillars and mossy crumbled slabs
      ctx.fillStyle = '#090807';
      ctx.fillRect(0, h - 12, w, 12);
      ctx.fillStyle = '#12100d';
      for (let x = 18; x < w; x += 44) {
        const pillarH = 18 + ((x * 7) % 24);
        ctx.fillRect(x, h - 12 - pillarH, 12, pillarH);
        ctx.fillRect(x - 3, h - 12 - pillarH, 18, 4);
      }
    } else if (this.environment === 'MAW') {
      // Jagged volcanic caldera teeth and gaping abyssal oceanic chasm
      ctx.fillStyle = '#0c0205';
      for (let x = 0; x < w; x += 18) {
        const toothH = 16 + ((x * 13) % 28);
        ctx.fillRect(x, h - 10 - toothH, 16, toothH + 10);
      }
      ctx.fillStyle = '#3d0812';
      ctx.fillRect(0, h - 6, w, 6);
    } else if (this.environment === 'VILLAGE') {
      // Pre-colonial stilt huts with ladder poles and nipa pitched roofs
      ctx.fillStyle = '#0d0a06';
      ctx.fillRect(0, h - 10, w, 10);
      ctx.fillStyle = '#1a130c';
      for (let x = 16; x < w; x += 52) {
        ctx.fillRect(x, h - 26, 26, 16);
        ctx.fillRect(x - 4, h - 34, 34, 8);
        ctx.fillRect(x + 4, h - 10, 3, 10);
        ctx.fillRect(x + 19, h - 10, 3, 10);
      }
    } else {
      // Default: Cordillera Mountain Ridges & Rolling Foothills
      ctx.fillStyle = '#140b08';
      for (let x = 0; x < w; x += 24) {
        const farPeak = 14 + ((x * 11) % 22);
        ctx.fillRect(x, h - 12 - farPeak, 26, farPeak + 12);
      }

      ctx.fillStyle = '#0a0604';
      ctx.fillRect(0, h - 14, w, 14);
      for (let x = 0; x < w; x += 18) {
        const hillH = 8 + ((x * 7) % 16);
        ctx.fillRect(x, h - 14 - hillH, 18, hillH);
      }
    }

    // 4. Smoothly Interpolated Weather Particles (Rain Build-Up / Calm-Down, Spirit Fog, Clear Embers)
    this._drawWeatherParticlesOnSky(ctx, w, h);
  }
}
