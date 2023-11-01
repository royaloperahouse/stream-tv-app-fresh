import React, {
  useRef,
  useCallback,
  createRef,
  useImperativeHandle,
  useLayoutEffect,
  useContext,
  useState,
} from 'react';
import {
  StyleSheet,
  Dimensions,
  TouchableHighlight,
  findNodeHandle,
  View,
  BackHandler,
  ScrollView,
  TVFocusGuideView,
} from 'react-native';
import { scaleSize } from '@utils/scaleSize';
import NavMenuItem from '@components/NavMenu/components/NavMenuItem';
import type { TRoute } from '@services/types/models';
import {
  widthInvisble,
  widthWithFocus,
  widthWithOutFocus,
  marginRightWithFocus,
  marginRightWithOutFocus,
  opacityOfItemTextStart,
  opacityOfItemTextStop,
  opacityOfItemIconStart,
  opacityOfItemIconStop,
  focusAnimationDuration,
  visibleAnimationDuration,
  marginLeftStart,
  marginLeftStop,
  marginRightInvisble,
} from '@configs/navMenuConfig';
import RohText from '@components/RohText';
import { Colors } from '@themes/Styleguide';
import ExitApp from '@components/ExitApp';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { useFeature } from 'flagged';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withSpring,
  useAnimatedReaction,
  useAnimatedProps,
  useDerivedValue,
  runOnJS,
} from 'react-native-reanimated';
import { NavMenuNodesRefsContext } from '@components/NavMenu/components/ContextProvider';
import type { TNavMenuNodesRefsContextValue } from '@components/NavMenu/components/ContextProvider';
import { TVEventManager } from '@services/tvRCEventListener';
import type { HWEvent } from 'react-native';
import { useForseUpdate } from '@hooks/useForseUpdate';
import { globalModalManager } from '@components/GlobalModals';
import { WarningOfExitModal } from '@components/GlobalModals/variants';
import { FocusManager } from 'services/focusService/focusManager';
import { isTVOS } from 'configs/globalConfig';

type TNavMenuProps = {
  navMenuConfig: Array<{
    navMenuScreenName: TRoute['navMenuScreenName'];
    SvgIconActiveComponent: TRoute['SvgIconActiveComponent'];
    SvgIconInActiveComponent: TRoute['SvgIconInActiveComponent'];
    navMenuTitle: TRoute['navMenuTitle'];
    position: TRoute['position'];
    isDefault: TRoute['isDefault'];
  }>;
  exitButtonRouteName: TRoute['navMenuScreenName'];
} & DrawerContentComponentProps;

const navMenuRef = createRef<
  Partial<{
    unwrapNavMenu: () => void;
    showNavMenu: () => void;
    hideNavMenu: (cb?: () => void) => void;
    lockNavMenu: () => void;
    unlockNavMenu: () => void;
  }>
>();

const ExitButton = Animated.createAnimatedComponent(TouchableHighlight);

export const navMenuManager = Object.freeze({
  unwrapNavMenu: () => {
    if (typeof navMenuRef.current?.unwrapNavMenu === 'function') {
      navMenuRef.current.unwrapNavMenu();
    }
  },
  showNavMenu: () => {
    if (typeof navMenuRef.current?.showNavMenu === 'function') {
      navMenuRef.current.showNavMenu();
    }
  },
  hideNavMenu: (cb?: () => void) => {
    if (typeof navMenuRef.current?.hideNavMenu === 'function') {
      navMenuRef.current.hideNavMenu(cb);
    }
  },
  lockNavMenu: () => {
    if (typeof navMenuRef.current?.lockNavMenu === 'function') {
      navMenuRef.current.lockNavMenu();
    }
  },
  unlockNavMenu: () => {
    if (typeof navMenuRef.current?.unlockNavMenu === 'function') {
      navMenuRef.current.unlockNavMenu();
    }
  },
});

