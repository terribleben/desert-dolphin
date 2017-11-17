import React from 'react';

import GameScreen from './screens/GameScreen';

export default class App extends React.Component {
  componentWillMount() {
    console.disableYellowBox = true;
  }
  
  render() {
    return (
      <GameScreen />
    );
  }
}
