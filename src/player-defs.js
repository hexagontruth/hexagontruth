export default {
  background: {
    shaders: [
      [
        'vertex-position',
        'flake',
      ],
      // [
      //   'vertex-position',
      //   'ca-state',
      //   {size: 64, uniforms: { gridSize: 15, skip: 30 }},
      // ],
      // [
      //   'vertex-position',
      //   'ca-display',
      //   {uniforms: { gridSize: 15, skip: 30 }},
      // ],
      // [
      //   'vertex-position',
      //   'passthru',
      // ],
      ],
  },
  logo: {
    uniforms: {
      duration: 60,
    },
    stopAt: 60,
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
