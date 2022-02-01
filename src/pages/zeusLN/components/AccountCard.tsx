import React, { useRef, useState } from 'react'
import { StyleSheet, Text, View, PanResponder, Animated } from 'react-native'
import AccountDetailsCard from './AccountDetailsCard'
import { Mode } from '../AccountDetails'

const styles = StyleSheet.create( {
} )

type Props = {
    mode: Mode,
    lightningBalance: string,
    totalBlockchainBalance: string,
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
  onClickSettings
}: Props ) => {
  const pan: any = useRef( new Animated.ValueXY() ).current
  const pan1: any = useRef( new Animated.Value( 0 ) ).current
  const [ isLightning, setIsLightning ] = useState( true )

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

        if ( pan.x._value != 0 ) {
          Animated.timing( pan, {
            toValue: 0,
            duration: 300,
          } ).start()
          Animated.timing( pan1, {
            toValue: 1,
            duration: 300,
          } ).start( () => {
            // reset cardsStackedAnim's value to 0 when animation ends
            pan1.setValue( 0 )
            // increment card position when animation ends
            setIsLightning( ( prev ) => {
              if ( prev == true ) {
                setMode( Mode.ON_CHAIN )
              } else {
                setMode( Mode.LIGHTNING )
              }
              return !prev
            } )
          } )
        }
      },
    } )
  ).current

  return (
    <View style={{
      marginTop: 200
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
            inputRange: [ 0, 1 ], outputRange: [ 40, 0 ]
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
          onSettingsPressed={onClickSettings}
          balance={!isLightning ? totalBlockchainBalance : lightningBalance}
          accountShell={accountShell}
          mode={!isLightning ? Mode.LIGHTNING : Mode.ON_CHAIN}
          onItemPressed={() => setMode( Mode.ON_CHAIN )}
        />
      </Animated.View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          width: '100%', height: 200,
          position: 'absolute',
          zIndex: 2,
          bottom: pan1.interpolate( {
            inputRange: [ 0, 1 ], outputRange: [ 0, 40 ]
          } ),
          opacity: pan1.interpolate( {
            inputRange: [ 0, 1 ], outputRange: [ 1, 0.6 ]
          } ),
          transform: [
            {
              translateX: pan.x
            },
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
          onSettingsPressed={() => { }}
          balance={isLightning ? lightningBalance : totalBlockchainBalance}
          accountShell={accountShell}
          onItemPressed={() => setMode( Mode.LIGHTNING )}
          mode={isLightning ? Mode.LIGHTNING : Mode.ON_CHAIN}
        />
      </Animated.View>
    </View>
  )
}

export default AccountCard

