import React, { memo, useEffect, useLayoutEffect } from 'react';
import {
  View,
  TouchableHighlight,
  Text,
  Platform,
  Dimensions,
} from 'react-native';
import RohText from '@components/RohText';
import StreamLogo from '@assets/svg/StreamLogo.svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { isTVOS } from 'configs/globalConfig';
import {
  createDrawerNavigator,
  DrawerNavigationOptions,
} from '@react-navigation/drawer';
import { allRoutes, mainRoutes, routes } from '@navigations/routes';
import type {
  TContentRoutesParamList,
  TMainRoutesParamList,
} from '@navigations/routes';
import { useFeature } from 'flagged';
import NavMenu from 'components/NavMenu';
const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

type TContentLayoutProps = {};

const ContentLayout: React.FC<TContentLayoutProps> = () => {
  const showLiveStream = useFeature('showLiveStream');
  const initialRoute = allRoutes.find(
    route => route.isDefault,
  )?.navMenuScreenName;
  return (
    <Stack.Navigator
      screenListeners={{
        transitionStart: (...rest) => {
          global.roh_rlog({
            name: `transitionStart ${Platform.OS}`,
            value: rest,
          });
        },
        transitionEnd: (...rest) => {
          global.roh_rlog({
            name: `transitionEnd ${Platform.OS}`,
            value: rest,
          });
        },
        focus: (...rest) => {
          global.roh_rlog({
            name: `focus ${Platform.OS}`,
            value: rest,
          });
        },
        blur: (...rest) => {
          global.roh_rlog({
            name: `blur ${Platform.OS}`,
            value: rest,
          });
        },
        beforeRemove: (...rest) => {
          global.roh_rlog({
            name: `beforeRemove ${Platform.OS}`,
            value: rest,
          });
        },
      }}
      //initialRouteName="Player"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Content"
        component={ContentScreen}
        initialParams={{ fromHome: false }}
      />
      <Stack.Screen name="Player" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

const ContentScreen: React.MemoExoticComponent<
  React.FC<NativeStackScreenProps<TMainRoutesParamList, 'Content'>>
> = memo(() => {
  const showLiveStream = useFeature('showLiveStream');
  const initialRoute = allRoutes.find(
    route => route.isDefault,
  )?.navMenuScreenName;
  const routesForRenering = (
    showLiveStream
      ? routes
      : routes.filter(screen => screen.navMenuScreenName !== 'LiveStream')
  )
    .sort((a, b) => a.position - b.position)
    .map(route => ({
      navMenuScreenName: route.navMenuScreenName,
      SvgIconActiveComponent: route.SvgIconActiveComponent,
      SvgIconInActiveComponent: route.SvgIconInActiveComponent,
      navMenuTitle: route.navMenuTitle,
      position: route.position,
      isDefault: route.isDefault,
    }));
  return (
    <View
      style={{ flexDirection: 'row', height: Dimensions.get('window').height }}>
      <NavMenu navMenuConfig={routesForRenering} />
      <Drawer.Navigator
        screenListeners={{
          drawerItemPress: (...rest) => {
            global.roh_rlog({
              name: `drawerItemPress ${Platform.OS}`,
              value: rest,
            });
          },
          focus: (...rest) => {
            global.roh_rlog({
              name: `focus ${Platform.OS}`,
              value: rest,
            });
          },
          blur: (...rest) => {
            global.roh_rlog({
              name: `blur ${Platform.OS}`,
              value: rest,
            });
          },
          beforeRemove: (...rest) => {
            global.roh_rlog({
              name: `beforeRemove ${Platform.OS}`,
              value: rest,
            });
          },
          state: (...rest) => {
            global.roh_rlog({
              name: `state ${Platform.OS}`,
              value: rest,
            });
          },
        }}
        initialRouteName={initialRoute}
        defaultStatus="closed"
        backBehavior="none"
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          drawerType: 'slide', //,'permanent',
          overlayColor: 'transparent',
          drawerHideStatusBarOnOpen: true,
          swipeEnabled: false,
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
              drawerLabel: screen?.navMenuTitle || '',
            }}
          />
        ))}
      </Drawer.Navigator>
    </View>
  );
});

const DetailsScreen: React.FC<
  NativeStackScreenProps<
    { Home: undefined; Details: undefined; Settings: undefined },
    'Details'
  >
> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        hasTVPreferredFocus={true}
        underlayColor="red"
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <View>
          <View>
            <StreamLogo width={300} height={300} />
          </View>
          <View>
            <RohText style={{ color: 'white' }}>Details Screen</RohText>
          </View>
          <View>
            <Text style={{ color: 'white' }}>Details Screen</Text>
          </View>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor="green"
        onPress={() => {
          navigation.navigate('Settings');
        }}>
        <View>
          <RohText style={{ color: 'white' }}>Settings Text</RohText>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const SettingsScreen: React.FC<
  NativeStackScreenProps<
    { Home: undefined; Details: undefined; Settings: undefined },
    'Settings'
  >
> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        hasTVPreferredFocus={true}
        underlayColor="red"
        onPress={() => {
          navigation.navigate('Details');
        }}>
        <View>
          <View>
            <StreamLogo width={300} height={300} />
          </View>
          <View>
            <RohText style={{ color: 'white' }}>Details Screen</RohText>
          </View>
          <View>
            <Text style={{ color: 'white' }}>Details Screen</Text>
          </View>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor="green"
        onPress={() => {
          navigation.navigate('Home', { fromHome: true });
        }}>
        <View>
          <RohText style={{ color: 'white' }}>Home screen</RohText>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const HomeScreen: React.FC<
  NativeStackScreenProps<
    { Home: undefined; Details: undefined; Settings: undefined },
    'Home'
  >
> = ({ navigation, route }) => {
  const defRef = React.useRef<TouchableHighlight>(null);
  useIsFocused();
  useLayoutEffect(() => {
    if (isTVOS) {
      defRef.current?.setNativeProps({ hasTVPreferredFocus: true });
    }
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      if (route.params?.fromHome) {
        defRef.current?.setNativeProps({ hasTVPreferredFocus: true });
      }
    }, [route.params?.fromHome]),
  );
  const offset = useSharedValue(0);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value * 255 }],
    };
  });
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          {
            width: 100,
            height: 80,
            margin: 30,
            backgroundColor: '#ffff',
          },
          animatedStyles,
        ]}
      />
      <TouchableHighlight
        underlayColor="red"
        onPress={() => (offset.value = withSpring(Math.random()))}>
        <View>
          <Text style={{ color: 'white' }}>Animated</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor="red"
        hasTVPreferredFocus={true}
        ref={defRef}
        onPress={() => {
          navigation.navigate('Details');
        }}>
        <View>
          <Text style={{ color: 'white' }}>Home Screen</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default ContentLayout;

const Menu = () => {
  global.roh_rlog({ name: 'mount' });
  const [load, setLoad] = React.useState(false);
  useEffect(() => {
    setTimeout(() => {
      setLoad(true);
    }, 1000);
  }, []);
  if (!load) {
    return null;
  }
  return (
    <View
      style={{
        height: Dimensions.get('screen').height,
        width: 100,
        justifyContent: 'center',
      }}>
      <TouchableHighlight
        //accessible={false}
        underlayColor="red"
        onFocus={() => console.log('inFocus ' + Platform.OS)}
        onBlur={() => console.log('inBlur ' + Platform.OS)}>
        <Text style={{ color: 'white' }}>MenuItem</Text>
      </TouchableHighlight>
    </View>
  );
};

/*
  <View style={styles.root}>
      <Stack.Navigator
        initialRouteName={initialRoute?.navMenuScreenName}
        detachInactiveScreens={true}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animationEnabled: false,
          detachPreviousScreen: true,
        }}>
        {allRoutes
          .filter(route => {
            if (showLiveStream) {
              return true;
            }
            return route.navMenuScreenName !== 'liveStream';
          })
          .map(route => (
            <Stack.Screen
              key={route.navMenuScreenName}
              name={route.navMenuScreenName}
              component={route.ScreenComponent}
            />
          ))}
      </Stack.Navigator>
    </View>
  );
};


    transitionStart: EventListenerCallback<NativeStackNavigationEventMap, "transitionStart">;
    transitionEnd: EventListenerCallback<NativeStackNavigationEventMap, "transitionEnd">;
    focus: EventListenerCallback<...>;
    blur: EventListenerCallback<...>;
    state: EventListenerCallback<...>;
    beforeRemove: EventListenerCallback<...>;



*/
