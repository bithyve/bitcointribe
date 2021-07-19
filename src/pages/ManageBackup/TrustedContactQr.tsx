import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
} from 'react-native'
import NavStyles from '../../common/Styles/NavStyles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { RFValue } from 'react-native-responsive-fontsize'
import { useSelector } from 'react-redux'
import BottomInfoBox from '../../components/BottomInfoBox'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import TrustedContactsService from '../../bitcoin/services/TrustedContactsService'
import QRCode from '../../components/QRCode'

export default function TrustedContactQr( props ) {
  const [ trustedContactQR, setTrustedContactQR ] = useState( '' )

  const SHARES_TRANSFER_DETAILS = useSelector(
    ( state ) =>
      state.storage.database.DECENTRALIZED_BACKUP.SHARES_TRANSFER_DETAILS,
  )
  const WALLET_SETUP = useSelector(
    ( state ) => state.storage.database.WALLET_SETUP,
  )

  const trustedContacts: TrustedContactsService = useSelector(
    ( state ) => state.trustedContacts.service,
  )

  useEffect( () => {
    const { contact } = props
    if ( contact ) {
      if ( SHARES_TRANSFER_DETAILS[ props.index ] ) {
        // uploading of share is already done on the communication mode component

        const contactName = `${contact.firstName} ${
          contact.lastName ? contact.lastName : ''
        }`
          .toLowerCase()
          .trim()
        const publicKey =
          trustedContacts.tc.trustedContacts[ contactName ].publicKey
        setTrustedContactQR(
          JSON.stringify( {
            isGuardian: true,
            requester: WALLET_SETUP.walletName,
            publicKey,
            uploadedAt: SHARES_TRANSFER_DETAILS[ props.index ].UPLOADED_AT,
            type: 'trustedGuardian',
          } ),
        )
      }
    }
  }, [ SHARES_TRANSFER_DETAILS[ props.index ], props.contact ] )


  return (
    <View
      style={{
        height: '100%',
        backgroundColor: Colors.white,
        borderColor: Colors.borderColor,
        alignSelf: 'center',
        width: '100%',
      }}
    >
      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{
          flexDirection: 'row'
        }}>
          <View
            style={{
              alignSelf: 'center', flex: 1, justifyContent: 'center'
            }}
          >
            <Text style={NavStyles.modalHeaderTitleText}>
              contact QR code
            </Text>
          </View>
        </View>
      </View>
      <View style={NavStyles.modalContentView}>
        {!trustedContactQR ? (
          <View style={{
            height: hp( '27%' ), justifyContent: 'center'
          }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode title="Keeper Request" value={trustedContactQR} size={hp( '27%' )} />
        )}
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressOk()}
          style={{
            backgroundColor: Colors.blue,
            borderRadius: 10,
            width: wp( '50%' ),
            height: wp( '13%' ),
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: hp( '3%' ),
            marginBottom: hp( '3%' ),
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.FiraSansMedium,
            }}
          >
            Yes, I have shared
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      <BottomInfoBox
        title={'Send your Recovery Key'}
        infoText={
          'Open the QR scanner at the bottom of the Home screen on your Keeper Device and scan this QR'
        }
      />
    </View>
  )
}
