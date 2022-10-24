import CanvasInput from './classes/canvas-input.js';
import NoiseInput from './classes/noise-input.js';
import VideoInput from './classes/video-input.js';
import playerUtils from './player-utils.js';

export default {
  main: {
    type: 'gl',
    customInput: {
      noiseTexture: (player) => new NoiseInput({size: 64, channels: 2}),
    },
    hooks: {
      afterRun: (player) => player.page.updateCounter(player.counter),
      onReset: (player) => {
        player.page.updateCounter(player.counter);
        player.customInput.noiseTexture.setNoise();
      },
      onPointer: [
        (player, ev) => playerUtils.setCursor(player, ev),
        (player, ev) => playerUtils.setCursorHex(player, ev),
      ],
      onKey: (player, ev) => playerUtils.handleKey(player, ev),
      onScroll: (player) => player.uniforms.parallax[1] = (player.page.scrollPos * 2 - 1) || 0,
    },
    uniforms: {
      autoscroll: [0, 1],
      gridSize: 15,
      zoom: 2./3.,
      pan: (uniforms) => {
        const {dir, gridSize, autoscroll, counter, duration, parallax} = uniforms;
        // return dir.map((e, i) => e / gridSize / 2);
        return dir.map((e, i) => e / gridSize / 2 + autoscroll[i] * counter / duration / 2 + parallax[i] / 2)
      },
    },
    shaders: [
      [
        'vertex-position',
        'ca-cursor',
        {size: 64, state: true},
      ],
      [
        'vertex-position',
        'ca-state',
        {size: 64, state: true},
      ],
      [
        'vertex-position',
        'ca-display',
      ],
      // [
      //   'vertex-position',
      //   'passthru-rgb',
      // ],
      // [
      //   'vertex-position',
      //   'flake',
      // ],
    ],
  },
  video: {
    type: 'gl',
    customInput: {
      videoTexture: (player) => new VideoInput(player, {size: 512}),
      mainTexture: (player) => new CanvasInput(player, {canvas: player.page.players.main.canvas}),
    },
    uniforms: {
      startCounter: 0,
      srcCounter: 0,
    },
    shaders: [
      [
        'vertex-position',
        'video',
      ],
    ],
    shaders: [
      [
        'vertex-position',
        'passthru',
      ],
    ],
  },
  logo: {
    type: 'gl',
    minPixelRatio: 2,
    stopAt: 60,
    uniforms: {
      duration: 60,
    },
    shaders: [
      [
        'vertex-position',
        'logo',
        {size: 512},
        ],
      [
        'vertex-position',
        'antialias',
      ]
    ]
  },
};