const NavMenu: React.FC<TNavMenuProps> = ({
  navMenuConfig,
  exitButtonRouteName,
  ...restProps
}) => {
  const { state, navigation } = restProps;
  const forseUpdate = useForseUpdate();
  const { setNavMenuNodesRefs, setExitOfAppButtonRef, navMenuNodesRefs } =
    useContext<TNavMenuNodesRefsContextValue>(NavMenuNodesRefsContext);
  const exitButtonActive = useSharedValue<boolean>(false);
  const lastItemInScrollView = useRef<number | undefined>();
  const canExit = useFeature('canExit');
  const focusTag = useRef<number | undefined>();
  const navMenuMountedRef = useRef<boolean>(false);
  const currenItemInFocus = useRef<string>(
    navMenuConfig?.find(item => item?.isDefault).navMenuTitle as string,
  );
  const buttonsRefs = useRef<{
    [key: string]: React.RefObject<TouchableHighlight>;
  }>({});
  const cbRef = useRef<(() => void) | null>(null);
  const setButtonRef = useCallback(
    (
      id: TRoute['navMenuScreenName'],
      ref: React.RefObject<TouchableHighlight>,
      isLast?: boolean,
    ) => {
      if (isLast && findNodeHandle(ref.current) !== null) {
        lastItemInScrollView.current = findNodeHandle(ref.current) as number;
      }
      buttonsRefs.current[id] = ref;
      if (Object.keys(buttonsRefs.current).length === navMenuConfig.length) {
        setNavMenuNodesRefs(buttonsRefs.current);
      }
    },
    [navMenuConfig.length, setNavMenuNodesRefs],
  );
  const navMenuWidth = useSharedValue(widthWithFocus);
  const navMenuExitButton = useSharedValue(0);
  const [navMenuIsLocked, setNavMenuIsLocked] = useState(false);

  const wrap = useCallback((_finished: any) => {
    if (typeof cbRef.current === 'function') {
      cbRef.current();
    }
    cbRef.current = null;
  }, []);
  const navMenuAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(
        navMenuWidth.value,
        {
          duration:
            navMenuWidth.value >= widthWithOutFocus
              ? focusAnimationDuration
              : visibleAnimationDuration,
          easing: Easing.ease,
        },
        finished => {
          if (navMenuWidth.value === widthInvisble) {
            runOnJS(wrap)(finished);
          }
        },
      ),
      marginLeft: withSpring(
        navMenuWidth.value > widthInvisble ? marginLeftStop : marginLeftStart,
      ),
      marginRight: withSpring(
        navMenuWidth.value === widthInvisble
          ? marginRightInvisble
          : navMenuWidth.value === widthWithOutFocus
          ? marginRightWithOutFocus
          : marginRightWithFocus,
      ),
    };
  }, []);

  const navMenuExitButtonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(navMenuExitButton.value, {
      duration: focusAnimationDuration,
      easing: Easing.ease,
    }),
  }));
  const exitButtonFocusedStyle = useAnimatedStyle(
    () => ({
      opacity: exitButtonActive.value ? 1 : 0.5,
    }),
    [exitButtonActive],
  );
  useAnimatedReaction(
    () => {
      return navMenuWidth.value > widthWithOutFocus ? 1 : 0;
    },
    data => {
      navMenuExitButton.value = data;
    },
  );

  const exitButtonAnimatedProps = useAnimatedProps(
    () => ({
      accessible: navMenuIsLocked ? !navMenuIsLocked : navMenuWidth.value > widthWithOutFocus,
    }),
    [navMenuWidth.value, navMenuIsLocked],
  );
  const appleLockedExitButtonAnimatedProps = useAnimatedProps(
    () => ({
      accessible: false,
    }),
    [],
  );
  const appleUnlockedExitButtonAnimatedProps = useAnimatedProps(
    () => ({
      accessible: true,
    }),
    [],
  );
  const labelOpacityWorklet = useDerivedValue(
    () =>
      navMenuWidth.value === widthWithFocus
        ? opacityOfItemTextStop
        : opacityOfItemTextStart,
    [navMenuWidth.value],
  );

  const iconOpacityWorklet = useDerivedValue(
    () =>
      navMenuWidth.value === widthInvisble
        ? opacityOfItemIconStart
        : opacityOfItemIconStop,
    [navMenuWidth.value],
  );
  const exitOfAppButtonRef = useRef<TouchableHighlight>(null);
  const exitOfApp = useCallback((isGlobalHandler?: boolean) => {
    globalModalManager.openModal({
      hasBackground: true,
      hasLogo: true,
      contentComponent: WarningOfExitModal,
      contentProps: {
        confirmActionHandler: () => {
          globalModalManager.closeModal(() => {
            ExitApp.exit();
          });
        },
        rejectActionHandler: () => {
          globalModalManager.closeModal(() => {
            if (isGlobalHandler) {
              return;
            }
            buttonsRefs?.current['Home']?.current?.setNativeProps?.({
              hasTVPreferredFocus: true,
            });
          });
        },
      },
    });
  }, []);

  const exitOfAppPressHandler = () => {
    exitOfApp();
  };
  useImperativeHandle(
    navMenuRef,
    () => ({
      unwrapNavMenu: () => {
        navMenuWidth.value = widthWithFocus;
      },
      showNavMenu: () => {
        navMenuWidth.value = widthWithOutFocus;
      },
      hideNavMenu: (cb?: () => void) => {
        if (cbRef.current === null) {
          if (typeof cb === 'function') {
            cbRef.current = cb;
          }
          navMenuWidth.value = widthInvisble;
        }
      },
      lockNavMenu: () => {
        setNavMenuIsLocked(true);
      },
      unlockNavMenu: () => {
        setNavMenuIsLocked(false);
      },
    }),
    [navMenuWidth, navMenuIsLocked],
  );

  const setMenuFocus = useCallback(
    (id: TRoute['navMenuScreenName']) => {
      if (
        navMenuWidth.value !== widthWithFocus &&
        state.routeNames[state.index] !== id
      ) {
        navigation.navigate(state.routeNames[state.index]);
        currenItemInFocus.current = state.routeNames[state.index];
        navMenuWidth.value = widthWithFocus;
        buttonsRefs?.current[
          currenItemInFocus.current
        ]?.current?.setNativeProps?.({
          hasTVPreferredFocus: true,
        });
      }
      if (
        state.routeNames[state.index] !== id &&
        !FocusManager.getFirstLounch() &&
        !navMenuIsLocked &&
        navMenuWidth.value === widthWithFocus
      ) {
        navigation.navigate(id);
        navMenuWidth.value = widthWithFocus;
        currenItemInFocus.current = id;
      }

      if (FocusManager.getFirstLounch()) {
        navigation.navigate('Search');
        navigation.navigate('Home');
        navMenuWidth.value = widthWithOutFocus;
        currenItemInFocus.current = 'Home';
        return;
      }
    },
    [state.routeNames, state.index, navigation, navMenuWidth],
  );

  useLayoutEffect(() => {
    const backButtonCallback = () => {
      if (navMenuIsLocked) {
        navMenuManager.unlockNavMenu();
        buttonsRefs?.current[
          currenItemInFocus.current
        ]?.current?.setNativeProps?.({
          hasTVPreferredFocus: true,
        });

        navMenuWidth.value = widthWithFocus;
        return true;
      }

      if (navMenuWidth.value === widthInvisble) {
        return false;
      }
      if (navMenuWidth.value === widthWithOutFocus) {
        buttonsRefs?.current[
          currenItemInFocus.current
        ]?.current?.setNativeProps?.({
          hasTVPreferredFocus: true,
        });

        navMenuWidth.value = widthWithFocus;
        return true;
      }
      if (canExit) {
        if (isTVOS) {
          ExitApp.exit();
          return;
        }
        exitOfApp();
      }
      return true;
    };
    BackHandler.addEventListener('hardwareBackPress', backButtonCallback);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backButtonCallback);
    };
  }, [navMenuConfig, exitOfApp, canExit, navMenuWidth, navMenuIsLocked]);

  useLayoutEffect(() => {
    setExitOfAppButtonRef(exitOfAppButtonRef);
  }, [setExitOfAppButtonRef]);

  useLayoutEffect(() => {
    navMenuMountedRef.current = true;
    return () => {
      if (navMenuMountedRef && navMenuMountedRef.current) {
        navMenuMountedRef.current = false;
      }
    };
  }, []);

  useLayoutEffect(() => {
    TVEventManager.init();
    const toggleNavMenuCB = (event: HWEvent) => {
      const { eventType, tag } = event;
      switch (eventType) {
        case 'blur': {
          break;
        }
        case 'focus': {
          const doesMenuIncludeNewTag =
            Object.values(navMenuNodesRefs).some(
              ref => findNodeHandle(ref.current) === tag,
            ) || findNodeHandle(exitOfAppButtonRef.current) === tag;
          const doesMenuIncludePrevTag =
            focusTag.current === undefined
              ? doesMenuIncludeNewTag
              : Object.values(navMenuNodesRefs).some(
                  ref => findNodeHandle(ref.current) === focusTag.current,
                ) ||
                findNodeHandle(exitOfAppButtonRef.current) === focusTag.current;

          if (navMenuWidth.value === widthInvisble) {
            focusTag.current = tag;
            return;
          }

          if (
            (doesMenuIncludePrevTag && !doesMenuIncludeNewTag) ||
            (!doesMenuIncludePrevTag && !doesMenuIncludeNewTag)
          ) {
            navMenuWidth.value = widthWithOutFocus; //close
          }
          if (
            (!doesMenuIncludePrevTag && doesMenuIncludeNewTag) ||
            (doesMenuIncludePrevTag && doesMenuIncludeNewTag)
          ) {
            navMenuWidth.value = widthWithFocus; //open
          }
          focusTag.current = tag;
          break;
        }
        default:
          break;
      }
    };
    TVEventManager.addEventListener(toggleNavMenuCB);
    return () => {
      TVEventManager.removeEventListener(toggleNavMenuCB);
    };
  }, [navMenuWidth, navMenuNodesRefs]);

  useLayoutEffect(() => {
    if (canExit) {
      forseUpdate();
    }
  }, [canExit, navMenuConfig.length, forseUpdate]);
  return (
    <View>
      <Animated.View style={[styles.root, navMenuAnimatedStyle]}>
        <ScrollView>
          {navMenuConfig.map((item, index) => (
            <NavMenuItem
              key={item.navMenuScreenName}
              id={item.navMenuScreenName}
              isActive={
                item.navMenuScreenName === state.routeNames[state.index]
              }
              SvgIconActiveComponent={item.SvgIconActiveComponent}
              SvgIconInActiveComponent={item.SvgIconInActiveComponent}
              navMenuTitle={item.navMenuTitle}
              onFocus={setMenuFocus}
              isLastItem={index === navMenuConfig.length - 1}
              setMenuItemRef={setButtonRef}
              labelOpacityWorklet={labelOpacityWorklet}
              iconOpacityWorklet={iconOpacityWorklet}
              accessibleWorklet={navMenuWidth}
              isLockedWorklet={navMenuIsLocked}
              nextFocusDown={findNodeHandle(exitOfAppButtonRef.current)}
            />
          ))}
          {canExit && (
            <TVFocusGuideView
              style={styles.exitButtonRedirection}
              destinations={[exitOfAppButtonRef.current]}
            />
          )}
        </ScrollView>
      </Animated.View>
      {canExit && (
        <Animated.View
          style={[
            styles.exitOfAppContainer,
            navMenuAnimatedStyle,
            navMenuExitButtonAnimatedStyle,
          ]}>
          <Animated.View style={[exitButtonFocusedStyle]}>
            <TVFocusGuideView
              style={styles.exitButtonRedirection}
              destinations={[buttonsRefs.current?.['Settings']?.current]}
            />
            <ExitButton
              animatedProps={
                isTVOS
                  ? navMenuIsLocked
                    ? appleLockedExitButtonAnimatedProps
                    : appleUnlockedExitButtonAnimatedProps
                  : exitButtonAnimatedProps
              }
              onPress={exitOfAppPressHandler}
              ref={exitOfAppButtonRef}
              underlayColor="transparent"
              onBlur={() => {
                exitButtonActive.value = false;
              }}
              onFocus={() => {
                exitButtonActive.value = true;
                navigation.navigate(exitButtonRouteName);
              }}
              nextFocusUp={lastItemInScrollView.current}
              nextFocusDown={
                findNodeHandle(exitOfAppButtonRef.current) || undefined
              }
              nextFocusLeft={
                findNodeHandle(exitOfAppButtonRef.current) || undefined
              }
              nextFocusRight={
                findNodeHandle(exitOfAppButtonRef.current) || undefined
              }>
              <RohText style={styles.exitOfAppText}>Exit ROH Stream</RohText>
            </ExitButton>
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    height: Dimensions.get('window').height - scaleSize(190) - scaleSize(80),
    marginTop: scaleSize(190),
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  exitOfAppContainer: {
    marginBottom: scaleSize(58),
    overflow: 'hidden',
    height: scaleSize(30),
  },
  exitOfAppText: {
    fontSize: scaleSize(22),
    lineHeight: scaleSize(28),
    letterSpacing: scaleSize(1),
    color: Colors.defaultTextColor,
    textTransform: 'uppercase',
  },
  exitButtonRedirection: {
    flexDirection: 'row',
    height: scaleSize(5),
  },
});

export default NavMenu;
