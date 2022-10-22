import Player2D from './player-2d.js';
import PlayerGL from './player-gl.js';
import playerDefs from '../player-defs.js';

export default function PlayerFactory(page, name, canvas) {
  const config = playerDefs[name];
  const classObj = PlayerFactory.PLAYER_MAP[config.type];
  return new classObj(page, name, canvas, config);
}

PlayerFactory.PLAYER_MAP = {
  '2d': Player2D,
  'gl': PlayerGL,
};
