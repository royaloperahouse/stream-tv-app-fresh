import { getUniqueId } from 'react-native-device-info';

const upgradeEnv = 'https://roh-upgrade.global.ssl.fastly.net/api';
const stagingEnv = 'https://roh-stagev2.global.ssl.fastly.net/api';

export const ApiConfig = Object.freeze({
  host: 'https://www.roh.org.uk/api',
  deviceId: getUniqueId(),
  stagingEnv,
  upgradeEnv,
  manifestURL: stagingEnv,
  routes: {
    verifyDevice: '/auth/device',
    videoSource: '/video-source',
    pinUnlink: '/auth/device/unlink',
    subscriptionInfo: '/auth/device/subscription-info',
    digitalEvents: '/digital-events',
    checkoutPayPerView: '/checkout/payPerView',
    checkoutPurchasedStreams: '/checkout/purchasedStreams',
    searchHistory: '/user/tv/search-history',
    clearSearchHistory: '/user/tv/search-history/clear',
    tvDataStatus: '/user/tv',
    watchStatus: '/user/tv/watch-status',
    myLsit: '/user/tv/my-list',
    clearMyList: '/user/tv/my-list/clear',
    analytics: '/information/analytics',
    activateAvailabilityWindow: '/checkout/purchasedStreams/activateAvailabilityWindow',
  },
  auth: {
    username: 'tvapp',
    password: 'stream',
  },
});
