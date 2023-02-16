import React, {
  useLayoutEffect,
  createRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  BackHandler,
  HWEvent,
} from 'react-native';
import { navMenuManager } from '@components/NavMenu';
import { scaleSize } from '@utils/scaleSize';
import { useNavigation, useRoute } from '@react-navigation/native';
import GoBackIcon from '@assets/svg/navIcons/GoBack.svg';
import TouchableHighlightWrapper, {
  TTouchableHighlightWrapperRef,
} from './TouchableHighlightWrapper';
//import { globalModalManager } from '@components/GlobalModal';
import type {
  TContentScreensProps,
  NSNavigationScreensNames,
} from '@configs/screensConfig';
import { TVEventManager } from '@services/tvRCEventListener';
import { useFocusLayoutEffect } from 'hooks/useFocusLayoutEffect';
import { isTVOS } from 'configs/globalConfig';

const goBackButtonWidth = scaleSize(160);
const goBackButtonRef = createRef<
  Partial<{
    showGoBackButton: () => void;
    hideGoBackButton: () => void;
    setAccessibleGoBackButton: () => void;
    setUnAccessibleGoBackButton: () => void;
  }>
>();

export const goBackButtonuManager = Object.freeze({
  showGoBackButton: () => {
    if (typeof goBackButtonRef.current?.showGoBackButton === 'function') {
      goBackButtonRef.current.showGoBackButton();
    }
  },
  hideGoBackButton: () => {
    if (typeof goBackButtonRef.current?.hideGoBackButton === 'function') {
      goBackButtonRef.current.hideGoBackButton();
    }
  },
  setAccessibleGoBackButton: () => {
    if (
      typeof goBackButtonRef.current?.setAccessibleGoBackButton === 'function'
    ) {
      goBackButtonRef.current.setAccessibleGoBackButton();
    }
  },
  setUnAccessibleGoBackButton: () => {
    if (
      typeof goBackButtonRef.current?.setUnAccessibleGoBackButton === 'function'
    ) {
      goBackButtonRef.current.setUnAccessibleGoBackButton();
    }
  },
});

type TGoBackProps = {};

const GoBack: React.FC<TGoBackProps> = () => {
  const [show, setShow] = useState<boolean>(true);
  const btnRef = useRef<TTouchableHighlightWrapperRef>(null);
  const [accessible, setAccessible] = useState<boolean>(true);
  const isFocused = useRef<boolean>(false);
  const firstCall = useRef<boolean>(true);
  const navigation =
    useNavigation<
      TContentScreensProps<
        NSNavigationScreensNames.ContentStackScreens['eventDetails']
      >['navigation']
    >();
  const isMounted = useRef<boolean>(false);
  const route =
    useRoute<
      TContentScreensProps<
        NSNavigationScreensNames.ContentStackScreens['eventDetails']
      >['route']
    >();
  const onFocusHandler = useCallback(() => {
    if (route.params?.screenNameFrom) {
      navigation.navigate(route.params.screenNameFrom, {
        eventId: route.params.eventId,
        sectionIndex: route.params.sectionIndex,
        selectedItemIndex: route.params.selectedItemIndex,
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
    navMenuManager.showNavMenu();
  }, [
    route.params.eventId,
    route.params.screenNameFrom,
    route.params.sectionIndex,
    route.params.selectedItemIndex,
    navigation,
  ]);
  useFocusLayoutEffect(
    useCallback(() => {
      const handleBackButtonClick = () => {
        //if (globalModalManager.isModalOpen() || !show)
        if (!show || !accessible) {
          return false;
        }
        if (route.params?.screenNameFrom) {
          navigation.navigate(route.params.screenNameFrom, {
            eventId: route.params.eventId,
            sectionIndex: route.params.sectionIndex,
            selectedItemIndex: route.params.selectedItemIndex,
          });
          navMenuManager.showNavMenu();
        } else if (navigation.canGoBack()) {
          navigation.goBack();
          navMenuManager.showNavMenu();
        }
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', handleBackButtonClick);
      return () => {
        BackHandler.removeEventListener(
          'hardwareBackPress',
          handleBackButtonClick,
        );
      };
    }, [navigation, route.params, show, accessible]),
  );
  useImperativeHandle(
    goBackButtonRef,
    () => ({
      showGoBackButton: () => {
        if (isMounted.current) {
          setShow(true);
          setAccessible(true);
        }
      },
      hideGoBackButton: () => {
        if (isMounted.current) {
          setShow(false);
          setAccessible(false);
        }
      },
      setAccessibleGoBackButton: () => {
        if (isMounted.current) {
          setAccessible(true);
        }
      },
      setUnAccessibleGoBackButton: () => {
        if (isMounted.current) {
          setAccessible(false);
        }
      },
    }),
    [],
  );
  useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    const cb = (event: HWEvent) => {
      if (
        event.tag !== btnRef.current?.getNode?.() ||
        (isTVOS && event.eventType !== 'focus') ||
        (!isTVOS && event.eventType !== 'left')
      ) {
        return;
      }
      if (isTVOS && firstCall.current) {
        firstCall.current = false;
        return;
      }
      onFocusHandler();
    /*
    if (
        (event.eventType === 'swipeLeft' && isFocused.current) ||
        (event.tag === btnRef.current?.getNode?.() &&
          event.eventType === 'left')
      ) {
        onFocusHandler();
      } */
    };
    TVEventManager.addEventListener(cb);
    return () => {
      TVEventManager.removeEventListener(cb);
    };
  }, [onFocusHandler]);
  if (!show) {
    return null;
  }

  return (
    <View style={styles.container}>
      <TouchableHighlightWrapper
        ref={btnRef}
        style={styles.wrapperStyle}
        accessible={accessible}
        onBlur={() => {
          isFocused.current = false;
          console.log('blur');
        }}
        onFocus={() => {
          isFocused.current = true;
          console.log('focus');
        }}
        styleFocused={styles.wrapperStyleActive}>
        <View style={styles.buttonContainer}>
          <GoBackIcon width={scaleSize(40)} height={scaleSize(40)} />
        </View>
      </TouchableHighlightWrapper>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Dimensions.get('window').height,
    width: goBackButtonWidth,
  },
  buttonContainer: {
    height: Dimensions.get('window').height,
    width: goBackButtonWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  back: {
    width: scaleSize(40),
    height: scaleSize(40),
  },
  wrapperStyle: {
    opacity: 0.5,
    height: Dimensions.get('window').height,
    width: goBackButtonWidth,
  },
  wrapperStyleActive: {
    opacity: 0.7,
  },
});

export default GoBack;
