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
    return initFocusPosition;
    if (
      data[sectionIndex] !== undefined &&
      data[sectionIndex].data[itemIndex] !== undefined &&
      data[sectionIndex].data[itemIndex].id === eventId
    ) {
      return {
        sectionIndex,
        itemIndex,
      };
    }
    const foundIndex =
      data[sectionIndex] === undefined
        ? -1
        : data[sectionIndex].data.findIndex(
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

  static searchingCBForList({
    eventId,
    data,
    moveToMenuItem = () => {},
  }: {
    eventId: string | null;
    initFocusPosition: { itemIndex: number };
    itemIndex?: number;
    data: Array<TEventContainer>;
    moveToMenuItem?: () => void;
  }): {
    itemIndex: number;
    sectionIndex: number;
  } {
    if (!data.length && eventId) {
      moveToMenuItem();
    }
    if (!data.length || !eventId) {
      return { itemIndex: -1, sectionIndex: 0 };
    }

    const foundIndex = data.findIndex(
      (item: TEventContainer) => item.id === eventId,
    );
    return { itemIndex: foundIndex === -1 ? 0 : foundIndex, sectionIndex: 0 };
  }

  private static firstLounchStateChangingEventLoop() {
    for (let i = 0; i < FocusManager.cbCollection.length; i++) {
      if (typeof FocusManager.cbCollection[i] === 'function') {
        FocusManager.cbCollection[i](FocusManager.firstLounch);
      }
    }
  }
}
