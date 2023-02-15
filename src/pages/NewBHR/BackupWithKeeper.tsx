import React, { useEffect, useState } from 'react'
import { View, Linking, Text, StyleSheet, TouchableOpacity, Clipboard, Platform } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Config from '../../bitcoin/HexaConfig'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import { translations } from '../../common/content/LocContext'
import { useDispatch, useSelector } from 'react-redux'
import { AccountType, Wallet } from '../../bitcoin/utilities/Interface'
import dbManager from '../../storage/realm/dbManager'
import QRCode from '../../components/QRCode'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import ButtonBlue from '../../components/ButtonBlue'
import Toast from '../../components/Toast'
import BackupWithKeeperState from '../../common/data/enums/BackupWithKeeperState'
import { setBackupWithKeeperState } from '../../store/actions/BHR'

const styles = StyleSheet.create( {
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )

export default function BackupWithKeeper( { navigation } ) {
  const [ seed, setSeed ] = useState( 'loading' )
  const [ isKeeperInstalled, setIsKeeperInstalled ] = useState( false )
  const [ deeplinkUrl, setDeeplinkUrl ] = useState( '' )
  const [ path, setPath ] = useState( '' )
  const strings = translations[ 'bhr' ]
  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const dispatch = useDispatch()

  useEffect(  () => {
    init()
  }, [] )

  async function init() {
    const dbWallet = dbManager.getWallet()
    const walletObj = JSON.parse( JSON.stringify( dbWallet ) )
    const primaryMnemonic = walletObj.primaryMnemonic
    setSeed( primaryMnemonic )
    const path = AccountUtilities.getDerivationPath( Config.NETWORK_TYPE, AccountType.CHECKING_ACCOUNT, 0 )
    setPath( path )
    const url = `keeperdev://backup/${Buffer.from( `&seed=${primaryMnemonic.replace( / /g, ',' )}&path=${path}&name=hexa&appId=hexadev`, 'utf8' ).toString(
      'base64',
    )}`
    setDeeplinkUrl( url )
    const isInstalled = await Linking.canOpenURL( url )
    setIsKeeperInstalled( isInstalled )
  }

  async function openInKeeper () {
    try {
      if( isKeeperInstalled ) {
        await Linking.openURL( deeplinkUrl )
      } else{
        const url =
        Platform.OS == 'ios'
          ? 'https://apps.apple.com/us/app/bitcoin-wallet-hexa-2-0/id1586334138'
          : 'https://play.google.com/store/apps/details?id=io.hexawallet.hexa2&hl=en'
        Linking.canOpenURL( url ).then( ( supported ) => {
          if ( supported ) {
            Linking.openURL( url )
          }
        } )
      }

    } catch( error ) {
      console.log( error )
    }
  }

  function copyPath() {
    Clipboard.setString( path )
    Toast( 'Copied Successfully' )
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor,
    }}>
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={'Backup With Keeper'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View
        style={{
          alignItems: 'center', marginVertical: 20
        }}
      >
        <QRCode title="Seed" value={seed} size={hp( '27%' )} />
      </View>
      <Text onPress={copyPath} style={{
        textAlign:'center'
      }}>{`Derivation Path: ${path}`}</Text>
      <Text style={{
        textAlign: 'center'
      }}>{'Purpose: P2SH-P2WPKH: Wrapped segwit'}</Text>
      <View style={{
        margin: 20
      }}>
        <ButtonBlue
          buttonText={isKeeperInstalled ? 'Open in Keeper' : 'Download Bitcoin Keeper'}
          handleButtonPress={openInKeeper}
          buttonDisable= {false}
        />
      </View>

      <Text
        onPress={()=> {
          navigation.goBack()
          dispatch( setBackupWithKeeperState( BackupWithKeeperState.BACKEDUP ) )
        }}
        style={{
          textAlign: 'center', marginVertical: 40
        }}>I have backed up with Keeper</Text>

    </View>
  )
}


