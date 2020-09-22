import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export const getIconByStatus = (status) => {
  if (status == 'Ugly') {
    return require('../../assets/images/icons/icon_error_red.png');
  } else if (status == 'Bad') {
    return require('../../assets/images/icons/icon_error_yellow.png');
  } else if (status == 'Good') {
    return require('../../assets/images/icons/icon_check.png');
  }
};

export const verifyPersonalCopyAccess = async (personalCopyDetails) => {
  const path =
    Platform.OS == 'android'
      ? 'file://' + personalCopyDetails.path
      : personalCopyDetails.path;

      // remove this when we are able to access and check android file system
      if (Platform.OS == 'android') return false;
  try {
    return RNFS.exists(path);
  } catch (err) {
    console.log('error checking file, err', err);
    // error in verifying file access
    // to err on the side of caution lets
    // just declare that the file may not exist
    return false;
  }
};
