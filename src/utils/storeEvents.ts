import { Settings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isTVOS } from 'configs/globalConfig';
import { sendAnalytics } from 'services/apiClient';
import { getBrand } from 'react-native-device-info';

interface IEvent {
  event_type: AnalyticsEventTypes;
  event_data:
    | IOpenPerformanceFromRailsEventData
    | IOptionClickedEventData
    | IOpenPerformanceFromSearchEventData
    | IScrolledEventData;
}

interface IOpenPerformanceFromRailsEventData {
  screen_name: string;
  rail_name: string;
  index: string;
  device_type?: string;
}

interface IOpenPerformanceFromSearchEventData {
  performance_id: string;
  index: string;
  search_query: string;
  device_type?: string;
}

interface IOptionClickedEventData {
  performance_id: string;
  option_name: string;
  device_type?: string;
}

interface IScrolledEventData {
  performance_id: string;
  section_name: string;
  device_type?: string;
}

interface IStoredEvents {
  events: IEvent[];
}

export enum AnalyticsEventTypes {
  OPEN_PERFORMANCE_RAILS = 'open_performance_rails',
  OPEN_PERFORMANCE_SEARCH = 'open_performance_search',
  SECTION_VIEWED = 'section_viewed',
  OPTION_CLICKED = 'option_clicked',
}

enum Brands {
  APPLE = 'Apple',
  AMAZON = 'Amazon',
  GOOGLE = 'google',
}

export async function storeEvents(event: IEvent): Promise<void> {
  // if (__DEV__) {
  //   return; // ignoring analytics events in DEV environment
  // }

  switch (getBrand()) {
    case Brands.APPLE:
      event.event_data.device_type = 'AppleTV';
      break;
    case Brands.AMAZON:
      event.event_data.device_type = 'FireTV';
      break;
    case Brands.GOOGLE:
      event.event_data.device_type = 'ChromeCast';
      break;
    default:
      event.event_data.device_type = 'unknown';
      break;
  }

  if (!isTVOS) {
    const previousData = await AsyncStorage.getItem('events');
    if (!previousData) {
      await AsyncStorage.setItem('events', JSON.stringify({ events: [event] }));
      return;
    }

    const previousDataParsed: IStoredEvents = JSON.parse(previousData);
    previousDataParsed.events.push(event);
    await AsyncStorage.setItem('events', JSON.stringify(previousDataParsed));

    return;
  }

  const previousData: IEvent[] | undefined = Settings.get('events');
  if (!previousData) {
    Settings.set({ events: [event] });
    return;
  }
  const newData = [...previousData, event];
  Settings.set({ events: newData });

  const events = await getEvents();
  if (events && events.length >= 50) {
    await sendEvents(events);
  }

  return;
}

export async function getEvents(): Promise<IEvent[] | null> {
  if (!isTVOS) {
    const data = await AsyncStorage.getItem('events');
    if (!data) {
      return null;
    }

    return JSON.parse(data);
  }

  const data = Settings.get('events');
  if (!data) {
    return null;
  }

  return data;
}

export async function clearStorage() {
  if (!isTVOS) {
    await AsyncStorage.removeItem('events');
    return;
  }

  Settings.set({ events: null });
}

async function sendEvents(events: IEvent[]) {
  const transformedEvents = events.map(event => {
    return {
      source: 'tv_app',
      type: event.event_type,
      data: event.event_data,
    };
  });

  const response = await sendAnalytics(transformedEvents);
  console.log(response);
  if (response.status === 200) {
    await clearStorage();
  }
  return;
}
