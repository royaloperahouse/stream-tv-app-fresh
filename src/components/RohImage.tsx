import React, { FC, useState } from 'react';
import FastImage, { ResizeMode } from 'react-native-fast-image';
import PlaceholderLandscape from '../assets/image-placeholder-landscape.svg';
import PlaceholderPortrait from '../assets/image-placeholder-portrait.svg';
import { StyleSheet, View } from 'react-native';
import { Colors } from 'themes/Styleguide';

type TRohImageProps = {
  resizeMode: ResizeMode;
  style: any;
  source: string;
  focused: boolean;
  isPortrait?: boolean;
};

const RohImage: FC<TRohImageProps> = ({
  resizeMode,
  style,
  source,
  focused,
  isPortrait = false,
}) => {
  const [isError, setIsError] = useState<boolean>(false);
  if (isError) {
    return isPortrait ? (
      <PlaceholderPortrait width={style.width} height={style.height} />
    ) : (
      <PlaceholderLandscape width={style.width} height={style.height} />
    );
  }

  return (
    <View style={style}>
      <View>
        {isPortrait ? (
          <PlaceholderPortrait width={style.width} height={style.height} />
        ) : (
          <PlaceholderLandscape width={style.width} height={style.height} />
        )}
      </View>

      <FastImage
        resizeMode={resizeMode}
        style={[
          style,
          styles.container,
          focused ? { backgroundColor: Colors.defaultBlue } : {},
        ]}
        source={{
          uri: source,
        }}
        onError={() => setIsError(true)}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
  },
});
export default RohImage;
