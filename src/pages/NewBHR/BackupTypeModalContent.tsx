import React, { useState, useEffect, useContext } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import RadioButton from '../../components/RadioButton'
import { LocalizationContext } from '../../common/content/LocContext'

export default function BackupTypeModalContent( props ) {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const [ selectedBackupType, setSelectedBackupType ] = useState( 0 )
  const backupData = [
    {
      name: 'Google Drive/iCloud',
      info: 'Backup the Recovery Key on cloud',
      image: require( '../../assets/images/icons/icon_password.png' ),
    },
    {
      name: 'Seed Words',
      info: 'Make a note of your seed words',
      image: require( '../../assets/images/icons/seedwords.png' ),
    },
  ]

  return (
    <View style={{
      ...styles.modalContentContainer
    }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerText}>{props.headerText}</Text>
      </View>
      <View
        style={{
          ...styles.successModalAmountView,
        }}
      >
        {backupData.map( ( value, index ) => {
          return (
            <AppBottomSheetTouchableWrapper
              activeOpacity={10}
              onPress={() => setSelectedBackupType( index+1 )}
              style={styles.keeperTypeElementView}
              key={index}
            >
              <View style={styles.typeRadioButtonView}>
                <RadioButton
                  size={15}
                  color={Colors.lightBlue}
                  borderColor={Colors.borderColor}
                  isChecked={selectedBackupType == index+1}
                  onpress={() => setSelectedBackupType( index+1 )}
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
                <Text numberOfLines={3} style={styles.keeperTypeInfo}>
                  {value.info}
                </Text>
              </View>
            </AppBottomSheetTouchableWrapper>
          )
        } )}
      </View>
      <View style={styles.bottomButtonView}>
        <AppBottomSheetTouchableWrapper
          disabled={selectedBackupType == 0}
          onPress={() => {
            props.onPressBackupType( selectedBackupType )
          }}
          style={{
            ...styles.successModalButtonView,
            shadowColor: Colors.shadowBlue,
            backgroundColor: selectedBackupType == 0 ? Colors.lightBlue : Colors.blue,
          }}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            {'Submit'}
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
            {common.back}
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: wp( '5%' ),
  },
  successModalAmountView: {
    marginRight: wp( '8%' ),
    marginLeft: wp( '8%' ),
    marginTop: hp( '1%' ),
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '40%' ),
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
    marginTop: hp( '3%' )
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  typeRadioButtonView: {
    justifyContent: 'center',
    width: wp( '10%' ),
    height: wp( '10%' ),
  },
  keeperTypeTitle: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 13 ),
    marginBottom: 5,
  },
  keeperTypeInfo: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 11 ),
    width: wp( '60%' ),
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
    marginTop: hp( '3%' )
  },
  keeperTypeElementView: {
    flexDirection: 'row',
    marginTop: wp( '5%' ),
    marginBottom: wp( '5%' ),
  },
} )
