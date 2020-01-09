export const nameToInitials = (fullName) => {
    const namesArray = fullName.split(' ');
    if (namesArray.length === 1) return `${namesArray[0].charAt(0)}`;
    else return `${namesArray[0].charAt(0)}${namesArray[namesArray.length - 1].charAt(0)}`;
  }