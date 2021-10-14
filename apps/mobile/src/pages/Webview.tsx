import React, {useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import styled, {useTheme} from 'styled-components/native';
import {ActivityIndicator, View} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {WebView} from 'react-native-webview';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {RootStackParamList} from 'routes/types';
import {Navbar} from '@components';

const disableClasses =
  '.hamburger, header, footer, .hs-cookie-notification-position-bottom, .footer';

const LoadingWrapper = styled.View(({theme: {colors}}) => ({
  position: 'absolute',
  height: '100%',
  width: '100%',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.background,
}));

export const Webview = (
  props: StackScreenProps<RootStackParamList, 'Webview'>,
) => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors} = useTheme();

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
    return (
      <LoadingWrapper>
        <ActivityIndicator color={colors.accent} />
      </LoadingWrapper>
    );
  };

  return (
    <>
      <View style={{flex: 1}}>
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
