import * as THREE from 'three';
import GameState from '../state/GameState';
import TextureManager from '../assets/TextureManager';

export default class Scope {
  constructor() {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.3, 0.3);
    this._material = new THREE.MeshBasicMaterial({
      map: TextureManager.get(TextureManager.SCOPE),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._material.opacity = 0;
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);
    this.setIsVisible(false);

    this._scaleT = 0;
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  tick = (dt) => {
    this._scaleT += dt;
    const scale = 1.0 + (Math.sin(this._scaleT * 5.0) * 0.2);
    this._mesh.scale.x = scale;
    this._mesh.scale.y = scale;
  }

  setPosition = (position) => {
    this._mesh.position.copy(position);
  }

  setIsVisible = (isVisible) => {
    this._material.opacity = (isVisible) ? 1 : 0;
  }
}
