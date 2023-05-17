import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';
import { ECellItemKey } from '@components/EventDetailsComponents/commonControls/MultiColumnAboutProductionList';
import {
  rootStackScreensNames,
  contentScreenNames,
  eventDetailsScreenNames,
} from '@services/types/models';
import type {
  TContentStackScreensNames,
  TEventDetailsStackScreensNames,
  TContentScreenReverseNames,
  TEventDetailsScreenReverseNames,
  TExtrasVideo,
} from 'services/types/models';

export { rootStackScreensNames, contentScreenNames, eventDetailsScreenNames };
export type { TContentScreenReverseNames, TEventDetailsScreenReverseNames };

export type TContentScreenReverseNamesOfNavToDetails = Exclude<
  TContentScreenReverseNames,
  | typeof contentScreenNames.settings
  | typeof contentScreenNames.eventDetails
  | typeof contentScreenNames.exit
  | typeof contentScreenNames.liveStream
>;

export type TRootStackScreensNames = typeof rootStackScreensNames;

export type TRootStackScreensParamList = {
  [rootStackScreensNames.content]: NavigatorScreenParams<TContentScreensParamList>;
  [rootStackScreensNames.player]: undefined;
};

export type TRootStackScreenProps<T extends keyof TRootStackScreensParamList> =
  NativeStackScreenProps<TRootStackScreensParamList, T>;

export type TEventDetailsStackScreenProps<
  T extends TEventDetailsScreensNamesList,
> = NativeStackScreenProps<TEventDetailsScreensParamList, T>;

export type TContentScreensParamList = {
  [contentScreenNames.home]:
    | {
        eventId: string | null;
        sectionIndex: number;
        selectedItemIndex?: number;
        fromErrorModal?: boolean;
      }
    | undefined;
  [contentScreenNames.operaMusic]:
    | {
        eventId: string | null;
        sectionIndex: number;
        selectedItemIndex?: number;
      }
    | undefined;
  [contentScreenNames.balletDance]:
    | {
        eventId: string | null;
        sectionIndex: number;
        selectedItemIndex?: number;
      }
    | undefined;
  [contentScreenNames.search]:
    | {
        eventId: string | null;
        sectionIndex: number;
        selectedItemIndex?: number;
      }
    | undefined;
  [contentScreenNames.myList]:
    | {
        eventId: string | null;
        sectionIndex: number;
        selectedItemIndex?: number;
      }
    | undefined;
  [contentScreenNames.settings]:
    | {
        pinPage: boolean;
      }
    | undefined;
  [contentScreenNames.eventDetails]: {
    eventId: string;
    screenNameFrom: TContentScreenReverseNames;
    sectionIndex: number;
    selectedItemIndex?: number;
    queryParams?: {
      playTrailer?: boolean;
    };
  };
  [contentScreenNames.eventVideo]: {
    videoId: string;
    eventId: string;
    screenNameFrom: TContentScreenReverseNames;
    sectionIndex: number;
    selectedItemIndex?: number;
  }
  [contentScreenNames.exit]: undefined;
  [contentScreenNames.liveStream]: undefined;
};

export type TEventDetailsScreensParamContextProps = {
  [eventDetailsScreenNames.general]: {
    nextSectionTitle?: string;
    publishingDate: string;
    title: string;
    shortDescription: string;
    snapshotImageUrl: string;
    vs_guidance: string;
    vs_guidance_details: string;
    nextScreenName?: TEventDetailsScreenReverseNames;
    performanceInfo: { eventId: string; videoId: string } | null;
    trailerInfo: { eventId: string; videoId: string } | null;
    eventId: string;
    performanceVideoTimePosition: string | undefined;
    setPerformanceVideoTimePositionCB: (tyme: string) => void;
    videoQualityBitrate: number;
    videoQualityId: 'high' | 'medium' | 'normal';
    playTrailer?: boolean;
  };
  [eventDetailsScreenNames.cast]: {
    nextSectionTitle?: string;
    castList: Array<{ role: string; name: string }>;
    nextScreenName?: TEventDetailsScreenReverseNames;
    prevScreenName: TEventDetailsScreenReverseNames;
  };
  [eventDetailsScreenNames.creatives]: {
    nextSectionTitle?: string;
    creatives: Array<{ role: string; name: string }>;
    nextScreenName?: TEventDetailsScreenReverseNames;
    prevScreenName: TEventDetailsScreenReverseNames;
  };
  [eventDetailsScreenNames.synopsis]: {
    nextSectionTitle?: string;
    synopsis: Array<{ key: string; text: string }>;
    nextScreenName?: TEventDetailsScreenReverseNames;
    prevScreenName: TEventDetailsScreenReverseNames;
  };
  [eventDetailsScreenNames.info]: {
    nextSectionTitle?: string;
    aboutProduction: Array<{ key: string; type: ECellItemKey; content: any }>;
    nextScreenName?: TEventDetailsScreenReverseNames;
    prevScreenName: TEventDetailsScreenReverseNames;
  };
  [eventDetailsScreenNames.extras]: {
    nextSectionTitle?: string;
    videosInfo: Array<TExtrasVideo>;
    nextScreenName?: TEventDetailsScreenReverseNames;
    prevScreenName: TEventDetailsScreenReverseNames;
    eventId: string;
    videoQualityBitrate: number;
    videoQualityId: 'high' | 'medium' | 'normal';
  };
};

export type TEventDetailsScreensParamList = {
  [eventDetailsScreenNames.general]: undefined;
  [eventDetailsScreenNames.cast]: undefined;
  [eventDetailsScreenNames.creatives]: undefined;
  [eventDetailsScreenNames.synopsis]: undefined;
  [eventDetailsScreenNames.info]: undefined;
  [eventDetailsScreenNames.extras]: undefined;
  DummyPlayerScreen: undefined;
};

export type TContentScreensNamesList = keyof TContentScreensParamList;

export type TEventDetailsScreensNamesList = keyof TEventDetailsScreensParamList;

export type TContentScreensProps<T extends keyof TContentScreensParamList> =
  CompositeScreenProps<
    DrawerScreenProps<TContentScreensParamList, T>,
    TRootStackScreenProps<keyof TRootStackScreensParamList>
  >;

export type TEventDetailsScreensProps<T extends TEventDetailsScreensNamesList> =
  CompositeScreenProps<
    NativeStackScreenProps<TEventDetailsScreensParamList, T>,
    TContentScreensProps<'EventDetails'>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TRootStackScreensParamList {}
  }
}

export declare namespace NSNavigationScreensNames {
  export interface RootStackScreens extends TRootStackScreensNames {}
  export interface ContentStackScreens extends TContentStackScreensNames {}
  export interface EventDetailsStackScreens
    extends TEventDetailsStackScreensNames {}
  export interface NavigateToDetailsScreens
    extends Omit<
      TContentStackScreensNames,
      | typeof contentScreenNames.settings
      | typeof contentScreenNames.eventDetails
      | typeof contentScreenNames.exit
      | typeof contentScreenNames.liveStream
      | typeof contentScreenNames.eventVideo
    > {}
}
