
import * as THREE from 'three';
import GameState from '../state/GameState';

export default class Pool {
  constructor(terrain, initialX) {
    const scene = GameState.scene;
    this._terrain = terrain;
    this._poolMaterial = new THREE.MeshBasicMaterial({ color: 0x5b9190 });
    this._poolMesh = new THREE.Mesh(this._makePoolGeometry(terrain._spans, terrain._poolIndex), this._poolMaterial);
    scene.add(this._poolMesh);
    this._poolMesh.position.x = initialX;
    this._poolMesh.position.y = this._terrain.getTerrainY(initialX) - 0.02;
    this._poolMesh.position.z = 1.1;
  }

  getCenterX = () => {
    return this._poolMesh.position.x;
  }

  updateXPosition = (x) => {
    this._poolMesh.position.x += x;
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._poolMesh);
    this._terrain = null;
  }

  _makePoolGeometry = (spans, poolIndex) => {
    let shape = new THREE.Shape();
    // moveTo, lineTo
    const poolWidth = (GameState.viewport.width / 12) + 0.02,
          poolHeight = 0.15;
    // upper left
    shape.moveTo(-poolWidth * 0.5, poolHeight * 0.5);

    // bottom is random
    const numBottomSegments = 3 + Math.floor(Math.random() * 3);
    const randomHeight = () => poolHeight * (0.4 + Math.random() * 0.6);
    for (let ii = 0; ii < numBottomSegments; ii++) {
      const x = (-poolWidth * 0.5) + ii * (poolWidth / (numBottomSegments - 1.0));
      shape.lineTo(x, -randomHeight());
    }
    
    // upper right
    shape.lineTo(poolWidth * 0.5, poolHeight * 0.5);
    return new THREE.ShapeGeometry(shape);
    // return new THREE.PlaneBufferGeometry(, );
  }
}
