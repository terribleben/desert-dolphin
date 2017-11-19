
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
    return new THREE.PlaneBufferGeometry((GameState.viewport.width / 12) + 0.02, 0.15);
  }
}
