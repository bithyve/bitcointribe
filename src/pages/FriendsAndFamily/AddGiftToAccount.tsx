import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Keyboard, Alert } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import idx from 'idx'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells'
import AccountSelection from './AccountSelection'
import { associateGift } from '../../store/actions/trustedContacts'
import { resetStackToAccountDetails, } from '../../navigation/actions/NavigationActions'
import AccountSelected from './AccountSelected'
import GiftAddedModal from './GiftAddedModal'
import { giftAccepted, refreshAccountShells } from '../../store/actions/accounts'


export type Props = {
  navigation: any;
  giftAmount: string | number;
  giftId: string
  getTheme: () => void;
  onCancel: () => void;
  closeModal: () => void;
};


export default function AddGiftToAccount( { getTheme, navigation, giftAmount, giftId, onCancel, closeModal }: Props ) {
  const dispatch = useDispatch()
  const [ showAccounts, setShowAccounts ] = useState( true )
  const [ confirmAccount, setConfirmAccount ] = useState( false )
  const [ giftAddedModal, setGiftAddedModel ] = useState( false )
  const [ accType, setAccType ] = useState( AccountType.CHECKING_ACCOUNT )
  const [ accId, setAccId ] = useState( '' )
  const accountShells: AccountShell[] = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.accountShells ) )
  // const acceptedGifts = useSelector( ( state ) => state.accounts.acceptedGiftId )
  // const addedGift = useSelector( ( state ) => state.accounts.addedGift )
  // const activeAccounts = useActiveAccountShells()
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == accType && shell.primarySubAccount.instanceNumber === 0 )

  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )
  const spendableBalance = useSpendableBalanceForAccountShell( sendingAccount )

  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title}`
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`

  }, [ sourcePrimarySubAccount ] )

  useEffect( () => {
    setAccId( sourcePrimarySubAccount.id )
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`

  }, [ sourcePrimarySubAccount ] )

  const renderButton = ( text ) => {
    return (
      <TouchableOpacity
        onPress={() => {

          if ( text === 'Confirm' ) {
            // closeModal()
            setConfirmAccount( false )
            setGiftAddedModel( true )
            dispatch( associateGift( giftId, accId ) )
          } else if ( text === 'View Account' ) {
            setGiftAddedModel( false )
            dispatch( giftAccepted( '' ) )
            closeModal()
            navigation.dispatch(
              resetStackToAccountDetails( {
                accountShellID: sourcePrimarySubAccount.accountShellID,
              } )
            )
            dispatch( refreshAccountShells( [ sendingAccount ], {
              hardRefresh: true
            } ) )
          }
        }}
        style={{
          ...styles.buttonView,
          backgroundColor: Colors.blue,
        }}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  }

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  return (
    <>
      {showAccounts &&
        <View style={styles.modalContentContainer}>
          <AccountSelection
            onClose={() => {
              setShowAccounts( false )
              onCancel()
            }}
            onChangeType={( type, selectedAccId ) => {
              // closeModal()
              setAccType( type )
              setAccId( selectedAccId )
              setShowAccounts( false )
              setConfirmAccount( true )
              // dispatch( associateGift( giftId, accId ) )
            }}
          />
        </View>
      }
      {confirmAccount &&
        <View style={styles.modalContentContainer}>
          <AccountSelected
            getTheme={getTheme}
            onAccountChange={() => { setConfirmAccount( false ); setShowAccounts( true ) }}
            sourcePrimarySubAccount={sourcePrimarySubAccount}
            sourceAccountHeadlineText={sourceAccountHeadlineText}
            spendableBalance={spendableBalance}
            formattedUnitText={formattedUnitText}
            renderButton={renderButton}
            giftAmount={giftAmount}
            onCancel={onCancel}
          />
        </View>
      }
      {giftAddedModal &&
        <View style={styles.modalContentContainer}>
          <GiftAddedModal
            getTheme={getTheme}
            sourcePrimarySubAccount={sourcePrimarySubAccount}
            sourceAccountHeadlineText={sourceAccountHeadlineText}
            renderButton={renderButton}
            formattedUnitText={formattedUnitText}
            spendableBalance={spendableBalance}
            onCancel={onCancel}
            navigation={navigation}
          />
        </View>
      }
    </>
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
  box: {
    flex: 1,
    height: 60,
    backgroundColor: Colors.shadowBlue,
    marginTop: hp( '3%' ),
    marginLeft: wp( '4%' ),
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    justifyContent: 'center',
  },
  successModalHeaderView: {
    flex: 1,
    marginTop: hp( '3%' ),
    marginBottom: hp( '3%' ),
    marginLeft: wp( '8%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  successModalAmountImage: {
    width: wp( '10%' ),
    height: wp( '10%' ),
    marginRight: 10,
    marginLeft: 10,
    // marginBottom: wp('1%'),
    resizeMode: 'contain',
  },
  phoneNumberInfoText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    color: Colors.textColorGrey,
    marginBottom: wp( '5%' ),
  },
  inputErrorText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontSize: RFValue( 10 ),
    color: Colors.red,
    marginTop: wp( '2%' ),
    marginBottom: wp( '3%' ),
    marginLeft: 'auto',
  },
  textboxView: {
    flexDirection: 'row',
    paddingLeft: 15,
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: Colors.borderColor,
    marginBottom: wp( '5%' ),
    alignItems: 'center',
  },
  countryCodeText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    paddingRight: 15,
  },
  separatorView: {
    marginRight: 15,
    height: 25,
    width: 2,
    borderColor: Colors.borderColor,
    borderWidth: 1,
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp( '12%' ),
    width: wp( '12%' ),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp( '12%' ),
    width: wp( '12%' ),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: {
      width: 0, height: 3
    },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    textAlign: 'center',
    lineHeight: 18,
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
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
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
    letterSpacing: 0.6
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.bgColor,
    paddingBottom: hp( 4 ),
  },
  rootContainer: {
    flex: 1
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  floatingActionButtonContainer: {
    bottom: hp( 1.5 ),
    right: 0,
    marginLeft: 'auto',
    padding: hp( 1.5 ),
  },
} )

// export default AcceptGift



