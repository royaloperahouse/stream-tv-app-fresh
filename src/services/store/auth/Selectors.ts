import isValid from 'date-fns/isValid';
import format from 'date-fns/format';
import type { TRootState } from '../index';
export const introScreenShowSelector = (store: TRootState) =>
  store.auth.showIntroScreen;

export const deviceAuthenticatedSelector = (store: TRootState) =>
  store.auth.isAuthenticated;

export const devicePinSelector = (store: TRootState) => store.auth.devicePin;

export const deviceAuthenticatedErrorSelector = (store: TRootState) =>
  store.auth.errorString;

export const subscribedModeSelector = (store: TRootState) =>
  store.auth.fullSubscription;

export const subscribedModeUpdateDateSelector = (store: TRootState) =>
  store.auth.fullSubscriptionUpdateDate;

export const needSubscribedModeInfoUpdateSelector = (store: TRootState) =>
  !store.auth.fullSubscription ||
  !isValid(new Date(store.auth.fullSubscriptionUpdateDate)) ||
  format(new Date(store.auth.fullSubscriptionUpdateDate), 'DDD') !==
    format(new Date(), 'DDD') ||
  format(new Date(store.auth.fullSubscriptionUpdateDate), 'yyyy') !==
    format(new Date(), 'yyyy');

export const userEmailSelector = (store: TRootState) => store.auth.userEmail;

export const deviceAuthenticatedInfoLoadedSelector = (store: TRootState) =>
  store.auth.isLoaded;

export const customerIdSelector = (store: TRootState) => store.auth.customerId;
