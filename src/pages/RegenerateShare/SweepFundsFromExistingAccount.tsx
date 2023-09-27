import React, { useEffect, useState } from 'react'
import {
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'

const SweepFundsFromExistingAccount = props => {

  useEffect( () => {
  }, [] )

  const [ AllAccountData, setAllAccountData ] = useState( [
    {
      title: 'Checking Account',
      info: '234500 sats',
      image: require( '../../assets/images/icons/icon_regular.png' )
    },
    {
      title: 'Secure Account',
      info: '6755464 sats',
      image: require( '../../assets/images/icons/icon_secureaccount.png' )
    },
    {
      title: 'Get Bittr Account',
      info: '1332535 sats',
      image: require( '../../assets/images/icons/icon_test.png' )
    },
  ] )

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{
          flex: 1, flexDirection: 'row', alignItems: 'center'
        }}>
          <TouchableOpacity
            onPress={() => { props.navigation.goBack() }}
            style={{
              height: 30, width: 30, justifyContent: 'center'
            }}
            hitSlop={{
              top: 20, left: 20, bottom: 20, right: 20
            }}
          >
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitleText}>{'Address Book'}</Text>
        </View>
      </View>
      <View style={{
      }}>
        <View style={{
          marginLeft: 20, marginRight: 20, paddingBottom: 20, marginTop: 20, borderBottomWidth: 1,
          borderColor: Colors.borderColor,
        }}>
          <Text style={{
            color: Colors.blue, fontFamily: Fonts.Regular, fontSize: RFValue( 14 )
          }}>Your new wallet{'\n'}and back-up is ready</Text>
          <Text style={{
            color: Colors.textColorGrey, fontFamily: Fonts.Regular, fontSize: RFValue( 10 )
          }}>You can now sweep funds from your existing wallet to{'\n'}the new wallet</Text>
        </View>
      </View>
      <ScrollView style={{
      }}>
        {AllAccountData.map( ( value, index ) =>
          <View key={`${JSON.stringify( value )}_${index}`} style={styles.listElements}>
            <Image style={styles.listElementsIconImage} source={value.image} />
            <View style={{
              flex: 1,
            }}>
              <Text style={styles.listElementsTitle}>{value.title}</Text>
              <Text style={styles.listElementsInfo}>
                {value.info}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
      <View style={{
        margin: 20,
      }}>
        <View style={{
        }}>
          <Text style={styles.listElementsTitle}>Approximate transfer fees</Text>
          <Text style={styles.listElementsInfo}>453143 sats</Text>
        </View>
        <View style={{
          flexDirection: 'row', marginTop:20, marginBottom:20
        }}>
          <TouchableOpacity onPress={()=>{props.navigation.navigate( 'NewWalletGenerationOTP' )}} style={{
            height: wp( '13%' ), width: wp( '40%' ), backgroundColor: Colors.blue, justifyContent: 'center', alignItems: 'center', borderRadius: 10, elevation: 10,
            shadowColor: Colors.shadowBlue,
            shadowOpacity: 1,
            shadowOffset: {
              width: 15, height: 15
            },
          }}><Text style={{
              color: Colors.white,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Medium
            }}>Confirm</Text></TouchableOpacity>
          <TouchableOpacity style={{
            height: wp( '13%' ), width: wp( '30%' ), justifyContent: 'center', alignItems: 'center', borderRadius: 10
          }}><Text style={{
              color: Colors.blue,
              fontSize: RFValue( 13 ),
              fontFamily: Fonts.Medium
            }}>Cancel</Text></TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

export default SweepFundsFromExistingAccount

const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp( '1.5%' )
  },
  listElements: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingBottom: 20,
    paddingTop: 20,
    marginRight: 20, marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginLeft: 13,
    fontFamily: Fonts.Regular
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginLeft: 13,
    fontFamily: Fonts.Regular,
    marginTop: hp( '0.5%' )
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: wp( '10%' ),
    height: wp( '10%' ),
    alignSelf: 'center'
  }
} )
