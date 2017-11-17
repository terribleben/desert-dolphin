
import * as THREE from 'three';
import GameState from '../state/GameState';

const TERRAIN_NUM_SPANS = 12;
const TERRAIN_NEUTRAL_Y = 0.0;
        const POOL_TERRAIN_DEPTH = 0.1;

export default class Terrain {
  constructor() {
    const scene = GameState.scene;
    this._poolIndex = 8 + Math.ceil(Math.random() * 2);
    this._spans = this._generateTerrain(0);
    
    this._groundMaterial = new THREE.MeshBasicMaterial({ color: 0xe28631 });
    this._groundMesh = new THREE.Mesh(this._makeShapeGeometry(this._spans), this._groundMaterial);
    scene.add(this._groundMesh);

    this._poolMaterial = new THREE.MeshBasicMaterial({ color: 0x00aabb });
    this._poolMesh = new THREE.Mesh(this._makePoolGeometry(this._spans, this._poolIndex), this._poolMaterial);
    this._poolMesh.position.x = GameState.viewport.width * -0.5 + (GameState.viewport.width / TERRAIN_NUM_SPANS) * (this._poolIndex + 0.5);
    this._poolMesh.position.y = this.getTerrainY(this._poolMesh.position.x);
    this._poolMesh.position.z = 11;
    scene.add(this._poolMesh);
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._groundMesh);
    scene.remove(this._poolMesh);
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

  _makePoolGeometry = (spans, poolIndex) => {
    return new THREE.PlaneBufferGeometry(GameState.viewport.width / TERRAIN_NUM_SPANS, 0.2);
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

  _generateTerrain = (startY) => {
    let spans = [];
    let prevY = startY;
    for (let ii = 0; ii < TERRAIN_NUM_SPANS; ii++) {
      let span;
      if (ii == this._poolIndex) {
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
