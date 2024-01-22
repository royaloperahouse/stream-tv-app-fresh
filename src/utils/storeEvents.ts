import { Settings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isTVOS } from 'configs/globalConfig';
import { sendAnalytics } from 'services/apiClient';

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
}

interface IOpenPerformanceFromSearchEventData {
  performance_id: string;
  index: string;
  search_query: string;
}

interface IOptionClickedEventData {
  performance_id: string;
  option_name: string;
}

interface IScrolledEventData {
  performance_id: string;
  section_name: string;
}

interface IStoredEvents {
  events: IEvent[];
}

export enum AnalyticsEventTypes {
  OPEN_PERFORMANCE_RAILS = 'open_performance_rails',
  OPEN_PERFORMANCE_SEARCH = 'open_performance_search',
  SECTION_SCROLL = 'section_scroll',
  OPTION_CLICK = 'option_click',
}

export async function storeEvents(event: IEvent): Promise<void> {
  if (__DEV__) {
    return; // ignoring analytics events in DEV environment
  }

  if (!isTVOS) {
    const previousData = await AsyncStorage.getItem('events');
    if (!previousData) {
      await AsyncStorage.setItem(
        'events',
        JSON.stringify({ events: [event] }),
      );
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
  console.log('Should have sent these events:');
  console.log(JSON.stringify(transformedEvents, null, 4));
  console.log('End of events');
  // const response = await sendAnalytics(transformedEvents);
  // if (response.status === 200) {
  //   await clearStorage();
  // }
  return;
}
