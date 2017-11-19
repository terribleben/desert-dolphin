import Arrow from './Arrow';
import GameState from '../state/GameState';
import * as THREE from 'three';
import Scope from './Scope';
import Store from '../redux/Store';
import TextureManager from '../assets/TextureManager';

export default class Player {
  constructor() {
    this._isReady = false;
    this._arrow = new Arrow();
    this._scope = new Scope();
    this._buildMeshAsync();
  }

  _buildMeshAsync = async () => {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.15, 0.15);
    this._material = new THREE.MeshBasicMaterial({
      map: TextureManager.get(TextureManager.DOLPHIN),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);
    this._reset();
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
    if (this._arrow) {
      this._arrow.destroy();
      this._arrow = null;
    }
    if (this._scope) {
      this._scope.destroy();
      this._scope = null;
    }
  }

  tick = (dt) => {
    if (!this._isReady) { return; }

    this._scope.tick(dt);
    
    if (this._isJumping) {
      this._velocity.y -= 0.1 * dt;
      if (this._velocity.x >= 0) {
        this._mesh.scale.x = 1;
        this._mesh.rotation.z = this._velocity.angle();
      } else {
        this._mesh.scale.x = -1;
        this._mesh.rotation.z = this._velocity.angle() + 3.142;
      }
    }
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;

    const terrainY = GameState.world.terrain.getTerrainY(this._mesh.position.x);

    if (this._mesh.position.x > GameState.viewport.width * 0.5 || this._mesh.position.x < GameState.viewport.width * -0.5) {
      this._reset();
    }
    if (this._mesh.position.y < terrainY) {
      // TODO: bounce/coast if angle is acute enough
      if (GameState.world.terrain.isInPool(this._mesh.position.x)) {
        Store.dispatch({ type: 'HIT' });
        this._reset();
      } else {
        Store.dispatch({ type: 'MISS', position: { x: this._mesh.position.x, y: terrainY }, rotation: this._mesh.rotation.z });
        this._reset();
      }
    }
  }

  _isInteractionAvailable = () => {
    return (!this._isJumping && !this._hasJumped && this._isGameReady);
  }

  onTouchBegin = (touch) => {
    if (this._isInteractionAvailable()) {
      this._arrow.onTouchBegin(touch);
    }
  }

  onTouchMove = (touch) => {
    if (this._isInteractionAvailable()) {
      this._arrow.onTouchMove(touch);
      this._mesh.rotation.z = this._arrow._mesh.rotation.z + 3.141;
    }
  }

  onTouchEnd = (touch) => {
    if (this._isInteractionAvailable()) {
      this._arrow.onTouchEnd(touch);
      this._isJumping = true;
      let pan = new THREE.Vector2(touch.translationX, touch.translationY);
      pan.clampLength(-72, 72);
      pan.multiplyScalar(0.001);
      this._velocity.x = -pan.x;
      this._velocity.y = pan.y;
      this._scope.setIsVisible(false);
    }
  }

  onGameReady = () => {
    this._isGameReady = true;
    this._material.opacity = 1;
    this._mesh.rotation.z = 0;
    if (GameState.world.terrain) {
      const startPosition2D = GameState.world.terrain.getStartPosition();
      this._mesh.position.x = startPosition2D.x;
      this._mesh.position.y = startPosition2D.y;
    }
    this._scope.setPosition(this._mesh.position);
    this._scope.setIsVisible(true);
  }

  _reset = () => {
    this._hasJumped = false;
    this._isJumping = false;
    this._velocity = new THREE.Vector2(0, 0);
    this._scope.setIsVisible(false);
    this._mesh.position.set(-1.5, 2.0, 0.5);
    this._material.opacity = 0;
    this._isReady = true;
    this._isGameReady = false;
  }
}
