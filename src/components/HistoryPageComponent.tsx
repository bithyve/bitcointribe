import React, { useState } from 'react'
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import BottomInfoBox from './BottomInfoBox'

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
    }}>
      {props.data && props.data.length ? (
        <View style={{
          flex: 1
        }}>
          <ScrollView style={{
          }}>
            {props.data.map( ( value ) => {
              if ( SelectedOption == value.id ) {
                return (
                  <TouchableOpacity
                    key={value.id}
                    onPress={() => SelectOption( value.id )}
                    style={{
                      margin: wp( '3%' ),
                      backgroundColor: Colors.white,
                      borderRadius: 10,
                      height: wp( '20%' ),
                      width: wp( '90%' ),
                      justifyContent: 'center',
                      paddingLeft: wp( '3%' ),
                      paddingRight: wp( '3%' ),
                      alignSelf: 'center',
                    }}
                  >
                    <Text
                      style={{
                        color: Colors.blue,
                        fontSize: RFValue( 13 ),
                        fontFamily: Fonts.Regular,
                      }}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue( 9 ),
                        fontFamily: Fonts.Regular,
                        marginTop: hp( '0.3%' ),
                      }}
                    >
                      {value.date}
                    </Text>
                  </TouchableOpacity>
                )
              }
              return (
                <TouchableOpacity
                  key={value.id}
                  onPress={() => SelectOption( value.id )}
                  style={{
                    margin: wp( '3%' ),
                    backgroundColor: Colors.white,
                    borderRadius: 10,
                    height: wp( '15%' ),
                    width: wp( '85%' ),
                    justifyContent: 'center',
                    paddingLeft: wp( '3%' ),
                    paddingRight: wp( '3%' ),
                    alignSelf: 'center',
                  }}
                >
                  <View style={{
                    flexDirection: 'row', alignItems: 'center'
                  }}>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue( 10 ),
                        fontFamily: Fonts.Regular,
                      }}
                    >
                      {value.title}
                    </Text>
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue( 9 ),
                        fontFamily: Fonts.Regular,
                        marginLeft: 'auto',
                      }}
                    >
                      {value.date}
                    </Text>
                  </View>
                </TouchableOpacity>
              )
            } )}
          </ScrollView>
          {props.data.length <= 1 ? (
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={'Recovery Key History'}
              infoText={'The history of your Recovery Key will appear here'}
            />
          ) : null}
        </View>
      ) : (
        <View style={{
          flex: 1
        }}>
          <ScrollView>
            {[ 1, 2, 3, 4 ].map( ( value ) => {
              return (
                <View
                  key={value}
                  style={{
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
                  }}
                >
                  <View>
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp( '4%' ),
                        width: wp( '40%' ),
                        borderRadius: 10,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp( '4%' ),
                        width: wp( '30%' ),
                        marginTop: 5,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </View>
              )
            } )}
          </ScrollView>
          <BottomInfoBox
            backgroundColor={Colors.white}
            title={'No history'}
            infoText={'The history of your Recovery Key will appear here'}
          />
        </View>
      )}

      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: hp( '25%' ),
          backgroundColor: Colors.white,
        }}
      >
        {props.reshareInfo ? (
          <Text
            style={{
              opacity: props.IsReshare ? 1 : 0.5,
              marginTop: hp( '1%' ),
              marginBottom: hp( '1%' ),
              color: Colors.textColorGrey,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.Regular,
            }}
          >
            {props.reshareInfo}
            <Text
              onPress={() => {
                props.IsReshare ? props.onPressReshare() : {
                }
              }}
              style={{
                color: Colors.blue, textDecorationLine: 'underline'
              }}
            >
              Reshare
            </Text>
          </Text>
        ) : null}

        {props.changeInfo ? (
          <Text
            style={{
              opacity: props.IsReshare ? 1 : 0.5,
              marginTop: hp( '1%' ),
              marginBottom: hp( '1%' ),
              color: Colors.textColorGrey,
              fontSize: RFValue( 10 ),
              fontFamily: Fonts.Regular,
            }}
          >
            {props.changeInfo}
            <Text
              onPress={() => {
                props.IsReshare ? props.onPressChange() : {
                }
              }}
              style={{
                color: Colors.blue, textDecorationLine: 'underline'
              }}
            >
              {props.type === 'secondaryDevice'
                ? 'Change device'
                : 'Change contact'}
            </Text>
          </Text>
        ) : null}

        {props.IsReshare ? (
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressConfirm()
            }}
            style={{
              backgroundColor: Colors.blue,
              height: wp( '13%' ),
              width: wp( '40%' ),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginTop: hp( '3%' ),
              marginBottom: hp( '3%' ),
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: {
                width: 15, height: 15
              },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Medium,
              }}
            >
              Confirm
            </Text>
          </AppBottomSheetTouchableWrapper>
        ) : (
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressContinue()
            }}
            style={{
              backgroundColor: Colors.blue,
              height: wp( '13%' ),
              width: wp( '40%' ),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginTop: hp( '3%' ),
              marginBottom: hp( '3%' ),
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: {
                width: 15, height: 15
              },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.Medium,
              }}
            >
              Backup Now
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
      </View>
    </View>
  )
}

export default HistoryPageComponent

const styles = StyleSheet.create( {
} )
