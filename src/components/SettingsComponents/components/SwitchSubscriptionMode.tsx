import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { toggleSubscriptionMode } from '@services/store/auth/Slices';
import { subscribedModeSelector } from '@services/store/auth/Selectors';
import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';

export type TSwitchSubscriptionMode = {
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const SwitchSubscriptionMode: React.FC<TSwitchSubscriptionMode> = ({
  listItemGetRef,
}) => {
  const dispatch = useAppDispatch();
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const buttonRef = useRef<TTouchableHighlightWrapperRef>(null);
  const fullSubscription: boolean = useAppSelector(subscribedModeSelector);
  const switchSubscriptionModeActionHandler = () =>
    dispatch(toggleSubscriptionMode());
  const actionButtonText = `Switch to ${
    fullSubscription ? 'non-subscribed' : 'subscribed'
  } mode`;
  const subscriptionInfoText = `You are ${
    fullSubscription ? 'subscribed' : 'non-subscribed'
  }`;

  useLayoutEffect(() => {
    if (typeof buttonRef.current?.getRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
        'switchSubscriptionBtn',
        buttonRef.current.getRef().current,
      );
    }
    if (typeof listItemGetRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectToNavMenu?.(
        'switchSubscriptionBtn',
        listItemGetRef().current,
      );
    }
  }, [listItemGetRef]);

  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect ref={navMenuScreenRedirectRef} />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <RohText style={styles.titleText}>
            Switch of Subscription Mode
          </RohText>
        </View>
        <View style={styles.descriptionContainer}>
          <RohText style={styles.descriptionText}>
            {subscriptionInfoText}
          </RohText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <View style={styles.actionButtonContainer}>
            <TouchableHighlightWrapper
              ref={buttonRef}
              canMoveRight={false}
              canMoveUp={false}
              canMoveDown={false}
              onPress={switchSubscriptionModeActionHandler}
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

export default SwitchSubscriptionMode;

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    flex: 1,
    height: '100%',
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
    textTransform: 'uppercase',
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
    justifyContent: 'center',
    alignItems: 'center',
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
