import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Fonts from '../../common/Fonts'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomInfoBox from '../../components/BottomInfoBox'

const HistoryPageComponent = ( props ) => {
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
                      {value.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            } )}
          </ScrollView>
          {props.data.length <= 1 && (
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={
                props.infoBoxTitle ? props.infoBoxTitle : 'Recovery Key History'
              }
              infoText={
                props.infoBoxInfo
                  ? props.infoBoxInfo
                  : 'The history of your Recovery Key will appear here'
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
          <View style={{
            backgroundColor: Colors.backgroundColor, flex: 1, justifyContent: 'flex-end'
          }}>
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={props.infoBoxTitle ? props.infoBoxTitle : 'No history'}
              infoText={
                props.infoBoxInfo
                  ? props.infoBoxInfo
                  : 'The history of your Recovery Key will appear here'
              }
            />
          </View>
        </View>
      )}
      <View>
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
                fontFamily: Fonts.FiraSansRegular,
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
                style={{
                  ...styles.successModalButtonView,
                  backgroundColor: props.confirmDisable
                    ? Colors.lightBlue
                    : Colors.blue,
                }}
                delayPressIn={0}
                disabled={props.confirmDisable ? props.confirmDisable : false}
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
                  }}
                >
                  {props.changeButtonText}
                </Text>
              </TouchableOpacity>
            ) : null}
        </View>
      </View>
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
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
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
    fontFamily: Fonts.FiraSansRegular,
  },
  selectedHistoryCardDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
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
    fontFamily: Fonts.FiraSansRegular,
  },
  historyCardDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
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
