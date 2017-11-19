import Expo from 'expo';
import ExpoTHREE from 'expo-three';

class TextureManager {
  DOLPHIN = 'dolphin';
  GUIDE = 'guide';
  SCOPE = 'scope';
  
  loadAsync = async () => {
    this._textures = {};
    this._textures[this.DOLPHIN] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/dolphin.png')),
    });
    this._textures[this.GUIDE] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/guide.png')),
    });
    this._textures[this.SCOPE] = await ExpoTHREE.createTextureAsync({
      asset: Expo.Asset.fromModule(require('../assets/scope.png')),
    });
    return;
  }

  get = (id) => {
    return this._textures[id];
  }
}

export default new TextureManager();
