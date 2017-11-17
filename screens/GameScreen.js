import Expo from 'expo';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  PanGestureHandler,
  State,
} from 'react-native-gesture-handler';
import { connect } from 'react-redux';

import * as THREE from 'three';
import ExpoTHREE from 'expo-three';
import GameState from '../state/GameState';
import GameHUD from '../components/GameHUD';
import World from '../entities/World';

class GameScreen extends React.Component {
  render() {
    return (
      <PanGestureHandler
        id="pan"
        onGestureEvent={this._onPanGestureEvent}
        onHandlerStateChange={this._onPanGestureStateChange}>
        <View style={{flex: 1}}>
          <Expo.GLView
            style={styles.glContainer}
            onContextCreate={this._onGLContextCreate}
            />
          <GameHUD />
        </View>
      </PanGestureHandler>
    );
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hit && nextProps.hit > 0 && nextProps.hit !== this.props.hit) {
      if (GameState.world) {
        GameState.world.advanceLevel();
      }
    }
  }

  _onPanGestureEvent = event => {
    if (!event.nativeEvent) { return; }
    if (!GameState.world.player) { return; }
    
    GameState.world.player.onTouchMove(event.nativeEvent);
  }
  
  _onPanGestureStateChange = event => {
    if (!event.nativeEvent) { return; }
    if (!GameState.world.player) { return; }
    
    const { state } = event.nativeEvent;
    switch (state) {
    case State.ACTIVE:
      GameState.world.player.onTouchBegin(event.nativeEvent);
      break;
    case State.END: case State.CANCELLED:
      GameState.world.player.onTouchEnd(event.nativeEvent);
      break;
    default:
      break;
    }
  };

  _onGLContextCreate = async (glContext) => {
    this._glContext = glContext;
    await this._rebuildAsync();
    GameState.world = new World();
    
    let lastFrameTime;
    const render = () => {
      requestAnimationFrame(render);
      const now = 0.001 * global.nativePerformanceNow();
      const dt = typeof lastFrameTime !== "undefined" ? now - lastFrameTime : 0.16666;

      GameState.world.tick(dt);
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
    if (GameState.world) {
      GameState.world.destroy();
    }
  }
}

const styles = StyleSheet.create({
  glContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default connect((state) => ({ hit: state.hit }))(GameScreen);
