import React from 'react';
import { StatusBar, View } from 'react-native';
import GameScreen from './screens/GameScreen';
import { Provider } from 'react-redux';
import Store from './redux/Store';

export default class App extends React.Component {
  componentWillMount() {
    console.disableYellowBox = true;
  }
  
  render() {
    return (
      <Provider store={Store}>
        <View style={{flex: 1}}>
          <StatusBar hidden={true} />
          <GameScreen />
        </View>
      </Provider>
    );
  }
}
