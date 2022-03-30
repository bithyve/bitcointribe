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
import { LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import { useSelector } from 'react-redux'
import { LocalizationContext } from '../../common/content/LocContext'

export default function KeeperTypeModalContents( props ) {
  const { translations } = useContext( LocalizationContext )
  const common = translations[ 'common' ]
  const strings = translations[ 'bhr' ]
  const [ keeperTypesData, setKeeperTypesData ] = useState( [
    {
      type: 'cloud',
      name: strings.Backupwithcloud,
      info: strings.BackupwithcloudSub,
      image: require( '../../assets/images/icons/icon_cloud.png' ),
    },
    {
      type: 'contact',
      name: strings.Backupwithcontact,
      info: strings.BackupwithcontactSub,
      image: require( '../../assets/images/icons/icon_contact.png' ),
    },
    {
      type: 'device',
      name: strings.Backuponadevice,
      info: strings.BackuponadeviceSub,
      image: require( '../../assets/images/icons/icon_secondarydevice.png' ),
    },
    {
      type: 'pdf',
      name: strings.BackupusingPDF,
      info: strings.BackupusingPDFSub,
      image: require( '../../assets/images/icons/files-and-folders-2.png' ),
    },
  ] )
  const [ SelectedKeeperType, setSelectedKeeperType ] = useState( {
    type: '',
    name: '',
  } )
  const levelHealth: LevelHealthInterface[] = useSelector(
    ( state ) => state.bhr.levelHealth
  )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const [ completedKeeperType, setCompletedKeeperType ] = useState( [] )

  const restrictChangeToContactType = () => {
    const completedKeeperType = []
    let contactCount = 0
    let pdfCount = 0
    let deviceCount = 0
    let levelhealth: LevelHealthInterface[] = []
    if (
      !levelHealth[ 1 ] &&
      levelHealth[ 0 ] &&
      levelHealth[ 0 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1
    )
      levelhealth = [ levelHealth[ 0 ] ]
    if (
      levelHealth[ 1 ] &&
      levelHealth[ 1 ].levelInfo.findIndex( ( v ) => v.updatedAt > 0 ) > -1
    )
      levelhealth = [ levelHealth[ 0 ], levelHealth[ 1 ] ]
    for ( let i = 0; i < levelhealth.length; i++ ) {
      const element = levelhealth[ i ]
      for ( let j = 2; j < element.levelInfo.length; j++ ) {
        const element2 = element.levelInfo[ j ]
        if (
          props.keeper &&
          levelhealth[ i ] &&
          ( element2.shareType == 'contact' || element2.shareType == 'existingContact' ) &&
          props.keeper.shareId != element2.shareId
        ) {
          contactCount++
        } else if (
          !props.keeper &&
          levelhealth[ i ] &&
          ( element2.shareType == 'contact' || element2.shareType == 'existingContact' )
        )
          contactCount++
        if (
          props.keeper &&
          levelhealth[ i ] &&
          element2.shareType == 'pdf' &&
          props.keeper.shareId != element2.shareId
        ) {
          pdfCount++
        } else if (
          !props.keeper &&
          levelhealth[ i ] &&
          element2.shareType == 'pdf'
        )
          pdfCount++
        if (
          props.keeper &&
          levelhealth[ i ] &&
          ( element2.shareType == 'device' || element2.shareType == 'primaryDevice' ) &&
          props.keeper.shareId != element2.shareId
        ) {
          deviceCount++
        } else if (
          !props.keeper &&
          levelhealth[ i ] &&
          ( element2.shareType == 'device' || element2.shareType == 'primaryDevice' )
        ) {
          deviceCount++
        }
      }
    }
    if ( contactCount >= 2 ) completedKeeperType.push( 'contact' )
    if ( pdfCount >= 1 ) completedKeeperType.push( 'pdf' )
    if ( deviceCount >= 3 ) completedKeeperType.push( 'device' )
    console.log( 'contactCount', contactCount )
    console.log( 'pdfCount', pdfCount )
    console.log( 'deviceCount', deviceCount )

    setCompletedKeeperType( completedKeeperType )
  }

  useEffect( () => {
    restrictChangeToContactType()
  }, [ levelHealth ] )

  const onKeeperSelect = ( value ) => {
    if ( value.type != SelectedKeeperType.type ) {
      setSelectedKeeperType( value )
    }
  }

  return (
    <View style={{
      ...styles.modalContentContainer
    }}>
      {/* <View style={{
        height: '100%'
      }}> */}
      <View style={styles.successModalHeaderView}>
        <Text style={styles.headerText}>{props.headerText}</Text>
        <Text
          style={{
            ...styles.modalInfoText,
            marginTop: wp( '1.5%' ),
            color: Colors.lightTextColor,
          }}
        >
          {props.subHeader}
        </Text>
      </View>
      <View
        style={{
          ...styles.successModalAmountView,
          // flex: 1,
        }}
      >
        {keeperTypesData.map( ( value, index ) => {
          if ( value.type === 'cloud' && props.selectedLevelId != 1 && currentLevel != 0 ) return
          if ( ( value.type === 'pdf' && completedKeeperType.findIndex( ( value ) => value == 'pdf' ) > -1 ) ) return
          // || ( value.type === 'pdf' && currentLevel == 0 )
          if ( value.type === 'contact' && completedKeeperType.findIndex( ( value ) => value == 'contact' ) > -1 ) return
          if ( value.type === 'device' && completedKeeperType.findIndex( ( value ) => value == 'device' ) > -1 ) return
          return (
            <AppBottomSheetTouchableWrapper
              activeOpacity={10}
              onPress={() => onKeeperSelect( value )}
              style={styles.keeperTypeElementView}
              key={index}
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
                <Text numberOfLines={3} style={styles.keeperTypeInfo}>
                  {value.info}
                </Text>
              </View>
            </AppBottomSheetTouchableWrapper>
          )
        } )}
      </View>
      {/* <View style={styles.successModalAmountView}>
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
        </View>*/}
      <View style={styles.bottomButtonView}>
        <AppBottomSheetTouchableWrapper
          disabled={!SelectedKeeperType.name}
          onPress={() => {
            props.onPressSetup(
              SelectedKeeperType.type,
              SelectedKeeperType.name
            )
          }}
          style={{
            ...styles.successModalButtonView,
            shadowColor: Colors.shadowBlue,
            backgroundColor: !SelectedKeeperType.name ? Colors.lightBlue : Colors.blue,
          }}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            {strings.ShareRecoveryKey}
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
      {/* </View> */}
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContentContainer: {
    // height: '100%',
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
    fontFamily: Fonts.FiraSansRegular,
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
