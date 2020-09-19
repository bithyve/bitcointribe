import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

export const getIconByStatus = status => {
  if (status == "Ugly") {
    return require("../../assets/images/icons/icon_error_red.png");
  } else if (status == "Bad") {
    return require("../../assets/images/icons/icon_error_yellow.png");
  } else if (status == "Good") {
    return require("../../assets/images/icons/icon_check.png");
  }
};

export const verifyPersonalCopyAccess = personalCopyDetails => {
  console.log('-*- about to verify file access -*-')
  const path =
    Platform.OS == 'android'
      ? 'file://' + personalCopyDetails.path
      : personalCopyDetails.path;

  console.log({ path });
  RNFS.readFile(path)
    .then((res) => { return true })
    .catch((err) => {
      console.log('err.code', err.code);
      if(err.code=='ENOENT') console.log(' succesfully caught error ')
      return false
    });
    return true
}