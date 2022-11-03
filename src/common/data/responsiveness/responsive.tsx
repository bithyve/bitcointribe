import { Dimensions, Platform } from 'react-native'
export const windowHeight: number = Dimensions.get( 'window' ).height
export const windowWidth: number = Dimensions.get( 'window' ).width

export const getResponsiveHome = () => {
  if ( windowHeight >= 850 ) {
    return {
      padingTop: 7,
      marginTop: 0,
      height: 35,
    }
  } else if ( windowHeight >= 750 ) {
    return {
      padingTop: 10,
      marginTop: -2,
      height: 38,
    }
  } else if ( windowHeight >= 650 && Platform.OS == 'android' ) {
    return {
      padingTop: 10,
      marginTop: 0,
      height: 42,
    }
  } else if ( windowHeight >= 650 ) {
    return {
      padingTop: 14,
      marginTop: -8,
      height: 42,
    }
  } else {
    return {
      padingTop: 16,
      marginTop: -9,
      height: 44,
    }
  }
}

export const getCardheight = () => {
  if ( windowHeight >= 850 ) {
    return 5
  } else if ( windowHeight >= 750 ) {
    return 3
  } else if ( windowHeight >= 650 ) {
    return 1
  }
}

export const getAccountCardHeight = () => {
  if ( windowHeight >= 850 ) {
    return -115
  } else if ( windowHeight >= 750 ) {
    return -140
  } else if ( windowHeight >= 650 ) {
    return -170
  }
}


export const getTransactionPadding = () => {
  return windowHeight * 0.047
}

export const hp = ( height: number ) => {
  return ( height / 812 ) * windowHeight
}

export const wp = ( width: number ) => {
  return ( width / 375 ) * windowWidth
}
