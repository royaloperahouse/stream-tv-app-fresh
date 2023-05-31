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
import { TRoutes, TRoute } from '@services/types/models';
import { contentScreenNames } from '@configs/screensConfig';
import EventVideoScreen from 'screens/EventVideoScreen';

//import { isTVOS } from '@configs/globalConfig';

export const routes: TRoutes = [
  {
    navMenuScreenName: contentScreenNames.home,
    SvgIconActiveComponent: HomeActiveIcon,
    SvgIconInActiveComponent: HomeInActiveIcon,
    navMenuTitle: 'Home',
    position: 2,
    isDefault: true,
    ScreenComponent: HomePageScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: contentScreenNames.search,
    SvgIconActiveComponent: SearchActiveIcon,
    SvgIconInActiveComponent: SearchInActiveIcon,
    navMenuTitle: 'Search',
    position: 1,
    isDefault: false,
    ScreenComponent: SearchScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: contentScreenNames.operaMusic,
    SvgIconActiveComponent: OperaMusicActiveIcon,
    SvgIconInActiveComponent: OperaMusicInActiveIcon,
    navMenuTitle: 'Opera & Music',
    position: 3,
    isDefault: false,
    ScreenComponent: OperaMusicScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: contentScreenNames.balletDance,
    SvgIconActiveComponent: BalletDanceActiveIcon,
    SvgIconInActiveComponent: BalletDanceInActiveIcon,
    navMenuTitle: 'Ballet & Dance',
    position: 4,
    isDefault: false,
    ScreenComponent: BalletDanceScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: contentScreenNames.liveStream,
    SvgIconActiveComponent: LiveStreamActiveIcon,
    SvgIconInActiveComponent: LiveStreamInActiveIcon,
    navMenuTitle: 'Live Stream',
    position: 5,
    isDefault: false,
    ScreenComponent: LiveStreamScreen,
    initialParams: undefined,
  },
  {
    navMenuScreenName: contentScreenNames.myList,
    SvgIconActiveComponent: MyListActiveIcon,
    SvgIconInActiveComponent: MyListInActiveIcon,
    navMenuTitle: 'My List',
    position: 6,
    isDefault: false,
    ScreenComponent: MyListScreen,
    initialParams: { eventId: null },
  },
  {
    navMenuScreenName: contentScreenNames.settings,
    SvgIconActiveComponent: SettingsActiveIcon,
    SvgIconInActiveComponent: SettingsInActiveIcon,
    navMenuTitle: 'Account & Settings',
    position: 7,
    isDefault: false,
    ScreenComponent: SettingsScreen,
    initialParams: undefined,
  },
];

export const additionalRoutesWithoutNavMenuNavigation: {
  eventDetails: TRoute;
  eventVideo: TRoute;
  exit: TRoute;
} = {
  eventDetails: {
    navMenuScreenName: contentScreenNames.eventDetails,
    ScreenComponent: EventDetailsScreen,
    SvgIconActiveComponent: undefined,
    SvgIconInActiveComponent: undefined,
    navMenuTitle: undefined,
    isDefault: false,
    position: 8,
    initialParams: { eventId: '' },
  },
  eventVideo: {
    navMenuScreenName: contentScreenNames.eventVideo,
    ScreenComponent: EventVideoScreen,
    SvgIconActiveComponent: undefined,
    SvgIconInActiveComponent: undefined,
    navMenuTitle: undefined,
    isDefault: false,
    position: 9,
    initialParams: { videoId: '', eventId: '' },
  },
  exit: {
    navMenuScreenName: contentScreenNames.exit,
    ScreenComponent: ExitScreen,
    SvgIconActiveComponent: undefined,
    SvgIconInActiveComponent: undefined,
    navMenuTitle: undefined,
    isDefault: false,
    position: 10,
    initialParams: undefined,
  },
};

export const allRoutes: TRoutes = [
  ...routes,
  ...Object.values(additionalRoutesWithoutNavMenuNavigation),
];
