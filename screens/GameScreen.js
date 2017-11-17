import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';

import * as THREE from 'three';
import ExpoTHREE from 'expo-three';

export default class GameScreen extends React.Component {
  render() {
    return (
      <Expo.GLView
        style={{ flex: 1 }}
        onContextCreate={this._onGLContextCreate}
      />
    );
  }

  _onGLContextCreate = async (glContext) => {
    this._glContext = glContext;
    await this._rebuildAsync();
    const render = () => {
      requestAnimationFrame(render);

      this._renderer.render(this._scene, this._camera);

      this._glContext.endFrameEXP();
    }
    render();
  }

  _rebuildAsync = async () => {
    const gl = this._glContext;
    this._scene = new THREE.Scene();
    
    const { camera, viewport } = this._buildCameraAndViewport(gl);
    this._camera = camera;
    this._viewport = viewport;
    
    this._renderer = ExpoTHREE.createRenderer({ gl });
    this._renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({
      map: await ExpoTHREE.createTextureAsync({
        asset: Expo.Asset.fromModule(require('../assets/icon.png')),
      }),
    });
    const cube = new THREE.Mesh(geometry, material);
    this._scene.add(cube);
  }

  _buildCameraAndViewport = (glContext) => {
    let width, height, camera;
    const screenWidth = glContext.drawingBufferWidth,
          screenHeight = glContext.drawingBufferHeight;
    if (screenWidth > screenHeight) {
      width = 4;
      height = (screenHeight / screenWidth) * width;
      camera = new THREE.OrthographicCamera(
        -width / 2, width / 2,
        height / 2, -height / 2,
        1, 10000,
      );
    } else {
      width = 4;
      height = (screenWidth / screenHeight) * width;
      camera = new THREE.OrthographicCamera(
        -width / 2, width / 2,
        height / 2, -height / 2,
        1, 10000,
      );
    }
    camera.position.z = 1000;
    const viewport = {
      width,
      height,
      screenWidth: (screenWidth > screenHeight) ? screenWidth : screenHeight,
      screenHeight: (screenWidth > screenHeight) ? screenHeight : screenWidth,
    };
    return { camera, viewport };
  }
}
