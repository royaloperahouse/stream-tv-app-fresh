import React, {
  useLayoutEffect,
  createRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import { View, StyleSheet, Dimensions, BackHandler } from 'react-native';
import { navMenuManager } from '@components/NavMenu';
import { scaleSize } from '@utils/scaleSize';
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import GoBackIcon from '@assets/svg/navIcons/GoBack.svg';
import TouchableHighlightWrapper from './TouchableHighlightWrapper';
//import { globalModalManager } from '@components/GlobalModal';
import { isTVOS } from '@configs/globalConfig';
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
  const [accessible, setAccessible] = useState<boolean>(false);
  const navigation = useNavigation();
  const isMounted = useRef<boolean>(false);
  const route = useRoute<RouteProp<any, string>>();
  const onFocusHandler = () => {
    if (route.params?.screenNameFrom) {
      navigation.navigate(route.params.screenNameFrom, {
        fromEventDetails: true,
        sectionIndex: route.params.sectionIndex,
        eventId: route.params.event.id,
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
    navMenuManager.showNavMenu();
    //navigation.openDrawer();
/*     if (!isTVOS) {
      navMenuManager.showNavMenu();
    } else {
      setTimeout(() => {
        navMenuManager.showNavMenu();
      }, 500);
    } */
  };
  useLayoutEffect(() => {
    const handleBackButtonClick = () => {
      //if (globalModalManager.isModalOpen() || !show)
      if (!show) {
        return true;
      }
      if (route.params?.screenNameFrom) {
        navigation.navigate(route.params.screenNameFrom, {
          fromEventDetails: true,
          sectionIndex: route.params.sectionIndex,
          eventId: route.params.event.id,
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
  }, [navigation, route.params, show]);
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
      setUnAccessibleGoBackButtonn: () => {
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

  useFocusEffect(
    useCallback(() => {
      const timeout = setTimeout(() => {
        if (!isMounted.current) {
          return;
        }
        setAccessible(true);
      }, 0);
      return () => {
        clearTimeout(timeout);
      };
    }, []),
  );

  if (!show) {
    return null;
  }
  return (
    <View style={styles.container}>
      <TouchableHighlightWrapper
        onFocus={onFocusHandler}
        onBlur={() => 'blur'}
        hasTVPreferredFocus={false}
        style={styles.wrapperStyle}
        accessible={accessible}
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
