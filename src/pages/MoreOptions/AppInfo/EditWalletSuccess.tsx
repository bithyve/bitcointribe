import React from 'react'
import {
  View,
  TouchableOpacity,
  Text,
  SafeAreaView,
  StyleSheet,
  Image,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

import {  useSelector } from 'react-redux'
import { heightPercentageToDP as hp, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import BottomInfoBox from '../../../components/BottomInfoBox'
import Illustration from '../../../assets/images/svgs/illustration.svg'
import Wallet from '../../../assets/images/svgs/wallet.svg'

export default function EditWalletSuccess( props ) {
  const walletName = useSelector(
    ( state ) => state.storage.wallet.walletName,
  )
    const walletNameLength = walletName?.split('').length;
    const walletNameNew = walletName.split('')[walletNameLength - 1].toLowerCase() === 's' ? `${walletName}’ Wallet` : `${walletName}’s Wallet`;

  return (
    <SafeAreaView style={{
      backgroundColor: Colors.bgColor
    }}>
      <View style={{
        marginTop: 'auto', right: 0, bottom: 0, position: 'absolute', marginLeft: 'auto'
      }}>
        <Illustration/>
      </View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => { props.closeBottomSheet() }}
        style={{
          width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7 / 2 ),
          alignSelf: 'flex-end',
          backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
          marginTop: wp( 3 ), marginRight: wp( 3 )
        }}
      >
        <FontAwesome name="close" color={Colors.white} size={19} />
      </TouchableOpacity>
      <View style={{
        alignSelf: 'baseline'
      }}>
        <View style={{
          marginLeft: wp( 6 ),
        }}>
          <Text style={styles.modalTitleText}>
            Wallet Name{'\n'}Changed Successfully
          </Text>
          <Text style={{
            ...styles.modalInfoText,
            marginTop: wp( 1.5 ),
            marginBottom: wp( 3 ),
            paddingRight: wp( 12 )
          }}>The new name would appear on your Home Screen</Text>
        </View>
      </View>
      <View
        style={styles.addModalView}
      >
        <View style={{
          justifyContent: 'flex-start', marginVertical: 10,
          marginHorizontal: 10, flexDirection: 'row', alignItems: 'center'
        }}>
          <Wallet />
          <Text style={styles.headerTitleText}>
            {/* {`${walletName}’s Wallet`} */}
            {walletNameNew}
            </Text>
        </View>

      </View>
      <BottomInfoBox
        // backgroundColor={Colors.white}
        title={'Note'}
        infoText={
          'All your Friends & Family will see this wallet name going forward'
        }
      />
      <View style={{
        marginVertical: hp( 5 ), marginHorizontal: wp( 6 )
      }}>
        <TouchableOpacity
          onPress={() => props.onPressConfirm()}
          style={{
            ...styles.buttonView
          }}
        >
          <Text style={styles.buttonText}>Home</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  buttonView: {
    backgroundColor: Colors.blue,
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  addModalView: {
    backgroundColor: Colors.gray7,
    paddingVertical: 4,
    paddingHorizontal: 18,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    width: '90%',
    height: hp( 15 ),
    alignSelf: 'center',
    borderRadius: wp( '2' ),
    marginBottom: hp( '1' ),
    marginVertical: hp( 10 )
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
    // width: wp( 30 ),
  },
  modalInfoText: {
    marginRight: wp( 4 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify',
    letterSpacing: 0.6,
    lineHeight: 18
  },
  headerTitleText: {
    color: Colors.black,
    fontSize: RFValue( 18 ),
    marginLeft: wp( 6 ),
    fontFamily: Fonts.FiraSansRegular,
  },
} )
