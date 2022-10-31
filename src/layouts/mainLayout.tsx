import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, TVEventControl } from 'react-native';
import WithLogo from '@components/WithLogo';
import WithBackground from '@components/WithBackground';
import RNBootSplash from 'react-native-bootsplash';
import NavigationContainer from '@navigations/navigationContainer';
import ContentLayout from '@layouts/contentLayout';
import RohText from '@components/RohText';
import { buildInfo, isTVOS } from '@configs/globalConfig';
import { scaleSize } from '@utils/scaleSize';
import { NavMenuNodesRefsProvider } from '@components/NavMenu/components/ContextProvider';
import GlobalModal from '@components/GlobalModals';
import { FocusManager } from 'services/focusService/focusManager';

type TMainLayoutProps = {};

const MainLayout: React.FC<TMainLayoutProps> = () => {
  useEffect(() => {
    if (isTVOS) {
      TVEventControl.enableTVMenuKey();
    }
    FocusManager.init();
    return () => {
      if (isTVOS) {
        TVEventControl.disableTVMenuKey();
      }
    };
  }, []);
  return (
    <WithBackground>
      <WithLogo>
        <NavMenuNodesRefsProvider>
          <View style={styles.root}>
            <View style={styles.maninContentContainer}>
              <NavigationContainer
                onReady={React.useCallback(() => RNBootSplash.hide(), [])}>
                <ContentLayout />
              </NavigationContainer>
            </View>
            <GlobalModal />
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
        </NavMenuNodesRefsProvider>
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
