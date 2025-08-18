import React, { useLayoutEffect } from 'react';
import { View, StyleSheet, BackHandler, Dimensions } from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { TGlobalModalContentProps } from '@services/types/globalModal';

const RentalStateStatusModal: React.FC<TGlobalModalContentProps> = ({
  title = '',
}) => {
  const headerText = `Checking subscription stream status of \n${title}`;
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
      <View style={styles.header}>
        <RohText style={styles.headerText}>{headerText}</RohText>
      </View>
    </View>
  );
};
export default RentalStateStatusModal;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: Dimensions.get('window').width,
  },
  header: {
    marginBottom: scaleSize(40),
    flexDirection: 'row',
  },
  headerText: {
    fontSize: scaleSize(54),
    lineHeight: scaleSize(67),
    letterSpacing: scaleSize(1),
    fontWeight: 'bold',
    color: Colors.defaultTextColor,
    textAlign: 'center',
  },
});
