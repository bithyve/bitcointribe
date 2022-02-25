import React, { useEffect } from 'react'
import {
  View,
  StyleSheet,
} from 'react-native'
import { connect } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../../common/Colors'
import { useSelector } from 'react-redux'
import idx from 'idx'
import SecurityInactive from '../../../assets/images/tabs/security.svg'
import Security from '../../../assets/images/tabs/security_active.svg'

const IconWithBadge = ( {
  focused,
  currentLevel,
} ) => {
  const levelData = useSelector(
    ( state ) => state.bhr.levelData
  )

  //   useEffect( () => {
  //     const focusListener = navigation.addListener( 'didFocus', () => {
  //       getMessageToShow()
  //     } )
  //     return () => {
  //       focusListener.remove()
  //     }
  //   }, [] )
  useEffect( () => {
    getLevel()
  }, [] )

  const getLevel = () => {
    if( levelData ){
      for ( let i = 0; i < levelData.length; i++ ) {
        const element = levelData[ i ]
        if( element.keeper1.name && element.keeper1.status == 'notAccessible' ){
          return {
            isError: true
          }
        }
        if( element.keeper2.name && element.keeper2.status == 'notAccessible' ){
          return {
            isError: true
          }
        }
      }
      if( currentLevel == 0 ){
        return {
          isError: true
        }
      } else if( currentLevel === 1 ){
        return {
          isError: false
        }
      } else if( currentLevel === 2 ){
        return {
          isError: false
        }
      } else if( currentLevel == 3 ){
        return {
          isError: false
        }
      }
    }
    if( currentLevel === 1 ){
      return {
        isError: false
      }
    } else {
      return {
        isError: true
      }
    }
  }
  const { isError } = getLevel()
  return (
    <View style={{
      // marginVertical: hp( '2%' )
    }}>

      {focused ?
        <Security />
        :
        <SecurityInactive />
      }
      {/* {isError && <View style={styles.dot}/>} */}
      {focused ?
        <View style={styles.activeStyle}/>
        :
        <View style={styles.inactiveStyle}/>
      }
    </View>
  )
}

const mapStateToProps = ( state ) => {
  return {
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
  }
}

export default connect( mapStateToProps, null )( IconWithBadge )

const styles = StyleSheet.create( {
  headerViewContainer: {
    marginTop: hp( '2%' ),
    marginLeft: 20,
    marginRight: 20,
  },
  activeStyle:{
    alignSelf: 'center',
    marginTop: 2,
    width: wp( 1 ),
    height: wp( 1 ),
    borderRadius: wp( 0.5 ),
    backgroundColor: Colors.white
  },
  inactiveStyle: {
    alignSelf: 'center',
    marginTop: 2,
    width: wp( 1 ),
    height: wp( 1 ),
    borderRadius: wp( 0.5 ),
    // backgroundColor: Colors.white
  },
  dot: {
    height: 9,
    width: 9,
    borderRadius: 9/2,
    backgroundColor: 'tomato',
    position: 'absolute',
    left: wp( 4 ),
  },
} )
