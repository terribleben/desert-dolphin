const TWOPI = Math.PI * 2.0;

function diffAngle(a, b) {
  while (a > TWOPI)  a -= TWOPI;
  while (b > TWOPI)  b -= TWOPI;
  while (a < 0)  a += TWOPI;
  while (b < 0) b += TWOPI;

  let diff = a - b;
  if (Math.abs(diff) <= Math.PI) {
    return diff;
  }

  while (a > Math.PI)  a -= TWOPI;
  while (b > Math.PI)  b -= TWOPI;
  while (a < -Math.PI)  a += TWOPI;
  while (b < -Math.PI)  b += TWOPI;

  return a - b;
}

export {
  diffAngle,
  TWOPI,
};
