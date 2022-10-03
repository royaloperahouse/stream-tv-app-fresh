import type { TEventContainer } from 'services/types/models';

export abstract class FocusManager {
  private static firstLounch = true;
  private static cbCollection: Array<(firstLounchState?: boolean) => void> = [];

  static getFirstLounch() {
    return FocusManager.firstLounch;
  }

  static init() {
    FocusManager.firstLounch = true;
    FocusManager.cbCollection = [];
  }

  static switchOnFirstLounch() {
    if (!FocusManager.firstLounch) {
      FocusManager.firstLounch = true;
      FocusManager.firstLounchStateChangingEventLoop();
    }
  }

  static switchOffFirstLounch() {
    if (FocusManager.firstLounch) {
      FocusManager.firstLounch = false;
      FocusManager.firstLounchStateChangingEventLoop();
    }
  }

  static addEventListner(
    cb: (firstLounchState?: boolean) => void,
  ): (firstLounchState?: boolean) => void {
    FocusManager.cbCollection.push(cb);
    return cb;
  }

  static removeEventListner(cb: (firstLounchState?: boolean) => void): boolean {
    const index = FocusManager.cbCollection.findIndex(item => item === cb);
    if (index !== -1) {
      FocusManager.cbCollection.splice(index, 1);
      return true;
    }
    return false;
  }

  static getFocusPosition({
    searchingCB,
    initFocusPosition = {
      sectionIndex: 0,
      itemIndex: 0,
    },
    ...rest
  }: {
    eventId: string | null;
    sectionIndex?: number;
    itemIndex?: number;
    initFocusPosition?: { sectionIndex: number; itemIndex: number };
    data: any;
    moveToMenuItem?: () => void;
    searchingCB: (obj: {
      eventId: string | null;
      sectionIndex?: number;
      itemIndex?: number;
      initFocusPosition: { sectionIndex: number; itemIndex: number };
      data: any;
      moveToMenuItem?: () => void;
    }) => {
      sectionIndex: number;
      itemIndex: number;
    };
  }): {
    sectionIndex: number;
    itemIndex: number;
  } {
    const focusPosition = initFocusPosition;
    const foundPosition = searchingCB({ ...rest, initFocusPosition });
    focusPosition.sectionIndex = foundPosition.sectionIndex;
    focusPosition.itemIndex = foundPosition.itemIndex;
    return focusPosition;
  }

  static searchingCBForRails({
    eventId,
    sectionIndex,
    itemIndex,
    initFocusPosition,
    data,
    moveToMenuItem = () => {},
  }: {
    eventId: string | null;
    initFocusPosition: { sectionIndex: number; itemIndex: number };
    sectionIndex?: number;
    itemIndex?: number;
    data: Array<{
      sectionIndex: number;
      title: string;
      data: Array<TEventContainer>;
    }>;
    moveToMenuItem?: () => void;
  }): {
    sectionIndex: number;
    itemIndex: number;
  } {
    if (!data.length && (eventId || FocusManager.getFirstLounch())) {
      FocusManager.switchOffFirstLounch();
      moveToMenuItem();
    }
    console.log(FocusManager.getFirstLounch(), 'firstLounch');
    console.log(data.length, eventId, sectionIndex, itemIndex, ' focusParams');
    if (data.length && FocusManager.getFirstLounch()) {
      return initFocusPosition;
    }
    if (
      !data.length ||
      !eventId ||
      sectionIndex === undefined ||
      itemIndex === undefined
    ) {
      return { sectionIndex: -1, itemIndex: -1 };
    }
    if (data[sectionIndex].data[itemIndex].id === eventId) {
      return {
        sectionIndex,
        itemIndex,
      };
    }
    const foundIndex = data[sectionIndex].data.findIndex(
      (item: TEventContainer) => item.id === eventId,
    );
    if (foundIndex !== -1) {
      return { sectionIndex, itemIndex: foundIndex };
    }
    for (
      let lookingForSectionIndex = 0;
      lookingForSectionIndex < data.length;
      lookingForSectionIndex++
    ) {
      if (lookingForSectionIndex === sectionIndex) {
        continue;
      }
      const lookingForItemIndex = data[lookingForSectionIndex].data.findIndex(
        item => item.id === eventId,
      );
      if (lookingForItemIndex !== -1) {
        return {
          sectionIndex: lookingForSectionIndex,
          itemIndex: lookingForItemIndex,
        };
      }
      if (lookingForSectionIndex === data.length - 1) {
        return initFocusPosition;
      }
    }
    return initFocusPosition;
  }

  private static firstLounchStateChangingEventLoop() {
    for (let i = 0; i < FocusManager.cbCollection.length; i++) {
      if (typeof FocusManager.cbCollection[i] === 'function') {
        FocusManager.cbCollection[i](FocusManager.firstLounch);
      }
    }
  }
}
