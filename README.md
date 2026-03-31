# Royal Opera House Stream TV App

A React Native TV streaming application for watching opera, ballet, and classical music performances from the Royal Opera House.

## Overview

RohTVApp is a multi-platform TV application that allows users to browse, search, and stream Royal Opera House performances. It supports both subscription-based and pay-per-view access models, with features including continue watching, personal lists, live streaming, and multi-language subtitles.

### Supported Platforms

| Platform | Status |
|----------|--------|
| Apple TV (tvOS 14.0+) | Supported |
| Android TV | Supported |
| Amazon Fire TV | Supported (primary Android target) |
| Chromecast | Supported |
| iOS | Builds but not operational |

## Tech Stack

| Category | Library | Version |
|----------|---------|---------|
| Framework | react-native-tvos | 0.72.6-1 |
| UI Library | React | 18.2.0 |
| Language | TypeScript | 5.2.2 |
| State Management | @reduxjs/toolkit | 1.8.3 |
| Side Effects | redux-saga | 1.1.3 |
| Navigation | @react-navigation/drawer + native-stack | 6.x |
| Video Player | bitmovin-player-react-native | 0.27.1 |
| CMS | @prismicio/client | 6.6.2 |
| HTTP Client | axios | 0.27.2 |
| Search | fuse.js | 6.6.2 |
| Error Tracking | @sentry/react-native | 5.19.3 |
| Build System | Expo CLI | 49.0.18 |
| Feature Flags | flagged | 2.0.5 |
| Dev Debugging | reactotron-react-native | 5.0.3 |

> **Note:** `react-native` is npm-aliased to `react-native-tvos` in `package.json` (line 45: `"react-native": "npm:react-native-tvos@0.72.6-1"`). Two `patch-package` patches are applied post-install for `react-native-countdown-component` and `react-native-gesture-handler`.

## Project Structure

```
src/
  assets/              Fonts, icons, SVGs, splash screen images
  components/          Reusable UI components
    EventDetailsComponents/  Event detail sub-screens (General, Cast, etc.)
    EventListComponents/     Content rail/list rendering
    GlobalModals/            App-wide modal system
    NavMenu/                 TV navigation sidebar with focus animation
    Player/                  Bitmovin video player controls and UI
    SettingsComponents/      Account and settings UI
    VirtualKeyboard/         TV-optimized keyboard for search input
  configs/             App configuration (API, Bitmovin, Prismic, nav, etc.)
  hooks/               Custom React hooks (redux, useEventDetails, useMyList, etc.)
  layouts/             Page layout layers (appLayout, mainLayout, contentLayout)
  navigations/         React Navigation route definitions
  screens/             Screen components (12 screens, one per directory)
  services/            Core business logic
    apiClient/           ROH backend HTTP client (Axios)
    bitMovinPlayer/      Video player position save/restore
    focusService/        TV remote control focus management
    myList/              My List persistence
    previousSearch/      Search history persistence
    prismicApiClient/    Prismic CMS queries
    reactotronDebugger/  Dev debugging config
    sessionStorage/      Platform-specific storage abstraction
    store/               Redux store (auth/, events/, settings/ slices)
    tvRCEventListener/   TV remote control event subscription system
    types/               TypeScript type definitions and models
  themes/              Styling and font definitions
  utils/               Utility functions (custom errors, date formatting, analytics, etc.)
```

Root-level directories:

```
scripts/     Shell scripts for cache clearing, reinstalling, building
patches/     patch-package patches applied on postinstall
docs/        Legacy documentation (superseded by this README)
android/     Android native code and Gradle build config
ios/         iOS/tvOS native code, Xcode project, CocoaPods
```

## Architecture

### Application Lifecycle

Boot sequence:

