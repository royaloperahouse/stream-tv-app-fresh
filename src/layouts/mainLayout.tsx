import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import WithLogo from '@components/WithLogo';
import WithBackground from '@components/WithBackground';
import RNBootSplash from 'react-native-bootsplash';
import NavigationContainer from '@navigations/navigationContainer';
import ContentLayout from '@layouts/contentLayout';
import RohText from '@components/RohText';
import { buildInfo } from '@configs/globalConfig';
import { scaleSize } from '@utils/scaleSize';
//import GlobalModal from '@components/GlobalModal';

type TMainLayoutProps = {};

const MainLayout: React.FC<TMainLayoutProps> = () => {
  return (
    <WithBackground>
      <WithLogo>
        <View style={styles.root}>
          <View style={styles.maninContentContainer}>
            <NavigationContainer
              onReady={React.useCallback(() => RNBootSplash.hide(), [])}>
              <ContentLayout />
            </NavigationContainer>
          </View>
          {/*           <GlobalModal /> */}
          {__DEV__ && (
            <View style={styles.buildInfo}>
              <RohText
                bold
                style={styles.buildInfoText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {buildInfo}
              </RohText>
            </View>
          )}
        </View>
      </WithLogo>
    </WithBackground>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  maninContentContainer: {
    width: Dimensions.get('screen').width,
    height: Dimensions.get('screen').height,
  },
  buildInfo: {
    position: 'absolute',
    top: scaleSize(10),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  buildInfoText: {
    color: 'white',
    fontSize: scaleSize(20),
  },
});

export default MainLayout;
