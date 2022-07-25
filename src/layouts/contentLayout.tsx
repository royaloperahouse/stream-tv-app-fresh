import React from 'react';
import { View, TouchableHighlight, Text } from 'react-native';
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
//import { allRoutes } from '@navigations/routes';
//import { useFeature } from 'flagged';
const Stack = createNativeStackNavigator();

type TContentLayoutProps = {};

const ContentLayout: React.FC<TContentLayoutProps> = () => {
  //const showLiveStream = useFeature('showLiveStream');
  //const initialRoute = allRoutes.find(route => route.isDefault);
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

const DetailsScreen: React.FC<
  NativeStackScreenProps<{ Home: undefined; Details: undefined }, 'Details'>
> = ({ navigation }) => {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        hasTVPreferredFocus={true}
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <View>
          <View>
            <StreamLogo width={300} height={300} />
          </View>
          <View>
            <RohText>Details Screen</RohText>
          </View>
          <View>
            <Text>Details Screen</Text>
          </View>
        </View>
      </TouchableHighlight>
    </View>
  );
};

const HomeScreen: React.FC<
  NativeStackScreenProps<{ Home: undefined; Details: undefined }, 'Home'>
> = ({ navigation }) => {
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
        underlayColor="#ffff"
        onPress={() => (offset.value = withSpring(Math.random()))}>
        <View>
          <Text>Animated</Text>
        </View>
      </TouchableHighlight>
      <TouchableHighlight
        underlayColor="#ffff"
        hasTVPreferredFocus={true}
        onPress={() => {
          navigation.navigate('Details');
        }}>
        <View>
          <Text>Home Screen</Text>
        </View>
      </TouchableHighlight>
    </View>
  );
};

export default ContentLayout;

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

*/