1. **`index.js`** - Registers the app, imports `react-native-gesture-handler`, polyfills `Promise.allSettled`, `btoa`, and `atob`
2. **`App.tsx`** - Initializes Sentry, wraps app in Redux `Provider` and `FlagsProvider` with default feature flags, enables `react-native-screens`
3. **`AppLayout`** (`src/layouts/appLayout.tsx`) - The root runtime component:
   - Sets up deep linking listener for `rohtvapp://events/{eventId}` URL scheme
   - Monitors network connectivity via NetInfo — shows error modal and exits on disconnect
   - Verifies device authentication via `verifyDevice()`, fetches subscription status
   - Starts the event list loop (`getEventListLoopStart`)
   - Manages `TVEventManager` lifecycle (init/unmount)
   - Manages `TVEventControl.enableTVMenuKey()` / `disableTVMenuKey()` on tvOS
   - Hides boot splash on Android via `RNBootSplash.hide({ fade: true })`
   - Renders `IntroScreen` or `MainLayout` based on auth state

### Redux Store

Three slices manage all application state:

#### `auth` slice (`src/services/store/auth/Slices.ts`)

| Field | Type | Purpose |
|-------|------|---------|
| `isAuthenticated` | `boolean` | Whether device is verified |
| `devicePin` | `string \| null` | PIN displayed for login |
| `customerId` | `number \| null` | Authenticated customer ID |
| `fullSubscription` | `boolean` | Whether user has active subscription |
| `fullSubscriptionUpdateDate` | `string` | ISO date of last subscription check |
| `userEmail` | `string` | User's email address |
| `countryCode` | `string` | User's country (from `x-country-code` header) |
| `isDeepLinkingFlow` | `boolean` | Whether app was opened via deep link |
| `showIntroScreen` | `boolean` | Controls intro/splash screen visibility |

Key actions: `startLoginLoop`, `endLoginLoop`, `checkDeviceStart/Success/Error`, `updateSubscriptionMode`, `clearAuthState`, `turnOnDeepLinkingFlow`, `turnOffDeepLinkingFlow`

#### `events` slice (`src/services/store/events/Slices.ts`)

| Field | Type | Purpose |
|-------|------|---------|
| `allDigitalEventsDetail` | `{ [key: string]: TEventContainer }` | All events keyed by Prismic ID |
| `eventGroups` | `{ [key: string]: { title, ids } }` | Events grouped by tag |
| `searchQueryString` | `string` | Current search input |
| `eventsLoaded` | `boolean` | Whether initial content fetch is complete |
| `ppvEventsIds` | `string[]` | IDs of user's purchased PPV events |
| `availablePPVEventsIds` | `string[]` | IDs of all available PPV events |
| `showOnlyVisisbleEvents` | `boolean` | Tray visibility toggle (staff feature) |
| `exploreAllTrays` | `TStreamHomePageRail[]` | Home page content rails |
| `operaAndMusicTopTrays` | `TStreamHomePageRail[]` | Opera & Music top section rails |
| `operaAndMusicBottomTrays` | `TStreamHomePageRail[]` | Opera & Music bottom section rails |
| `balletAndDanceTopTrays` | `TStreamHomePageRail[]` | Ballet & Dance top section rails |
| `balletAndDanceBottomTrays` | `TStreamHomePageRail[]` | Ballet & Dance bottom section rails |
| `propositionPageElements` | `TStreamHomePageRail[]` | Non-subscriber proposition page content |

Key actions: `getEventListLoopStart/Stop`, `getEventListSuccess`, `setSearchQuery`, `clearSearchQuery`, `setPPVEventsIds`, `setAvailablePPVEventsIds`, `toggleShowOnlyVisisbleEvents`

#### `settings` slice (`src/services/store/settings/Slices.ts`)

| Field | Type | Purpose |
|-------|------|---------|
| `isProductionEnv` | `boolean` | Controls production vs staging environment (default: `true`) |

Action: `switchEnv` — toggles between production and staging. Only available to users with `roh.org.uk` email addresses (enforced in `settingsConfig.ts`).

### Saga Loops

Two root sagas run the app's background operations (`src/services/store/auth/Sagas.ts` and `src/services/store/events/Sagas.ts`):

#### Auth Login Loop
- **Interval:** 5 seconds
- **Lifecycle:** Runs until device is verified (returns `customerId`)
- **Flow:** Calls `verifyDevice` → on success dispatches `checkDeviceSuccess`, fetches subscription info → loop terminates

