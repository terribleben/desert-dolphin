import * as THREE from 'three';
import GameState from '../state/GameState';
import TextureManager from '../assets/TextureManager';

export default class Scope {
  constructor() {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.08, 0.08);
    this._material = new THREE.MeshBasicMaterial({
      map: TextureManager.get(TextureManager.SCOPE),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._material.opacity = 0;
    this._mesh = new THREE.Mesh(geometry, this._material);
    this._mesh.rotation.z = Math.PI * 0.5;
    scene.add(this._mesh);
    this.setIsVisible(false);

    this._animT = 0;
    this._basePosition = new THREE.Vector3();
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  tick = (dt) => {
    this._animT += dt;
    this._mesh.position.x = this._basePosition.x;
    this._mesh.position.y = this._basePosition.y + 0.175 + Math.sin(this._animT * 5.0) * 0.03;
    if (this._isVisible) {
      if (this._material.opacity < 1.0) this._material.opacity += 2.0 * dt;
      if (this._material.opacity > 1.0) this._material.opacity = 1.0;
    } else {
      this._material.opacity = 0;
    }
  }

  setPosition = (position) => {
    this._basePosition.copy(position);
  }

  setIsVisible = (isVisible) => {
    this._isVisible = isVisible;
  }
}
