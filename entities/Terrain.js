
import * as THREE from 'three';
import GameState from '../state/GameState';

const TERRAIN_NUM_SEGMENTS = 5;
const TERRAIN_NEUTRAL_Y = 0;

export default class Terrain {
  constructor() {
    const scene = GameState.scene;
    this._material = new THREE.MeshBasicMaterial({ color: 0xe28631 }),
    this._mesh = new THREE.Mesh(this._makeShapeGeometry(), this._material);
    scene.add(this._mesh);
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  _makeShapeGeometry = () => {
    const viewport = GameState.viewport;
    let width = viewport.width;
    let shape = new THREE.Shape();
    shape.moveTo(-viewport.width / 2, -viewport.height / 2);

    // (interpolating, 1 + value)
    const depths = [ 0.1, -0.1, 0.05, -0.05, 0.2 ];
    for (let ii = 0; ii < TERRAIN_NUM_SEGMENTS; ii++) {
      let xInterp = ii / (TERRAIN_NUM_SEGMENTS - 1.0);
      shape.lineTo(-(viewport.width / 2) + (xInterp * width), TERRAIN_NEUTRAL_Y + depths[ii]);
    }
    // neutral top-right corner
    shape.lineTo(viewport.width / 2, TERRAIN_NEUTRAL_Y);

    // bottom two corners
    shape.lineTo(viewport.width / 2, -viewport.height / 2);
    shape.lineTo(-viewport.width / 2, -viewport.height / 2);
    return new THREE.ShapeGeometry(shape);
  }
}
