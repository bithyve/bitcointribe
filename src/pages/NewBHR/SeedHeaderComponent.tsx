import React from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { translations } from '../../common/content/LocContext'

const SeedHeaderComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]

  return (
    <View style={styles.modalHeaderTitleView}>
      <View style={{
        flex: 1, flexDirection: 'row', alignItems: 'center'
      }}>
        <TouchableOpacity
          onPress={() => props.onPressBack()}
          style={{
            height: wp( '10%' ), width: wp( '10%' ), alignItems: 'center'
          }}
        >
          <Image
            source={require( '../../assets/images/icons/icon_back.png' )}
            style={{
              width: wp( '5%' ), height: wp( '2%' )
            }}
          />
        </TouchableOpacity>
        <View style={styles.headerInfoView}>
          <View style={{
            flex: 1, justifyContent: 'center'
          }}>
            <Text style={styles.titleText}>{props.selectedTitle}</Text>
            <Text style={{
              ...styles.infoText, fontSize: RFValue( 10 )
            }}>
              {props.moreInfo}
            </Text>
          </View>
        </View>
      </View>
    </View>
  )
}

export default SeedHeaderComponent

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingBottom: hp( '2%' ),
    marginTop: 20,
    marginBottom: 15,
    marginLeft: wp( '4%' ),
    marginRight: wp( '4%' ),
  },
  infoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.lightTextColor,
    fontSize: RFValue( 11 ),
  },
  titleText: {
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  headerImage: {
    width: wp( '9%' ),
    height: wp( '9%' ),
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  headerInfoView: {
    flex: 1,
    flexDirection: 'row',
    marginLeft: wp( '4%' ),
  },
} )
