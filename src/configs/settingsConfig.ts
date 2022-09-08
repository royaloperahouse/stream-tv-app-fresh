import {
  SignOut,
  Account,
  AppVersion,
  SwitchingBetweenEnvironments,
  Subscription,
} from '@components/SettingsComponents';
import { store } from '@services/store';
import type {
  TAccountProps,
  TSignOutProps,
  TAppVersionProps,
  TSwitchingBetweenEnvironmentsProps,
  TSwitchSubscriptionMode,
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
        TSwitchSubscriptionMode
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
  };
  if (store.getState().auth.userEmail.includes('roh.org.uk')) {
    settingsSections.switchingBetweenEnv = {
      key: 'switchingBetweenEnv',
      navMenuItemTitle: 'ENVIRONMENT SWITCHING',
      ContentComponent: SwitchingBetweenEnvironments,
    };
  }
  return settingsSections;
};

export default () => Object.values(getSettingsSectionsConfig());
