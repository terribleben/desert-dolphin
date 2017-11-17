import Expo from 'expo';
import React from 'react';
import { View } from 'react-native';
import {
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';

import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import GameState from '../state/GameState';
import Terrain from '../entities/Terrain';
import Player from '../entities/Player';

export default class GameScreen extends React.Component {
  render() {
    return (
      <PanGestureHandler
        id="pan"
        onGestureEvent={this._onPanGestureEvent}
        onHandlerStateChange={this._onPanGestureStateChange}>
        <Expo.GLView
          style={{ flex: 1 }}
          onContextCreate={this._onGLContextCreate}
          />
      </PanGestureHandler>
    );
  }

  _onPanGestureEvent = event => {
    if (!event.nativeEvent) { return; }
    if (!GameState.player) { return; }
    
    GameState.player.onTouchMove(event.nativeEvent);
  }
  
  _onPanGestureStateChange = event => {
    if (!event.nativeEvent) { return; }
    if (!GameState.player) { return; }
    
    const { state } = event.nativeEvent;
    switch (state) {
    case State.ACTIVE:
      GameState.player.onTouchBegin(event.nativeEvent);
      break;
    case State.END: case State.CANCELLED:
      GameState.player.onTouchEnd(event.nativeEvent);
      break;
    default:
      break;
    }
  };

  _onGLContextCreate = async (glContext) => {
    this._glContext = glContext;
    await this._rebuildAsync();

    // TODO: kill me
    const geometry = new THREE.PlaneBufferGeometry(GameState.viewport.width, GameState.viewport.height);
    const bgMaterial = new THREE.MeshBasicMaterial( { color: 0xddac67 } );
    const bgMesh = new THREE.Mesh(geometry, bgMaterial);
    GameState.scene.add(bgMesh);
    GameState.terrain = new Terrain();
    GameState.player = new Player();

    let lastFrameTime;
    const render = () => {
      requestAnimationFrame(render);
      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== "undefined" ? now - lastFrameTime : 0.16666;

      GameState.player.tick(dt);
      this._renderer.render(GameState.scene, GameState.camera);

      this._glContext.endFrameEXP();
      lastFrameTime = now;
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
    if (GameState.terrain) {
      GameState.terrain.destroy();
      GameState.terrain = null;
    }
    if (GameState.player) {
      GameState.player.destroy();
      GameState.player = null;
    }
  }
}