#### Subscription Loop
- **Interval:** 10 minutes
- **Lifecycle:** Runs throughout app lifetime after authentication
- **Flow:** Checks subscription status daily via `getSubscribeInfo`. For non-subscribers, fetches purchased PPV streams and forks `downloadListOfAvailablePPVEvents` (runs once per day)

#### Event List Loop
- **Interval:** 30 minutes
- **Lifecycle:** Runs throughout app lifetime
- **Flow:** Fetches all `digital_event_details` and `digital_event_video` documents from Prismic (paginated, 100 per page). Fetches `stream_home_page` for rail configuration. Filters events by country availability and `isBroken` status. Groups events by tags. Distributes content across tray arrays for different screens.

#### Deep Linking Flow
- **Trigger:** `turnOnDeepLinkingFlow` action
- **Flow:** Waits for events to load, then navigates to the target event details screen

### Navigation

**Root Stack** (NativeStack):
- `Content` — drawer navigator with nav menu
- `Player` — full-screen player overlay

**Content Drawer** (custom `NavMenu` sidebar, not standard drawer):

| Position | Screen | Nav Menu Item |
|----------|--------|---------------|
| 1 | Search | Yes |
| 2 | Home (default) | Yes |
| 3 | OperaMusic | Yes |
| 4 | BalletDance | Yes |
| 5 | LiveStream | Yes |
| 6 | MyList | Yes |
| 7 | Settings | Yes |
| 8 | EventDetails | No |
| 9 | EventVideo | No |
| 10 | Exit | No |

**Event Details Sub-screens** (internal stack navigation):
General, Cast, Creatives, Synopsis, Info, Extras, Shop

The `NavMenu` component animates between collapsed (100px) and expanded (400px) widths with 300ms animation duration (`src/configs/navMenuConfig.ts`).

## API Reference

### ROH Backend API

**Base URL:** `https://www.rbo.org.uk/api` (production)

Alternative environments:
- Staging: `https://roh-stagev2.global.ssl.fastly.net/api`
- Upgrade: `https://roh-upgrade.global.ssl.fastly.net/api`

All requests include an `X-Device-ID` header (from `react-native-device-info` `getUniqueId()`). Timeout: 20 seconds.

| Route | Method | Purpose | Auth |
|-------|--------|---------|------|
| `/auth/device` | GET | Verify device, returns customerId + PIN | Device ID header |
| `/auth/device/unlink` | DELETE | Unlink device PIN (sign out) | Device ID header |
| `/auth/device/subscription-info` | GET | Check subscription status | Device ID header |
| `/video-source` | GET | Get video stream URL by ID | Basic auth (`tvapp`/`stream`) |
| `/digital-events` | GET | Get events by fee IDs | Basic auth |
| `/checkout/payPerView` | GET | List all available PPV events | Device ID header |
| `/checkout/purchasedStreams` | GET | List user's purchased streams | `x-customer-id` header |
| `/checkout/purchasedStreams/activateAvailabilityWindow` | POST | Activate PPV rental window | `x-customer-id` header |
| `/user/tv/watch-status` | GET/POST | Get/save video playback position | Device ID header |
| `/user/tv/my-list` | GET/POST/DELETE | Manage My List | Device ID header |
| `/user/tv/my-list/clear` | DELETE | Clear entire My List | Device ID header |
| `/user/tv/search-history` | GET/POST/DELETE | Manage search history | Device ID header |
| `/user/tv/search-history/clear` | DELETE | Clear search history | Device ID header |
| `/user/tv` | GET | Get all TV data (myList + watchStatus + searchHistory) | Device ID header |
| `/information/analytics` | POST | Send analytics events (batched, 50 per request) | None |

### Prismic CMS API

**Endpoint:** `https://royal-opera-house.cdn.prismic.io/api/v2` (production)

Staging endpoint available but commented out in `src/configs/prismicApiConfig.ts`.

**Document types queried:**

