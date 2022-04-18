import React, { useRef, useState } from 'react'
import { StyleSheet, View, PanResponder, Animated, Dimensions, Platform } from 'react-native'
import AccountDetailsCard from './AccountDetailsCard'
import { Mode } from '../AccountDetails'

const styles = StyleSheet.create( {
} )

type Props = {
    mode: Mode,
    lightningBalance: string,
    totalBlockchainBalance: string,
    pendingOpenBalance: string,
    unconfirmedBlockchainBalance: string,
    setMode: ( mode: Mode ) => void;
    accountShell: any;
    onClickSettings: () => void
}

const AccountCard = ( {
  mode,
  lightningBalance,
  totalBlockchainBalance,
  setMode,
  accountShell,
  onClickSettings,
  pendingOpenBalance,
  unconfirmedBlockchainBalance
}: Props ) => {
  const pan: any = useRef( new Animated.ValueXY() ).current
  const pan1: any = useRef( new Animated.Value ( 0 ) ).current
  const [ isLightning, setIsLightning ] = useState( true )
  const windowWidth = Dimensions.get( 'window' ).width

  const handleAnimation = ( type:string ) => {
    if ( pan.x._value != 0 && pan.x._value > 50/100*windowWidth ) {
      Animated.timing( pan, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      } ).start()
      Animated.timing( pan1, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false
      } ).start( () => {
        pan1.setValue( 0 )
        Platform.OS == 'ios' ? type == 'pressOut' &&
          setIsLightning( ( prev ) => {
            if ( prev == true ) {
              setMode( Mode.ON_CHAIN )
            } else {
              setMode( Mode.LIGHTNING )
            }
            return !prev
          } ) :
          setIsLightning( ( prev ) => {
            if ( prev == true ) {
              setMode( Mode.ON_CHAIN )
            } else {
              setMode( Mode.LIGHTNING )
            }
            return !prev
          } )
      } )
    }else{
      Animated.timing( pan, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false
      } ).start()
      pan1.setValue( 0 )
    }
  }
  const panResponder = useRef(
    PanResponder.create( {
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderMove: ( event, gestureState ) => {
        pan.setValue(
          {
            x: gestureState.dx, y: pan.y
          }
        )
      },
      onPanResponderTerminationRequest: () => true,
      onPanResponderRelease: ( event, gestureState ) => {
        handleAnimation( 'onPanResponderRelease' )
      },
    } )
  ).current

  return (
    <View style={{
      marginTop: 220
    }}>
      {/* <AccountDetailsCard
        onKnowMorePressed={()=> {}}
        onSettingsPressed={onClickSettings}
        balance={lightningBalance}
        accountShell={accountShell}
        mode={Mode.LIGHTNING}
        onItemPressed={()=> setMode( Mode.LIGHTNING )}
      />
      <View style={{
        marginVertical: 10
      }}/>
      <AccountDetailsCard
        onKnowMorePressed={()=> {}}
        onSettingsPressed={()=>{}}
        balance={totalBlockchainBalance}
        accountShell={accountShell}
        onItemPressed={()=> setMode( Mode.ON_CHAIN )}
        mode={Mode.ON_CHAIN}
      /> */}
      <Animated.View
        style={{
          width: '100%', height: 200,
          position: 'absolute',
          zIndex: 1,
          bottom: pan1.interpolate( {
            inputRange: [ 0, 1 ], outputRange: [ 50, 0 ]
          } ),
          transform: [ {
            scale: pan1.interpolate( {
              inputRange: [ 0, 1 ], outputRange: [ 0.80, 1.0 ]
            } )
          } ],
          opacity: pan1.interpolate( {
            inputRange: [ 0, 1 ], outputRange: [ 0.6, 1 ]
          } ),
        }}
      >
        <AccountDetailsCard
          onKnowMorePressed={() => { }}
          onSettingsPressed={() => {onClickSettings()}}
          balance={!isLightning ? `${Number( totalBlockchainBalance ) + Number( unconfirmedBlockchainBalance )}` : `${lightningBalance+ pendingOpenBalance}`}
          accountShell={accountShell}
          mode={!isLightning ? Mode.LIGHTNING : Mode.ON_CHAIN}
          onPressOut={() => setIsLightning( ( prev ) => {
            if ( prev == true ) {
              setMode( Mode.ON_CHAIN )
            } else {
              setMode( Mode.LIGHTNING )
            }
            return !prev
          } )}
          background ={true}

        />
      </Animated.View>

      <Animated.View
        // {...panResponder.panHandlers}
        style={{
          width:'100%', height: 200,
          position: 'absolute',
          zIndex: 2,
          bottom: pan1.interpolate( {
            inputRange: [ 0, 1 ], outputRange: [ 0, 50 ]
          } ),
          opacity: pan1.interpolate ( {
            inputRange: [ 0, 1 ], outputRange: [ 1, 0.6 ]
          } ),
          transform: [
            {
              translateX: pan.x
            }
            ,
            {
              scale: pan1.interpolate( {
                inputRange: [ 0, 1 ], outputRange: [ 1, 0.80 ]
              } )
            },
          ],
        }}
      >
        <AccountDetailsCard
          onKnowMorePressed={() => { }}
          onSettingsPressed={() => {onClickSettings()}}
          balance={isLightning ? `${lightningBalance+ pendingOpenBalance}` : `${Number( totalBlockchainBalance ) + Number( unconfirmedBlockchainBalance )}`}
          accountShell={accountShell}
          onPressOut={() => handleAnimation( 'pressOut' )}
          mode={isLightning ? Mode.LIGHTNING : Mode.ON_CHAIN}
          background ={false}
        />
      </Animated.View>
    </View>
  )
}

export default AccountCard

