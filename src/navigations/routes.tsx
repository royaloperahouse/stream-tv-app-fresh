//Content Screens
import SearchScreen from '@screens/SearchScreen';
import BalletDanceScreen from '@screens/BalletDanceScreen';
import LiveStreamScreen from '@screens/LiveStreamScreen';
import MyListScreen from '@screens/MyListScreen';
import OperaMusicScreen from '@screens/OperaMusicScreen';
import SettingsScreen from '@screens/SettingsScreen';
import ExitScreen from '@screens/ExitScreen';

import EventDetailsScreen from '@screens/EventDetailsScreen';
import HomePageScreen from '@screens/HomePageScreen';
//NavMenu SVG Icons
import SearchInActiveIcon from '@assets/svg/navIcons/Search.svg';
import SearchActiveIcon from '@assets/svg/navIcons/SearchActive.svg';
import HomeInActiveIcon from '@assets/svg/navIcons/Home.svg';
import HomeActiveIcon from '@assets/svg/navIcons/HomeActive.svg';
import BalletDanceInActiveIcon from '@assets/svg/navIcons/Ballet_&_Dance.svg';
import BalletDanceActiveIcon from '@assets/svg/navIcons/Ballet_&_DanceActive.svg';
import LiveStreamInActiveIcon from '@assets/svg/navIcons/Live_Stream.svg';
import LiveStreamActiveIcon from '@assets/svg/navIcons/Live_StreamActive.svg';
import MyListInActiveIcon from '@assets/svg/navIcons/Added_to_My_List.svg';
import MyListActiveIcon from '@assets/svg/navIcons/Added_to_My_ListActive.svg';
import OperaMusicInActiveIcon from '@assets/svg/navIcons/Opera_&_Music.svg';
import OperaMusicActiveIcon from '@assets/svg/navIcons/Opera_&_MusicActive.svg';
import SettingsInActiveIcon from '@assets/svg/navIcons/Settings.svg';
import SettingsActiveIcon from '@assets/svg/navIcons/SettingsActive.svg';
import { TRoutes } from '@services/types/models';
//import { isTVOS } from '@configs/globalConfig';

export const routes: TRoutes = [
  {
    navMenuScreenName: 'Home',
    SvgIconActiveComponent: HomeActiveIcon,
    SvgIconInActiveComponent: HomeInActiveIcon,
    navMenuTitle: 'Home',
    position: 2,
    isDefault: true,
    ScreenComponent: HomePageScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: 'Search',
    SvgIconActiveComponent: SearchActiveIcon,
    SvgIconInActiveComponent: SearchInActiveIcon,
    navMenuTitle: 'Search',
    position: 1,
    isDefault: false,
    ScreenComponent: SearchScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: 'Opera&music',
    SvgIconActiveComponent: OperaMusicActiveIcon,
    SvgIconInActiveComponent: OperaMusicInActiveIcon,
    navMenuTitle: 'Opera & Music',
    position: 3,
    isDefault: false,
    ScreenComponent: OperaMusicScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: 'Ballet&dance',
    SvgIconActiveComponent: BalletDanceActiveIcon,
    SvgIconInActiveComponent: BalletDanceInActiveIcon,
    navMenuTitle: 'Ballet & Dance',
    position: 4,
    isDefault: false,
    ScreenComponent: BalletDanceScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: 'LiveStream',
    SvgIconActiveComponent: LiveStreamActiveIcon,
    SvgIconInActiveComponent: LiveStreamInActiveIcon,
    navMenuTitle: 'Live Stream',
    position: 5,
    isDefault: false,
    ScreenComponent: LiveStreamScreen,
    initialParams: undefined,
  },
  {
    navMenuScreenName: 'MyList',
    SvgIconActiveComponent: MyListActiveIcon,
    SvgIconInActiveComponent: MyListInActiveIcon,
    navMenuTitle: 'My List',
    position: 6,
    isDefault: false,
    ScreenComponent: MyListScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: 'Settings',
    SvgIconActiveComponent: SettingsActiveIcon,
    SvgIconInActiveComponent: SettingsInActiveIcon,
    navMenuTitle: 'Account & Settings',
    position: 7,
    isDefault: false,
    ScreenComponent: SettingsScreen,
    initialParams: undefined,
  },
];

export const additionalRoutesWithoutNavMenuNavigation = {
  eventDetails: {
    navMenuScreenName: 'EventDetails',
    ScreenComponent: EventDetailsScreen,
    isDefault: false,
    position: 8,
    initialParams: undefined,
  },
  exit: {
    navMenuScreenName: 'Exit',
    ScreenComponent: ExitScreen,
    isDefault: false,
    position: 9,
    initialParams: undefined,
  },
};

export const allRoutes = [
  ...routes,
  ...Object.values(additionalRoutesWithoutNavMenuNavigation),
];

export type TContentRoutesParamList = {
  Home: { eventId: string | null };
  'Opera&musi': { eventId: string | null };
  'Ballet&dance': { eventId: string | null };
  Search: { eventId: string | null };
  MyList: { eventId: string | null };
  Settings: undefined;
  EventDetails: undefined;
  Exit: undefined;
  LiveStream: undefined;
};

export const mainRoutes = {
  content: {
    screenName: 'Content',
  },
  player: {
    screenNmae: 'Player',
  },
};

export type TMainRoutesParamList = {
  Content: undefined;
  Player: undefined;
};

/* export const allRoutes = !isTVOS
  ? [...routes, ...Object.values(additionalRoutesWithoutNavMenuNavigation)]
  : [...Object.values(additionalRoutesWithoutNavMenuNavigation), ...routes]; */
