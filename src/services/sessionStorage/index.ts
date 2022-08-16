import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTVOS } from 'configs/globalConfig';

export abstract class SessionStorage {
  private static tvosStarage: { [key: string]: string } = {};

  static getItem(key: string): Promise<string | null> {
    if (!isTVOS) {
      return AsyncStorage.getItem(key);
    }
    if (!(key in SessionStorage.tvosStarage)) {
      return Promise.resolve(null);
    }
    return Promise.resolve(SessionStorage.tvosStarage[key]);
  }

  static setItem(key: string, value: string): Promise<void> {
    if (!isTVOS) {
      return AsyncStorage.setItem(key, value);
    }
    SessionStorage.tvosStarage[key] = value;
    return Promise.resolve();
  }

  static removeItem(key: string): Promise<void> {
    if (!isTVOS) {
      return AsyncStorage.removeItem(key);
    }
    if (!(key in SessionStorage.tvosStarage)) {
      return Promise.resolve();
    }
    delete SessionStorage.tvosStarage[key];
    return Promise.resolve();
  }
}
