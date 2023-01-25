import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, Dimensions } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import AccountShell from '../../../common/data/models/AccountShell'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import { useSelector, useDispatch } from 'react-redux'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../../utils/hooks/formatting/UseFormattedAmountText'
import useSelectedRecipientsForSending from '../../../utils/hooks/state-selectors/sending/UseSelectedRecipientsForSending'
import useSourceAccountShellForSending from '../../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import SelectedRecipientsCarousel from './SelectedRecipientsCarousel'
import SendConfirmationCurrentTotalHeader from '../../../components/send/SendConfirmationCurrentTotalHeader'
import TransactionPriorityMenu from './TransactionPriorityMenu'
import { executeSendStage2, resetSendStage1, sendTxNotification } from '../../../store/actions/sending'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import SendConfirmationContent from '../SendConfirmationContent'
import defaultBottomSheetConfigs from '../../../common/configs/BottomSheetConfigs'
import { clearTransfer, refreshAccountShells } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountSendST2CompletionEffect from '../../../utils/sending/UseAccountSendST2CompletionEffect'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import ModalContainer from '../../../components/home/ModalContainer'
import { AccountType, MultiSigAccount, NetworkType, TxPriority } from '../../../bitcoin/utilities/Interface'
import { translations } from '../../../common/content/LocContext'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import HeadingAndSubHeading from '../../../components/HeadingAndSubHeading'
import { AccountsState } from '../../../store/reducers/accounts'
import LoaderModal from '../../../components/LoaderModal'

export type NavigationParams = {
};

type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const { height } = Dimensions.get( 'window' )

const AccountSendConfirmationContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const [ sendSuccessModal, setSuccess ] = useState( false )
  const [ sendFailureModal, setFailure ] = useState( false )
  const [ handleButton, setHandleButton ] = useState( true )
  const [ errorMessage, setError ] = useState( '' )
  const selectedRecipients = useSelectedRecipientsForSending()
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const accountState: AccountsState = useSelector(
    ( state ) => state.accounts,
  )
  const account = accountState.accounts[ sourcePrimarySubAccount.id ]
  const sendingState = useSendingState()
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: sourcePrimarySubAccount?.kind ==  'TEST_ACCOUNT' ? BitcoinUnit.TSATS : BitcoinUnit.SATS,
  } )
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )
  const [ note, setNote ] = useState( '' )
  const [ transactionPriority, setTransactionPriority ] = useState( TxPriority.LOW )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )
  const fromWallet = navigation?.getParam( 'fromWallet' ) || false

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
  }, [ formattedAvailableBalanceAmountText, sourcePrimarySubAccount ] )

  useEffect( () => {
    return () => {
      // dismissBottomSheet()
      setSuccess( false )
      setFailure( false )
    }
  }, [ navigation ] )

  const showSendSuccessBottomSheet = () => {
    return(
      <SendConfirmationContent
        title={strings.SentSuccessfully}
        info={strings.Transactionsubmitted}
        infoText={ account.networkType === NetworkType.TESTNET ? strings.tsatsSent: strings.satsSent }
        recipients={sendingState.selectedRecipients}
        isFromContact={false}
        okButtonText={strings.ViewAccount}
        cancelButtonText={common.back}
        isCancel={true}
        onPressOk={() => {
        // dismissBottomSheet()
          setSuccess( false )
          // dispatch( resetSendState() ) // need to delay reset as other background sagas read from the send state
          requestAnimationFrame( () => {
            dispatch( refreshAccountShells( [ sourceAccountShell ], {
              hardRefresh: true,
            } ) )
          } )
          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        onPressCancel={() => setSuccess( false )}
        isSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />
    //   ,
    //   {
    //     ...defaultBottomSheetConfigs,
    //     dismissOnOverlayPress: false,
    //     dismissOnScrollDown: false,
    //     snapPoints: [ '52%', '52%' ],
    //   },
    )
  }

  const showSendFailureBottomSheet = useCallback( () => {
    return(
      <SendConfirmationContent
        title={strings.SendUnsuccessful}
        info={String( errorMessage )}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        okButtonText={common.tryAgain}
        cancelButtonText={common.back}
        isCancel={true}
        onPressOk={() => setFailure( false )}
        onPressCancel={() => {
          dispatch( clearTransfer( sourcePrimarySubAccount.kind ) )
          // dismissBottomSheet()
          setFailure( false )
          navigation.dispatch(
            resetStackToAccountDetails( {
              accountShellID: sourceAccountShell.id,
            } )
          )
        }}
        isUnSuccess={true}
        accountKind={sourcePrimarySubAccount.kind}
      />
    )
  }, [ errorMessage ] )

  function handleConfirmationButtonPress() {
    if( sourceAccountShell.primarySubAccount.isTFAEnabled && !( account as MultiSigAccount ).xprivs?.secondary )
      navigation.navigate( 'OTPAuthentication', {
        txnPriority: transactionPriority,
        note,
        fromWallet
      } )
    else {
      setHandleButton( false )
      dispatch( executeSendStage2( {
        accountShell: sourceAccountShell,
        txnPriority: transactionPriority,
        note
      } ) )
    }
  }

  function handleBackButtonPress() {
    dispatch( resetSendStage1() )
    navigation.goBack()
  }

  useEffect( ()=>{
    navigation.setParams( {
      handleBackButtonPress: handleBackButtonPress,
    } )
  }, [] )

  useAccountSendST2CompletionEffect( {
    onSuccess: ( txid: string | null, amt: number | null ) => {
      if ( txid ) {
        let type
        if ( sourceAccountShell.primarySubAccount.type === undefined ) {
          type = -1
        } else if ( sourceAccountShell.primarySubAccount.type === 'TEST_ACCOUNT' ) {
          type = 0
        } else if ( sourceAccountShell.primarySubAccount.type === 'CHECKING_ACCOUNT' ) {
          type = 1
        } else if ( sourceAccountShell.primarySubAccount.type === 'SWAN_ACCOUNT' ) {
          type = 2
        } else if ( sourceAccountShell.primarySubAccount.type === 'SAVINGS_ACCOUNT' ) {
          type = 3
        }

        if ( amt ) {
          dispatch( sendTxNotification( txid, amt + ' ' + formattedUnitText, type ) )
        } else {
          dispatch( sendTxNotification( txid, null, type ) )
        }
        // showSendSuccessBottomSheet()
        setSuccess( true )
        setHandleButton( true )
      }
    },
    onFailure: ( errorMessage: string | null ) => {
      if ( errorMessage ) {
        setError( errorMessage )
        setTimeout( () => {
          setFailure( true )
          setHandleButton( true )
        }, 200 )
      }
    },
  } )


  return (
    <KeyboardAwareScrollView
      resetScrollToCoords={{
        x: 0, y: 0
      }}
      style={styles.rootContainer}
    >
      <ModalContainer onBackground={()=>setSuccess( false )} visible={sendSuccessModal} closeBottomSheet={() => {}} >
        {showSendSuccessBottomSheet()}
      </ModalContainer>
      <ModalContainer onBackground={()=>setFailure( false )} visible={sendFailureModal} closeBottomSheet={() => {}} >
        {showSendFailureBottomSheet()}
      </ModalContainer>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: height > 720 ? heightPercentageToDP( '1%' ) : 0,
        marginTop: height > 720 ? heightPercentageToDP( '2%' ) : 5
      }}>
        <Text style={{
          marginRight: RFValue( 4 )
        }}>
          {`${strings.SendingFrom}:`}
        </Text>

        <Text style={{
          fontFamily: Fonts.FiraSansRegular,
          fontSize: RFValue( 11 ),
          fontStyle: 'italic',
          color: Colors.blue,
        }}>
          {sourceAccountHeadlineText}
        </Text>
      </View>
      <View style={styles.headerSection}>
        <SelectedRecipientsCarousel
          recipients={selectedRecipients}
          subAccountKind={sourcePrimarySubAccount.kind}
        />
      </View>
      <SendConfirmationCurrentTotalHeader
        Unit={sourcePrimarySubAccount?.kind ==  'TEST_ACCOUNT' ? BitcoinUnit.TSATS : BitcoinUnit.SATS}
      />

      <TransactionPriorityMenu
        accountShell={sourceAccountShell}
        bitcoinDisplayUnit={sourcePrimarySubAccount?.kind ==  'TEST_ACCOUNT' ? BitcoinUnit.TSATS : BitcoinUnit.SATS}
        onTransactionPriorityChanged={setTransactionPriority}
      />
      {selectedRecipients.length === 1 &&
      <>
        <HeadingAndSubHeading
          heading={common.addNote}
          subHeading={common.subNote}
        />
        <View
          style={[ styles.inputBox, styles.inputField ]}
        >
          <TextInput
            style={styles.modalInputBox}
            multiline={true}
            numberOfLines={3}
            textAlignVertical={'bottom'}
            placeholder={`${common.note} (${common.optional})`}
            placeholderTextColor={Colors.gray1}
            value={note}
            keyboardType={
              Platform.OS == 'ios'
                ? 'ascii-capable'
                : 'visible-password'
            }
            returnKeyType="done"
            returnKeyLabel="Done"
            autoCompleteType="off"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={( text ) => {
              setNote( text )
            }}
          />
        </View>
      </>
      }
      <View style={styles.footerSection}>
        <TouchableOpacity
          onPress={handleConfirmationButtonPress}
          style={handleButton ? ButtonStyles.primaryActionButton : ButtonStyles.disabledNewPrimaryActionButton}
        >
          <Text style={ButtonStyles.actionButtonText}>{strings.ConfirmSend}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBackButtonPress}
          style={{
            ...ButtonStyles.primaryActionButton,
            marginRight: 8,
            backgroundColor: 'transparent',
          }}
        >
          <Text style={{
            ...ButtonStyles.actionButtonText,
            color: Colors.blue,
          }}>
            {common.back}
          </Text>
        </TouchableOpacity>
      </View>
      <ModalContainer visible={!handleButton} closeBottomSheet = {()=>{}} onBackground = {()=>{}}>
        <LoaderModal
          headerText={'Sending...'}
        />
      </ModalContainer>
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create( {
  inputField: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height > 720 ? 10 : 5,
    borderColor: Colors.white,
    backgroundColor: Colors.bgColor,
    width: widthPercentageToDP( 90 )
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 10, height: 10
    },
    backgroundColor: Colors.backgroundColor1,
  },
  modalInputBox: {
    flex: 1,
    height: height > 720 ? 50 : 40,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: '90%',
    paddingTop: height > 720 ? 17 : 0
  },
  modalInfoText: {
    width: widthPercentageToDP( 90 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    lineHeight: 18,
    marginLeft: widthPercentageToDP( 5 ),
    paddingVertical: height > 720 ? heightPercentageToDP( 1 ) : 5
  },
  rootContainer: {
    flex: 1,
  },

  headerSection: {
    paddingVertical: height > 720 ? heightPercentageToDP( '1%' ) : 0,
  },

  footerSection: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'space-evenly',
    marginBottom: heightPercentageToDP( '2%' ),
    paddingHorizontal:10,
  },

} )


AccountSendConfirmationContainerScreen.navigationOptions = ( { navigation } ): NavigationOptions => {
  return {
    ...defaultStackScreenNavigationOptions,

    headerLeft: () => {
      return <SmallNavHeaderBackButton onPress={navigation.getParam( 'handleBackButtonPress' )} />
    },
  }
}

export default AccountSendConfirmationContainerScreen
