import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CardWithRadioBtn from '../../components/CardWithRadioBtn'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import { ScrollView } from 'react-native-gesture-handler'

export type Props = {
  navigation: any;
  closeModal: () => void;
  onGiftRequestAccepted: ( otp ) => void;
  onGiftRequestRejected: () => void;
  walletName: string;
  giftAmount: string;
  inputType: string;
  hint: string;
  note: string,
  themeId: string
  giftId: string
};


export default function AccountSelection( { onClose, onChangeType } ) {
//   const dispatch = useDispatch()
  const [ activeIndex, setActiveIndex ] = useState( AccountType.CHECKING_ACCOUNT )
  const [ activeId, setActiveId ] = useState( '' )
  const activeAccounts = useActiveAccountShells().filter( account => account.primarySubAccount.type !== AccountType.LIGHTNING_ACCOUNT )
  const renderButton = ( text ) => {
    return (
      <TouchableOpacity
        onPress={( ) => {onChangeType( activeIndex, activeId )}}
        style={{
          ...styles.buttonView,
        }}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <View style={{
      backgroundColor: Colors.bgColor
    }}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {onClose( activeIndex ) }}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19}/>
      </TouchableOpacity>
      <View>
        <View style={{
          marginLeft: wp( 6 ),
        }}>
          <Text style={styles.modalTitleText}>Select Account</Text>
          <Text style={{
            ...styles.modalInfoText,
          }}>Choose the account where you'd like to stack the sats</Text>
        </View>
        <ScrollView style={{
          height: hp( '36%' )
        }}>
          {activeAccounts.map( ( item, index ) => {
            if ( [ AccountType.TEST_ACCOUNT, AccountType.SWAN_ACCOUNT, AccountType.DONATION_ACCOUNT ].includes( item.primarySubAccount.type ) || !item.primarySubAccount.isUsable || item.primarySubAccount.isTFAEnabled ) return
            return(
              <View key={index}>
                <CardWithRadioBtn
                  geticon={() => getAvatarForSubAccount( item.primarySubAccount, false, true )}
                  mainText={item.primarySubAccount.customDisplayName ?? item.primarySubAccount.defaultTitle}
                  subText={''}
                  italicText={`Balance: ${item.primarySubAccount?.balances?.confirmed} sats`}
                  isSelected={activeIndex === item.primarySubAccount.type}
                  setActiveIndex={( index ) => {
                    setActiveIndex( index )
                    setActiveId( item.primarySubAccount.id )
                  }}
                  index={item.primarySubAccount.type}
                  boldText={''}
                  changeBgColor={false}
                />
              </View>
            )
          } )}
        </ScrollView>
        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: wp( 6 ),
        }}>
          {renderButton( 'Proceed' )}
          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorActiveView} />
            <View style={styles.statusIndicatorInactiveView} />
            {/* <View style={styles.statusIndicatorInactiveView} /> */}

          </View>
        </View>
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  statusIndicatorView: {
    flexDirection: 'row',
    marginLeft: 'auto',
    marginHorizontal: wp( '1%' ),
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    height: wp( '14%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    marginLeft: wp( 6 ),
    marginTop: hp( 1 )
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: hp( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( 12 ),
    letterSpacing: 0.6,
    marginBottom: hp( 2 )
  },
} )

// export default AccountSelection


