import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useAppSelector } from '@hooks/redux';
import { userEmailSelector } from '@services/store/auth/Selectors';

export type TAccountProps = {};

const Account: React.FC<TAccountProps> = () => {
  const userEmail: string = useAppSelector(userEmailSelector);
  return (
    <View style={styles.root}>
      <View style={styles.titleContainer}>
        <RohText style={styles.titleText}>Account email address</RohText>
      </View>
      <View style={styles.userEmailContainer}>
        <RohText style={styles.userEmailText}>{userEmail}</RohText>
      </View>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: scaleSize(42),
    marginLeft: scaleSize(80),
    marginRight: scaleSize(338),
  },
  titleContainer: {
    marginBottom: scaleSize(54),
  },
  titleText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.midGrey,
  },
  userEmailContainer: {
    minHeight: scaleSize(80),
    minWidth: scaleSize(486),
    backgroundColor: Colors.displayBackgroundColor,
    justifyContent: 'center',
    paddingLeft: scaleSize(24),
  },
  userEmailText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
    opacity: 1,
  },
});
