
import GameState from '../state/GameState';
import Terrain from '../entities/Terrain';
import * as THREE from 'three';
import Loser from '../entities/Loser';
import Particle from './Particle';
import ParticleManager from './ParticleManager';
import Player from '../entities/Player';
import Store from '../redux/Store';
import TextureManager from '../assets/TextureManager';

export default class World {
  constructor() {
    this._isAdvancing = false;
    this._nextTerrain = null;
  }

  loadAsync = async () => {
    await TextureManager.loadAsync();
    
    const geometry = new THREE.PlaneBufferGeometry(GameState.viewport.width, GameState.viewport.height);
    const bgMaterial = new THREE.MeshBasicMaterial({ color: 0xddac67 });
    const bgMesh = new THREE.Mesh(geometry, bgMaterial);
    bgMesh.position.z = -99;
    GameState.scene.add(bgMesh);

    this._overlayMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this._overlayMesh = new THREE.Mesh(geometry, this._overlayMaterial);
    this._overlayMesh.position.z = 99;
    GameState.scene.add(this._overlayMesh);
    
    this.terrain = new Terrain(this._getTerrainSeed());
    this.player = new Player();
    this.particleManager = new ParticleManager();

    // because I can't figure out how to get THREE to stop lagging
    // on the first time it renders a texture.
    const objectsToRenderOnce = [
      new Loser(new THREE.Vector2(), 0),
      new Particle({ materialKey: TextureManager.PARTICLE_WATER }),
      new Particle({ materialKey: TextureManager.PARTICLE_DUST }),
    ];
    requestAnimationFrame(() => {
      objectsToRenderOnce.forEach(obj => { obj.destroy(); });
      this._isFadingIn = true;
      Store.dispatch({ type: 'READY' });
    });

    return;
  }

  onGameReady = () => {
    this._isGameReady = true;
    this.player.onGameReady();
  }

  destroy = () => {
    if (this.terrain) {
      this.terrain.destroy();
      this.terrain = null;
    }
    if (this.nextTerrain) {
      this.nextTerrain.destroy();
      this.nextTerrain = null;
    }
    if (this.player) {
      this.player.destroy();
      this.player = null;
    }
    if (this.particleManager) {
      this.particleManager.destroy();
      this.particleManager = null;
    }
    if (this._overlayMesh) {
      GameState.scene.remove(this._overlayMesh);
      this._overlayMesh = null;
      this._overlayMaterial = null;
      this._isFadingIn = false;
    }
  }

  tick = (dt) => {
    this.player.tick(dt);
    this.particleManager.tick(dt);
    if (this._isFadingIn) {
      // need to wait to set transparent otherwise we encounter rendering issues during load
      this._overlayMaterial.transparent = true;
      this._overlayMaterial.opacity -= 0.008;
      if (this._overlayMaterial.opacity <= 0) {
        GameState.scene.remove(this._overlayMesh);
        this._isFadingIn = false;
      }
    }
    if (this._isAdvancing) {
      if (this._timeUntilCameraMoves > 0) {
        this._timeUntilCameraMoves -= dt;
      } else {
        this.terrain.updateXPosition(-0.04);
        this._nextTerrain.updateXPosition(-0.04);
        if (this._nextTerrain._groundMesh.position.x <= 0) {
          this._nextTerrain._previousPool = this.terrain._pool;
          this._nextTerrain.updateXPosition(
            -this._nextTerrain._groundMesh.position.x
          );
          this._isAdvancing = false;
          this.terrain.destroy();
          this.terrain = this._nextTerrain;
          this._nextTerrain = null;
          Store.dispatch({ type: 'READY' });
        }
      }
    }
  }

  isInteractionAvailable = () => {
    return (!!this.player && !this._isAdvancing && this._isGameReady && !this._isFadingIn);
  }

  advanceLevel = () => {
    if (!this._isAdvancing) {
      this._nextTerrain = new Terrain(this._getTerrainSeed(), this.terrain);
      this._isAdvancing = true;
      this._timeUntilCameraMoves = 1.5;
    }
  }

  addLoser = (position, rotation) => {
    const loser = new Loser(position, rotation);
    this.terrain.addLoser(loser);
  }

  _getTerrainSeed = () => {
    // seed is dependent on what level we've reached
    const state = Store.getState();
    return (state.hit) ? state.hit : 0;
  }
}
