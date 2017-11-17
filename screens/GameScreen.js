import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';

import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import GameState from '../state/GameState';
import Terrain from '../entities/Terrain';

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

    // TODO: kill me
    const geometry = new THREE.PlaneBufferGeometry(GameState.viewport.width, GameState.viewport.height);
    const bgMaterial = new THREE.MeshBasicMaterial( { color: 0xddac67 } );
    const bgMesh = new THREE.Mesh(geometry, bgMaterial);
    GameState.scene.add(bgMesh);
    this._terrain = new Terrain();
    
    const render = () => {
      requestAnimationFrame(render);

      this._renderer.render(GameState.scene, GameState.camera);

      this._glContext.endFrameEXP();
    }
    render();
  }

  _rebuildAsync = async () => {
    this._destroy();
    
    const gl = this._glContext;
    GameState.scene = new THREE.Scene();
    const { camera, viewport } = this._buildCameraAndViewport(gl);
    GameState.camera = camera;
    GameState.viewport = viewport;
    this._renderer = ExpoTHREE.createRenderer({ gl });
    this._renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);
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

  _destroy = () => {
    if (this._terrain) {
      this._terrain.destroy();
      this._terrain = null;
    }
  }
}
