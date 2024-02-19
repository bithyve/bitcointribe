import moment from 'moment'
import React, { useMemo } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { TransactionDetails } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { SUB_PRIMARY_ACCOUNT } from '../../common/constants/wallet-service-types'
import { UsNumberFormat } from '../../common/utilities'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import openLink from '../../utils/OpenLink'


export type Props = {
  navigation,
  route
};

// TODO: Refactor after integrating data model changes from `feature/account-management`
const getImageByAccountType = ( accountType, primaryAccType? ) => {
  if ( accountType == 'FAST_BITCOINS' ) {
    return (
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          borderColor: Colors.borderColor,
          borderWidth: 0.5,
          borderRadius: widthPercentageToDP( '12%' ) / 2,
          width: widthPercentageToDP( '12%' ),
          height: widthPercentageToDP( '12%' ),
          backgroundColor: Colors.white,
        }}
      >
        <Image
          source={require( '../../assets/images/icons/fastbitcoin_dark.png' )}
          style={{
            width: widthPercentageToDP( '8%' ),
            height: widthPercentageToDP( '8%' ),
            resizeMode: 'contain',
          }}
        />
      </View>
    )
  } else if (
    accountType == 'Savings Account' ||
    accountType == 'Test Account' ||
    accountType == 'Checking Account' ||
    accountType == 'Donation Account' ||
    accountType === SUB_PRIMARY_ACCOUNT
  ) {
    return (
      <View>
        <Image
          source={
            accountType === SUB_PRIMARY_ACCOUNT
              ? primaryAccType === 'Savings Account'
                ? require( '../../assets/images/icons/icon_secureaccount.png' )
                : require( '../../assets/images/icons/icon_regular.png' )
              : accountType == 'Donation Account'
                ? require( '../../assets/images/icons/icon_donation_account.png' )
                : accountType == 'Savings Account'
                  ? require( '../../assets/images/icons/icon_secureaccount.png' )
                  : accountType == 'Test Account'
                    ? require( '../../assets/images/icons/icon_test.png' )
                    : require( '../../assets/images/icons/icon_regular.png' )
          }
          style={{
            width: widthPercentageToDP( '12%' ), height: widthPercentageToDP( '12%' )
          }}
        />
      </View>
    )
  }
}

const AllTransactionsDetailsContainerScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const transaction: TransactionDetails = route.params?.transaction

  const formattedConfirmationsText = useMemo( () => {
    return transaction.accountType === 'Test Account' ?
      transaction.confirmations < 6 ?
        transaction.confirmations
        // for testnet faucet tx
        : transaction.confirmations === -1 ?
          transaction.confirmations
          : '6+'
      : transaction.confirmations < 6 ?
        transaction.confirmations
        : '6+'
  }, [ transaction.confirmations ] )


  // TODO: Refactor after integrating data model changes from `feature/account-management`
  return (
    <View style={styles.rootContainer}>

      <View
        style={{
          flexDirection: 'row',
          marginLeft: heightPercentageToDP( '2%' ),
          marginRight: heightPercentageToDP( '2%' ),
          alignItems: 'center',
          paddingTop: heightPercentageToDP( '2%' ),
          paddingBottom: heightPercentageToDP( '2%' ),
        }}
      >
        {getImageByAccountType( transaction.accountType, transaction.primaryAccType )}

        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            marginLeft: 10,
          }}
        >
          <View>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 14 ),
              }}
            >
              {transaction.accountType === SUB_PRIMARY_ACCOUNT
                ? transaction.primaryAccType
                : transaction.accountType}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
                marginTop: heightPercentageToDP( '1%' ),
              }}
            >
              {moment( transaction.date ).utc().format( 'DD MMMM YYYY' )}
            </Text>
          </View>

          <FontAwesome
            style={{
              marginLeft: 'auto'
            }}
            name={
              transaction.transactionType == 'Received'
                ? 'long-arrow-down'
                : 'long-arrow-up'
            }
            color={
              transaction.transactionType == 'Received'
                ? Colors.green
                : Colors.red
            }
            size={17}
          />
        </View>
      </View>
      <View style={{
        flex: 1
      }}>
        <View style={styles.infoCardView}>
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
            }}
          >
            Amount
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: heightPercentageToDP( '0.5%' ),
            }}
          >
            <Image
              source={require( '../../assets/images/icons/icon_bitcoin_gray.png' )}
              style={{
                width: widthPercentageToDP( '3%' ),
                height: widthPercentageToDP( '3%' ),
                resizeMode: 'contain',
              }}
            />
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
                marginLeft: 3,
              }}
            >
              {UsNumberFormat( transaction.amount )}
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
                marginLeft: 3,
              }}
            >
              {transaction.accountType == 'Test Account' ? ' t-sats' : ' sats'}
            </Text>
          </View>
        </View>

        {transaction.recipientAddresses ? (
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
              }}
            >
              {transaction.recipientAddresses.length > 1
                ? 'To Addresses'
                : 'To Address'}
            </Text>
            {transaction.recipientAddresses.map( ( address, index ) => (
              <Text
                key={`${address}_${index}`}
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.Regular,
                  fontSize: RFValue( 12 ),
                  marginTop: heightPercentageToDP( '0.5%' ),
                }}
              >
                {address}
              </Text>
            ) )}
          </View>
        ) : null}
        {transaction.senderAddresses ? (
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
              }}
            >
              {transaction.senderAddresses.length > 1
                ? 'From Addresses'
                : 'From Address'}
            </Text>
            {transaction.senderAddresses.map( ( address, index ) => (
              <Text
                key={`${address}_${index}`}
                style={{
                  color: Colors.textColorGrey,
                  fontFamily: Fonts.Regular,
                  fontSize: RFValue( 12 ),
                  marginTop: heightPercentageToDP( '0.5%' ),
                }}
              >
                {address}
              </Text>
            ) )}
          </View>
        ) : null}
        <View style={styles.infoCardView}>
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
            }}
          >
            Fees
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
              marginTop: heightPercentageToDP( '0.5%' ),
            }}
          >
            {UsNumberFormat( transaction.fee )}{' '}
            {transaction.accountType == 'Test Account' ? ' t-sats' : ' sats'}
          </Text>
        </View>
        {transaction.message ? (
          <View style={styles.infoCardView}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
              }}
            >
              Note
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
                marginTop: heightPercentageToDP( '0.5%' ),
              }}
            >
              {transaction.message}
            </Text>
          </View>
        ) : null}
        <View style={styles.infoCardView}>
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
            }}
          >
            Transaction ID
          </Text>

          <AppBottomSheetTouchableWrapper
            onPress={() => {
              openLink(
                `https://blockstream.info${
                  transaction.accountType === 'Test Account' ? '/testnet' : ''
                }/tx/${transaction.txid}`,
              )
            }}
          >
            <Text
              style={{
                color: Colors.textColorGrey,
                fontFamily: Fonts.Regular,
                fontSize: RFValue( 12 ),
                marginTop: heightPercentageToDP( '0.5%' ),
              }}
            >
              {transaction.txid}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
        <View style={styles.infoCardView}>
          <Text
            style={{
              color: Colors.blue,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
            }}
          >
            Confirmations
          </Text>
          <Text
            style={{
              color: Colors.textColorGrey,
              fontFamily: Fonts.Regular,
              fontSize: RFValue( 12 ),
              marginTop: heightPercentageToDP( '0.5%' ),
            }}
          >
            {formattedConfirmationsText}
          </Text>
        </View>
      </View>
    </View>
  )
}


const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  infoCardView: {
    backgroundColor: Colors.white,
    marginLeft: heightPercentageToDP( '2%' ),
    marginRight: heightPercentageToDP( '2%' ),
    height: heightPercentageToDP( '8%' ),
    borderRadius: 10,
    justifyContent: 'center',
    paddingLeft: heightPercentageToDP( '2%' ),
    paddingRight: heightPercentageToDP( '2%' ),
    marginBottom: heightPercentageToDP( '0.5%' ),
    marginTop: heightPercentageToDP( '0.5%' ),
  },
} )

export default AllTransactionsDetailsContainerScreen
