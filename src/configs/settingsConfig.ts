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
export const settingsTitle = 'SETTINGS';

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
      navMenuItemTitle: 'ACCOUNT',
      ContentComponent: Account,
    },
    [isAuthenticated ? 'signOut' : 'pinPage']: {
      key: isAuthenticated ? 'signOut' : 'pinPage',
      navMenuItemTitle: isAuthenticated ? 'SIGN OUT' : 'PIN PAGE',
      ContentComponent: isAuthenticated ? SignOut : LoginWithoutQRCode,
    },
    appVersion: {
      key: 'appVersion',
      navMenuItemTitle: 'APP VERSION',
      ContentComponent: AppVersion,
    },
    subscription: {
      key: 'subscription',
      navMenuItemTitle: 'SUBSCRIPTION',
      ContentComponent: Subscription,
    },
    videoPlayerSettings: {
      key: 'videoPlayerSettings',
      navMenuItemTitle: 'VIDEO PLAYER SETTINGS',
      ContentComponent: VideoPlayerSettings,
    },
  };
  if (store.getState().auth.userEmail.includes('roh.org.uk')) {
    settingsSections.switchingBetweenEnv = {
      key: 'switchingBetweenEnv',
      navMenuItemTitle: 'ENVIRONMENT SWITCHING',
      ContentComponent: SwitchingBetweenEnvironments,
    };

    settingsSections.showTrayEvents = {
      key: 'showTrayEvents',
      navMenuItemTitle: 'SHOWING TRAYS',
      ContentComponent: ShowTrayEvents,
    };
  }
  return settingsSections;
};

export default (isAuthenticated: boolean) =>
  Object.values(getSettingsSectionsConfig(isAuthenticated));
