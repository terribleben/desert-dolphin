import React from 'react';
import { StatusBar, View } from 'react-native';
import GameScreen from './screens/GameScreen';
import { Provider } from 'react-redux';
import Store from './redux/Store';

export default class App extends React.Component {
  componentWillMount() {
    const oldWarn = console.warn;
    console.warn = (str) => {
      if (str.indexOf('THREE') !== -1) {
        // don't provide stack traces for warnspew from THREE
        console.log('Warning:', str);
        return;
      }
      return oldWarn.apply(console, [str]);
    }
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
