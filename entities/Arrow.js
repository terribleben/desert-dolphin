import * as THREE from 'three';
import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import { PixelRatio } from 'react-native';
import GameState from '../state/GameState';

const SCREEN_SCALE = PixelRatio.get();

export default class Arrow {
  constructor() {
    this._buildMeshAsync();
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }

  onTouchBegin = (touch) => {
    this._material.opacity = 1;
    const { x, y } = touch;
    const viewportCoords = this._toViewportCoords({ x, y });
    this._mesh.position.x = viewportCoords.x;
    this._mesh.position.y = viewportCoords.y;
  }

  onTouchMove = (touch) => {
    const { translationX, translationY } = touch;
    const v = new THREE.Vector2(translationX, -translationY);
    this._mesh.rotation.z = v.angle();
    this._mesh.scale.x = v.length() * -0.1;
  }

  onTouchEnd = (touch) => {
    this._material.opacity = 0;
  }

  _buildMeshAsync = async () => {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.1, 0.02);
    this._material = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/guide.png')),
      }),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._material.opacity = 0;
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);
  }

  _toViewportCoords = (screenCoords) => {
    const viewport = GameState.viewport;
    screenCoords.x *= SCREEN_SCALE;
    screenCoords.y *= SCREEN_SCALE;
    return {
      x: ((screenCoords.x / viewport.screenWidth) * viewport.width) - viewport.width * 0.5,
      y: -1 * (((screenCoords.y / viewport.screenHeight) * viewport.height) - viewport.height * 0.5),
    };
  }
}
