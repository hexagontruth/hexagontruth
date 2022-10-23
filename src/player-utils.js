export default {
  cart2hex,
  roundHex,
  cart2hex,
  hex2cart,
  hex2hex,
  setCursor,
  setCursorHex,
  handleKey
};

const sr3 = 3 ** 0.5;
const ir3 = 1 / sr3;

const hex2hexMat = [
  1./3.,        1./3. + ir3,  1./3. - ir3,
  1./3. - ir3,  1./3.,        1./3. + ir3,
  1./3. + ir3,  1./3. - ir3,  1./3.
];

function roundHex(hex) {
  // This algorithm is described in Red Blob Games' amazing "Hexagonal Grids" article:
  // https://www.redblobgames.com/grids/hexagons/#rounding
  const {abs, round} = Math;
  const r = hex.map((e) => round(e));
  const d = hex.map((e, i) => abs(e - r[i]));
  if (d[0] > d[1] && d[0] > d[2])
    r[0] = -r[1] - r[2];
  else if (d[1] > d[2])
    r[1] = -r[0] - r[2];
  else
    r[2] = -r[0] - r[1];
  return r;
}

function hex2cart(h) {
  return [
    h[1] + 0.5 * h[2],
    sr3 / 2 * h[2]
  ];
}

function cart2hex(c) {
  return [
    -c[0] - 1 / sr3 * c[1],
    c[0] - 1 / sr3 * c[1],
    2 / sr3 * c[1],
  ];
}

function hex2hex(h) {
  const a = 1/3 + ir3;
  const b = 1/3 - ir3;
  const [x, y, z] = h;
  const mat = hex2hexMat;
  return [
    x * mat[0] + y * mat[1] + z * mat[2],
    x * mat[3] + y * mat[4] + z * mat[5],
    x * mat[6] + y * mat[7] + z * mat[8],
  ];
}

function getPos(player, ev) {
  return [
    ev.clientX / player.dw * 2 - 1,
    ev.clientY / player.dh * -2 + 1,
  ];
}

function setCursor(player, ev) {
  const {uniforms} = player
  const pos = getPos(player, ev);

  uniforms.cursorLastPos = uniforms.cursorPos;
  uniforms.cursorPos = pos;

  if (ev.type == 'pointerdown') {
    uniforms.cursorDown = true;
    uniforms.cursorDownAt = this.counter;
    uniforms.cursorDownPos = pos.slice();
  }
  else if (ev.type == 'pointerup' || ev.type == 'pointerout' || ev.type == 'pointercancel') {
    uniforms.cursorDown = false;
    uniforms.cursorUpAt = this.counter;
    uniforms.cursorUpPos = pos.slice();
  }
  uniforms.cursorAngle = Math.atan2(pos[1], pos[0]);
}

function setCursorHex(player, ev) {
  const {uniforms} = player;
  const {pan, zoom, gridSize} = uniforms;
  const panc = pan(uniforms);

  let p = getPos(player, ev);
  p = p.map((e, i) => e * player.cover[i]);
  p = p.map((e, i) => e * zoom + panc[i]);

  let hex, rounded, diff;
  hex = cart2hex(p);
  uniforms.cursorHex = roundHex(hex.map((e) => e * gridSize));

  hex = hex2hex(hex).map((e) => e / sr3);
  rounded = roundHex(hex);
  diff = hex.map((e, i) => e - rounded[i]);
  hex = hex2hex(diff).map((e) => -e * sr3);
  uniforms.cursorHexRounded = roundHex(hex.map((e) => e * gridSize));
}

function handleKey(player, ev) {
  const {uniforms} = player;
  const key = ev.key.toUpperCase();
  const uniformKey = `key${key}`;
  uniforms.shiftKey = ev.shiftKey;
  if ('WASD'.includes(key) && !ev.shiftKey && !ev.ctrlKey) {
    const wasdMap = {
      W: [0, 1],
      A: [-1, 0],
      S: [0, -1],
      D: [1, 0],
    };
    const dirDelta = wasdMap[key];
    if (ev.type == 'keydown') {
      uniforms[uniformKey] = true;
      uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
    }
    else if (ev.type == 'keyup') {
      uniforms[uniformKey] = false;
      uniforms.dir = uniforms.dir.map((e, i) => e +dirDelta[i]);
    }
  }
  else if (ev.type == 'keydown') {
    if (key == ',') {
      uniforms.zoom *= 12/11;
    }
    else if (key == '.') {
      uniforms.zoom *= 11/12;
    }
    else if (!ev.repeat) {
      if (key == 'R') {
        player.reset();
      }
      else if (key == 'T') {
        player.toggle();
      }
      else if (key == 'G') {
        if (player.playing)
          player.stop();
        else
          player.run();
      }
      else if (key == 'H') {
        uniforms.dir = [0, 0];
        uniforms.zoom = 1;
      }
    }
  }
}
