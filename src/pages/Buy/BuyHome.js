import React from 'react'
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
} from 'react-native'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import BuyContainer from './BuyContainer'

const BuyMenu = () => {
  return (
    <ImageBackground
      source={require( '../../assets/images/home-bg.png' )}
      style={{
        width: '100%',
        height: '100%',
        flex: 1,
      }}
      imageStyle={{
        resizeMode: 'stretch',
      }}
    >
      <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
      <BuyContainer containerView={styles.accountCardsSectionContainer} />

    </ImageBackground>
  )
}

const styles = StyleSheet.create( {
  cardContainer: {
    backgroundColor: Colors.backgroundColor1,
    width: widthPercentageToDP( '95%' ),
    // height: heightPercentageToDP( '7%' ),
    // borderColor: Colors.borderColor,
    // borderWidth: 1,
    borderRadius: widthPercentageToDP( 3 ),
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: widthPercentageToDP( 5 ),
    alignSelf: 'center',
    flexDirection: 'row',
    paddingHorizontal: widthPercentageToDP( 2 )
  },
  accountCardsSectionContainer: {
    height: heightPercentageToDP( '70.83%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor1,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    flexDirection: 'column',
    justifyContent: 'space-around'
  },

  floatingActionButtonContainer: {
    // position: 'absolute',
    // zIndex: 0,
    // bottom: TAB_BAR_HEIGHT,
    // right: 0,
    // flexDirection: 'row',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    padding: heightPercentageToDP( 1.5 ),
  },

  cloudErrorModalImage: {
    width: widthPercentageToDP( '30%' ),
    height: widthPercentageToDP( '25%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
    marginBottom: heightPercentageToDP( '-3%' ),
  }
} )

export default BuyMenu
