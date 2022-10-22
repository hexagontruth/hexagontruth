

import CanvasInput from './classes/canvas-input.js';
import NoiseInput from './classes/noise-input.js';
import VideoInput from './classes/video-input.js';

export default {
  main: {
    customInput: {
      noiseTexture: (player) => new NoiseInput(player, {size: 64}),
    },
    hooks: {
      afterRun: (player) => player.page.updateCounter(player.counter),
      onReset: (player) => {
        player.page.updateCounter(player.counter);
        player.customInput.noiseTexture.setNoise();
      },
    },
    shaders: [
      // [
      //   'vertex-position',
      //   'flatetke',
      // ],
      [
        'vertex-position',
        'ca-state',
        {size: 64, uniforms: { gridSize: 15}},
      ],
      [
        'vertex-position',
        'ca-display',
        {uniforms: { gridSize: 10, autoscroll: [0, 1]}},
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