| Document Type | Purpose |
|---------------|---------|
| `digital_event_details` | Event metadata (title, description, cast, videos, images, etc.) |
| `digital_event_video` | Video records linked to events |
| `stream_home_page` | Homepage and content screen rail configuration |
| `feature_flags` | Feature flags (query exists but currently unused in saga) |

The client switches between `Master Ref` (production) and `Staging` ref labels based on the `isProductionEnv` setting.

## Authentication Flow

1. App launches. `AppLayout` calls `verifyDevice()` with the device's unique ID
2. If no `customerId` is returned (HTTP 401), the app displays a PIN on the login screen. If `hasQRCode` flag is enabled, a QR code is also shown
3. User visits the ROH website and enters the PIN (or scans the QR code) to link the device
4. The login loop polls `verifyDevice` every **5 seconds** until the backend returns a `customerId`
5. On success: `checkDeviceSuccess` is dispatched, subscription info is fetched, and the event list loop starts
6. The subscription loop then runs every **10 minutes** to check subscription status and PPV purchases
7. **Sign out:** calls `/auth/device/unlink` (DELETE) and dispatches `clearAuthState`

**Deep linking:** The app handles `rohtvapp://events/{eventId}` URLs. On receiving a deep link, it triggers `turnOnDeepLinkingFlow`, waits for events to load, then navigates directly to the event details screen.

## Video Player

### Bitmovin Player Configuration

Defined in `src/configs/bitMovinPlayerConfig.ts`:

| Preset | Label | Max Bitrate | Icon |
|--------|-------|-------------|------|
| `high` | Best | Unlimited (-1) | HQ |
| `medium` | Good | 5.5 Mbps | HD |
| `normal` | Low bandwidth | 1.5 Mbps | SD |

**Default quality:** `high` (Best) for Amazon Fire TV and tvOS, `normal` (Low bandwidth) for other Android TV devices.

### Playback Features
- Play/pause, 10-second seek forward/backward
- Subtitle/caption selection (multi-language via ISO 639-1)
- Video quality/bitrate selection
- Audio track selection
- Progress bar with scrubbing
- Resume from saved position (minimum 5 seconds watched, 2-second rollback on resume)
- Continue Watching rail (title: "Continue Watching")
- Playback position saved to backend via `/user/tv/watch-status`

### Video Access Flow

Implemented in `getAccessToWatchVideo()` in `src/services/apiClient/index.ts`:

1. Check subscription via `getSubscribeInfo`
2. If subscribed: return video object, play immediately
3. If not subscribed: fetch purchased streams via `getPurchasedStreams`
4. Filter purchases by `transaction_status === 'success'` and valid availability window
5. If PPV purchased and available: return video with PPV metadata (`feeId`, `orderNo`, `isPPV`, `availabilityWindow`)
6. If not purchased: throw `NotRentedItemError`

## Content Pipeline

How content flows from Prismic CMS to screen:

1. `getEventListLoopWorker` saga fetches all `digital_event_details` documents from Prismic (paginated, 100 per page)
2. Fetches all `digital_event_video` documents and transforms them
3. Fetches `stream_home_page` document for rail configuration (tray ordering for all content screens)
4. Events are filtered: removes broken video links (`isBroken`), checks country availability
5. Events are grouped by tags into `eventGroups`
6. Content is distributed across 6 tray arrays for different screens: `exploreAllTrays`, `operaAndMusicTopTrays`, `operaAndMusicBottomTrays`, `balletAndDanceTopTrays`, `balletAndDanceBottomTrays`, `propositionPageElements`
7. Home page rail order for subscribers: Continue Watching, My List, Current Rentals, Available to Rent, Prismicised explore-all trays, then tag-based groups. Non-subscribers see proposition page elements instead.

> **Note:** Videos fetched from Prismic are filtered by `video_type === "performance"`. In production, each event should have only one performance video (the first is used). Staging may have multiple.

## Feature Flags

### Client-side Flags

Configured via the `flagged` library in `App.tsx`:

| Flag | Default | Purpose |
|------|---------|---------|
| `hasOpera` | `false` | Controls Opera & Music screen availability |
| `canExit` | `true` | Controls exit functionality |
| `showLiveStream` | `false` | Controls Live Stream screen visibility |
| `hasQRCode` | `false` | Controls QR code display on login screen |

