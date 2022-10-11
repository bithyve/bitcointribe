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
import FinanceSecurityReceipt from '../../assets/images/svgs/Finance_security_receipt.svg'

const HistoryHeaderComponent = ( props ) => {
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
        {props.imageIcon ? (
          props.imageIcon()
        ) : (
          <View style={styles.headerImageView}>
            <FinanceSecurityReceipt/>
            {/* <Image style={props.tintColor ? {
              ...styles.headerImage,
              tintColor: Colors.deepBlue
            } : styles.headerImage} source={props.headerImage} /> */}
          </View>
        )}
        <View style={styles.headerInfoView}>
          <View style={{
            flex: 1, justifyContent: 'center'
          }}>
            <Text style={styles.infoText}>
              {`${strings.Lastbackup}: `}
              <Text style={{
                fontFamily: Fonts.FiraSansMediumItalic
              }}>
                {props.selectedTime.replace( 'approximately', '' ).trim()}
              </Text>
            </Text>
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

export default HistoryHeaderComponent

const styles = StyleSheet.create( {
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
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
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
  },
  titleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  headerImageView: {
    backgroundColor: Colors.white,
    height: wp( '15%' ),
    width: wp( '15%' ),
    borderRadius: wp( '15%' ) / 2,
    borderColor: Colors.blue,
    borderWidth: 1,
    shadowColor: Colors.textColorGrey,
    shadowOpacity: 0.5,
    shadowOffset: {
      width: 0, height: 3
    },
    shadowRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wp( '4%' ),
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
