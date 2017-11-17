import React from 'react';
import { StatusBar, View } from 'react-native';
import GameScreen from './screens/GameScreen';

export default class App extends React.Component {
  componentWillMount() {
    console.disableYellowBox = true;
  }
  
  render() {
    return (
      <View style={{flex: 1}}>
        <StatusBar hidden={true} />
        <GameScreen />
      </View>
    );
  }
}
