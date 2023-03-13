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
        <RohText style={styles.header}>To set up your Royal Opera House Stream TV app</RohText>
        <View style={styles.websiteContainer}>
          <RohText style={styles.regular}>1. Go to www.roh.org.uk/pin on a computer, tablet or mobile</RohText>
          <RohText style={styles.regular}>2. Enter the code below:</RohText>
        </View>
        <RohText style={styles.pin}>{devicePin || 'Pin not found'}</RohText>
        <View style={styles.websiteContainer}>
          <RohText style={styles.regular}>3. Click 'Activate TV'</RohText>
          <RohText style={styles.regular}>4. Your TV app should now show our library of ballets and operas for you to enjoy</RohText>
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
    alignItems: 'center',
    flex: 2,
    marginBottom: scaleSize(60)
  },
  websiteContainer: {
    marginTop: scaleSize(0),
    alignItems: 'flex-start',
  },
  header: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: scaleSize(54),
    textAlign: 'center',
    marginBottom: scaleSize(60),
  },
  blue: {
    color: Colors.defaultBlue,
    textTransform: 'uppercase',
    fontSize: scaleSize(26),
  },
  regular: {
    color: 'white',
    fontSize: scaleSize(32),
    marginBottom: scaleSize(15),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  address: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: scaleSize(38),
  },
  pin: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: scaleSize(120),
    alignItems: 'center',
    paddingRight: scaleSize(100),
    marginBottom: scaleSize(15),
  },
});

export default LoginWithoutQRCode;
