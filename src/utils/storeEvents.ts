import { Settings } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { isTVOS } from 'configs/globalConfig';

interface IEvent {
  event_type: string;
  event_data:
    | IOpenPerformanceEventData
    | IOptionClickedEventData
    | ISrolledEventData;
}

interface IOpenPerformanceEventData {
  screen_name: string;
  rail_name?: string;
  index: string;
  search_query?: string;
  datetime: string;
}

interface IOptionClickedEventData {
  performance_id: string;
  option_name: string;
  datetime: string;
}

interface ISrolledEventData {
  performance_id: string;
  section_name: string;
  datetime: string;
}

interface IStoredEvents {
  events: IEvent[];
}

export async function storeEvents(eventData: IEvent): Promise<void> {
  if (!isTVOS) {
    const previousData = await AsyncStorage.getItem('events');
    if (!previousData) {
      await AsyncStorage.setItem(
        'events',
        JSON.stringify({ events: [eventData] }),
      );
      return;
    }

    const previousDataParsed: IStoredEvents = JSON.parse(previousData);
    previousDataParsed.events.push(eventData);
    await AsyncStorage.setItem('events', JSON.stringify(previousDataParsed));

    return;
  }

  const previousData: IEvent[] | undefined = Settings.get('events');
  if (!previousData) {
    Settings.set({ events: [eventData] });
    return;
  }

  const newData = [...previousData, eventData];
  Settings.set({ events: newData });
  return;
}

export async function getEvents(): Promise<IStoredEvents | null> {
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
