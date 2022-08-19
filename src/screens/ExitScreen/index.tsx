import React, { useCallback, useState } from "react";
import LoadingSpinner from '@components/LoadingSpinner';
import { View, TouchableHighlight } from 'react-native';
import RohText from '@components/RohText';
import GlobalModal, { globalModalManager } from '@components/GlobalModals';
import { PlayerModal, WarningOfExitModal } from "components/GlobalModals/variants";
import { goBackButtonuManager } from "components/GoBack";

type TExitScreenProps = {};

const ExitScreen: React.FC<TExitScreenProps> = () => {
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const openModal = () => {
    globalModalManager.openModal({
      contentComponent: WarningOfExitModal,
      contentProps: {
        title: 'title',
      },
    });
  }

  const openPlayer = ({
       url = '',
       poster = '',
       offset = '0.0',
       title: playerTitle = '',
       subtitle = '',
       onClose = () => {},
       analytics = {},
       guidance = '',
       guidanceDetails = [],
     }) => {
      goBackButtonuManager.hideGoBackButton();
      globalModalManager.openModal({
        contentComponent: PlayerModal,
        contentProps: {
          autoPlay: true,
          configuration: {
            url: 'https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd',
            poster,
            offset,
          },
          title: playerTitle,
          subtitle,
          onClose,
          analytics,
          guidance,
          guidanceDetails,
        },
      });
    }



  return (
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>

      <LoadingSpinner showSpinner={showSpinner} size={90} />
      <TouchableHighlight underlayColor="transparent" onPress={() => {
          // setShowSpinner(prevState => !prevState);
          // openModal();
          openPlayer({});
        }}>
        <RohText style={{ color: 'white', margin: 20 }}>toggle spinner</RohText>

      </TouchableHighlight>
    </View>);

};

export default ExitScreen;
