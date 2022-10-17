import {
  SignOut,
  Account,
  AppVersion,
  SwitchingBetweenEnvironments,
  Subscription,
  VideoPlayerSettings,
  ShowTrayEvents,
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
        TVideoPlayerSettingsProps
    >
  >;
};

export const getSettingsSectionsConfig: () => {
  [key: string]: TSettingsSection;
} = () => {
  const settingsSections: {
    [key: string]: TSettingsSection;
  } = {
    account: {
      key: 'account',
      navMenuItemTitle: 'ACCOUNT',
      ContentComponent: Account,
    },
    signOut: {
      key: 'signOut',
      navMenuItemTitle: 'SIGN OUT',
      ContentComponent: SignOut,
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

export default () => Object.values(getSettingsSectionsConfig());
