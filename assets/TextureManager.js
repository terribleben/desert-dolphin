import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import * as THREE from 'three';

class TextureManager {
  DOLPHIN = 'dolphin';
  GUIDE = 'guide';
  SCOPE = 'scope';
  LOSER = 'loser';
  
  loadAsync = async () => {
    this._textures = {};
    this._materials = {};
    
    this._textures[this.DOLPHIN] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/dolphin.png')),
    });
    this._textures[this.GUIDE] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/guide.png')),
    });
    this._textures[this.SCOPE] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/scope.png')),
    });

    this._materials[this.LOSER] = new THREE.MeshBasicMaterial({
      map: this.get(this.DOLPHIN),
      transparent: true,
    });
    return;
  }

  get = (id) => {
    return this._textures[id];
  }

  getMaterial = (id) => {
    return this._materials[id];
  }
}

export default new TextureManager();
