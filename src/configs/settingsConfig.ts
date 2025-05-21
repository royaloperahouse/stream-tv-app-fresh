import {
  SignOut,
  Account,
  AppVersion,
  SwitchingBetweenEnvironments,
  Subscription,
  VideoPlayerSettings,
  ShowTrayEvents,
  LoginWithoutQRCode,
} from '@components/SettingsComponents';
import { store } from '@services/store';
import type {
  TAccountProps,
  TSignOutProps,
  TAppVersionProps,
  TSwitchingBetweenEnvironmentsProps,
  TSwitchSubscriptionMode,
  TVideoPlayerSettingsProps,
  TShowTrayEventsProps,
  TLoginScreenProps,
} from '@components/SettingsComponents';
export const settingsTitle = 'Settings';

export type TSettingsSection = {
  key: string;
  navMenuItemTitle: string;
  ContentComponent: React.FC<
    Partial<
      {} & TAccountProps &
        TSignOutProps &
        TAppVersionProps &
        TSwitchingBetweenEnvironmentsProps &
        TSwitchSubscriptionMode &
        TVideoPlayerSettingsProps &
        TLoginScreenProps
    >
  >;
};

export const getSettingsSectionsConfig: (isAuthenticated: boolean) => {
  [key: string]: TSettingsSection;
} = isAuthenticated => {
  const settingsSections: {
    [key: string]: TSettingsSection;
  } = {
    account: {
      key: 'account',
      navMenuItemTitle: 'Account',
      ContentComponent: Account,
    },
    [isAuthenticated ? 'signOut' : 'pinPage']: {
      key: isAuthenticated ? 'signOut' : 'pinPage',
      navMenuItemTitle: isAuthenticated ? 'Sign out' : 'TV app set-up',
      ContentComponent: isAuthenticated ? SignOut : LoginWithoutQRCode,
    },
    appVersion: {
      key: 'appVersion',
      navMenuItemTitle: 'App version',
      ContentComponent: AppVersion,
    },
    subscription: {
      key: 'subscription',
      navMenuItemTitle: 'Subscription',
      ContentComponent: Subscription,
    },
    videoPlayerSettings: {
      key: 'videoPlayerSettings',
      navMenuItemTitle: 'Video Player Settings',
      ContentComponent: VideoPlayerSettings,
    },
  };
  if (!isAuthenticated) {
    delete settingsSections.account;
  }
  if (store.getState().auth.userEmail.includes('roh.org.uk')) {
    settingsSections.switchingBetweenEnv = {
      key: 'switchingBetweenEnv',
      navMenuItemTitle: 'Environment Switching',
      ContentComponent: SwitchingBetweenEnvironments,
    };

    settingsSections.showTrayEvents = {
      key: 'showTrayEvents',
      navMenuItemTitle: 'Showing Trays',
      ContentComponent: ShowTrayEvents,
    };
  }
  return settingsSections;
};

export default (isAuthenticated: boolean) =>
  Object.values(getSettingsSectionsConfig(isAuthenticated));
