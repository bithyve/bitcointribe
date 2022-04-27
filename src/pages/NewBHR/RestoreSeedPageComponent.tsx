import React, { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
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

const RestoreSeedPageComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]

  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const SelectOption = ( Id ) => {
  }

  const [ seedData, setSeedData ] = useState( [
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
    {
      id: 1,
      name:''
    },
  ] )

  const getFormattedNumber =  ( number ) => {
    if( number < 10 ) return '0'+number
    else return number + ''
  }

  const getPlaceholder = ( index ) => {
    if( index == 1 ) return index + 'st'
    else if( index == 2 ) return index + 'nd'
    else if( index == 3 ) return index + 'rd'
    else return index + 'th'
  }

  return (
    <View style={{
      flex: 1
    }} >
      {seedData && seedData.length ? (
        <View style={{
          flex: 1, marginTop: 10
        }} >
          <ScrollView>
            {seedData.map( ( value, index ) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => SelectOption( value?.id )}
                  style={styles.historyCard}
                >
                  <View style={styles.numberContainer}>
                    <View style={styles.numberInnerContainer}>
                      <Text style={styles.numberText}>{getFormattedNumber( index + 1 )}</Text>
                    </View>
                  </View>
                  <TextInput
                    style={styles.modalInputBox}
                    placeholder={`Enter ${getPlaceholder( index+1 )} word`}
                    placeholderTextColor={Colors.borderColor}
                    value={value.name}
                    autoCompleteType="off"
                    textContentType="none"
                    returnKeyType="next"
                    autoCorrect={false}
                    // editable={isEditable}
                    autoCapitalize="none"
                    // onSubmitEditing={() =>
                    // }
                    onChangeText={( text ) => {
                      const data = [ ...seedData ]
                      data[ index ].name = text
                      setSeedData( data )
                    }}
                  />
                </TouchableOpacity>
              )
            } )}
          </ScrollView>
          <BottomInfoBox
            backgroundColor={Colors.white}
            title={props.infoBoxTitle}
            infoText={props.infoBoxInfo}
          />
        </View>
      ) : (
        <View style={{
          flex: 1
        }}>
          <View style={{
            backgroundColor: Colors.backgroundColor, flex: 1, justifyContent: 'flex-end'
          }}>
            <BottomInfoBox
              backgroundColor={Colors.white}
              title={props.infoBoxInfoTitle}
              infoText={props.infoBoxInfo}
            />
          </View>
        </View>
      )}
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
          {props.confirmButtonText ? (
            <TouchableOpacity
              onPress={() => {
                let seed = ''
                seedData.forEach( ( { name } ) => {
                  if( !seed ) seed = name
                  else seed = seed + ' ' + name
                } )
                props.onPressConfirm( seed )
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
          {props.isChangeKeeperAllow ? (
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
      </View> : null
      }
    </View>
  )
}

export default RestoreSeedPageComponent

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
    // backgroundColor: Colors.gray7,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    // justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  historyCard: {
    margin: wp( '3%' ),
    // backgroundColor: Colors.gray7,
    borderRadius: 10,
    height: wp( '15%' ),
    width: wp( '90%' ),
    // justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
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
  bottomButtonView: {
    height: hp( '18%' ),
    flexDirection: 'row',
    marginTop: 'auto',
    alignItems: 'center',
    marginLeft: wp( '8%' ),
    marginRight: wp( '8%' ),
  },
  numberContainer:{
    margin: 10,
    height: RFValue( 50 ),
    width: RFValue( 50 ),
    borderRadius: RFValue( 25 ),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowBlack,
    elevation: 10,
    // shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
  },
  numberInnerContainer:{
    backgroundColor: Colors.numberBg,
    borderRadius: RFValue ( 23 ),
    height: RFValue( 46 ),
    width:RFValue( 46 ),
    margin:RFValue( 4 ),
    justifyContent:'center',
    alignItems:'center'
  },
  numberText:{
    color: Colors.numberFont,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  nameText:{
    color: Colors.greyTextColor,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginStart: 25
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 13 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    borderRadius: 10,
    borderColor: '#E3E3E3',
    borderWidth: 1
  },
} )
