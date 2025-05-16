import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, { useLayoutEffect, useRef, useState } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import {
  clearEventState,
  getEventListLoopStop,
} from '@services/store/events/Slices';
import {
  clearAuthState,
  endLoginLoop,
  endFullSubscriptionLoop,
} from '@services/store/auth/Slices';
import { pinUnlink } from '@services/apiClient';

import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';

export type TSignOutProps = {
  listItemGetNode?: () => number;
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const SignOut: React.FC<TSignOutProps> = ({ listItemGetRef }) => {
  const [focused, setFocused] = useState(false);
  const dispatch = useAppDispatch();
  const isProduction = useAppSelector(isProductionEvironmentSelector);
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const buttonRef = useRef<TTouchableHighlightWrapperRef>(null);
  const signOutActionHandler = () =>
    pinUnlink(isProduction)
      .then(response => {
        if (response.status !== 204) {
          throw Error('Something went wrong');
        }
        dispatch(endFullSubscriptionLoop());
        dispatch(clearAuthState());
      })
      .catch(console.log);
  useLayoutEffect(() => {
    if (typeof buttonRef.current?.getRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
        'signOutBtn',
        buttonRef.current.getRef().current,
      );
    }
    if (typeof listItemGetRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectToNavMenu?.(
        'signOutBtn',
        listItemGetRef().current,
      );
    }
  }, [listItemGetRef]);
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect ref={navMenuScreenRedirectRef} />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <RohText style={styles.titleText}>Sign out of this device</RohText>
        </View>
        <View style={styles.descriptionContainer}>
          <RohText style={styles.descriptionText}>
            Choosing to sign out of this device will stop this device being
            paired with your ROH account. To access content on this device
            again, you will need to pair.
          </RohText>
        </View>
        <View style={styles.commonQuestionContainer}>
          <RohText style={styles.commonQuestionText}>
            Are you sure you want to sign out?
          </RohText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonContainer}>
            <TouchableHighlightWrapper
              ref={buttonRef}
              canMoveRight={false}
              canMoveUp={false}
              canMoveDown={false}
              onPress={signOutActionHandler}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={styles.actionButtonDefault}
              styleFocused={styles.actionButtonFocus}>
              <View style={styles.actionButtonContentContainer}>
                <RohText style={focused ? styles.actionButtonTextFocused : styles.actionButtonText}>
                  I want to sign out
                </RohText>
              </View>
            </TouchableHighlightWrapper>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignOut;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    height: '100%',
    flex: 1,
  },
  contentContainer: {
    paddingTop: scaleSize(42),
    marginLeft: scaleSize(24),
    width: scaleSize(700),
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
    color: Colors.midGrey,
    letterSpacing: scaleSize(1),
  },
  actionButtonContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
    alignItems: 'center',
  },
  actionButtonContentContainer: {
    minWidth: scaleSize(358),
    minHeight: scaleSize(80),
    alignItems: 'center',
    paddingHorizontal: scaleSize(25),
    paddingVertical: scaleSize(25),
  },
  actionButtonsContainer: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  actionButtonText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    color: Colors.defaultTextColor,
  },
  actionButtonTextFocused: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    color: Colors.focusedTextColor,
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
