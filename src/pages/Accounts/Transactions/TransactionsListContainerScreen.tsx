import React, { useMemo } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native'
import TransactionDescribing from '../../../common/data/models/Transactions/Interfaces'
import AccountDetailsTransactionsList from '../../../components/account-details/AccountDetailsTransactionsList'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import useTransactionsForAccountShell from '../../../utils/hooks/state-selectors/accounts/UseTransactionsForAccountShell'
import Colors from '../../../common/Colors'
import { widthPercentageToDP, heightPercentageToDP } from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import { RFValue } from 'react-native-responsive-fontsize'
import { wp, hp } from '../../../common/data/responsiveness/responsive'
import Fonts from '../../../common/Fonts.js'

export type Props = {
  navigation: any;
};


const TransactionsListContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const accountShell = useAccountShellFromNavigation( navigation )
  const transactions = useTransactionsForAccountShell( accountShell )
  const walletName = useSelector( state => state.storage.wallet.walletName )

  function handleTransactionSelection( transaction: TransactionDescribing ) {
    navigation.navigate( 'TransactionDetails', {
      transaction,
      accountShellID: accountShell.id,
    } )
  }

  return (
    <View style={styles.rootContainer}>
      <View 
      // style={styles.Container}
      >
          <View 
          style={styles.userData}
          >
            <View
              style={{
                backgroundColor: 'grey',
                height: Dimensions.get('screen').height * 0.09,
                width: Dimensions.get('screen').width * 0.2,
                borderRadius: 40,
                
              }}
            />
            <View
              style={{
                flexDirection: 'column',
                marginLeft: wp(14)
              }}
            >
              <Text
                style={{
                  fontSize: RFValue(15),
                }}
              >
                {`Last backup 2 months ago`}
              </Text>
              <Text
                style={{
                  fontSize: RFValue(26),
                }}
                >
                {walletName}'s Wallet
              </Text>
              </View>
          </View>
        </View>
      <AccountDetailsTransactionsList
        transactions={transactions}
        onTransactionSelected={handleTransactionSelection}
        accountShellId={accountShell.id}
        showAll={true}
      />
      <TouchableOpacity
        style={styles.buttonContainer}
      >
        <Text style={styles.backupButtonText}>
          {'Help Restore Wallet'}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    backgroundColor: Colors.backgroundColor1
  },
  userData: {
    flexDirection : 'row',
    justifyContent : 'flex-start',
    alignItems: 'center',
    margin: wp(30)
  },
  backupButtonText : {
    marginTop: heightPercentageToDP( 2.8 ), 
    color: '#FAFAFA' ,
    fontSize: RFValue( 13 ),
    marginLeft: widthPercentageToDP(6),
    fontFamily: Fonts.RoboslabRegular
  },
  buttonContainer:{
    backgroundColor: Colors.blue,
    height : heightPercentageToDP(8),
    width : widthPercentageToDP(45),
    borderRadius: wp( 12 ),
    position: 'absolute',
    marginLeft: wp(40),
    marginTop: heightPercentageToDP(80)
  }
} )

export default TransactionsListContainerScreen
