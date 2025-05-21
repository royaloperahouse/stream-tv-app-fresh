import React from 'react';
import { View, ImageBackground, StyleSheet } from 'react-native';
import { Colors, Images } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import IntroStreamLogoSvg from '@assets/svg/IntroStreamLogo.svg';
import LoadingSpinner from 'components/LoadingSpinner';

type TIntroScreenProps = {};

const IntroScreen: React.FC<TIntroScreenProps> = () => {
  return (
    <ImageBackground
      style={styles.containerBackground}
      source={Images.splashScreen}
    />
  );
};

const styles = StyleSheet.create({
  containerBackground: {
    flex: 1,
    resizeMode: 'cover',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.backgroundColorTransparent,
  },
  logo: {
    marginTop: scaleSize(186),
  },
  welcome: {
    marginTop: scaleSize(126),
    color: 'white',
    fontSize: scaleSize(38),
  },
  descriptionContainer: {
    marginTop: scaleSize(18),
  },
  description: {
    color: 'white',
    fontSize: scaleSize(72),
  },
  button: {
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.defaultBlue,
    width: scaleSize(445),
    height: scaleSize(84),
    marginTop: scaleSize(182),
    flexDirection: 'row',
  },
  buttonText: {
    color: 'white',
    fontSize: scaleSize(24),
  },
});

export default IntroScreen;
