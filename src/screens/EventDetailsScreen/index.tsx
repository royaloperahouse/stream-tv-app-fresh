import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { useEventDetails } from '@hooks/useEventDetails';
import LoadingSpinner from '@components/LoadingSpinner';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch } from 'hooks/redux';
import GoBack from '@components/GoBack';
import {
  TContentScreensProps,
  NSNavigationScreensNames,
  TEventDetailsScreensParamList,
  contentScreenNames,
} from '@configs/screensConfig';
import { SectionsParamsComtextProvider } from '@components/EventDetailsComponents/commonControls/SectionsParamsContext';
import {
  getEventListLoopStart,
  getEventListLoopStop,
} from 'services/store/events/Slices';

import {
  DummyPlayerScreen,
  DummyPlayerScreenName,
} from '@components/Player/DummyPlayerScreen';
import { isTVOS } from 'configs/globalConfig';
import { navMenuManager } from 'components/NavMenu';

const Stack = createNativeStackNavigator<TEventDetailsScreensParamList>();

const EventDetailsScreen: React.FC<
  TContentScreensProps<
    NSNavigationScreensNames.ContentStackScreens['eventDetails']
  >
> = ({ route, navigation }) => {
  const { eventId, queryParams, availableFrom, duration } = route.params;
  const { extrasLoading, sectionsParams, sectionsCollection } = useEventDetails(
    { eventId },
  );
  if (sectionsParams.General) {
    sectionsParams.General.playTrailer = !!queryParams?.playTrailer;
    sectionsParams.General.availableFrom = availableFrom;
    sectionsParams.General.duration = duration;
  }
  const dispatch = useAppDispatch();
  const eventDetailsScreenMounted = useRef<boolean>(false);
  const moveToSettings = () => {
    navigation.navigate(contentScreenNames.settings, { pinPage: true });
  };
  useEffect(() => {
    dispatch(getEventListLoopStop());
    return () => {
      dispatch(getEventListLoopStart());
    };
  }, [dispatch]);

  useLayoutEffect(() => {
    eventDetailsScreenMounted.current = true;
    return () => {
      if (eventDetailsScreenMounted?.current) {
        eventDetailsScreenMounted.current = false;
      }
    };
  }, []);

  if (extrasLoading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner showSpinner={true} />
      </View>
    );
  }
  navMenuManager.hideNavMenu();
  return (
    <View style={styles.rootContainer}>
      <GoBack />
      <SectionsParamsComtextProvider
        params={{ ...sectionsParams, moveToSettings }}>
        <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
          {sectionsCollection.map(section => (
            <Stack.Screen
              key={section.key}
              name={section.key}
              component={section.Component}
            />
          ))}
          {isTVOS && (
            <Stack.Screen
              name={DummyPlayerScreenName}
              component={DummyPlayerScreen}
            />
          )}
        </Stack.Navigator>
      </SectionsParamsComtextProvider>
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width,
    flexDirection: 'row',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EventDetailsScreen;
