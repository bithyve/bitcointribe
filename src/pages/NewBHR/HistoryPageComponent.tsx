import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform
} from 'react-native'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../../components/BottomInfoBox'
import { translations } from '../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'
import moment from 'moment'

const HistoryPageComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]

  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const SelectOption = ( Id ) => {
    if ( Id == SelectedOption ) {
      setSelectedOption( 0 )
    } else {
      setSelectedOption( Id )
    }
  }

  return (
    <View style={{
      flex: 1
    }} >
      {props.data && props.data.length ? (
        <View style={{
          flex: 1
        }} >
          <ScrollView>
            {props.data.map( ( value, index ) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => SelectOption( value.id )}
                  style={
                    SelectedOption == value.id
                      ? styles.selectedHistoryCard
                      : styles.historyCard
                  }
                >
                  <View
                    style={
                      SelectedOption == value.id
                        ? {
                          flexDirection: 'column',
                        }
                        : {
                          flexDirection: 'row',
                          alignItems: 'center',
                        }
                    }
                  >
                    <Text
                      style={
                        SelectedOption == value.id
                          ? styles.selectedHistoryCardTitleText
                          : styles.historyCardTitleText
                      }
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={
                        SelectedOption == value.id
                          ? styles.selectedHistoryCardDateText
                          : styles.historyCardDateText
                      }
                    >
                      {moment( value.confirmed ).format( 'DD MMMM YYYY, HH:mm' )}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            } )}
          </ScrollView>
          {props.data.length <= 1 || props.infoBoxTitle == ( Platform.OS == 'ios' ? strings.BackupHistory : strings.BackupHistorydrive ) && !props.showSeedHistoryNote && (
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={
                props.infoBoxTitle ? props.infoBoxTitle : 'Recovery Key History'
              }
              infoText={
                props.infoBoxInfo
                  ? props.infoBoxInfo
                  : strings.historyofyourRecovery
              }
            />
          )}
        </View>
      ) : (
        <View style={{
          flex: 1
        }}>
          {/* <ScrollView>
            {[ 1, 2, 3, 4 ].map( ( index ) => {
              return (
                <View style={styles.waterMarkCard} key={index}>
                  <View>
                    <View style={styles.waterMarkCardTextOne} />
                    <View style={styles.waterMarkCardTextTwo} />
                  </View>
                </View>
              )
            } )}
          </ScrollView> */}
          { !props.showSeedHistoryNote &&
          <View style={{
            backgroundColor: Colors.backgroundColor, flex: 1, justifyContent: 'flex-end'
          }}>
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={props.infoBoxTitle ? props.infoBoxTitle : strings.Nohistory}
              infoText={
                props.infoBoxInfo
                  ? props.infoBoxInfo
                  : strings.historyofyourRecovery
              }
            />
          </View>
          }
        </View> )}
      {props.showSecurityPassword ?
        <TouchableOpacity
          style={[ styles.successModalButtonView, {
            marginLeft: wp( '8%' ),
            marginBottom: -wp( '5%' ),
            alignSelf:'flex-start',
          } ]}
          delayPressIn={0}
          onPress={() => props.onEncryptionPasswordClick()}
        >
          <Text
            style={[ styles.proceedButtonText, {
              fontSize: RFValue( 12 ),
              // fontFamily: Fonts.Regular,
              color: Colors.white,
            } ]}
          >
            Encryption Password
          </Text>
        </TouchableOpacity>
        : null}
      {props.showButton ? <View>
        {props.onConfirm ?
          <TouchableOpacity
            style={{
              marginLeft: wp( '8%' ),
              marginBottom: -wp( '5%' ),
              height: wp( '7%' ),
              width: 'auto',
              justifyContent:'center'
            }}
            delayPressIn={0}
            onPress={() => props.onConfirm()}
          >
            <Text
              style={{
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Regular,
                color: Colors.textColorGrey,
              }}
            >
            Click here To{' '}
              <Text
                style={{
                  color: Colors.blue,
                }}
              >
              confirm
              </Text>{' '}
            share
            </Text>
          </TouchableOpacity>
          : null}
        <View style={styles.bottomButtonView}>
          {props.confirmButtonText ||
          props.IsReshare ||
          !props.isVersionMismatch ? (
              <TouchableOpacity
                onPress={() => {
                  props.IsReshare
                    ? props.onPressReshare()
                    : props.onPressConfirm()
                }}

                delayPressIn={0}
                disabled={props.confirmDisable ? props.confirmDisable : false}
              >
                <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
                  start={{
                    x: 0, y: 0
                  }} end={{
                    x: 1, y: 0
                  }}
                  locations={[ 0.2, 1 ]}
                  style={{
                    ...styles.successModalButtonView,
                    backgroundColor: props.confirmDisable
                      ? Colors.lightBlue
                      : Colors.blue,
                  }}
                >
                  <Text
                    style={{
                      ...styles.proceedButtonText,
                      color: Colors.white,
                    }}
                  >
                    {props.IsReshare
                      ? props.reshareButtonText
                      : props.confirmButtonText}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            ) : null}
          {!props.isVersionMismatch &&
          props.isChangeKeeperAllow ? (
              <TouchableOpacity
                disabled={props.disableChange ? props.disableChange : false}
                onPress={() => props.onPressChange()}
                style={{
                  marginLeft: 10,
                  height: wp( '13%' ),
                  width: wp( '40%' ),
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                delayPressIn={0}
              >
                <Text
                  style={{
                    ...styles.proceedButtonText,
                    color: props.disableChange ? Colors.lightBlue : Colors.blue,
                    opacity: props.disableChange ? 0 : 1
                  }}
                >
                  {props.changeButtonText}
                </Text>
              </TouchableOpacity>
            ) : null}
        </View>
      </View> : null
      }
    </View>
  )
}

export default HistoryPageComponent

const styles = StyleSheet.create( {
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '40%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // elevation: 10,
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  selectedHistoryCard: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
  },
  selectedHistoryCardTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
  },
  selectedHistoryCardDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
    marginTop: hp( '0.3%' ),
  },
  historyCard: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '15%' ),
    width: wp( '85%' ),
    justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
  },
  historyCardTitleText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
  },
  historyCardDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
    marginLeft: 'auto',
  },
  waterMarkCard: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  waterMarkCardTextOne: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '4%' ),
    width: wp( '40%' ),
    borderRadius: 10,
  },
  waterMarkCardTextTwo: {
    backgroundColor: Colors.backgroundColor,
    height: wp( '4%' ),
    width: wp( '30%' ),
    marginTop: 5,
    borderRadius: 10,
  },
  bottomButtonView: {
    height: hp( '18%' ),
    flexDirection: 'row',
    marginTop: 'auto',
    alignItems: 'center',
    marginLeft: wp( '8%' ),
    marginRight: wp( '8%' ),
  },
} )
