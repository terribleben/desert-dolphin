import GameState from '../state/GameState';
import * as THREE from 'three';
import TextureManager from '../assets/TextureManager';

export default class Loser {
  constructor(position, rotation) {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.15, 0.15);
    this._mesh = new THREE.Mesh(geometry, TextureManager.getMaterial(TextureManager.LOSER));
    scene.add(this._mesh);
    this._mesh.position.x = position.x;
    this._mesh.position.y = position.y;
    this._mesh.position.z = -0.5;
    this._mesh.rotation.z = rotation;
  }

  updateXPosition = (x) => {
    this._mesh.position.x += x;
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }
}
