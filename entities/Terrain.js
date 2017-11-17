
import * as THREE from 'three';
import GameState from '../state/GameState';

const TERRAIN_NUM_SPANS = 12;
const TERRAIN_NEUTRAL_Y = 0.0;

export default class Terrain {
  constructor() {
    const scene = GameState.scene;
    this._spans = this._generateTerrain(0);
    this._material = new THREE.MeshBasicMaterial({ color: 0xe28631 }),
    this._mesh = new THREE.Mesh(this._makeShapeGeometry(this._spans), this._material);
    scene.add(this._mesh);
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  getTerrainY = (x) => {
    let { spanIndex, interp } = this._scaledPosition(x);
    return TERRAIN_NEUTRAL_Y +
      (this._spans[spanIndex][0] * (1.0 - interp)) +
      (this._spans[spanIndex][1] * (interp));
  }

  _scaledPosition = (worldX) => {
    const viewportX = ((worldX + GameState.viewport.width * 0.5) / GameState.viewport.width);
    const spanIndexFloat = Math.max(0, Math.min(1, viewportX)) * (TERRAIN_NUM_SPANS);
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
      shape.lineTo(-(viewport.width / 2) + (xInterpLeft * width), TERRAIN_NEUTRAL_Y + spans[ii][0]);
      shape.lineTo(-(viewport.width / 2) + (xInterpRight * width), TERRAIN_NEUTRAL_Y + spans[ii][1]);
    }
    // neutral top-right corner
    shape.lineTo(viewport.width / 2, TERRAIN_NEUTRAL_Y);

    // bottom two corners
    shape.lineTo(viewport.width / 2, -viewport.height / 2);
    shape.lineTo(-viewport.width / 2, -viewport.height / 2);
    return new THREE.ShapeGeometry(shape);
  }

  _generateTerrain = (startY) => {
    let spans = [];
    let prevY = startY;
    for (let ii = 0; ii < TERRAIN_NUM_SPANS; ii++) {
      const isDiscontinuous = (Math.random() < 0.2);
      if (isDiscontinuous) {
        prevY = TERRAIN_NEUTRAL_Y - 0.1 + Math.random() * 0.2;
      }
      const span = [
        prevY,
        prevY - 0.1 + Math.random() * 0.2,
      ];
      prevY = span[1];
      spans.push(span);
    }
    return spans;
  }
}
