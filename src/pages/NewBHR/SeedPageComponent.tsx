import React, { useCallback, useState } from 'react'
import { useSelector, RootStateOrAny } from 'react-redux'
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
import { translations } from '../../common/content/LocContext'
import { Wallet } from '../../bitcoin/utilities/Interface'

const SeedPageComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const SelectOption = ( Id ) => {
  }

  const seed = wallet.primaryMnemonic.split( ' ' )
  const seedData = seed.map( ( word, index ) => {
    return {
      word, index
    }
  } )

  const getFormattedNumber =  ( number ) => {
    if( number < 10 ) return '0'+number
    else return number + ''
  }

  return (
    <View style={{
      flex: 1
    }} >
      {seedData && seedData.length ? (
        <View style={{
          flex: 1, marginTop: 30
        }} >
          <ScrollView>
            {seedData.map( ( value, index ) => {
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => SelectOption( value?.id )}
                  style={
                    SelectedOption == value.id
                      ? styles.selectedHistoryCard
                      : styles.historyCard
                  }
                >
                  <View style={styles.numberContainer}>
                    <View style={styles.numberInnerContainer}>
                      <Text style={styles.numberText}>{getFormattedNumber( index + 1 )}</Text>
                    </View>
                  </View>
                  <Text style={styles.nameText}>{value.word}</Text>
                </TouchableOpacity>
              )
            } )}
          </ScrollView>
          <BottomInfoBox
            backgroundColor={Colors.white}
            title={''}
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
              onPress={() => {props.onPressConfirm()
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

export default SeedPageComponent

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
    backgroundColor: Colors.gray7,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '80%' ),
    // justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
  },
  historyCard: {
    margin: wp( '3%' ),
    backgroundColor: Colors.gray7,
    borderRadius: 10,
    height: wp( '15%' ),
    width: wp( '80%' ),
    // justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center'
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
    height: RFValue( 50 ),
    width: RFValue( 50 ),
    borderRadius: RFValue( 25 ),
    backgroundColor: Colors.white,
    shadowColor: Colors.shadowBlack,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 6,
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
  }
} )
