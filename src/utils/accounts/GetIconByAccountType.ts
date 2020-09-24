
// TODO: Make the `type` argument strongly-typed as some kind of enum.
export default function getIconByAccountType(type: string): NodeRequire {
  if (type === 'saving') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type === 'regular') {
    return require('../../assets/images/icons/icon_regular.png');
  } else if (type === 'secure') {
    return require('../../assets/images/icons/icon_secureaccount.png');
  } else if (type === 'test') {
    return require('../../assets/images/icons/icon_test.png');
  } else if (type === 'Donation Account') {
    return require('../../assets/images/icons/icon_donation_hexa.png');
  } else {
    return require('../../assets/images/icons/icon_test.png');
  }
};
