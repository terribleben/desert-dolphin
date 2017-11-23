import * as THREE from 'three';
import TextureManager from '../assets/TextureManager';
import GameState from '../state/GameState';

export default class Particle {
  constructor(params) {
    params = this._defaults(params);
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(params.size, params.size);
    this._mesh = new THREE.Mesh(geometry, TextureManager.getMaterial(params.materialKey));
    scene.add(this._mesh);
    
    this._mesh.position.x = params.position.x;
    this._mesh.position.y = params.position.y;
    this._mesh.position.z = -0.5;
    this._mesh.rotation.z = params.rotation;
    this._mesh.scale.x = params.scale;
    this._mesh.scale.y = params.scale;

    this._lifespan = params.lifespan;
    this._ttl = this._lifespan;
    this._velocity = params.velocity;
    this._gravity = params.gravity;
    this._isAlive = true;
  }

  _defaults = (params) => {
    params = (params) ? params : {};
    const defaults = {
      size: 0.05,
      scale: 1.0,
      rotation: 0,
      position: new THREE.Vector2(0, 0),
      velocity: new THREE.Vector2(0, 0),
      gravity: 0.03,
      lifespan: 1.0,
      materialKey: TextureManager.PARTICLE_DUST,
    };
    for (const key in defaults) {
      if (defaults.hasOwnProperty(key)) {
        if (!params.hasOwnProperty(key)) {
          params[key] = defaults[key];
        }
      }
    }
    return params;
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  isAlive = () => {
    return this._isAlive;
  }

  tick = (dt) => {
    if (!this._isAlive) return;
    
    this._ttl -= dt;
    if (this._ttl <= 0) {
      this._isAlive = 0;
    }

    this._velocity.y -= this._gravity * dt;
    const velDt = this._velocity.clone();
    velDt.multiplyScalar(dt);
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;
  }
}
