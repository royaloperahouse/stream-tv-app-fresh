import React, { FC, useState } from 'react';
import FastImage, { ResizeMode } from 'react-native-fast-image';
import PlaceholderLandscape from '../assets/image-placeholder-landscape.svg';
import PlaceholderPortrait from '../assets/image-placeholder-portrait.svg';

type TRohImageProps = {
  resizeMode: ResizeMode;
  style: any;
  source: string;
  isPortrait?: boolean;
};

const RohImage: FC<TRohImageProps> = ({
  resizeMode,
  style,
  source,
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
    <FastImage
      resizeMode={resizeMode}
      style={style}
      source={{
        uri: source,
      }}
      onError={() => setIsError(true)}
    />
  );
};
export default RohImage;