Consumed via `useFeature('flagName')` hook from the `flagged` library.

### Prismic-based Flags

A `getFeatureFlags` query function exists in `src/services/prismicApiClient/index.ts` that queries the `feature_flags` document type. This is currently not called in the event saga (the call is commented out).

## Platform-Specific Behavior

| Behavior | tvOS | Android TV / Fire TV |
|----------|------|----------------------|
| Session storage | In-memory object (`SessionStorage.tvosStarage`) | `AsyncStorage` |
| Flipper/Redux debugging | Not loaded | Loaded via `redux-flipper` |
| TV menu key management | `TVEventControl.enableTVMenuKey()` / `disableTVMenuKey()` | N/A |
| Default video quality | Best (unlimited bitrate) | Best for Amazon, Low bandwidth for others |
| Boot splash | Handled natively | Hidden via `RNBootSplash.hide({ fade: true })` |
| Platform detection | `Platform.OS === 'ios' && Platform.isTVOS` | `getManufacturerSync() === 'Amazon'` for Fire TV |

## Developer Setup

### Prerequisites

- Node.js >= 16
- Watchman
- Xcode (for tvOS/iOS builds)
- CocoaPods
- Android Studio with Java 17
- Ruby (version specified in `.ruby-version`)

### Installation

```bash
brew install node watchman

yarn install          # runs patch-package via postinstall

cd ios && pod install # may need `pod repo update` first
```

### Run Commands

| Command | Description |
|---------|-------------|
| `yarn start` | Start Metro bundler (`expo start`) |
| `yarn tvos` | Run on Apple TV simulator (`expo run:ios --scheme RohTVApp-tvOS --device "Apple TV"`) |
| `yarn android` | Run on Android TV (`expo run:android`) |
| `yarn ios` | Run on iOS (builds but not operational) |
| `yarn test` | Run Jest tests |
| `yarn lint` | Run ESLint |
| `yarn clean` | Clean project (`react-native-clean-project`) |
| `yarn build-production:android` | Build Android release APK (`./gradlew assembleRelease`) |
| `yarn run-production:android` | Run Android release variant |

### Getting Started with Auth

1. Launch the app and press the "Getting Started" button on the start screen
2. You will see a PIN code (and QR code if the `hasQRCode` flag is enabled)
3. Provide your public IP address to ROH so they can add it to their allowlist
4. Provide the on-screen PIN code to ROH
5. The login loop auto-detects when the PIN is activated (no manual refresh needed)
6. Once authenticated, you can browse and stream content

### Android

```bash
yarn android
```

The recommended development experience is on an Amazon Fire Stick. To connect, follow Amazon's [Connecting ADB to Device](https://developer.amazon.com/docs/fire-tv/connecting-adb-to-device.html) guide. You may need to restart `adb` occasionally.

### Apple TV

```bash
yarn tvos
```

To reload/restart the app, hold down the space bar until you see the debug menu, then choose "reload".

## Build & Deployment

### Android TV

1. Increment `versionCode` and `versionName` in `android/app/build.gradle` (currently `164` / `3.3.5`)
2. In Android Studio, change build variants to `release`
3. Build > Generate Signed Bundle or APK > Android App Bundle
4. Select `release` build variant and destination folder
5. Upload the generated `app-release.aab` to the Google Play Console

### Apple TV (tvOS)

- **Simulator:** `yarn tvos`
- **Real device:** Open Xcode, select `RohTVApp-tvOS` scheme, build and run

**Xcode workaround:** In the `RohTVApp-tvOS` target, Build Phases contains a "Run Script" that sets `MinimumOSVersion` in Info.plist. This is required for the Hermes framework. Update this script when changing the target deployment version.

