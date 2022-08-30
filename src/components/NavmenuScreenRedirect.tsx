import React, {
  useImperativeHandle,
  forwardRef,
  useState,
  useRef,
  useLayoutEffect,
  useContext,
} from 'react';
import {
  Dimensions,
  StyleSheet,
  TouchableHighlight,
  TVFocusGuideView,
  View,
} from 'react-native';
import { isTVOS } from '@configs/globalConfig';
import { NavMenuNodesRefsContext } from '@components/NavMenu/components/ContextProvider';
import type { TNavMenuNodesRefsContextValue } from '@components/NavMenu/components/ContextProvider';
import { scaleSize } from 'utils/scaleSize';

export type TNavMenuScreenRedirectRef = {
  setDefaultRedirectFromNavMenu: (
    key: string,
    cp:
      | React.Component<any, any, any>
      | React.ComponentClass<any, any>
      | null
      | number,
  ) => void;
  removeDefaultRedirectFromNavMenu: (key: string) => void;
  removeAllDefaultRedirectFromNavMenu: () => void;
  setDefaultRedirectToNavMenu: (
    key: string,
    cp:
      | React.Component<any, any, any>
      | React.ComponentClass<any, any>
      | null
      | number,
  ) => void;
  removeDefaultRedirectToNavMenu: (key: string) => void;
  removeAllDefaultRedirectToNavMenu: () => void;
};

type TNavMenuScreenRedirectProps = { screenName?: string };

export const NavMenuScreenRedirect = forwardRef<
  TNavMenuScreenRedirectRef,
  TNavMenuScreenRedirectProps
>(({ screenName = '' }, ref) => {
  const { navMenuNodesRefs } = useContext<TNavMenuNodesRefsContextValue>(
    NavMenuNodesRefsContext,
  );
  const isMounted = useRef(false);
  const [difaultRedirectFromNavMenu, setDefRedirectFromNavMenu] = useState<{
    [key: string]:
      | React.Component<any, any, any>
      | React.ComponentClass<any, any>
      | null
      | number;
  }>({});

  const [difaultRedirectToNavMenu, setDefRedirectToNavMenu] = useState<{
    [key: string]:
      | React.Component<any, any, any>
      | React.ComponentClass<any, any>
      | null
      | number;
  }>({});

  useImperativeHandle(
    ref,
    () => ({
      setDefaultRedirectFromNavMenu: (key, cp) => {
        if (!isMounted.current) {
          return;
        }

        setDefRedirectFromNavMenu(prevState => {
          const newState = { ...prevState };
          newState[key] = cp;
          return newState;
        });
      },
      setDefaultRedirectToNavMenu: (key, cp) => {
        if (!isMounted.current) {
          return;
        }

        setDefRedirectToNavMenu(prevState => {
          const newState = { ...prevState };
          newState[key] = cp;
          return newState;
        });
      },

      removeDefaultRedirectFromNavMenu: key => {
        if (!isMounted.current) {
          return;
        }
        setDefRedirectFromNavMenu(prevState => {
          if (!(key in prevState)) {
            return prevState;
          }
          const newState = { ...prevState };
          delete newState[key];
          return newState;
        });
      },
      removeAllDefaultRedirectFromNavMenu: () => {
        if (!isMounted.current) {
          return;
        }
        setDefRedirectFromNavMenu({});
      },
      removeDefaultRedirectToNavMenu: key => {
        if (!isMounted.current) {
          return;
        }
        setDefRedirectToNavMenu(prevState => {
          if (!(key in prevState)) {
            return prevState;
          }
          const newState = { ...prevState };
          delete newState[key];
          return newState;
        });
      },
      removeAllDefaultRedirectToNavMenu: () => {
        if (!isMounted.current) {
          return;
        }
        setDefRedirectToNavMenu({});
      },
    }),
    [],
  );
  const redirectToContent =
    Object.values(difaultRedirectFromNavMenu).length === 0
      ? undefined
      : Object.entries(difaultRedirectFromNavMenu)
          .sort(([firstKey], [nextKey]) => {
            const firstKeyNumber = Number(firstKey);
            const nextKeyNumber = Number(nextKey);
            if (Number.isNaN(firstKeyNumber) || Number.isNaN(nextKeyNumber)) {
              return 0;
            }
            return firstKeyNumber - nextKeyNumber;
          })
          .map(([_, value]) => value);
  /*
  !can be used not only to navigate between nav menu and content screen

 */
  const redirectFromContent = navMenuNodesRefs?.[screenName]?.current
    ? [navMenuNodesRefs[screenName].current]
    : Object.values(difaultRedirectToNavMenu).length === 0
    ? undefined
    : Object.entries(difaultRedirectToNavMenu)
        .sort(([firstKey], [nextKey]) => {
          const firstKeyNumber = Number(firstKey);
          const nextKeyNumber = Number(nextKey);
          if (Number.isNaN(firstKeyNumber) || Number.isNaN(nextKeyNumber)) {
            return 0;
          }
          return firstKeyNumber - nextKeyNumber;
        })
        .map(([_, value]) => value);

  useLayoutEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (!isTVOS) {
    return (
      <View style={styles.root}>
        <TouchableHighlight
          style={[styles.redirectBlock]}
          accessible={
            Array.isArray(redirectToContent) &&
            redirectToContent?.length > 0 &&
            Array.isArray(redirectFromContent) &&
            redirectFromContent?.length > 0 &&
            typeof (redirectToContent?.[0] as any)?.setNativeProps ===
              'function'
          }
          underlayColor="transparent"
          onFocus={() => {
            if (
              redirectToContent?.[0] &&
              typeof redirectToContent?.[0] !== 'number'
            ) {
              (redirectToContent?.[0] as any)?.setNativeProps({
                hasTVPreferredFocus: true,
              });
            }
          }}>
          <View collapsable={false}/>
        </TouchableHighlight>
        <TouchableHighlight
          underlayColor="transparent"
          accessible={
            Array.isArray(redirectToContent) &&
            redirectToContent?.length > 0 &&
            Array.isArray(redirectFromContent) &&
            redirectFromContent?.length > 0 &&
            typeof (redirectFromContent?.[0] as any)?.setNativeProps ===
              'function'
          }
          style={[styles.redirectBlock]}
          onFocus={() => {
            if (
              redirectFromContent?.[0] &&
              typeof redirectFromContent?.[0] !== 'number'
            ) {
              (redirectFromContent?.[0] as any)?.setNativeProps({
                hasTVPreferredFocus: true,
              });
            }
          }}>
          <View collapsable={false} />
        </TouchableHighlight>
      </View>
    );
  }
  return (
    <View style={styles.root}>
      <TVFocusGuideView
        style={[styles.redirectBlock]}
        destinations={redirectToContent}
        collapsable={false}
      />
      <TVFocusGuideView
        style={[styles.redirectBlock]}
        destinations={redirectFromContent}
        collapsable={false}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  root: {
    width: scaleSize(25),
    height: Dimensions.get('window').height,
    flexDirection: 'row',
    marginHorizontal: scaleSize(10),
    marginLeft: 20,
  },
  redirectBlock: {
    width: scaleSize(10),
    height: '100%',
  },
});
