import RohText from '@components/RohText';
import { TTouchableHighlightWrapperRef } from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { View, StyleSheet, TouchableHighlight, FlatList } from 'react-native';
import { playerBitratesFilter } from '@configs/bitMovinPlayerConfig';
import VideoPlayerSettingsItem from '@components/SettingsComponents/commonControl/VideoPlayerSettingsItem';
import {
  saveSelectedBitrateId,
  getSelectedBitrateId,
} from '@services/bitMovinPlayer';

import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';
import { isTVOS } from "configs/globalConfig";

export type TVideoPlayerSettingsProps = {
  listItemGetNode?: () => number;
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const VideoPlayerSettings: React.FC<TVideoPlayerSettingsProps> = ({
  listItemGetRef,
}) => {
  const [selectedId, setSelectedId] = useState<string>('');
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const buttonRef = useRef<TTouchableHighlightWrapperRef>(null);
  const mounted = useRef<boolean>(false);

  const pressHandler = useCallback((id: string) => {
    saveSelectedBitrateId(id, () => {
      if (mounted.current) {
        setSelectedId(id);
      }
    });
  }, []);

  useEffect(() => {
    getSelectedBitrateId().then(id => {
      if (mounted.current) {
        setSelectedId(id);
      }
    });
  }, []);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (typeof buttonRef.current?.getRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
        'qualityBtn',
        buttonRef.current.getRef().current,
      );
    }
    if (typeof listItemGetRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectToNavMenu?.(
        'qualityBtn',
        listItemGetRef().current,
      );
    }
  }, [listItemGetRef]);
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect ref={navMenuScreenRedirectRef} />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <RohText style={styles.titleText}>Video quality settings</RohText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonContainer}>
            <FlatList
              data={Object.values(playerBitratesFilter)}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item, index }) => (
                <VideoPlayerSettingsItem
                  ref={index === 0 ? buttonRef : undefined}
                  text={item.title.toUpperCase()}
                  currentIndex={index}
                  itemsLength={Object.values(playerBitratesFilter).length}
                  isActive={selectedId === item.key}
                  type={item.type}
                  id={item.key}
                  onPress={pressHandler}
                />
              )}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default VideoPlayerSettings;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    height: '100%',
    flex: 1,
  },
  contentContainer: {
    paddingTop: scaleSize(42),
    width: scaleSize(700),
    marginLeft: isTVOS ? scaleSize(24) : 0,
  },
  titleContainer: {
    marginBottom: scaleSize(34),
  },
  titleText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.midGrey,
  },
  descriptionContainer: {
    marginBottom: scaleSize(60),
  },
  descriptionText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(32),
    color: Colors.defaultTextColor,
  },
  commonQuestionContainer: {
    marginBottom: scaleSize(40),
  },
  commonQuestionText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    color: Colors.defaultTextColor,
    letterSpacing: scaleSize(1),
    textTransform: 'uppercase',
  },
  actionButtonContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
  },
  actionButtonContentContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
    paddingRight: scaleSize(25),
    paddingVertical: scaleSize(25),
  },
  actionButtonsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  actionButtonText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    color: Colors.defaultTextColor,
  },
  actionButtonDefault: {
    borderWidth: scaleSize(2),
    borderColor: Colors.defaultTextColor,
  },
  actionButtonFocus: {
    borderColor: Colors.defaultTextColor,
    backgroundColor: Colors.defaultTextColor,
  },
});
