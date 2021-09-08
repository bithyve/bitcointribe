import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import AccountShell from '../../../common/data/models/AccountShell'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import { useDispatch } from 'react-redux'
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
import { TxPriority } from '../../../bitcoin/utilities/Interface'
import { translations } from '../../../common/content/LocContext'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import HeadingAndSubHeading from '../../../components/HeadingAndSubHeading'

export type NavigationParams = {
};

type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const AccountSendConfirmationContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const [ sendSuccessModal, setSuccess ] = useState( false )
  const [ sendFailureModal, setFailure ] = useState( false )
  const [ errorMessage, setError ] = useState( '' )
  const selectedRecipients = useSelectedRecipientsForSending()
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const sendingState = useSendingState()
  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )
  const availableBalance = useMemo( () => {
    return AccountShell.getSpendableBalance( sourceAccountShell )
  }, [ sourceAccountShell ] )
  const [ note, setNote ] = useState( '' )
  const [ transactionPriority, setTransactionPriority ] = useState( TxPriority.LOW )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

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
        infoText={strings.tsatsSent}
        recipients={sendingState.selectedRecipients}
        isFromContact={false}
        okButtonText={strings.ViewAccount}
        cancelButtonText={common.back}
        isCancel={false}
        onPressOk={() => {
        // dismissBottomSheet()
          setSuccess( false )
          // dispatch( resetSendState() ) // need to delay reset as other background sagas read from the send state
          requestAnimationFrame( () => {
            dispatch( refreshAccountShells( [ sourceAccountShell ], {
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
    if( sourceAccountShell.primarySubAccount.isTFAEnabled )
      navigation.navigate( 'OTPAuthentication', {
        txnPriority: transactionPriority
      } )
    else
      dispatch( executeSendStage2( {
        accountShell: sourceAccountShell,
        txnPriority: transactionPriority,
      } ) )
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
    onSuccess: ( txid: string | null ) => {

      if ( txid ) {
        dispatch( sendTxNotification() )
        // showSendSuccessBottomSheet()
        setSuccess( true )
      }
    },
    onFailure: ( errorMessage: string | null ) => {
      if ( errorMessage ) {
        setError( errorMessage )
        setTimeout( () => {
          // setFailure( true )
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
      <ModalContainer visible={sendSuccessModal} closeBottomSheet={() => {}} >
        {showSendSuccessBottomSheet()}
      </ModalContainer>
      <ModalContainer visible={sendFailureModal} closeBottomSheet={() => {}} >
        {showSendFailureBottomSheet()}
      </ModalContainer>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginBottom: heightPercentageToDP( '1%' ),
        marginTop: heightPercentageToDP( '2%' )
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
      <SendConfirmationCurrentTotalHeader />

      <TransactionPriorityMenu
        accountShell={sourceAccountShell}
        bitcoinDisplayUnit={sourceAccountShell.unit}
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
            placeholder={common.note}
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
          style={ButtonStyles.primaryActionButton}
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
    </KeyboardAwareScrollView>
  )
}

const styles = StyleSheet.create( {
  inputField: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
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
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: '90%'

  },
  modalInfoText: {
    width: widthPercentageToDP( 90 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    lineHeight: 18,
    marginLeft: widthPercentageToDP( 5 ),
    paddingVertical: heightPercentageToDP( 1 )
  },
  rootContainer: {
    flex: 1,
  },

  headerSection: {
    paddingVertical: heightPercentageToDP( '1%' ),
  },

  footerSection: {
    flexDirection: 'row',
    alignContent: 'center',
    justifyContent: 'center',
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
