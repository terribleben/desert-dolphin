import Arrow from './Arrow';
import GameState from '../state/GameState';
import { diffAngle } from '../util/Geometry';
import * as THREE from 'three';
import { PixelRatio } from 'react-native';
import Scope from './Scope';
import Store from '../redux/Store';
import TextureManager from '../assets/TextureManager';

const SCREEN_SCALE = PixelRatio.get();

export default class Player {
  constructor() {
    this._isReady = false;
    this._arrow = new Arrow();
    this._scope = new Scope();
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
      this._velocity.y -= 0.08 * dt;
    }
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;

    if (this._resetIfOutsideViewport()) {
      return;
    }
    const collision = GameState.world.terrain.getCollision(this._mesh.position, this._velocity);
    if (collision.isIntersected) {
      if (GameState.world.terrain.isInPool(this._mesh.position.x)) {
        Store.dispatch({ type: 'HIT' });
        GameState.world.particleManager.splash(collision.intersection, collision.normal);
        this._reset();
      } else {
        const prevVelocity = this._velocity.clone();
        this._velocity.add(collision.normal);
        if (Math.abs(collision.normal.length()) > 0.02) {
          GameState.world.particleManager.dustBurst(collision.intersection, collision.normal, 7);
        }
        const isImpactDeadly = (
          this._velocity.length() < 0.007
            || (prevVelocity.length() / this._velocity.length() > 1.5)
            || (Math.abs(diffAngle(this._velocity.angle(), prevVelocity.angle())) > Math.PI * 0.4)
        );
        if (isImpactDeadly) {
          // ur ded
          this._missAndReset(collision.intersection);
        } else {
          // slide along terrain
          this._velocity.add(collision.friction);
          this._mesh.position.x = collision.intersection.x;
          this._mesh.position.y = collision.intersection.y + 0.0018;
          this._updateRotation();
          GameState.world.particleManager.dustBurst(collision.intersection, this._velocity, 2);
        }
      }
    } else {
      this._updateRotation();
    }
  }

  _resetIfOutsideViewport = () => {
    const buffer = 0.1;
    if (this._mesh.position.x > (GameState.viewport.width * 0.5) + buffer || this._mesh.position.x < (GameState.viewport.width * -0.5) - buffer) {
      this._missAndReset(this._mesh.position);
      return true;
    }
    return false;
  }

  _missAndReset = (position) => {
    Store.dispatch({ type: 'MISS', position, rotation: this._mesh.rotation.z });
    this._reset();
  }

  _updateRotation = () => {
    if (this._isJumping) {
      if (this._velocity.x >= 0) {
        this._mesh.scale.x = 1;
        this._mesh.rotation.z = this._velocity.angle();
      } else {
        this._mesh.scale.x = -1;
        this._mesh.rotation.z = this._velocity.angle() + Math.PI;
      }
    }
  }

  _isInteractionAvailable = () => {
    return (!this._isJumping && !this._hasJumped && this._isGameReady);
  }

  onTouchBegin = (touch) => {
    if (this._isInteractionAvailable()) {
      this._arrow.onTouchBegin(touch);
      this._hasTouch = true;
    }
  }

  onTouchMove = (touch) => {
    if (this._isInteractionAvailable() && this._hasTouch) {
      this._arrow.onTouchMove(touch);
      this._mesh.rotation.z = this._arrow._mesh.rotation.z + 3.141;
    }
  }

  onTouchEnd = (touch) => {
    if (this._isInteractionAvailable() && this._hasTouch) {
      this._arrow.onTouchEnd(touch);
      this._hasTouch = false;
      let pan = new THREE.Vector2(touch.translationX * SCREEN_SCALE, touch.translationY * SCREEN_SCALE);
      const { minPanLength, maxPanLength } = this._arrow.getPanBounds();
      if (Math.abs(pan.length()) >= minPanLength) {
        pan.clampLength(-maxPanLength, maxPanLength);
        pan.multiplyScalar((GameState.viewport.screenHeight / 1280000) / SCREEN_SCALE);
        this._isJumping = true;
        this._velocity.x = -pan.x;
        this._velocity.y = pan.y;
        this._scope.setIsVisible(false);
      }
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
    this._hasTouch = false;
    this._isReady = true;
    this._isGameReady = false;
  }
}
