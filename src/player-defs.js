

import CanvasInput from './classes/canvas-input.js';
import VideoInput from './classes/video-input.js';

export default {
  main: {
    shaders: [
      // [
      //   'vertex-position',
      //   'flake',
      // ],
      [
        'vertex-position',
        'ca-state',
        {size: 64, uniforms: { gridSize: 15, skip: 30 }},
      ],
      [
        'vertex-position',
        'ca-display',
        {uniforms: { gridSize: 15, skip: 30 }},
      ],
      // [
      //   'vertex-position',
      //   'passthru',
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
