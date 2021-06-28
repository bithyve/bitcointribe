import React, { useMemo, useState, useCallback, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native'
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
import { clearTransfer, refreshAccountShell } from '../../../store/actions/accounts'
import { resetStackToAccountDetails } from '../../../navigation/actions/NavigationActions'
import useAccountSendST2CompletionEffect from '../../../utils/sending/UseAccountSendST2CompletionEffect'
import useSendingState from '../../../utils/hooks/state-selectors/sending/UseSendingState'
import useFormattedUnitText from '../../../utils/hooks/formatting/UseFormattedUnitText'
import BitcoinUnit from '../../../common/data/enums/BitcoinUnit'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import defaultStackScreenNavigationOptions, { NavigationOptions } from '../../../navigation/options/DefaultStackScreenNavigationOptions'
import SmallNavHeaderBackButton from '../../../components/navigation/SmallNavHeaderBackButton'
import ModalContainer from '../../../components/home/ModalContainer'
import { TxPriority } from '../../../bitcoin/utilities/Interface'

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

  const [ transactionPriority, setTransactionPriority ] = useState( TxPriority.LOW )
  const formattedAvailableBalanceAmountText = useFormattedAmountText( availableBalance )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title} (Available to spend: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`
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
        title={'Sent Successfully'}
        info={'Transaction(s) successfully submitted'}
        infoText={'t-sats successfully sent from your account'}
        recipients={sendingState.selectedRecipients}
        isFromContact={false}
        okButtonText={'View Account'}
        cancelButtonText={'Back'}
        isCancel={false}
        onPressOk={() => {
        // dismissBottomSheet()
          setSuccess( false )
          // dispatch( resetSendState() ) // need to delay reset as other background sagas read from the send state
          dispatch( refreshAccountShell( sourceAccountShell, {
            autoSync: false,
            hardRefresh: false,
          } ) )
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
        title={'Send Unsuccessful'}
        info={String( errorMessage )}
        isFromContact={false}
        recipients={sendingState.selectedRecipients}
        okButtonText={'Try Again'}
        cancelButtonText={'Back'}
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
    <ScrollView style={styles.rootContainer}>
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
          Sending From:
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

      <View style={styles.footerSection}>
        <TouchableOpacity
          onPress={handleConfirmationButtonPress}
          style={ButtonStyles.primaryActionButton}
        >
          <Text style={ButtonStyles.actionButtonText}>Confirm & Send</Text>
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
            Back
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create( {
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
