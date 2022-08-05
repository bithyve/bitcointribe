import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Dimensions
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import GiftStepperComponent from './GiftStepperComponent'
import GreySatCard from '../../assets/images/satCards/Grey_satcard.svg'
import MaterialIcons from 'react-native-vector-icons/dist/MaterialIcons'
import { Icon } from 'react-native-elements'
import { Shadow } from 'react-native-shadow-2'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import GiftUnwrappedComponent from './GiftUnwrappedComponent'
import ModalContainer from '../../components/home/ModalContainer'
import ClaimSatComponent from './ClaimSatComponent'

const { height, } = Dimensions.get( 'window' )

export default function GiftCreatedScreen( props ) {

  // const [ activeSlot, setActiveSlot ] = useState( 4 )
  const totalSlots = props.navigation?.state?.params?.numSlots
  const activeSlot = props.navigation?.state?.params?.activeSlot
  const fromClaimFlow = props.navigation?.state?.params?.fromClaimFlow
  const [ claimVerification, setClaimVerification ]=useState( false )
  const [ showGiftModal, setShowGiftModal ]=useState( false )
  const [ showGiftFailureModal, setShowGiftFailureModal ]=useState( false )

  const onGiftClose =() => {
    setShowGiftModal( false )
  }

  const onGiftSuccessClick = () =>{
    setShowGiftModal( false )
    setShowGiftFailureModal( true )
  }

  const onClaimClose=() => {
    setClaimVerification( false )
  }

  const onClaimClick = () => {
    setClaimVerification( false )
    setShowGiftModal( true )
  }

  const onGiftFailureClose = () => {
    setShowGiftFailureModal( false )
  }

  const onGiftFailureClick = () => {
    setShowGiftFailureModal( false )
  }

  const onConfirmClick=()=> {
    if( fromClaimFlow == 1 )
      props.navigation.goBack()
    else setClaimVerification( true )
  }

  const onGiftSatsClick = () => {

  }

  return (
    <SafeAreaView style={styles.safeAreaContainer}>
      <StatusBar />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.white,
      } ]}>
        {/* <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.blue}
              size={17}
            />
          </View>
        </TouchableOpacity> */}
      </View>
      <Text style={{
        fontSize: RFValue( 24 ), marginHorizontal: 20, marginTop: 10,
        fontFamily: Fonts.FiraSansRegular, letterSpacing: 0.01, color: Colors.blue
      }}>{fromClaimFlow == 0 ? 'SATSCARDTM Detected':'Gift Created'}</Text>
      <Text style={{
        fontSize: RFValue( 16 ), marginHorizontal: 20, marginTop: 8,
        fontFamily: Fonts.FiraSansMedium, letterSpacing: 0.01, color: Colors.gray13
      }}>
        {fromClaimFlow == 0 ? 'Claimed sats would be transferred to your Checking Account' : 'You\'re ready to delight!'}
      </Text>
      <View style={{
        height: RFValue( 198 ), marginHorizontal: 20, marginTop: 42,
      }}>
        <Image source={require( '../../assets/images/satCards/Grey_satcard.png' )} style={{
          height: RFValue( 198 ), width: '100%'
        }} />
        <View style={{
          top: RFValue( 62 ),
          position: 'absolute',
          alignSelf: 'center'
        }}>
          <Text style={{
            fontFamily: Fonts.FiraSansSemiBold, fontSize: RFValue( 29 ),
            // top:62, position:'absolute',
            color: Colors.gray14, alignSelf: 'center',
            // backgroundColor:'red'
          }}>{'50000 sats'}</Text>
          <View style={{
            flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', marginTop: RFValue( 25 ),
          }}>
            {
              [ ...Array( totalSlots ) ].map( ( item, index ) => {
                return (
                  <View key={index} style={[ styles.slotView,
                    activeSlot == index && styles.activeSlot,
                    activeSlot > index && styles.previousActiveSlot ]}/>
                )
              } )
            }
            <TouchableOpacity style={{
              marginLeft: RFValue( 10 )
            }}>
              <MaterialIcons size={RFValue( 12 )} name={'info'} />
            </TouchableOpacity>
          </View>
        </View>

        {/* <GreySatCard /> */}
      </View>
      <View style={{
        flex: 1
      }} />
      <View style={{
        flexDirection:'row'
      }}>

        <Shadow viewStyle={{
          ...styles.successModalButtonView,
          backgroundColor: props.buttonColor
            ? props.buttonColor
            : Colors.blue,
        }} distance={2}
        startColor={props.buttonShadowColor
          ? props.buttonShadowColor
          : Colors.shadowBlue}
        offset={[ 42, 14 ]}>
          <AppBottomSheetTouchableWrapper
            onPress={() => onConfirmClick()}
            style={{
            // ...styles.successModalButtonView,
              shadowColor: props.buttonShadowColor
                ? props.buttonShadowColor
                : Colors.shadowBlue,
            }}
            delayPressIn={0}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: props.buttonTextColor
                  ? props.buttonTextColor
                  : Colors.white,
              }}
            >
              {fromClaimFlow == 0 ?'Claim Sats':'Back to Gifts'}
            </Text>
          </AppBottomSheetTouchableWrapper>
        </Shadow>

        {fromClaimFlow == 0 && (
          <AppBottomSheetTouchableWrapper
            onPress={() => onGiftSatsClick()}
            style={{
              marginStart: RFValue( 20 ),
              height: wp( '12%' ),
              width: wp( '27%' ),
              justifyContent: 'center',
              alignItems: 'center',
              // alignSelf: 'center',
              // marginTop: wp( '5%' ),
              // position: 'absolute',
              // left: wp( 53 )
              // backgroundColor:'red'
            }}
            delayPressIn={0}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: props.buttonTextColor
                  ? props.buttonTextColor
                  : Colors.blue,
              }}
            >
              {'cancle'}
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}

      </View>
      <ModalContainer onBackground={onGiftClose} visible={showGiftModal} closeBottomSheet={onGiftClose}  >
        <GiftUnwrappedComponent
          title={'Your Gift is unwrapped!'}
          info={'Gifts sats received transferred to '}
          infoSelected={'Checking Account.'}
          info2={'Your checking account balance is '}
          info2Selected={'100,000 sats'}
          proceedButtonText={'Back to Home'}
          onCloseClick={onGiftClose}
          onPressProceed={onGiftSuccessClick}
          closeModal
          isBottomImage
        />
      </ModalContainer>

      <ModalContainer onBackground={onClaimClose} visible={claimVerification} closeBottomSheet={onClaimClose}  >
        <ClaimSatComponent
          title={'Claim SATSCARDTM'}
          info={'Note that this transfers the available sats in the card to your Checking Account.'}
          proceedButtonText={'Claim sats'}
          onCloseClick={onClaimClose}
          onPressProceed={onClaimClick}
          closeModal
          firstHalfLbl={'Enter the '}
          secondHalfLbl={'Spend code'}
          cancelText={'Cancel'}
          onCancelClick={onClaimClose}
        />
      </ModalContainer>

      <ModalContainer onBackground={onGiftFailureClose} visible={showGiftFailureModal} closeBottomSheet={onGiftFailureClose}  >
        <GiftUnwrappedComponent
          title={'Claim Unsuccessful'}
          info={'Sats were not transferred from your\nSATSCARDTM. Please try again.'}
          proceedButtonText={'Try again'}
          onPressIgnore={onGiftFailureClose}
          onPressProceed={onGiftFailureClick}
          isIgnoreButton
          cancelButtonText={'Back'}
          closeModal
          isBottomImage
          bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  safeAreaContainer: {
    flex: 1, backgroundColor: Colors.white,
  },
  successModalButtonView: {
    height: wp( '12%' ),
    minWidth: wp( '22%' ),
    paddingLeft: wp( '5%' ),
    paddingRight: wp( '5%' ),
    justifyContent: 'center',
    // alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    // alignSelf: 'center',
    marginLeft: wp( '8%' ),
    marginBottom: hp( '5%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  slotView: {
    width: RFValue( 13 ), height: RFValue( 6 ), borderRadius: RFValue( 3 ),
    marginHorizontal: RFValue( 2 ), borderWidth: 1, borderColor: Colors.gray15
  },
  activeSlot: {
    backgroundColor: Colors.gray14, borderWidth: 0
  },
  previousActiveSlot:{
    backgroundColor: Colors.gray8, borderWidth: 0
  }
} )
