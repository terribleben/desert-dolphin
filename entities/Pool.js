
import * as THREE from 'three';
import GameState from '../state/GameState';
import TerrainGenerator from './TerrainGenerator';

const POOL_HEIGHT = 0.15;

export default class Pool {
  constructor(terrain) {
    const scene = GameState.scene;
    this._terrain = terrain;
    this._poolMaterial = new THREE.MeshBasicMaterial({ color: 0x5b9190 });
    this._poolMesh = new THREE.Mesh(this._makePoolGeometry(terrain._spans, terrain._poolRange), this._poolMaterial);
    scene.add(this._poolMesh);

    const initialX = GameState.viewport.width * -0.5 + (GameState.viewport.width / TerrainGenerator.NUM_SPANS) * (((terrain._poolRange.begin + terrain._poolRange.end) * 0.5) + 0.5);
    this._poolMesh.position.x = initialX;
    this._poolMesh.position.y = this._terrain.getPoolY(initialX) - (POOL_HEIGHT * 0.5);
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

  _makePoolGeometry = (spans, poolRange) => {
    let shape = new THREE.Shape();
    // moveTo, lineTo
    const poolWidth = ((GameState.viewport.width / 12) * (poolRange.end - poolRange.begin + 1)) + 0.02;
    // upper left
    shape.moveTo(-poolWidth * 0.5, POOL_HEIGHT * 0.5);

    // bottom is random
    const numBottomSegments = 3 + Math.floor(Math.random() * 3);
    const randomHeight = () => POOL_HEIGHT * (0.4 + Math.random() * 0.6);
    for (let ii = 0; ii < numBottomSegments; ii++) {
      const x = (-poolWidth * 0.5) + ii * (poolWidth / (numBottomSegments - 1.0));
      shape.lineTo(x, -randomHeight());
    }
    
    // upper right
    shape.lineTo(poolWidth * 0.5, POOL_HEIGHT * 0.5);
    return new THREE.ShapeGeometry(shape);
    // return new THREE.PlaneBufferGeometry(, );
  }
}
