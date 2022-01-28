import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
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
  return (
    <View>
      <AccountDetailsCard
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
      />
    </View>
  )
}

export default AccountCard

