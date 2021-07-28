import {useMutation} from 'react-query';
import api from '@api';
import {ImageType} from '@fitlink/api/src/modules/images/images.constants';
import {Image} from '@fitlink/api/src/modules/images/entities/image.entity';
import {ImagePickerDialogResponse} from '@hooks';

export function useUploadImage() {
  return useMutation(
    ({image, type}: {image: ImagePickerDialogResponse; type: ImageType}) => {
      const payload = new FormData();

      payload.append('type', type);

      payload.append('image', {
        // @ts-ignore
        uri: image.uri,
        type: image.type,
        name: image.fileName || new Date().getTime().toString(),
      });

      return api.uploadFile<Image>(`/images`, {payload});
    },
  );
}
