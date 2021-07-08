import React from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import config from '../../bitcoin/HexaConfig'
import CopyThisText from '../CopyThisText'
import { ScrollView } from 'react-native-gesture-handler'
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper'

export default function DonationWebPageBottomSheet( props ) {
  return (
    <View style={styles.modalContentContainer}>
      <ScrollView style={styles.modalContainer}>
        <View style={{
          height: '100%', marginHorizontal: wp( '7%' )
        }}>
          <View
            style={{
              ...styles.successModalHeaderView, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start'
            }}
          >
            <View>
              <Text
                style={{
                  color: Colors.blue,
                  fontSize: RFValue( 18 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Donation web view
              </Text>
              <Text
                style={{
                  ...styles.modalInfoText,
                  marginTop: wp( '1.5%' ),
                  color: Colors.lightTextColor,
                }}
              >
                Use one of the options below to publish
              </Text>
            </View>
            <AppBottomSheetTouchableWrapper
              style={{
                marginLeft: 'auto',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: wp( '1.5%' ),
              }}
              onPress={() => {
                props.onClickSetting()
              }}
            >
              <Image
                source={require( '../../assets/images/icons/settings.png' )}
                style={styles.image}
              />
            </AppBottomSheetTouchableWrapper>
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.titleTextStyle}>Donation Link</Text>
            <Text style={styles.modalInfoText}>
              When someone wants to donate, they can simply click on this link
              which will serve up the donation page
            </Text>
          </View>
          <View
            style={{
              marginTop: -20,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 40,
              marginRight: 40,
            }}
          >
            <CopyThisText
              text={
                `https://hexawallet.io/${config.APP_STAGE === 'app'
                  ? 'donate'
                  : config.APP_STAGE === 'sta'
                    ? 'donate-stage'
                    : 'donate-test'
                }/?donationid=` + props.account.id.slice( 0, 15 )
              }
            />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.titleTextStyle}>Embed Code</Text>
            <Text style={styles.modalInfoText}>
              If you have a website, simply copy this code on your site to start
              receiving donations
            </Text>
          </View>
          <View
            style={{
              marginTop: -20,
              alignItems: 'center',
              justifyContent: 'center',
              marginLeft: 40,
              marginRight: 40,
            }}
          >
            <CopyThisText
              text={`<iframe src="https://hexawallet.io/${config.APP_STAGE === 'app'
                ? 'donate'
                : config.APP_STAGE === 'sta'
                  ? 'donate-stage'
                  : 'donate-test'
              }/?donationid=${props.account.id.slice( 0, 15 )
              }" width="100%" height="600" frameborder="0" style="border: 0px;"></iframe>`}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
  },
  successModalHeaderView: {
    marginTop: wp( '6%' ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  titleTextStyle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 70,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: hp( '1.2%' ),
  },
  infoTextContainer: {
    marginTop: 20,
    marginHorizontal: hp( '1.5%' ),
  },
  buttonStyle: {
    height: 50,
    width: wp( '40%' ),
    backgroundColor: Colors.blue,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    marginBottom: 20,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
  deeplinkContainerStyle: {
    flexDirection: 'row',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundColor,
    height: 50,
    borderRadius: 10,
    padding: 10,
  },
  copylinkContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 50,
    height: 50,
    backgroundColor: '#E3E3E3',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    position: 'absolute',
    right: 0,
  },
  image: {
    width: wp( '5%' ),
    height: wp( '5%' ),
    resizeMode: 'contain',
  },
} )
