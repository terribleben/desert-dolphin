import Expo from 'expo';
import ExpoTHREE from 'expo-three';
import * as THREE from 'three';

class TextureManager {
  // textures
  DOLPHIN = 'dolphin';
  GUIDE = 'guide';
  SCOPE = 'scope';
  LOSER = 'loser';
  PARTICLE = 'particle';

  // materials
  PARTICLE_DUST = 'particle_dust';
  PARTICLE_WATER = 'particle_water';
  
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
    this._textures[this.PARTICLE] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/particle.png')),
    });

    this._materials[this.LOSER] = new THREE.MeshBasicMaterial({
      map: this.get(this.DOLPHIN),
      transparent: true,
    });
    this._materials[this.PARTICLE_DUST] = new THREE.MeshBasicMaterial({
      map: this.get(this.PARTICLE),
      transparent: true,
      color: 0xe28631,
    });
    this._materials[this.PARTICLE_WATER] = new THREE.MeshBasicMaterial({
      map: this.get(this.PARTICLE),
      transparent: true,
      color: 0x5b9190,
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
