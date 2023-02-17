import React, { memo } from 'react';
import { View, Platform, Dimensions, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  //DrawerNavigationOptions,
} from '@react-navigation/drawer';
import {
  allRoutes,
  routes,
  additionalRoutesWithoutNavMenuNavigation,
} from '@navigations/routes';
import {
  rootStackScreensNames,
  contentScreenNames,
  NSNavigationScreensNames,
} from '@configs/screensConfig';
import type {
  TRootStackScreensParamList,
  TContentScreensParamList,
  TRootStackScreenProps,
} from '@configs/screensConfig';
import { useFeature } from 'flagged';
import NavMenu from 'components/NavMenu';
import { TNavMenuItem } from 'services/types/models';
import { useAppSelector } from 'hooks/redux';
import { deviceAuthenticatedSelector } from 'services/store/auth/Selectors';
const Drawer = createDrawerNavigator<TContentScreensParamList>();
const Stack = createNativeStackNavigator<TRootStackScreensParamList>();

type TContentLayoutProps = {};

const ContentLayout: React.FC<TContentLayoutProps> = () => {
  return (
    <Stack.Navigator
      screenListeners={{
        transitionStart: (...rest) => {
          console.log({
            name: `transitionStart ${Platform.OS}`,
            value: rest,
          });
        },
        transitionEnd: (...rest) => {
          console.log({
            name: `transitionEnd ${Platform.OS}`,
            value: rest,
          });
        },
        focus: (...rest) => {
          console.log({
            name: `focus ${Platform.OS}`,
            value: rest,
          });
        },
        blur: (...rest) => {
          console.log({
            name: `blur ${Platform.OS}`,
            value: rest,
          });
        },
        beforeRemove: (...rest) => {
          console.log({
            name: `beforeRemove ${Platform.OS}`,
            value: rest,
          });
        },
      }}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name={rootStackScreensNames.content}
        component={ContentScreen}
      />
      <Stack.Screen
        name={rootStackScreensNames.player}
        component={PlayerScreen}
      />
    </Stack.Navigator>
  );
};

const ContentScreen: React.MemoExoticComponent<
  React.FC<
    TRootStackScreenProps<NSNavigationScreensNames.RootStackScreens['content']>
  >
> = memo(() => {
  const isAuthenticated = useAppSelector(deviceAuthenticatedSelector);
  const showLiveStream = useFeature('showLiveStream');
  const initialRoute = allRoutes.find(route => route.isDefault);
  const routesForRenering = (
    showLiveStream
      ? routes
      : routes.filter(
          screen => screen.navMenuScreenName !== contentScreenNames.liveStream,
        )
  )
    .filter(
      screen =>
        isAuthenticated ||
        screen.navMenuScreenName !== contentScreenNames.myList,
    )
    .sort((a, b) => a.position - b.position)
    .map<TNavMenuItem>(route => ({
      navMenuScreenName: route.navMenuScreenName,
      SvgIconActiveComponent: route.SvgIconActiveComponent,
      SvgIconInActiveComponent: route.SvgIconInActiveComponent,
      navMenuTitle: route.navMenuTitle,
      position: route.position,
      isDefault: route.isDefault,
    }));
  return (
    <View style={styles.mainContentRoot}>
      <Drawer.Navigator
        drawerContent={(props: DrawerContentComponentProps) => (
          <NavMenu
            {...props}
            navMenuConfig={routesForRenering}
            exitButtonRouteName={
              additionalRoutesWithoutNavMenuNavigation.exit.navMenuScreenName
            }
          />
        )}
        screenListeners={{
          drawerItemPress: (...rest) => {
            console.log({
              name: `drawerItemPress ${Platform.OS}`,
              value: rest,
            });
          },
          focus: (...rest) => {
            console.log({
              name: `focus ${Platform.OS}`,
              value: rest,
            });
          },
          blur: (...rest) => {
            console.log({
              name: `blur ${Platform.OS}`,
              value: rest,
            });
          },
          beforeRemove: (...rest) => {
            console.log({
              name: `beforeRemove ${Platform.OS}`,
              value: rest,
            });
          },
          state: (...rest) => {
            console.log({
              name: `state ${Platform.OS}`,
              value: rest,
            });
          },
        }}
        initialRouteName={initialRoute?.navMenuScreenName}
        defaultStatus="open"
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          drawerType: 'permanent', //'slide',
          drawerHideStatusBarOnOpen: true,
          swipeEnabled: false,
          drawerStyle: {
            backgroundColor: 'transperent',
            borderWidth: 0,
            borderRightColor: 'transperent',
            width: 'auto',
            maxWidth: 'auto',
            borderRightWidth: 0,
          },
        }}>
        {allRoutes.map(screen => (
          <Drawer.Screen
            key={screen.navMenuScreenName}
            navigationKey={screen.navMenuScreenName}
            name={screen.navMenuScreenName}
            component={screen.ScreenComponent}
            initialParams={screen.initialParams}
            options={{
              unmountOnBlur: true,
            }}
          />
        ))}
      </Drawer.Navigator>
    </View>
  );
});

const PlayerScreen: React.FC<
  TRootStackScreenProps<NSNavigationScreensNames.RootStackScreens['player']>
> = () => {
  return <View style={styles.playerContentContainer} />;
};

export default ContentLayout;

const styles = StyleSheet.create({
  mainContentRoot: {
    flexDirection: 'row',
    height: Dimensions.get('window').height,
  },
  playerContentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
