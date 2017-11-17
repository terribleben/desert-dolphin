
import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import GameState from '../state/GameState';
import * as THREE from 'three';

export default class Player {
  constructor() {
    this._isReady = false;
    this._buildMeshAsync();
  }

  _buildMeshAsync = async () => {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.15, 0.15);
    // this._material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this._material = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/dolphin.png')),
      }),
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
  }

  tick = (dt) => {
    if (!this._isReady) { return; }
    if (this._isJumping) {
      this._velocity.y -= 0.1 * dt;
    }
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;

    if (this._velocity.x >= 0) {
      this._mesh.scale.x = 1;
      this._mesh.rotation.z = this._velocity.angle();
    } else {
      this._mesh.scale.x = -1;
      this._mesh.rotation.z = this._velocity.angle() + 3.142;
    }

    const terrainY = GameState.terrain.getTerrainY(this._mesh.position.x);

    if (this._mesh.position.x > GameState.viewport.width * 0.5 || this._mesh.position.x < GameState.viewport.width * -0.5) {
      this._reset();
    }
    if (this._mesh.position.y < terrainY) {
      this._isJumping = false;
      this._mesh.position.y = terrainY;
      this._velocity.set(0, 0);
      if (GameState.terrain.isInPool(this._mesh.position.x)) {
        console.log('winner');
        this._reset();
      }
    }
  }
  /*
[exp] Object {
[exp]   "absoluteX": 566.5,
[exp]   "absoluteY": 246.5,
[exp]   "handlerTag": 1,
[exp]   "oldState": 4,
[exp]   "state": 5,
[exp]   "target": 3,
[exp]   "translationX": 552.5,
[exp]   "translationY": 56.5,
[exp]   "velocityX": 75.11063079472257,
[exp]   "velocityY": 89.96844155619195,
[exp]   "x": 566.5,
[exp]   "y": 246.5,
[exp] }
*/
  onTouchBegin = (touch) => {
  }

  onTouchMove = (touch) => {
  }

  onTouchEnd = (touch) => {
    if (!this._isJumping) {
      this._isJumping = true;
      let pan = new THREE.Vector2(touch.translationX, touch.translationY);
      pan.clampLength(-60, 60);
      pan.multiplyScalar(0.001);
      this._velocity.x = -pan.x;
      this._velocity.y = pan.y;
    }
  }

  _reset = () => {
    this._isJumping = true;
    this._velocity = new THREE.Vector2(0, 0);
    this._mesh.position.set(-1.5, 1.0, 10);
    this._isReady = true;
  }
}
