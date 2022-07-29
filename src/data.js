
const PANELS = {}, SHADERS = {};;

function importAll(ctx, obj) {
  ctx.keys().forEach((key) => {
    let name = key.match(/^.*?([\w-]+)\.\w+$/)?.[1];
    let str = ctx(key);
    obj[name] = str;
  });
}

importAll(require.context('./panels/', false, /\.html$/), PANELS);
importAll(require.context('./shaders/', false, /\.(fs|vs)$/), SHADERS);

export default {
  shaders: SHADERS,
  panels: PANELS,
  frames: {
    intro: {
      shaders: [
       [SHADERS['background-ca'], { dim: [64, 64] }],
        SHADERS['frame-1'],
      ],
      content: [
        PANELS.intro,
      ],
    },
    links: {
      title: 'Links',
      shaders: [
        SHADERS['frame-2'],
      ],
      content: [
        PANELS.links
      ],
    }
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
