import React, { useContext } from 'react'
import { View, Image, Text, StyleSheet, Platform, Dimensions, StatusBar, SafeAreaView, TouchableOpacity } from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'

import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { AppBottomSheetTouchableWrapper } from '../components/AppBottomSheetTouchableWrapper'
import { ScrollView } from 'react-native-gesture-handler'
import DeviceInfo from 'react-native-device-info'
import Loader from './loader'
import { getEnvReleaseTopic } from '../utils/geEnvSpecificParams'
import { getTime } from '../common/CommonFunctions/timeFormatter'
import { LocalizationContext } from '../common/content/LocContext'
import commonStyle from "../common/Styles/Styles";

const releaseNotificationTopic = getEnvReleaseTopic()
const { height } = Dimensions.get( 'window' )
export default function NotificationListContent( props ) {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'home' ]
  const messageData = useSelector((state)=> state.notifications.messages)

  return (
    <SafeAreaView style={styles.modalContainer}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <TouchableOpacity
          style={commonStyle.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={commonStyle.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      <View style={styles.modalHeaderTitleView}>
        <View style={{
          justifyContent: 'center'
        }}>
          <Text style={styles.modalHeaderTitleText}>{strings.Notifications}</Text>
          <Text style={styles.subTitleText}>Lorem Ipsum dolor amet cons</Text>
        </View>
      </View>
      <ScrollView style={{
        // height: '63%'
        // flex: 1
      }}>
        {props.notificationLoading
          ? null
          : messageData.map( ( value, index ) => {
            return (
              <AppBottomSheetTouchableWrapper
                // key={index}
                onPress={() => props.onNotificationClicked( value )}
                style={{
                  ...styles.notificationElement,
                  backgroundColor: value.status === 'read'
                    ? Colors.white
                    : Colors.shadowBlue,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row', alignItems: 'center'
                  }}
                >
                  <Image
                    source={
                      value.type == releaseNotificationTopic
                        ? require( '../assets/images/icons/icon_hexa.png' )
                        : require( '../assets/images/icons/icon_receive.png' )
                    }
                    style={styles.notificationElementImage}
                  />
                  <View style={{
                    flex:1, justifyContent: 'center'
                  }}>
                    <Text numberOfLines={1} style={styles.notificationElementTitle}>
                      {value.title}
                    </Text>
                  </View>
                  <Text style={styles.notificationElementTimeText}>
                    {getTime( value.timeStamp )}
                  </Text>
                  {value.isMandatory ? (
                    <FontAwesome
                      name="star"
                      color={Colors.yellow}
                      size={17}
                    />
                  ) : (
                    <View style={{
                      width: 17
                    }} />
                  )}
                </View>
                <Text style={styles.notificationElementInfoText}>
                  {value.info}
                </Text>
              </AppBottomSheetTouchableWrapper>
            )
          } )}
      </ScrollView>
      {
        props.notificationLoading ? <Loader isLoading={true}/> : null
      }
      {!messageData.length ? (
        <View style={{
          backgroundColor: Colors.white, marginTop: 'auto'
        }}>
          <View style={styles.waterMarkInfoBoxView}>
            <Text style={styles.waterMarkInfoBoxTitle}>
              {strings.Nonotification}
            </Text>
            <Text style={styles.waterMarkInfoBoxInfo}>
              {strings.Allrecentnotifications}
            </Text>
          </View>
        </View>
      ) : null}
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 5,
    // maxHeight: height - 120,
    // height:hp( 63 )
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '2%' ),
    paddingTop: hp( '2%' ),
    // marginLeft: wp( '4%' ),
    // marginRight: wp( '4%' ),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 22 ),
    fontFamily: Fonts.FiraSansRegular,
    marginHorizontal: wp( 6 )
  },
  subTitleText: {
    color: Colors.gray4,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginHorizontal: wp( 6 )
  },
  notificationElement: {
    paddingHorizontal: wp( '4%' ),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderColor,
    paddingBottom: wp( '4%' ),
    paddingTop: wp( '4%' ),
  },
  notificationElementImage: {
    width: wp( '8%' ),
    height: wp( '8%' ),
    marginRight: wp( '2%' ),
  },
  notificationElementTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( '1.5%' )
  },
  notificationElementTimeText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: wp( '2%' ),
    width: 'auto',
    marginLeft: 'auto'
  },
  notificationElementInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    paddingTop: wp( '2%' ),
    marginLeft: 3,
  },
  waterMarkInfoBoxView: {
    margin: 15,
    backgroundColor: Colors.backgroundColor,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    borderRadius: 7,
  },
  waterMarkInfoBoxTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  waterMarkInfoBoxInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  EmptyListLoaderView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: wp( '5%' ),
    paddingBottom: wp( '5%' ),
    borderBottomWidth: 0.5,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    borderColor: Colors.borderColor,
  },
  EmptyListLoaderCircle: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '5%' ),
    width: wp( '5%' ),
    borderRadius: wp( '5%' ) / 2,
    marginLeft: 10,
    marginRight: 10,
  },
  EmptyListLoaderSmallText: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '5%' ),
    width: wp( '25%' ),
    borderRadius: 10,
  },
  EmptyListLoaderLargeText: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '5%' ),
    width: wp( '35%' ),
    marginTop: 5,
    borderRadius: 10,
  },
  EmptyListLoaderInfoText: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '7%' ),
    width: wp( '20%' ),
    borderRadius: 10,
  },
  EmptyListLoaderLargeCircle: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '5%' ),
    width: wp( '5%' ),
    borderRadius: wp( '5%' ) / 2,
    marginLeft: 10,
    marginRight: 10,
  },
  infoBoxView: {
    margin: 15,
    backgroundColor: Colors.backgroundColor,
    padding: 10,
    paddingTop: 20,
    paddingBottom: 20,
    marginBottom: Platform.OS == 'ios' && DeviceInfo.hasNotch() ? 30 : 20,
    borderRadius: 7,
  },
  infoBoxTitle: {
    color: Colors.black,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  infoBoxInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
  },
} )
