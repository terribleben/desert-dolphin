
import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import GameState from '../state/GameState';
import * as THREE from 'three';

export default class Loser {
  constructor(position, rotation) {
    this._buildMeshAsync(position, rotation);
  }

  updateXPosition = (x) => {
    this._mesh.position.x += x;
  }

  _buildMeshAsync = async (position, rotation) => {
    const scene = GameState.scene;
    const geometry = new THREE.PlaneBufferGeometry(0.15, 0.15);
    this._material = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/dolphin.png')),
      }),
      transparent: true,
      side: THREE.DoubleSide,
    });
    this._mesh = new THREE.Mesh(geometry, this._material);
    scene.add(this._mesh);
    this._mesh.position.x = position.x;
    this._mesh.position.y = position.y;
    this._mesh.position.z = -0.5;
    this._mesh.rotation.z = rotation;
  }

  destroy = () => {
    const scene = GameState.scene;
    scene.remove(this._mesh);
  }
}