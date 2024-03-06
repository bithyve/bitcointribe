import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import RadioButton from '../../components/RadioButton'

export default function UpgradePdfKeeper( props ) {
  const [ keeperTypesData, setKeeperTypesData ] = useState( [

    {
      type: 'pdf',
      name: 'Pdf Keeper',
      info: 'Lorem ipsum dolor sit amet, consectetur',
      image: require( '../../assets/images/icons/files-and-folders-2.png' ),
    },
    {
      type: 'device',
      name: 'Keeper Device',
      info: 'Lorem ipsum dolor sit amet, consectetur',
      image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
    },
  ] )
  const [ SelectedKeeperType, setSelectedKeeperType ] = useState( {
    type: '',
    name: '',
  } )

  const [ isLevel2, setIsLevel2 ] = useState( props.isLevel2 ? props.isLevel2 : false )
  const onKeeperSelect = ( value ) => {
    if ( value.type != SelectedKeeperType.type ) {
      setSelectedKeeperType( value )
    }
  }
  useEffect( () => {
    setIsLevel2( props.isLevel2 )
  }, [ props.isLevel2 ] )

  return (
    <View style={{
      ...styles.modalContentContainer, height: '100%'
    }}>
      <View style={{
        height: '100%'
      }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>Add Keeper</Text>
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp( '1.5%' ),
              color: Colors.lightTextColor,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View
          style={{
            ...styles.successModalAmountView,
            flex: 1,
          }}
        >
          {keeperTypesData.map( ( value, index ) => {
            if( isLevel2 && value.type === 'pdf' ){return}
            return (
              <AppBottomSheetTouchableWrapper
                key={index}
                activeOpacity={10}
                onPress={() => onKeeperSelect( value )}
                style={styles.keeperTypeElementView}
              >
                <View style={styles.typeRadioButtonView}>
                  <RadioButton
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={value.type == SelectedKeeperType.type}
                    onpress={() => onKeeperSelect( value )}
                  />
                </View>
                <Image
                  style={{
                    width: wp( '9%' ),
                    height: wp( '9%' ),
                    resizeMode: 'contain',
                    alignSelf: 'center',
                    marginRight: wp( '5%' ),
                  }}
                  source={value.image}
                />
                <View>
                  <Text style={styles.keeperTypeTitle}>{value.name}</Text>
                  <Text numberOfLines={1} style={styles.keeperTypeInfo}>
                    {value.info}
                  </Text>
                </View>
              </AppBottomSheetTouchableWrapper>
            )

          } )}
        </View>
        <View style={styles.successModalAmountView}>
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: wp( '5%' ),
              marginTop: 'auto',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View style={styles.bottomButtonView}>
          <AppBottomSheetTouchableWrapper
            onPress={() =>
              props.onPressSetup(
                SelectedKeeperType.type,
                SelectedKeeperType.name,
              )
            }
            style={{
              ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
              backgroundColor: Colors.blue,
            }}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              Continue
            </Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={styles.backButtonView}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              Back
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '5%' ),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
  },
  successModalAmountView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: hp( '1%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Medium,
  },
  typeRadioButtonView: {
    justifyContent: 'center',
    width: wp( '10%' ),
    height: wp( '10%' ),
  },
  keeperTypeTitle: {
    color: Colors.blue,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 13 ),
    marginBottom: 5,
  },
  keeperTypeInfo: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    width: wp( '70%' ),
  },
  bottomButtonView: {
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: wp( '8%' ),
  },
  backButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keeperTypeElementView: {
    flexDirection: 'row',
    marginTop: wp( '5%' ),
    marginBottom: wp( '5%' ),
  },
} )
