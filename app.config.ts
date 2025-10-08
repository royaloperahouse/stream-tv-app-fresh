import { ExpoConfig } from 'expo/config';

export const config: ExpoConfig = {
  android: {
    package: "com.rohtvapp",
  },
  name: 'RohTVApp',
  slug: 'RohTVApp',
  plugins: [
    [
      'bitmovin-player-react-native',
      {
        playerLicenseKey: 'YOUR_PLAYER_LICENSE_KEY',
      }
    ]
  ]
}
