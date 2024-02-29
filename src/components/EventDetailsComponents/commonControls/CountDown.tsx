import React, { useEffect } from 'react';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import { scaleSize } from '@utils/scaleSize';
import { View, StyleSheet } from 'react-native';
import CountDownComponent from 'react-native-countdown-component';
import differenceInSeconds from 'date-fns/differenceInSeconds';
import IdleTimerManager from 'react-native-idle-timer';
type TCountDownProps = {
  publishingDate: Date;
  finishCB?: () => void;
};

const CountDown: React.FC<TCountDownProps> = ({
  publishingDate,
  finishCB = () => {},
}) => {
  useEffect(() => {
    IdleTimerManager.setIdleTimerDisabled(true);
    return () => {
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  });
  return (
    <View style={styles.countDownBlockContainer}>
      <View>
        <RohText style={styles.titleText}>Live stream starts in:</RohText>
      </View>
      <View style={styles.countDownContainer}>
        <CountDownComponent
          showSeparator
          until={differenceInSeconds(publishingDate, new Date())}
          timeLabels={{ d: 'DAYS', h: 'HRS', m: 'MINS', s: 'SECS' }}
          digitStyle={styles.countDownNumberCellContainer}
          digitTxtStyle={styles.countDownCellNumber}
          timeLabelStyle={styles.countDownCellTitle}
          separatorStyle={styles.doubleDotText}
          onFinish={() => {
            setTimeout(() => {
              finishCB();
            }, 500);
          }}
        />
      </View>
    </View>
  );
};

export default CountDown;
const styles = StyleSheet.create({
  countDownBlockContainer: {
    width: scaleSize(400),
    marginTop: scaleSize(30),
  },
  titleText: {
    lineHeight: scaleSize(24),
    fontSize: scaleSize(20),
    letterSpacing: scaleSize(2),
    color: Colors.defaultTextColor,
    textTransform: 'uppercase',
  },
  countDownContainer: {
    paddingRight: scaleSize(45),
    flexDirection: 'row',
    height: scaleSize(70),
    marginTop: scaleSize(8),
  },
  countDownNumberCellContainer: {
    height: scaleSize(40),
    width: scaleSize(75),
  },
  countDownCellNumber: {
    fontSize: scaleSize(38),
    lineHeight: scaleSize(44),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
    paddingBottom: scaleSize(4),
  },
  countDownCellTitle: {
    fontSize: scaleSize(16),
    lineHeight: scaleSize(22),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
  },
  doubleDotContainer: {
    paddingHorizontal: scaleSize(30),
  },
  doubleDotText: {
    fontSize: scaleSize(38),
    lineHeight: scaleSize(40),
    letterSpacing: scaleSize(1),
    marginBottom: scaleSize(25),
    marginHorizontal: scaleSize(10),
    color: Colors.defaultTextColor,
  },
});
