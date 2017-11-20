
import GameState from '../state/GameState';
import Terrain from '../entities/Terrain';
import * as THREE from 'three';
import Loser from '../entities/Loser';
import Player from '../entities/Player';
import Store from '../redux/Store';
import TextureManager from '../assets/TextureManager';

export default class World {
  constructor() {
    const geometry = new THREE.PlaneBufferGeometry(GameState.viewport.width, GameState.viewport.height);
    const bgMaterial = new THREE.MeshBasicMaterial( { color: 0xddac67 } );
    const bgMesh = new THREE.Mesh(geometry, bgMaterial);
    bgMesh.position.z = -99;
    GameState.scene.add(bgMesh);

    this._isAdvancing = false;
    this._nextTerrain = null;
  }

  loadAsync = async () => {
    await TextureManager.loadAsync();
    this.terrain = new Terrain();
    this.player = new Player();
    return Store.dispatch({ type: 'READY' });
  }

  onGameReady = () => {
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
  }

  tick = (dt) => {
    this.player.tick(dt);
    if (this._isAdvancing) {
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

  isInteractionAvailable = () => {
    return (!!this.player && !this._isAdvancing);
  }

  advanceLevel = () => {
    if (!this._isAdvancing) {
      this._nextTerrain = new Terrain(this.terrain);
      this._isAdvancing = true;
    }
  }

  addLoser = (position, rotation) => {
    const loser = new Loser(position, rotation);
    this.terrain.addLoser(loser);
  }
}
