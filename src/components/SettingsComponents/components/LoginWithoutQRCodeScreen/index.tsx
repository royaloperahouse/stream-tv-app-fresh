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
        <RohText style={styles.header}>Follow these steps on your</RohText>
        <RohText style={styles.header}>Computer, tablet or mobile</RohText>
        <View style={styles.websiteContainer}>
          <View style={styles.addressContainer}>
            <RohText style={styles.regular}>Go to: </RohText>
            <RohText style={styles.address}>WWW.ROH.ORG.UK/PIN</RohText>
          </View>
          <RohText style={styles.regular}>
            Then enter the activation code when prompted
          </RohText>

          <RohText style={styles.pin}>{devicePin || 'Pin not found'}</RohText>
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
    alignItems: 'center',
  },
  innerContainer: {
    alignItems: 'center',
    flex: 2,
  },
  websiteContainer: {
    marginTop: scaleSize(60),
    alignItems: 'center',
  },
  header: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: scaleSize(54),
  },
  blue: {
    color: Colors.defaultBlue,
    textTransform: 'uppercase',
    fontSize: scaleSize(26),
  },
  regular: {
    color: 'white',
    fontSize: scaleSize(32),
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: scaleSize(20),
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
  },
});

export default LoginWithoutQRCode;
