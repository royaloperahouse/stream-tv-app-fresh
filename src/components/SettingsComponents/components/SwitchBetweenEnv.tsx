import RohText from '@components/RohText';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import React, { useRef, useLayoutEffect } from 'react';
import { View, StyleSheet, TouchableHighlight } from 'react-native';
import { useAppDispatch, useAppSelector } from '@hooks/redux';
import { switchEnv } from '@services/store/settings/Slices';
import {
  clearEventState,
  getEventListLoopStop,
} from '@services/store/events/Slices';
import {
  clearAuthState,
  endFullSubscriptionLoop,
} from '@services/store/auth/Slices';

import { isProductionEvironmentSelector } from '@services/store/settings/Selectors';
import {
  NavMenuScreenRedirect,
  TNavMenuScreenRedirectRef,
} from '@components/NavmenuScreenRedirect';

export type TSwitchingBetweenEnvironmentsProps = {
  listItemGetRef?: () => React.RefObject<TouchableHighlight>;
};

const SwitchingBetweenEnvironments: React.FC<
  TSwitchingBetweenEnvironmentsProps
> = ({ listItemGetRef }) => {
  const dispatch = useAppDispatch();
  const navMenuScreenRedirectRef = useRef<TNavMenuScreenRedirectRef>(null);
  const buttonRef = useRef<TTouchableHighlightWrapperRef>(null);
  const isProductionEnvironment: boolean = useAppSelector(
    isProductionEvironmentSelector,
  );
  const switchingBetweenEnvActionHandler = () => {
    dispatch(switchEnv());
    dispatch(getEventListLoopStop());
    dispatch(endFullSubscriptionLoop());
    dispatch(clearEventState());
    dispatch(clearAuthState());
  };
  const actionButtonText = `Switch to ${
    isProductionEnvironment ? 'staging' : 'production'
  } environment`;
  const currentEvironmentInfoText = `This is app is currently using ${
    isProductionEnvironment ? 'production' : 'staging'
  } environment`;
  useLayoutEffect(() => {
    if (typeof buttonRef.current?.getRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectFromNavMenu?.(
        'switchEnvBtn',
        buttonRef.current.getRef().current,
      );
    }
    if (typeof listItemGetRef === 'function') {
      navMenuScreenRedirectRef.current?.setDefaultRedirectToNavMenu?.(
        'switchEnvBtn',
        listItemGetRef().current,
      );
    }
  }, [listItemGetRef]);
  return (
    <View style={styles.root}>
      <NavMenuScreenRedirect ref={navMenuScreenRedirectRef} />
      <View style={styles.contentContainer}>
        <View style={styles.titleContainer}>
          <RohText style={styles.titleText}>ENVIRONMENT SWITCHING</RohText>
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
              onPress={switchingBetweenEnvActionHandler}
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

export default SwitchingBetweenEnvironments;

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
