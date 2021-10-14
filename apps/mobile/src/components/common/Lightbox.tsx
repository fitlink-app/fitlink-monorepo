import React, {useImperativeHandle, useState} from 'react';
import {Image, Modal, View, Dimensions, StyleSheet} from 'react-native';
import {Label, TouchHandler} from '.';

const {width: SCREEN_WIDTH} = Dimensions.get('screen');

export interface LightboxHandles {
  open: (url: string, description: string) => void;
  close: () => void;
}

export const Lightbox = React.forwardRef<LightboxHandles>((props, ref) => {
  const [isVisible, setVisible] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');

  useImperativeHandle(ref, () => ({
    open: handleOpen,
    close: handleClose,
  }));

  const handleOpen = (url: string, description: string) => {
    setImageUrl(url);
    setDescription(description);
    setVisible(true);
  };

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <Modal
      visible={isVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={handleClose}>
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: `rgba(0,0,0,0.85)`,
        }}>
        <Image
          resizeMode={'contain'}
          style={{
            width: SCREEN_WIDTH,
            height: SCREEN_WIDTH,
          }}
          source={{
            uri: imageUrl,
          }}
        />
        {description && (
          <Label appearance={'secondary'} style={{marginVertical: 10}}>
            {description}
          </Label>
        )}
      </View>

      <TouchHandler
        style={StyleSheet.absoluteFillObject}
        onPress={handleClose}
      />
    </Modal>
  );
});
