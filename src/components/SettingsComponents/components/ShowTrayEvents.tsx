import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, { useLayoutEffect, useRef } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';
import { showOnlyVisisbleEventsSelector } from 'services/store/events/Selectors';
import { toggleShowOnlyVisisbleEvents } from 'services/store/events/Slices';

export type TShowTrayEventsProps = {
  listItemGetNode?: () => number;
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const ShowTrayEvents: React.FC<TShowTrayEventsProps> = ({ listItemGetRef }) => {
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const buttonRef = useRef<TTouchableHighlightWrapperRef>(null);
  const mounted = useRef<boolean>(false);
  const dispatch = useAppDispatch();
  const showOnlyVisible: boolean = useAppSelector(
    showOnlyVisisbleEventsSelector,
  );
  const pressHandler = () => {
    dispatch(toggleShowOnlyVisisbleEvents());
  };
  const actionButtonText = `Switch to show ${
    showOnlyVisible ? 'all trays' : 'only visible trays'
  }`;
  const currentEvironmentInfoText = `This is app is currently showing ${
    showOnlyVisible ? 'only visible' : 'all'
  } trays with events for screens with rails(ONLY FOR OPERA TEAM)`;
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useLayoutEffect(() => {
    if (typeof buttonRef.current?.getRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
        'showTrayEventsBtn',
        buttonRef.current.getRef().current,
      );
    }
    if (typeof listItemGetRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectToNavMenu?.(
        'showTrayEventsBtn',
        listItemGetRef().current,
      );
    }
  }, [listItemGetRef]);
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect ref={navMenuScreenRedirectRef} />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <RohText style={styles.titleText}>Show Trays With Events</RohText>
        </View>
        <View style={styles.descriptionContainer}>
          <RohText style={styles.descriptionText}>
            {currentEvironmentInfoText}
          </RohText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonContainer}>
            <TouchableHighlightWrapper
              ref={buttonRef}
              canMoveRight={false}
              canMoveUp={false}
              canMoveDown={false}
              onPress={pressHandler}
              style={styles.actionButtonDefault}
              styleFocused={styles.actionButtonFocus}>
              <View style={styles.actionButtonContentContainer}>
                <RohText style={styles.actionButtonText}>
                  {actionButtonText}
                </RohText>
              </View>
            </TouchableHighlightWrapper>
          </View>
        </View>
      </View>
    </View>
  );
};

export default ShowTrayEvents;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    height: '100%',
    flex: 1,
  },
  contentContainer: {
    paddingTop: scaleSize(42),
    marginLeft: scaleSize(80),
    width: scaleSize(700),
  },
  titleContainer: {
    marginBottom: scaleSize(34),
  },
  titleText: {
    fontSize: scaleSize(26),
    lineHeight: scaleSize(30),
    letterSpacing: scaleSize(1),
    color: Colors.tVMidGrey,
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
  },
  actionButtonContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
  },
  actionButtonContentContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
    paddingHorizontal: scaleSize(25),
    paddingVertical: scaleSize(25),
  },
  actionButtonsContainer: {
    justifyContent: 'center',
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
    borderColor: Colors.streamPrimary,
    backgroundColor: Colors.streamPrimary,
  },
});
