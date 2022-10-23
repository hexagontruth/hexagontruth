import CanvasInput from './classes/canvas-input.js';
import NoiseInput from './classes/noise-input.js';
import VideoInput from './classes/video-input.js';
import playerUtils from './player-utils.js';

export default {
  main: {
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
    },
    uniforms: {
      autoscroll: [0, 1],
      gridSize: 15,
      pan: (uniforms) => {
        const {dir, gridSize, autoscroll, counter, duration, parallax} = uniforms;
        // return dir.map((e, i) => e / gridSize / 2);
        return dir.map((e, i) => e / gridSize / 2 + autoscroll[i] * counter / duration / 2 + parallax[i] / 2)
      },
    },
    shaders: [
      // [
      //   'vertex-position',
      //   'flate',
      // ],
      [
        'vertex-position',
        'ca-state',
        {size: 64},
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
      //   'test',
      // ],
    ],
  },
  video: {
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
