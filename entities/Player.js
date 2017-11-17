
import * as THREE from 'three';
import GameState from '../state/GameState';

export default class Player {
  constructor() {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.05, 0.05);
    this._material = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);

    this._reset();
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  tick = (dt) => {
    if (this._isJumping) {
      this._velocity.y -= 0.1 * dt;
    }
    this._mesh.position.x += this._velocity.x;
    this._mesh.position.y += this._velocity.y;

    if (this._mesh.position.y < GameState.viewport.height * -0.5) {
      this._reset();
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
    this._isJumping = false;
    this._velocity = new THREE.Vector2(0, 0);
    this._mesh.position.set(-1.0, 0, 10);
  }
}
