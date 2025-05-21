import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, FlatList } from 'react-native';
import RohText from '@components/RohText';
import { scaleSize } from '@utils/scaleSize';
import { Colors } from '@themes/Styleguide';
import getCollectionOfSettingsSections, {
  settingsTitle,
  getSettingsSectionsConfig,
} from '@configs/settingsConfig';
import { SettingsNavMenuItem } from '@components/SettingsComponents';
import {
  widthWithOutFocus,
  marginRightWithOutFocus,
  marginLeftStop,
} from '@configs/navMenuConfig';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';
import type {
  TContentScreensProps,
  NSNavigationScreensNames,
} from '@configs/screensConfig';
import { useAppSelector } from 'hooks/redux';
import { deviceAuthenticatedSelector } from 'services/store/auth/Selectors';
import { navMenuManager } from "components/NavMenu";

const settingsItemKey = 'settingsItemKey';

const SettingsScreen: React.FC<
  TContentScreensProps<NSNavigationScreensNames.ContentStackScreens['settings']>
> = ({ route }) => {
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  const [activeContentKey, setActiveContentKey] = useState<string>(
    route.params?.pinPage ? 'pinPage' : '',
  );

  if (activeContentKey === 'pinPage') {
    navMenuManager.unlockNavMenu();
  }

  const activeItemRef = useRef<TTouchableHighlightWrapperRef>();
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const contentFactory = (contentKey: string) => {
    if (
      !contentKey ||
      !(contentKey in getSettingsSectionsConfig(isAuthenticated)) ||
      typeof getSettingsSectionsConfig(isAuthenticated)[contentKey]
        .ContentComponent !== 'function'
    ) {
      return View;
    }
    return getSettingsSectionsConfig(isAuthenticated)[contentKey]
      .ContentComponent;
  };
  const Content = contentFactory(activeContentKey);

  const [preferredFocus, setPreferredFocus] = useState(false);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  useEffect(() => {
    if (!isFirstLaunch) {
      setPreferredFocus(true);
    }
    setIsFirstLaunch(false);
  }, [isAuthenticated]);
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect
        screenName={route.name}
        ref={navMenuScreenRedirectRef}
      />
      <View style={styles.mainContainer}>
        <View style={styles.navMenuContainer}>
          <RohText style={styles.pageTitle}>{settingsTitle}</RohText>
          <FlatList
            data={getCollectionOfSettingsSections(isAuthenticated)}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <SettingsNavMenuItem
                id={item.key}
                isFirst={index === 0}
                isActive={item.key === activeContentKey}
                hasTVPreferredFocus={
                  (route.params?.pinPage && item.key === 'pinPage') || (index === 0 && preferredFocus)
                }
                title={item.navMenuItemTitle}
                canMoveDown={
                  index !==
                  getCollectionOfSettingsSections(isAuthenticated).length - 1
                }
                canMoveUp={index !== 0}
                onFocus={touchableRef => {
                  if (touchableRef.current?.getRef?.().current) {
                    navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
                      settingsItemKey,
                      touchableRef.current.getRef().current,
                    );
                  }
                  activeItemRef.current = touchableRef.current;
                  setActiveContentKey(item.key);
                }}
                onMount={touchableRef => {
                  navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
                    settingsItemKey,
                    touchableRef,
                  );
                }}
              />
            )}
          />
        </View>
        <View style={styles.contentContainer}>
          <Content listItemGetRef={activeItemRef.current?.getRef} />
        </View>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  root: {
    height: Dimensions.get('window').height,
    flexDirection: 'row',
    flex: 1,
  },
  mainContainer: {
    paddingTop: scaleSize(160),
    flexDirection: 'row',
    flex: 1,
    height: '100%',
    paddingRight: scaleSize(80),
  },
  navMenuContainer: {
    width: scaleSize(486),
    height: '100%',
  },
  pageTitle: {
    color: Colors.defaultTextColor,
    fontSize: scaleSize(48),
    marginBottom: scaleSize(24),
  },
  contentContainer: {
    flex: 1,
  },
});

export default SettingsScreen;
