export const Colors = Object.freeze({
  backgroundColor: '#000000',
  backgroundColorTransparent: '#0E1B31CC',
  defaultBlue: '#F1F1F1',
  navIconDefault: '#F1F1F1',
  navIconActive: '#FFFFFF',
  defaultTextColor: '#F1F1F1',
  focusedTextColor: '#1A1A1A',
  displayBackgroundColor: '#424243',
  midGrey: '#919191',
  lightGrey: '#929292',
  tVMidGrey: '#6887B6',
  tvMidGreyWith50Alpha: '#364b6b',
  title: '#FFFFFF',
  subtitlesActiveBackground: '#1866DC',
  streamPrimary: '#1866DC',
  tvDarkTint: '#050F20',
});

export const Images = Object.freeze({
  introBackground: require('@assets/images/intro_background.png'),
  splashScreen: require('@assets/splashscreen/bootsplash_logo.png'),
 /* defaultBackground: require('@assets/default_background.png'),
  ROHLogo: require('@assets/ROH_Logo.png'),
  streamLogo: require('@assets/Stream_Logo.png'),
  loadingScreen: require('@assets/TV_01_loading.jpg'), */
});

export const Fonts = Object.freeze({
  default: 'GreyLL-Regular',
  bold: 'GreyLL-Bold',
  italic: 'GreyLL-MediumItalic',
  boldItalic: 'GreyLL-BoldItalic',
});

export const Icons = Object.freeze({
/*   addToList: require('@assets/icons/add_to_list.png'),
  back: require('@assets/icons/back.png'),
  bell: require('@assets/icons/bell.png'),
  down: require('@assets/icons/down.png'),
  trailer: require('@assets/icons/trailer.png'),
  watch: require('@assets/icons/watch.png'), */
});

export const PlayerIcons = Object.freeze({
  play: require('@assets/icons/player_play.png'),
  pause: require('@assets/icons/player_pause.png'),
  seekForward: require('@assets/icons/player_seek_forward.png'),
  seekBackward: require('@assets/icons/player_seek_backward.png'),
  subtitles: require('@assets/icons/player_subtitles.png'),
  description: require('@assets/icons/player_description.png'),
  close: require('@assets/icons/player_close.png'),
  restart: require('@assets/icons/player_restart.png'),
});

export default Object.freeze({
  colors: Colors,
  images: Images,
  icons: Icons,
  fonts: Fonts,
  playerIcons: PlayerIcons,
});
