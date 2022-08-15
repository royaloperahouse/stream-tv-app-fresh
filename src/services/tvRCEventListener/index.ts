import { TVEventHandler } from 'react-native';
import type { HWEvent } from 'react-native';

export abstract class TVEventManager {
  private static tvEventHandler: TVEventHandler | null = null;
  private static subscriptions: Array<(event: HWEvent) => void> = [];
  static init(): boolean {
    if (!TVEventManager.isInit()) {
      TVEventManager.tvEventHandler = new TVEventHandler();
      TVEventManager.tvEventHandler.enable<any>(
        undefined,
        (_, event: HWEvent) => {
          for (let i = 0; i < TVEventManager.subscriptions.length; i++) {
            TVEventManager.subscriptions[i](event);
          }
        },
      );
    }
    return TVEventManager.isInit();
  }

  static isInit(): boolean {
    return TVEventManager.tvEventHandler !== null;
  }

  static addEventListener(cb: (event: HWEvent) => void) {
    TVEventManager.subscriptions.push(cb);
  }

  static getEventListeners(): Array<(event: HWEvent) => void> {
    return [...TVEventManager.subscriptions];
  }

  static setEventListeners(subscriptions: Array<(event: HWEvent) => void>) {
    TVEventManager.subscriptions = subscriptions;
  }

  static removeEventListener(cb: (event: HWEvent) => void) {
    const index = TVEventManager.subscriptions.findIndex(
      cbItem => cbItem === cb,
    );
    if (index !== -1) {
      TVEventManager.subscriptions.splice(index, 1);
    }
  }

  static unmount() {
    if (typeof TVEventManager?.tvEventHandler?.disable === 'function') {
      TVEventManager.tvEventHandler.disable();
    }
    TVEventManager.subscriptions = [];
    TVEventManager.tvEventHandler = null;
  }
}
