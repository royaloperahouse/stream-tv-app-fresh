import React from 'react';
import {
  View,
  ImageBackground,
  StyleSheet,
  TouchableHighlight,
} from 'react-native';
import { useAppDispatch } from '@hooks/redux';
import { Colors, Images } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import {
  startLoginLoop,
  switchOffIntroScreen,
} from '@services/store/auth/Slices';
import IntroStreamLogoSvg from '@assets/svg/IntroStreamLogo.svg';

type TIntroScreenProps = {};

const IntroScreen: React.FC<TIntroScreenProps> = () => {
  const dispatch = useAppDispatch();
  const getStarted = () => {
    dispatch(switchOffIntroScreen());
    dispatch(startLoginLoop());
  };
  return (
    <ImageBackground
      style={styles.containerBackground}
      source={Images.introBackground}>
      <View style={styles.container}>
        <IntroStreamLogoSvg
          style={styles.logo}
          width={scaleSize(520)}
          height={scaleSize(142)}
        />
        <RohText style={styles.welcome}>Welcome to ROH Stream</RohText>
        <View style={styles.descriptionContainer}>
          <RohText style={styles.description}>
            Unlimited access to our rich
          </RohText>
          <RohText style={styles.description}>
            library of opera and ballet
          </RohText>
        </View>
        <TouchableHighlight
          onPress={getStarted}
          underlayColor={styles.button.backgroundColor}
          style={styles.button}
          hasTVPreferredFocus>
          <RohText style={styles.buttonText}>Get started</RohText>
        </TouchableHighlight>
      </View>
    </ImageBackground>
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
    textTransform: 'uppercase',
    fontSize: scaleSize(38),
  },
  descriptionContainer: {
    marginTop: scaleSize(18),
  },
  description: {
    color: 'white',
    textTransform: 'uppercase',
    fontSize: scaleSize(72),
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.defaultBlue,
    width: scaleSize(445),
    height: scaleSize(84),
    marginTop: scaleSize(182),
  },
  buttonText: {
    color: 'white',
    fontSize: scaleSize(24),
  },
});

export default IntroScreen;
