
import * as THREE from 'three';
import GameState from '../state/GameState';
import Pool from './Pool';

const TERRAIN_NUM_SPANS = 12;
const TERRAIN_NEUTRAL_Y = 0.0;
const POOL_TERRAIN_DEPTH = 0.1;

export default class Terrain {
  constructor(previousTerrain) {
    const scene = GameState.scene;
    this._poolIndex = 5 + Math.ceil(Math.random() * 5);
    this._spans = this._generateTerrain(0, previousTerrain);

    this._groundMaterial = new THREE.MeshBasicMaterial({ color: 0xe28631 });
    this._groundMesh = new THREE.Mesh(this._makeShapeGeometry(this._spans), this._groundMaterial);
    scene.add(this._groundMesh);

    const poolX = GameState.viewport.width * -0.5 + (GameState.viewport.width / TERRAIN_NUM_SPANS) * (this._poolIndex + 0.5);
    this._pool = new Pool(this, poolX);

    if (previousTerrain) {
      const indexIntoPreviousTerrain = previousTerrain._poolIndex - 1;
      const initialXPosition = (GameState.viewport.width / TERRAIN_NUM_SPANS) * indexIntoPreviousTerrain;
      this.updateXPosition(initialXPosition);
    }
  }

  updateXPosition = (x) => {
    if (x) {
      this._pool.updateXPosition(x);
      this._groundMesh.position.x += x;
      if (this._previousPool) {
        this._previousPool.updateXPosition(x);
      }
    }
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._groundMesh);
    if (this._previousPool) {
      this._previousPool.destroy();
      this._previousPool = null;
    }
  }

  isInPool = (x) => {
    const { spanIndex } = this._scaledPosition(x);
    return (spanIndex == this._poolIndex);
  }

  getTerrainY = (x) => {
    let { spanIndex, interp } = this._scaledPosition(x);
    return TERRAIN_NEUTRAL_Y +
      (this._spans[spanIndex][0] * (1.0 - interp)) +
      (this._spans[spanIndex][1] * (interp));
  }

  _scaledPosition = (worldX) => {
    const viewportX = ((worldX + GameState.viewport.width * 0.5) / GameState.viewport.width);
    const spanIndexFloat = Math.max(0, Math.min(0.999, viewportX)) * (TERRAIN_NUM_SPANS);
    const spanIndex = Math.floor(spanIndexFloat);
    const interp = spanIndexFloat - spanIndex;
    return { spanIndex, interp };
  }

  _makeShapeGeometry = (spans) => {
    const viewport = GameState.viewport;
    let width = viewport.width;
    let shape = new THREE.Shape();
    shape.moveTo(-viewport.width / 2, -viewport.height / 2);

    // (interpolating, 1 + value)
    const depths = [ 0.1, -0.1, 0.05, -0.05, 0.2 ];
    for (let ii = 0; ii < TERRAIN_NUM_SPANS; ii++) {
      let xInterpLeft = ii / (TERRAIN_NUM_SPANS);
      let xInterpRight = (ii + 1) / (TERRAIN_NUM_SPANS);
      let span = spans[ii];
      shape.lineTo(-(viewport.width / 2) + (xInterpLeft * width), TERRAIN_NEUTRAL_Y + span[0]);
      shape.lineTo(-(viewport.width / 2) + (xInterpRight * width), TERRAIN_NEUTRAL_Y + span[1]);
    }
    // neutral top-right corner
    shape.lineTo(viewport.width / 2, TERRAIN_NEUTRAL_Y);

    // bottom two corners
    shape.lineTo(viewport.width / 2, -viewport.height / 2);
    shape.lineTo(-viewport.width / 2, -viewport.height / 2);
    return new THREE.ShapeGeometry(shape);
  }

  getFinalY = () => {
    if (this._spans) {
      return this._spans[TERRAIN_NUM_SPANS - 1][1];
    }
    return 0;
  }

  _generateTerrain = (startY, previousTerrain) => {
    let spans = [];
    let prevY = startY;
    let indexIntoPreviousTerrain;
    if (previousTerrain) {
      indexIntoPreviousTerrain = previousTerrain._poolIndex - 1;
    }
    for (let ii = 0; ii < TERRAIN_NUM_SPANS; ii++) {
      let span;
      if (previousTerrain && indexIntoPreviousTerrain && indexIntoPreviousTerrain < TERRAIN_NUM_SPANS) {
        span = previousTerrain._spans[indexIntoPreviousTerrain];
        prevY = span[1];
        indexIntoPreviousTerrain++;
      } else if (ii == this._poolIndex) {
        span = [
          prevY - POOL_TERRAIN_DEPTH,
          prevY - 0.05 + Math.random() * 0.1 - POOL_TERRAIN_DEPTH,
        ];
        prevY = span[1] + POOL_TERRAIN_DEPTH;
      } else {
        const isDiscontinuous = (Math.random() < 0.2);
        if (isDiscontinuous) {
          prevY = -0.1 + Math.random() * 0.2;
        }
        span = [
          prevY,
          prevY - 0.1 + Math.random() * 0.2,
        ];
        prevY = span[1];
      }
      spans.push(span);
    }
    return spans;
  }
}
