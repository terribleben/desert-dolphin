

export default class TerrainGenerator {
  static NUM_SPANS = 12;
  static NEUTRAL_Y = 0.0;
  static POOL_DEPTH = 0.1;
  
  constructor(randomSeed, previousTerrain) {
    this._previousTerrain = previousTerrain;
    this._initRandom(randomSeed);
  }

  generate = () => {
    this._poolRange = this._computePoolRange(this._previousTerrain);
    this._spans = this._generateTerrain(0, this._previousTerrain);
    return {
      poolRange: this._poolRange,
      spans: this._spans,
    };
  }

  _initRandom = (seed) => {
    this._seed = seed % 2147483647;
    if (this._seed <= 0) this._seed += 2147483646;
  }

  _random = () => {
    return this._seed = this._seed * 16807 % 2147483647;
  }

  _randomf = () => {
    return (this._random() - 1) / 2147483646;
  }

  _computePoolRange = (previousTerrain) => {
    let minIndex = 6, maxIndex = TerrainGenerator.NUM_SPANS - 2;
    if (previousTerrain) {
      // our 0th span is previousTerrain's (poolIndex - 1) span
      // and we don't want our pool to appear while the previous one is still visible.
      minIndex = Math.max(minIndex, TerrainGenerator.NUM_SPANS - (previousTerrain._poolRange.end - 1));
    }
    const begin = minIndex + Math.ceil(this._randomf() * (maxIndex - minIndex));
    let end = begin;
    if (this._randomf() < 0.3 && end < maxIndex - 1) {
      end++;
    }
    return { begin, end };
  }

  _isInPoolRange = (ii) => {
    return (ii >= this._poolRange.begin && ii <= this._poolRange.end);
  }

  _generateTerrain = (startY, previousTerrain) => {
    let spans = [];
    let prevY = startY;
    let indexIntoPreviousTerrain;
    if (previousTerrain) {
      indexIntoPreviousTerrain = previousTerrain._poolRange.begin - 1;
    }
    for (let ii = 0; ii < TerrainGenerator.NUM_SPANS; ii++) {
      let span;
      if (previousTerrain && indexIntoPreviousTerrain && indexIntoPreviousTerrain < TerrainGenerator.NUM_SPANS) {
        span = previousTerrain._spans[indexIntoPreviousTerrain];
        prevY = span[1];
        indexIntoPreviousTerrain++;
      } else if (this._isInPoolRange(ii)) {
        span = [
          prevY - TerrainGenerator.POOL_DEPTH,
          prevY - TerrainGenerator.POOL_DEPTH,
        ];
        if (ii == this._poolRange.end) {
          prevY = span[1];
          prevY += -0.05 + this._randomf() * 0.1;
          prevY += TerrainGenerator.POOL_DEPTH + 0.05;
        }
      } else {
        const isDiscontinuous = (this._randomf() < 0.2 && !this._isInPoolRange(ii - 1));
        if (isDiscontinuous) {
          prevY = -0.1 + this._randomf() * 0.2;
        }
        span = [
          prevY,
          prevY - 0.1 + this._randomf() * 0.2,
        ];
        prevY = span[1];
      }
      spans.push(span);
    }
    return spans;
  }
}
