import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native';

export const rootStackScreensNames = Object.freeze({
  content: 'Content',
  player: 'Player',
});

export const contentScreenNames = Object.freeze({
  home: 'Home',
  operaMusic: 'Opera&music',
  balletDance: 'Ballet&dance',
  search: 'Search',
  myList: 'MyList',
  settings: 'Settings',
  eventDetails: 'EventDetails',
  exit: 'Exit',
  liveStream: 'LiveStream',
});

export const contentScreenReverseNames = Object.freeze({
  [contentScreenNames.home]: 'home',
  [contentScreenNames.operaMusic]: 'operaMusic',
  [contentScreenNames.balletDance]: 'balletDance',
  [contentScreenNames.search]: 'search',
  [contentScreenNames.myList]: 'myList',
  [contentScreenNames.settings]: 'settings',
  [contentScreenNames.eventDetails]: 'eventDetails',
  [contentScreenNames.exit]: 'exit',
  [contentScreenNames.liveStream]: 'liveStream',
});

type TContentStackScreensNames = typeof contentScreenNames;

export type TContentScreenReverseNames = keyof typeof contentScreenReverseNames;

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

export type TContentScreensParamList = {
  [contentScreenNames.home]: { eventId: string | null } | undefined;
  [contentScreenNames.operaMusic]: { eventId: string | null } | undefined;
  [contentScreenNames.balletDance]: { eventId: string | null } | undefined;
  [contentScreenNames.search]: { eventId: string | null } | undefined;
  [contentScreenNames.myList]: { eventId: string | null } | undefined;
  [contentScreenNames.settings]: undefined;
  [contentScreenNames.eventDetails]: { eventId: string | null };
  [contentScreenNames.exit]: undefined;
  [contentScreenNames.liveStream]: undefined;
};
export type TContentScreensNamesList = keyof TContentScreensParamList;

export type TContentScreensProps<T extends keyof TContentScreensParamList> =
  CompositeScreenProps<
    DrawerScreenProps<TContentScreensParamList, T>,
    TRootStackScreenProps<keyof TRootStackScreensParamList>
  >;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends TRootStackScreensParamList {}
  }
}

export declare namespace NSNavigationScreensNames {
  export interface RootStackScreens extends TRootStackScreensNames {}
  export interface ContentStackScreens extends TContentStackScreensNames {}
  export interface NavigateToDetailsScreens
    extends Omit<
      TContentStackScreensNames,
      | typeof contentScreenNames.settings
      | typeof contentScreenNames.eventDetails
      | typeof contentScreenNames.exit
      | typeof contentScreenNames.liveStream
    > {}
}
