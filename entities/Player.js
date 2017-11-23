import Arrow from './Arrow';
import GameState from '../state/GameState';
import * as THREE from 'three';
import { PixelRatio } from 'react-native';
import Scope from './Scope';
import Store from '../redux/Store';
import TextureManager from '../assets/TextureManager';

const TWOPI = Math.PI * 2.0;
const SCREEN_SCALE = PixelRatio.get();

function diffAngle(a, b) {
  while (a > TWOPI)  a -= TWOPI;
  while (b > TWOPI)  b -= TWOPI;
  while (a < 0)  a += TWOPI;
  while (b < 0) b += TWOPI;

  let diff = a - b;
  if (Math.abs(diff) <= Math.PI) {
    return diff;
  }

  while (a > Math.PI)  a -= TWOPI;
  while (b > Math.PI)  b -= TWOPI;
  while (a < -Math.PI)  a += TWOPI;
  while (b < -Math.PI)  b += TWOPI;

  return a - b;
}

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
      this._velocity.y -= 0.08 * dt;
    }
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;

    const terrainY = GameState.world.terrain.getTerrainY(this._mesh.position.x);

    if (this._mesh.position.x > GameState.viewport.width * 0.5 || this._mesh.position.x < GameState.viewport.width * -0.5) {
      Store.dispatch({ type: 'MISS', position: { x: this._mesh.position.x, y: terrainY }, rotation: this._mesh.rotation.z });
      this._reset();
    }
    if (this._mesh.position.y < terrainY) {
      const terrainAngle = GameState.world.terrain.getAngle(this._mesh.position.x);
      const diffVelocityTerrainAngle = diffAngle(
        this._velocity.angle(),
        terrainAngle
      );
      const normalAngle = terrainAngle + Math.PI * -0.5;
      const normalMag = this._velocity.length() * Math.sin(diffVelocityTerrainAngle);
      const normal = new THREE.Vector2(
        normalMag * Math.cos(normalAngle),
        normalMag * Math.sin(normalAngle)
      );
      if (GameState.world.terrain.isInPool(this._mesh.position.x)) {
        Store.dispatch({ type: 'HIT' });
        GameState.world.particleManager.splash(this._mesh.position, normal);
        this._reset();
      } else {
        const prevVelocity = this._velocity.clone();
        this._velocity.add(normal);
        if (Math.abs(normalMag) > 0.02) {
          GameState.world.particleManager.dustBurst(this._mesh.position, normal, 7);
        }
        const isImpactDeadly = (
          this._velocity.length() < 0.007
            || (prevVelocity.length() / this._velocity.length() > 1.5)
            || (Math.abs(diffAngle(this._velocity.angle(), prevVelocity.angle())) > Math.PI * 0.4)
        );
        if (isImpactDeadly) {
          Store.dispatch({ type: 'MISS', position: { x: this._mesh.position.x, y: terrainY }, rotation: this._mesh.rotation.z });
          this._reset();
        } else {
          // friction
          const frictionAngle = terrainAngle - Math.PI,
                frictionMag = this._velocity.length() * 0.18;
          this._velocity.add(new THREE.Vector2(
            frictionMag * Math.cos(frictionAngle),
            frictionMag * Math.sin(frictionAngle)
          ));
          this._mesh.position.y = terrainY;
          this._updateRotation();
          GameState.world.particleManager.dustBurst(this._mesh.position, this._velocity, 2);
        }
      }
    } else {
      this._updateRotation();
    }
  }

  _updateRotation = () => {
    if (this._isJumping) {
      if (this._velocity.x >= 0) {
        this._mesh.scale.x = 1;
        this._mesh.rotation.z = this._velocity.angle();
      } else {
        this._mesh.scale.x = -1;
        this._mesh.rotation.z = this._velocity.angle() + 3.142;
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
      this._isJumping = true;
      this._hasTouch = false;
      let pan = new THREE.Vector2(touch.translationX * SCREEN_SCALE, touch.translationY * SCREEN_SCALE);
      const maxPanLength = GameState.viewport.screenHeight * 0.4;
      pan.clampLength(-maxPanLength, maxPanLength);
      pan.multiplyScalar(0.0005 / SCREEN_SCALE);
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
    this._hasTouch = false;
    this._isReady = true;
    this._isGameReady = false;
  }
}
