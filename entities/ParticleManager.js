
import * as THREE from 'three';
import GameState from '../state/GameState'
import Particle from './Particle';
import TextureManager from '../assets/TextureManager';

export default class ParticleManager {
  constructor() {
    this._particles = {};
    this._nextId = 0;
  }

  destroy = () => {
    if (this._particles) {
      for (const key in this._particles) {
        if (this._particles.hasOwnProperty(key)) {
          this._particles[key].destroy();
        }
      }
      this._particles = null;
    }
  }

  add = (particle) => {
    particle.id = this._nextId++;
    this._particles[particle.id] = particle;
  }

  tick = (dt) => {
    let keysToDelete = [];
    for (const key in this._particles) {
      if (this._particles.hasOwnProperty(key)) {
        this._particles[key].tick(dt);
        if (!this._particles[key].isAlive()) {
          keysToDelete.push(key);
        }
      }
    }
    keysToDelete.forEach(key => {
      this._particles[key].destroy();
      delete this._particles[key];
    });
  }

  /* various particle events */
  dustBurst = (sourcePosition, sourceVelocity, numParticles) => {
    for (let ii = 0; ii < numParticles; ii++) {
      const position = sourcePosition.clone();
      position.add(new THREE.Vector2(-0.05 + Math.random() * 0.1, -0.05 + Math.random() * 0.1));
      const velocity = sourceVelocity.clone();
      velocity.multiplyScalar(0.1 + Math.random() * 0.15);
      const particle = new Particle({
        position,
        velocity,
        lifespan: 0.25 + Math.random() * 0.6,
        scale: 0.2 + Math.random() * 0.3,
      });
      this.add(particle);
    }
  }
  
  splash = (sourcePosition, splashVelocity) => {
    if (GameState.world.terrain) {
      sourcePosition.y = GameState.world.terrain.getPoolY(sourcePosition.x);
    }
    const numSmallParticles = 10;
    const numBigParticles = 6;
    const numTotalParticles = numSmallParticles + numBigParticles;
    for (let ii = 0; ii < numTotalParticles; ii++) {
      const position = sourcePosition.clone();
      position.add(new THREE.Vector2(-0.05 + Math.random() * 0.1, -0.05 + Math.random() * 0.1));
      const velocity = splashVelocity.clone();
      let params;

      if (ii < numSmallParticles) {
        velocity.multiplyScalar(0.3 + Math.random() * 0.25);
        params = {
          position,
          velocity,
          gravity: 0.04,
          lifespan: 0.25 + Math.random() * 0.6,
          scale: 0.2 + Math.random() * 0.5,
          materialKey: TextureManager.PARTICLE_WATER,
        };
      } else {
        velocity.multiplyScalar(0.04 + Math.random() * 0.05);
        velocity.x = -0.01 + Math.random() * 0.02;
        params = {
          position,
          velocity,
          gravity: 0.015,
          lifespan: 0.25 + Math.random() * 0.6,
          scale: 0.7 + Math.random() * 0.3,
          materialKey: TextureManager.PARTICLE_WATER,
        };
      }
      const particle = new Particle(params);
      this.add(particle);
    }
  }
}
