const {cos, sin, max, min} = Math;
const tau = Math.PI * 2;
const hext = tau / 6;

export default {
  setup(ctx, params) {
    ctx.fillStyle = '#fff';
    ctx.globalCompositeOperation = 'xor';
    ctx.imageSmoothingQuality = 'high';
  },

  draw(ctx, params) {
    ctx.save();
    const {size, time} = params;
    const unit = size[0] / 6;
    const t = smoothstep(time);

    ctx.clearRect(-size[0] / 2, -size[1] / 2, ...size);

    for (let i = 0, x, y; i < 6; i++) {
      x = hcos(i) * unit * (1 + t);
      y = hsin(i) * unit * (1 + t);
      drawFlatHex(ctx, x, y, unit * t);
    }

    if (time >= 0.5) {
      drawFlatHex(ctx, 0, 0, unit);
      drawFlatHex(ctx, 0, 0, unit * t * 2);
    }
    
    ctx.restore();
  },
}

function smoothstep(v) {
  // Assume normalized v
  return v * v * (3 - 2 * v);
}

function hcos(n) {
  return cos(n * hext);
}
function hsin(n) {
  return sin(n * hext);
}

function drawFlatHex(ctx, x, y, r) {
    ctx.beginPath();
    let u, v;
    u = x + r;
    v = y;
    ctx.moveTo(u, v);
    for (let i = 1; i < 6; i++) {
      u = x + r * hcos(i);
      v = y + r * hsin(i);
      ctx.lineTo(u, v);
    }
    ctx.closePath();
    ctx.fill();
}
