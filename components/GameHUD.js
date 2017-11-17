import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { connect } from 'react-redux';

class GameHUD extends React.Component {
  render() {
    return (<Text style={styles.score}>{this.props.strokes}</Text>);
  }
}

const styles = StyleSheet.create({
  score: {
    backgroundColor: 'transparent',
    padding: 4,
    fontSize: 12,
  },
});

export default connect((state) => ({ strokes: state.strokes }))(GameHUD);
