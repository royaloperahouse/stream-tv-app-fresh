import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import TouchableHighlightWrapper from '@components/TouchableHighlightWrapper';
import { Colors } from '@themes/Styleguide';
import { TGlobalModalContentProps } from '@services/types/globalModal';

const WarningOfExitModal: React.FC<TGlobalModalContentProps> = ({
  confirmActionHandler: primaryActionHandler = () => {},
  rejectActionHandler: secondaryActionHandler = () => {},
}) => {
  const [primaryFocused, setPrimaryFocused] = useState(false);
  const [secondaryFocused, setSecondaryFocused] = useState(false);
  useLayoutEffect(() => {
    const handleBackButtonClick = () => {
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        handleBackButtonClick,
      );
    };
  }, []);
  return (
    <View style={styles.root}>
      <View style={styles.contentContainer}>
        <View style={styles.header}>
          <RohText style={styles.headerText}>
            Are you sure you want to quit?
          </RohText>
        </View>
        <View style={styles.actionButtonsContainer}>
          <TouchableHighlightWrapper
            style={styles.primaryActionButton}
            onFocus={() => setPrimaryFocused(true)}
            onBlur={() => setPrimaryFocused(false)}
            canMoveLeft={false}
            canMoveDown={false}
            canMoveUp={false}
            styleFocused={styles.primaryActionButtonFocus}
            onPress={primaryActionHandler}>
            <View style={styles.primaryActionButtonContainer}>
              <RohText
                style={[
                  styles.primaryActionButtonText,
                  primaryFocused ? styles.focusedTextColor : styles.blurredTextColor,
                ]}>
                Yes, I want to quit
              </RohText>
            </View>
          </TouchableHighlightWrapper>
          <TouchableHighlightWrapper
            style={styles.secondaryActionButton}
            onFocus={() => setSecondaryFocused(true)}
            onBlur={() => setSecondaryFocused(false)}
            canMoveDown={false}
            hasTVPreferredFocus
            canMoveUp={false}
            canMoveRight={false}
            styleFocused={styles.secondaryActionButtonFocus}
            onPress={secondaryActionHandler}>
            <View style={styles.primaryActionButtonContainer}>
              <RohText
                style={[
                  styles.primaryActionButtonText,
                  secondaryFocused ? styles.focusedTextColor : styles.blurredTextColor,
                ]}>
                No, I want to stay
              </RohText>
            </View>
          </TouchableHighlightWrapper>
        </View>
      </View>
    </View>
  );
};
export default WarningOfExitModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: scaleSize(25),
    alignItems: 'center',
  },
  header: {
    marginBottom: scaleSize(40),
  },
  headerText: {
    fontSize: scaleSize(54),
    lineHeight: scaleSize(67),
    letterSpacing: scaleSize(1),
    color: Colors.midGrey,
  },
  subHeader: {
    marginBottom: scaleSize(40),
  },
  subHeaderText: {
    fontSize: scaleSize(28),
    lineHeight: scaleSize(30),
    color: Colors.defaultTextColor,
  },
  actionButtonsContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryActionButton: {
    width: scaleSize(358),
    height: scaleSize(80),
    marginRight: scaleSize(20),
    borderWidth: scaleSize(2),
    borderColor: Colors.defaultTextColor,
  },
  primaryActionButtonFocus: {
    borderColor: Colors.defaultTextColor,
    backgroundColor: Colors.defaultTextColor,
  },
  primaryActionButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryActionButtonText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
  },
  focusedTextColor: {
    color: Colors.focusedTextColor,
  },
  blurredTextColor: {
    color: Colors.defaultTextColor,
  },
  secondaryActionButton: {
    width: scaleSize(358),
    height: scaleSize(80),
    borderWidth: scaleSize(2),
    borderColor: Colors.defaultTextColor,
  },
  secondaryActionButtonFocus: {
    borderColor: Colors.defaultTextColor,
    backgroundColor: Colors.defaultTextColor,
  },
  secondaryActionButtonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryActionButtonText: {
    fontSize: scaleSize(24),
    lineHeight: scaleSize(30),
    color: Colors.defaultTextColor,
  },
});
