import * as THREE from 'three';
import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import { PixelRatio } from 'react-native';
import GameState from '../state/GameState';
import TextureManager from '../assets/TextureManager';

const SCREEN_SCALE = PixelRatio.get();

export default class Arrow {
  constructor() {
    const scene = GameState.scene;

    // arrow length
    const geometry = new THREE.PlaneBufferGeometry(0.1, 0.02);
    this._material = new THREE.MeshBasicMaterial({
      map: TextureManager.get(TextureManager.GUIDE),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._material.opacity = 0;
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);

    // arrow head
    const headGeom = new THREE.PlaneBufferGeometry(0.08, 0.08);
    this._headMaterial = new THREE.MeshBasicMaterial({
      map: TextureManager.get(TextureManager.SCOPE),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._headMaterial.opacity = 0;
    this._headMesh = new THREE.Mesh(headGeom, this._headMaterial);
    scene.add(this._headMesh);
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
    scene.remove(this._headMesh);
  }

  getPanBounds = () => {
    const minPanLength = GameState.viewport.screenHeight * 0.15,
          maxPanLength = GameState.viewport.screenHeight * 0.4;
    return { minPanLength, maxPanLength };
  }

  onTouchBegin = (touch) => {
    const { x, y } = touch;
    const viewportCoords = this._toViewportCoords({ x, y });
    this._mesh.position.x = viewportCoords.x;
    this._mesh.position.y = viewportCoords.y;
    this._mesh.position.z = 99;
    this._headMesh.position.z = 99;
  }

  onTouchMove = (touch) => {
    const { translationX, translationY } = touch;
    const v = new THREE.Vector2(translationX, -translationY);
    this._mesh.rotation.z = v.angle();
    this._mesh.scale.x = v.length() * -0.1;
    const { minPanLength } = this.getPanBounds();
    if (v.length() * SCREEN_SCALE > minPanLength) {
      this._material.opacity = 1;
      this._headMaterial.opacity = 1;
      // 0.01 is the width of the body texture (0.1) * the constant in mesh.scale.x (0.1)
      this._headMesh.position.x = this._mesh.position.x + -v.x * (0.01 / SCREEN_SCALE);
      this._headMesh.position.y = this._mesh.position.y + -v.y * (0.01 / SCREEN_SCALE);
      this._headMesh.rotation.z = v.angle();
    } else {
      this._material.opacity = 0.4;
      this._headMaterial.opacity = 0;
    }
  }

  onTouchEnd = (touch) => {
    this._material.opacity = 0;
    this._headMaterial.opacity = 0;
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
