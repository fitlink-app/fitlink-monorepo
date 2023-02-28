import React, {useRef, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Navbar} from '@components';

import {RootStackParamList} from 'routes/types';
import {BfitSpinner} from '../components/common/BfitSpinner';
import theme from '../theme/themes/fitlink';

const disableClasses =
  '.hamburger, header, footer, .hs-cookie-notification-position-bottom, .footer';

export const Webview = (
  props: StackScreenProps<RootStackParamList, 'Webview'>,
) => {
  const insets = useSafeAreaInsets();

  const {url, title} = props.route.params;

  const [isLoading, setLoading] = useState(true);
  const webviewRef = useRef<any>();

  const onLoad = () => {
    const injectCss = String.raw`${disableClasses}{display: none !important;} .blog--single, .contact__header, .about {margin-top:${
      insets.top + 70
    }px !important; padding-top: 0px !important;} .inner {margin-top:0px !important;}`;

    webviewRef.current.injectJavaScript(
      `(function(){
                const style = document.createElement('style');
                style.type = 'text/css';
                style.appendChild(document.createTextNode('${injectCss}'));
                document.head.appendChild(style);
            })();
        `,
    );

    // Timeout to give some time for the injected JS to run
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const renderLoading = () => {
    return <BfitSpinner wrapperStyle={styles.loadingWrapper} />;
  };

  return (
    <>
      <View style={{flex: 1, paddingTop: insets.top + 40}}>
        <WebView
          {...{onLoad}}
          source={{uri: url}}
          ref={r => (webviewRef.current = r)}
        />
      </View>

      {isLoading && renderLoading()}

      <Navbar title={title} overlay />
    </>
  );
};

const styles = StyleSheet.create({
  loadingWrapper: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
});
