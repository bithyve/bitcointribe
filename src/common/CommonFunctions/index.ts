export const nameToInitials = fullName => {
  const namesArray = fullName.split(' ');
  if (namesArray.length === 1) return `${namesArray[0].charAt(0)}`;
  else
    return `${namesArray[0].charAt(0)}${namesArray[
      namesArray.length - 1
    ].charAt(0)}`;
};

export const validateEmail = email => {
  let reg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return reg.test(email);
};

export const getCurrencyImageByRegion = (currencyCode, type) => {
  if (
    currencyCode == 'USD' ||
    currencyCode == 'AUD' ||
    currencyCode == 'BBD' ||
    currencyCode == 'BSD' ||
    currencyCode == 'BZD' ||
    currencyCode == 'BMD' ||
    currencyCode == 'BND' ||
    currencyCode == 'KHR' ||
    currencyCode == 'CAD' ||
    currencyCode == 'KYD' ||
    currencyCode == 'XCD' ||
    currencyCode == 'FJD' ||
    currencyCode == 'GYD' ||
    currencyCode == 'HKD' ||
    currencyCode == 'JMD' ||
    currencyCode == 'LRD' ||
    currencyCode == 'NAD' ||
    currencyCode == 'NZD' ||
    currencyCode == 'SGD' ||
    currencyCode == 'SBD' ||
    currencyCode == 'SRD' ||
    currencyCode == 'TWD' ||
    currencyCode == 'TTD' ||
    currencyCode == 'TVD' ||
    currencyCode == 'ZWD'
  ) {
    if (type == 'light') {
      return require('../../assets/images/currencySymbols/icon_dollar_white.png');
    } else if (type == 'dark') {
      return require('../../assets/images/currencySymbols/icon_dollar_dark.png');
    } else if (type == 'gray') {
      return require('../../assets/images/currencySymbols/icon_dollar_light.png');
    } else if (type == 'light_blue') {
      return require('../../assets/images/currencySymbols/icon_dollar_lightblue.png');
    }
    return require('../../assets/images/currencySymbols/icon_dollar_light.png');
  }
  if (currencyCode == 'EUR') {
    if (type == 'light') {
      return require('../../assets/images/currencySymbols/icon_euro_light.png');
    } else if (type == 'dark') {
      return require('../../assets/images/currencySymbols/icon_euro_dark.png');
    } else if (type == 'gray') {
      return require('../../assets/images/currencySymbols/icon_euro_gray.png');
    } else if (type == 'light_blue') {
      return require('../../assets/images/currencySymbols/icon_euro_lightblue.png');
    }
    return require('../../assets/images/currencySymbols/icon_euro_gray.png');
  }
  if (
    currencyCode == 'EGP' ||
    currencyCode == 'FKP' ||
    currencyCode == 'GIP' ||
    currencyCode == 'GGP' ||
    currencyCode == 'IMP' ||
    currencyCode == 'JEP' ||
    currencyCode == 'SHP' ||
    currencyCode == 'SYP' ||
    currencyCode == 'GBP'
  ) {
    if (type == 'light') {
      return require('../../assets/images/currencySymbols/icon_pound_white.png');
    } else if (type == 'dark') {
      return require('../../assets/images/currencySymbols/icon_pound_dark.png');
    } else if (type == 'gray') {
      return require('../../assets/images/currencySymbols/icon_pound_gray.png');
    } else if (type == 'light_blue') {
      return require('../../assets/images/currencySymbols/icon_pound_lightblue.png');
    }
    return require('../../assets/images/currencySymbols/icon_pound_white.png');
  }
  if (currencyCode == 'INR') {
    if (type == 'light') {
      return require('../../assets/images/currencySymbols/icon_rupees_white.png');
    } else if (type == 'dark') {
      return require('../../assets/images/currencySymbols/icon_rupees_dark.png');
    } else if (type == 'gray') {
      return require('../../assets/images/currencySymbols/icon_rupees_gray.png');
    } else if (type == 'light_blue') {
      return require('../../assets/images/currencySymbols/icon_rupee_lightblue.png');
    }
    return require('../../assets/images/currencySymbols/icon_rupees_gray.png');
  }
};
