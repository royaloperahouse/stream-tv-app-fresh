import React from 'react';
import { View, StyleSheet } from 'react-native';

export const DummyPlayerScreen = () => <View style={styles.root} />;
export const DummyPlayerScreenName = 'DummyPlayerScreen';
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
  },
});
