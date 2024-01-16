import Clipboard from '@react-native-clipboard/clipboard'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AccountUtilities from '../bitcoin/utilities/accounts/AccountUtilities'
import {
  Account,
  AccountType
} from '../bitcoin/utilities/Interface'
import { SATOSHIS_IN_BTC } from '../common/constants/Bitcoin'
import { Satoshis } from '../common/data/typealiases/UnitAliases'
import { resetStackToSend } from '../navigation/actions/NavigationActions'
import { clipboardReadAction } from '../store/actions/doNotStore'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting, sourceAccountSelectedForSending } from '../store/actions/sending'
import { AccountsState } from '../store/reducers/accounts'
import useAccountByAccountShell from '../utils/hooks/state-selectors/accounts/UseAccountByAccountShell'
import { makeAddressRecipientDescription } from '../utils/sending/RecipientFactories'
import ModalContainer from './home/ModalContainer'
import NotificationInfoContents from './NotificationInfoContents'

export type IClipboardAutoReadProps = {navigation: any};

const ClipboardAutoRead: React.FC<IClipboardAutoReadProps> = ( { navigation } ) => {
  const [ modalShow, setModalShow ] = useState<boolean>( false )
  const [ address, setAddress ] = useState<string>( '' )
  const didAccess = useSelector( ( state ) => state.doNotStore.didAccess )
  const accountsState: AccountsState = useSelector( ( state ) => state.accounts )
  const defaultSourceAccount = accountsState.accountShells.find(
    ( shell ) =>
      shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT &&
      !shell.primarySubAccount.instanceNumber
  )
  const account: Account = useAccountByAccountShell( defaultSourceAccount )
  const network = AccountUtilities.getNetworkByType( account.networkType )
  const dispatcher = useDispatch()

  function onSend( address: string, amount: Satoshis ) {
    const recipient = makeAddressRecipientDescription( {
      address
    } )

    dispatcher( sourceAccountSelectedForSending(
      defaultSourceAccount
    ) )
    dispatcher( addRecipientForSending( recipient ) )
    dispatcher( recipientSelectedForAmountSetting( recipient ) )
    dispatcher( amountForRecipientUpdated( {
      recipient,
      amount: amount < 1 ? amount * SATOSHIS_IN_BTC : amount
    } ) )

    navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  }

  const checkClipboard = async () => {
    const data = await Clipboard.getString()
    const isAddressValid = AccountUtilities.isValidAddress( data, network )
    setAddress( !didAccess && isAddressValid ? data : '' )
    setModalShow( !didAccess && isAddressValid )
    dispatcher( clipboardReadAction() )
  }

  useEffect( () => {
    checkClipboard()
  }, [] )

  return (
    <ModalContainer
      visible={modalShow}
      closeBottomSheet={() => setModalShow( false )}
    >
      <NotificationInfoContents
        title={'Tranferring Sats?'}
        info={`A BTC address was detected in your clipboard.\nWould you like to tranfer Sats to \n${address}`}
        additionalInfo={null}
        onPressProceed={() => onSend( address, 0 )}
        onPressIgnore={() => {
          setModalShow( false )
        }}
        onPressClose={() => {
          setModalShow( false )
        }}
        proceedButtonText={'Tranfer'}
        cancelButtonText={''}
        // cancelButtonText1={"Close"}
        isIgnoreButton={false}
        note={null}
        bottomSheetRef={undefined}
        releaseNotes={null}
      />
    </ModalContainer>
  )
}

export default ClipboardAutoRead
