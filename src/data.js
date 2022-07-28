
const PANELS = {};
function importAll(ctx) {
  ctx.keys().forEach((key) => {
    let name = key.match(/^.*?([\w-]+)\.html$/)?.[1];
    let str = ctx(key);
    PANELS[name] = str;
  });
}

importAll(require.context('./panels/', false, /\.html/));

console.log('wedge', PANELS);
export default {
  frames: {
    intro: {
      content: [
        PANELS.intro,
      ],
    },
    links: {
      title: 'Links',
      content: [
        PANELS.links
      ],
    }
  },
  programs: {
    background: {
      uniforms: {
        gridSize: 30,
      },
      shaders: [
        [ 'background-ca', { dim: [64, 64] }],
        'background1',
      ],
    },
    panel: {
      shaders: [
        'panel1',
      ],
    },
  },
  links: {
    Twitter: {
      username: '@hexagontruth',
      url: 'https://twitter.com/hexagontruth',
      icon: 'twitter',
    },
    Instagram: {
      username: '@hexagontruth',
      url: 'https://instagram.com/hexagontruth',
      icon: 'instagram',
    },
    Facebook: {
      username: 'Hexagon Truth',
      url: 'https://facebook.com/hexagontruth',
      icon: 'instagram',
    },
    YouTube: {
      username: 'Hexagonal Awareness',
      url: 'https://www.youtube.com/channel/UCf-ml0bmw7OJZHZCIB0cx3g',
      icon: 'youtube',
    },
    Twitch: {
      username: 'HexagonTruth',
      url: 'https://www.twitch.tv/hexagontruth',
      icon: 'twitch',
    },
    Patreon: {
      username: 'hexagontruth',
      url: 'https://www.patreon.com/m/hexagontruth',
      icon: 'patreon',
    },
    Bandcamp: {
      username: 'hexagontruth',
      url: 'https://hexagontruth.bandcamp.com/',
      icon: 'bandcamp',
    },
    Voxels: {
      username: 'Hexagonal Wisdom Center',
      url: 'https://www.cryptovoxels.com/play?coords=W@375.5W,603S,0.5U',
      icon: 'ethereum',
    },
    Discord: {
      username: 'Hexagonal Awareness',
      url: 'https://discordapp.com/invite/t6hrz7S',
      icon: 'discord',
    },
    SuperRare: {
      username: 'hexagontruth',
      url: 'href="https://superrare.co/hexagontruth',
      icon: 'sr',
    },
    OpenSea: {
      username: 'hexagontruth',
      url: 'https://opensea.io/accounts/hexagontruth',
      icon: 'opensea',
    },
    Rarible: {
      username: 'hexagontruth',
      url: 'https://app.rarible.com/hexagontruth',
      icon: 'ethereum',
    },
    Showtime: {
      username: 'hexagontruth',
      url: 'https://tryshowtime.com/hexagontruth',
      icon: 'discord',
    },
  },
};