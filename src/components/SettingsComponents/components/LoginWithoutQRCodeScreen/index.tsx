import React, { useEffect } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import {
  devicePinSelector,
  deviceAuthenticatedErrorSelector,
} from '@services/store/auth/Selectors';
import { useAppDispatch, useAppSelector } from 'hooks/redux';
import { endLoginLoop, startLoginLoop } from 'services/store/auth/Slices';

export type TLoginScreenProps = {
  listItemGetNode?: () => number;
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const LoginWithoutQRCode: React.FC<TLoginScreenProps> = () => {
  const devicePin = useAppSelector(devicePinSelector);
  const dispatch = useAppDispatch();
  const deviceAuthenticatedError = useAppSelector(
    deviceAuthenticatedErrorSelector,
  );
  useEffect(() => {
    dispatch(startLoginLoop());
    return () => {
      dispatch(endLoginLoop());
    };
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <RohText style={styles.header}>to set-up your Royal Opera House Stream TV app</RohText>
        <View style={styles.websiteContainer}>
          <RohText style={styles.regular}>1. Go to www.rbo.org.uk/pin on a computer, tablet or mobile</RohText>
          <RohText style={styles.regular}>2. Enter the code below:</RohText>
        </View>
        <RohText style={styles.pin}>{devicePin || 'Pin not found'}</RohText>
        {/* TODO find a way to remove blink of Pin not found after log out */}
        <View style={styles.websiteContainer}>
          <RohText style={styles.regular}>3. Click 'Activate TV'</RohText>
          <View style={{flex: 1, flexDirection: 'row', maxWidth: '90%'}}>
            <RohText style={styles.regular}>4. </RohText>
            <RohText style={styles.regular}>Your TV app should now show our library of ballets and operas for you to enjoy</RohText>
          </View>
          <RohText style={styles.regular}>{deviceAuthenticatedError}</RohText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: scaleSize(60),
  },
  innerContainer: {
    alignItems: 'flex-start',
    flex: 2,
    marginBottom: scaleSize(60),
    marginLeft: scaleSize(75),
  },
  websiteContainer: {
    marginTop: scaleSize(0),
    alignItems: 'flex-start',
  },
  header: {
    color: Colors.midGrey,
    textTransform: 'uppercase',
    fontSize: scaleSize(52),
    textAlign: 'left',
    marginBottom: scaleSize(30),
  },
  blue: {
    color: Colors.defaultBlue,
    textTransform: 'uppercase',
    fontSize: scaleSize(26),
  },
  regular: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(28),
    marginBottom: scaleSize(40),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  address: {
    color: Colors.defaultTextColor,
    textTransform: 'uppercase',
    fontSize: scaleSize(38),
  },
  pin: {
    color: Colors.defaultTextColor,
    textTransform: 'uppercase',
    fontSize: scaleSize(90),
    alignItems: 'flex-start',
    paddingRight: scaleSize(100),
    marginBottom: scaleSize(40),
    marginLeft: scaleSize(30),
  },
});

export default LoginWithoutQRCode;