**Known issue:** Real device deployment may fail with "Failed code verification for hermes.framework" or "Integrity of the app could not be verified". Fix documented [here](https://stackoverflow.com/a/43017549).

### iOS

```bash
yarn ios
```

Builds but is not currently operational.

## Utility Scripts

Located in the `scripts/` directory:

| Script | Purpose |
|--------|---------|
| `clearNativeCache.sh` | Clear node_modules, watchman, metro cache |
| `makeSplashScreenAssets.sh` | Generate splash screen assets for Android and iOS |
| `reInstallAndroidPart.sh` | Clear Gradle cache, resync project, reload Maven packages |
| `reInstallIOSPart.sh` | Clear CocoaPods cache, reinstall pods |
| `reInstallProject.sh` | Full clean reinstall (combines all above) |
| `createAndroidBuild.sh` | Build Android app |

## Path Aliases

Configured in `tsconfig.json` and `babel.config.js`:

| Alias | Path |
|-------|------|
| `@components/*` | `src/components/*` |
| `@configs/*` | `src/configs/*` |
| `@screens/*` | `src/screens/*` |
| `@services/*` | `src/services/*` |
| `@layouts/*` | `src/layouts/*` |
| `@assets/*` | `src/assets/*` |
| `@hooks/*` | `src/hooks/*` |
| `@themes/*` | `src/themes/*` |
| `@utils/*` | `src/utils/*` |
| `@navigations/*` | `src/navigations/*` |

Bare imports (e.g., `import X from 'services/...'`) also resolve to `src/` via the `root` option in babel's `module-resolver` plugin.

## Debugging

- **Reactotron:** Configured in `src/services/reactotronDebugger/reactotronConfig.ts`. Redux state inspection, saga monitoring, custom logging via `roh_rlog()`
- **Flipper:** Redux state via `redux-flipper` (Android only, not loaded on tvOS)
- **Sentry:** Error tracking in production. DSN configured in `src/configs/globalConfig.ts`
- **Environment switching:** The Settings screen allows toggling between production and staging environments. Restricted to users with `roh.org.uk` email addresses
- **Tray visibility toggle:** Staff can toggle `showOnlyVisisbleEvents` to see hidden trays in the content screens

## Analytics

Custom analytics event system in `src/utils/storeEvents.ts`:

**Event types:**
- `open_performance_rails` — user opens a performance from a content rail
- `open_performance_search` — user opens a performance from search results
- `section_viewed` — user scrolls to a section in event details
- `option_clicked` — user clicks an option in event details

Events are stored locally (using `Settings` API on tvOS, `AsyncStorage` on Android), batched (50 per batch), and sent to `/information/analytics`. Each event is tagged with the device type (AppleTV, FireTV, ChromeCast, or unknown).

## Custom Error Types

Defined in `src/utils/customErrors.ts`:

| Error | Purpose |
|-------|---------|
| `NotRentedItemError` | Thrown when user attempts to watch un-purchased PPV content. Default message directs to the ROH website. |
| `UnableToCheckRentalStatusError` | Thrown when subscription status check fails |
| `NonSubscribedStatusError` | Generic non-subscribed state |

## Known Issues & Workarounds

- **react-native-countdown-component:** Library is abandoned and uses deprecated functions. A `patch-package` patch is applied on `postinstall`. See [GitHub issue #123](https://github.com/talalmajali/react-native-countdown-component/issues/123).
- **react-native-gesture-handler:** A `patch-package` patch is applied on `postinstall`.
- **FastImage sizing on tvOS:** Add `zIndex: 0` style to `FastImage` component instances. See [react-native-tvos#226](https://github.com/react-native-tvos/react-native-tvos/issues/226).
- **Hermes code verification:** Real Apple TV device deployment may fail with "Failed code verification for hermes.framework". Fix: [Stack Overflow](https://stackoverflow.com/a/43017549).
- **Android emulator hanging on macOS:** In Android Studio SDK Manager > SDK Tools > uncheck "Android Emulator" > Apply > re-check to trigger update. See [Stack Overflow](https://stackoverflow.com/a/67304587/1861645).
- **Polyfills:** `Promise.allSettled`, `btoa`, and `atob` are polyfilled in `index.js` due to React Native limitations.
- **Hermes disabled on Android:** `enableHermes: false` in `android/app/build.gradle`. Hermes is enabled for tvOS/iOS.
