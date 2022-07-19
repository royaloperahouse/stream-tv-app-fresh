/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template for TV
 * https://github.com/react-native-tvos/react-native-template-typescript-tv
 *
 * @format
 */

import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableHighlight,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import RNBootSplash from 'react-native-bootsplash';
import 'react-native/tvos-types.d';
import RohText from 'components/RohText';
import StreamLogo from '@assets/svg/StreamLogo.svg';
import { Colors } from 'themes/Styleguide';

const Stack = createNativeStackNavigator();

const App: React.FC<{}> = () => (
  <NavigationContainer onReady={() => RNBootSplash.hide()}>
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

function DetailsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <TouchableHighlight
        underlayColor="#ffff"
        hasTVPreferredFocus={true}
        onPress={() => {
          navigation.navigate('Home');
        }}>
        <View>
          <View style={{ backgroundColor: Colors.backgroundColor }}>
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
}

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
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
}

export default App;
