export const getIconByStatus = status => {
  if (status == "error") {
    return require("../../assets/images/icons/icon_error_red.png");
  } else if (status == "warning") {
    return require("../../assets/images/icons/icon_error_yellow.png");
  } else if (status == "success") {
    return require("../../assets/images/icons/icon_check.png");
  }
};
