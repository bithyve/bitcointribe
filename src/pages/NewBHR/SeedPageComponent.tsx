import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSelector, RootStateOrAny } from 'react-redux'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Alert,
  FlatList,
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
import { Wallet } from '../../bitcoin/utilities/Interface'
import { PagerView, PagerViewOnPageScrollEventData, PagerViewOnPageSelectedEventData } from 'react-native-pager-view'

const AnimatedPagerView = Animated.createAnimatedComponent( PagerView )

const SeedPageComponent = ( props ) => {
  const strings  = translations[ 'bhr' ]
  const wallet: Wallet = useSelector( ( state: RootStateOrAny ) => state.storage.wallet )
  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const SelectOption = ( Id ) => {
  }

  const seed = wallet.primaryMnemonic.split( ' ' )
  const seedData = seed.map( ( word, index ) => {
    return {
      name: word, id: ( index+1 )
    }
  } )

  const [ total, setTotal ] = useState( 0 )
  const [ partialSeedData, setPartialSeedData ] = useState( [] )
  const [ currentPosition, setCurrentPosition ] = useState( 0 )

  const width = Dimensions.get( 'window' ).width
  const ref = useRef<PagerView>( null )
  const scrollOffsetAnimatedValue = useRef( new Animated.Value( 0 ) ).current
  const positionAnimatedValue = useRef( new Animated.Value( 0 ) ).current
  const onPageSelectedPosition = useRef( new Animated.Value( 0 ) ).current
  const inputRange = [ 0, partialSeedData.length ]
  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate( {
    inputRange,
    outputRange: [ 0, partialSeedData.length * width ],
  } )

  useEffect( () => {
    const tempData = []
    let innerTempData = []
    let initPosition = 0
    let lastPosition = 6
    const totalLength = seedData.length
    console.log( 'skk seeddata', seedData )
    seedData.map( ( item, index )=>{
      if( index != 0 && index % 6 == 0 ){
        initPosition = initPosition + 6
        lastPosition = ( lastPosition + 6 > totalLength )?totalLength:lastPosition
        tempData.push( innerTempData )
        innerTempData = []
      }
      innerTempData.push( item )
    } )
    if( innerTempData.length > 0 ){
      tempData.push( innerTempData )
    }
    console.log( 'skk tempData', tempData )

    setPartialSeedData( tempData )
    setTotal( totalLength )
  }, [] )

  const onNextClick = () => {
    const nextPosition = currentPosition+1
    setCurrentPosition( nextPosition )
    ref.current?.setPage( nextPosition )
  }

  const onProceedClick = () =>{
    let seed = ''
    let showValidation = false
    seedData.forEach( ( { name } ) => {
      if( name == null || name == '' ) {
        showValidation = true
        return
      }
      if( !seed ) seed = name
      else seed = seed + ' ' + name
    } )
    if( showValidation ){
      Alert.alert( 'Please fill all seed words' )
    } else {
      props.onPressConfirm( seed, seedData[ 1 ].name )
    }
  }

  const onPreviousClick = () => {
    const nextPosition = currentPosition-1
    setCurrentPosition( nextPosition )
    ref.current?.setPage( nextPosition )
  }

  const getFormattedNumber = ( number ) => {
    if ( number < 10 ) return '0' + number
    else return number + ''
  }

  const getPlaceholder = ( index ) => {
    if ( index == 1 ) return index + 'st'
    else if ( index == 2 ) return index + 'nd'
    else if ( index == 3 ) return index + 'rd'
    else return index + 'th'
  }

  const onPageScroll = useMemo(
    () =>
      Animated.event<PagerViewOnPageScrollEventData>(
        [
          {
            nativeEvent: {
              offset: scrollOffsetAnimatedValue,
              position: positionAnimatedValue,
            },
          },
        ],
        {
          useNativeDriver: false,
        }
      ),
    []
  )

  const onPageSelected = useMemo(
    () =>
      Animated.event<PagerViewOnPageSelectedEventData>(
        [ {
          nativeEvent: {
            position: onPageSelectedPosition
          }
        } ],
        {
          listener: ( { nativeEvent: { position } } ) => {
            setCurrentPosition( position )
          },
          useNativeDriver: true,
        }
      ),
    []
  )

  return (
    <View style={{
      flex: 1
    }} >
      {partialSeedData && partialSeedData.length > 0 && partialSeedData[ currentPosition ] != undefined &&
      partialSeedData[ currentPosition ] ? (
          <AnimatedPagerView
            initialPage={0}
            ref={ref}
            style={{
              flex:1
            }}
            onPageScroll={onPageScroll}
            onPageSelected={onPageSelected}
          >
            {partialSeedData.map( ( seedItem, seedIndex ) => (
              <View  key={seedIndex} style={{
                flex: 1, marginTop: 10
              }} >
                <FlatList
                  keyExtractor={( item, index ) => index.toString()}
                  data={seedItem}
                  extraData={seedItem}
                  showsVerticalScrollIndicator={false}
                  numColumns={2}
                  contentContainerStyle={{
                    marginStart:15
                  }}
                  renderItem={( { value, index } ) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => SelectOption( value?.id )}
                        style={styles.historyCard}
                      >
                        <Text style={styles.numberText}>{getFormattedNumber( index + 1 + ( seedIndex * 6 ) )}</Text>
                        <TextInput
                          style={[ styles.modalInputBox,
                            partialSeedData[ currentPosition ][ index ]?.name.length > 0 ? styles.selectedInput : null,
                            // value?.name.length > 0 ? styles.selectedInput : null,
                          ]}
                          placeholder={`Enter ${getPlaceholder( index + 1 + ( seedIndex * 6 ) )} word`}
                          placeholderTextColor={Colors.borderColor}
                          value={partialSeedData[ currentPosition ][ index ]?.name}
                          autoCompleteType="off"
                          textContentType="none"
                          returnKeyType="next"
                          autoCorrect={false}
                          editable={false}
                          autoCapitalize="none"
                          // onSubmitEditing={() =>
                          // }
                          onChangeText={( text ) => {
                            const data = [ ...partialSeedData ]
                            data[ currentPosition ][ index ].name = text
                            setPartialSeedData( data )
                          }}
                        />
                      </TouchableOpacity>
                    )
                  }}
                />
                {/* <BottomInfoBox
                  backgroundColor={Colors.white}
                  title={props.infoBoxTitle}
                  infoText={props.infoBoxInfo}
                /> */}
              </View>
            ) )}
          </AnimatedPagerView>
        ): (
          <View style={{
            flex: 1
          }}>
            {/* <View style={{
              backgroundColor: Colors.backgroundColor, flex: 1, justifyContent: 'flex-end'
            }}>
              <BottomInfoBox
                backgroundColor={Colors.white}
                title={props.infoBoxTitle}
                infoText={props.infoBoxInfo}
              />
            </View> */}
          </View>
        )}
      {props.showButton ? <View>
        <View style={[ styles.bottomButtonView ]}>
          {props.confirmButtonText ? (
            <TouchableOpacity
              onPress={() => { ( currentPosition + 1 ) * 6 < total ? onNextClick() : onProceedClick() }}
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
                {( currentPosition + 1 ) * 6 < total ? props.confirmButtonText : props.proceedButtonText}
              </Text>
            </TouchableOpacity>
          ) : null}
          {props.isChangeKeeperAllow ? (
            <TouchableOpacity
              disabled={props.disableChange ? props.disableChange : false}
              onPress={() => { ( currentPosition  * 6 )!=0 ? onPreviousClick() : props.onPressChange() }}
              style={{
                marginLeft: 10,
                height: wp( '13%' ),
                width: wp( '25%' ),
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
                {(  currentPosition  * 6 )!=0 ? props.previousButtonText : props.changeButtonText}
              </Text>
            </TouchableOpacity>
          ) : null}
          <View style={{
            flexDirection: 'row'
          }}>
            {
              partialSeedData.map( ( item, index )=>{
                return(
                  <View key={( index )} style={currentPosition==index ? styles.selectedDot:styles.unSelectedDot} />
                )
              } )
            }
          </View>
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
    marginEnd: 15,
    // backgroundColor: Colors.gray7,
    borderRadius: 10,
    flex: 1 / 2,
    // height: wp( '15%' ),
    // width: wp( '90%' ),
    // justifyContent: 'center',
    // paddingLeft: wp( '3%' ),
    // paddingRight: wp( '3%' ),
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
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
  numberContainer: {
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
  numberInnerContainer: {
    backgroundColor: Colors.numberBg,
    borderRadius: RFValue( 23 ),
    height: RFValue( 46 ),
    width: RFValue( 46 ),
    margin: RFValue( 4 ),
    justifyContent: 'center',
    alignItems: 'center'
  },
  numberText: {
    color: Colors.numberFont,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.FiraSansRegular,
    marginEnd: 10
  },
  nameText: {
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
    // borderColor: '#E3E3E3',
    // borderWidth: 1
    backgroundColor: Colors.backgroundColor1
  },
  selectedInput: {
    backgroundColor: Colors.white,
    // backgroundColor: 'red',
    elevation: 5,
    shadowColor: Colors.shadowBlack,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
  },
  selectedDot:{
    width:25,
    height:5,
    borderRadius:5,
    backgroundColor:Colors.blue,
    marginEnd:5
  },
  unSelectedDot:{
    width:6,
    height:5,
    borderRadius:5,
    backgroundColor:Colors.primaryAccentLighter2,
    marginEnd:5
  }
} )
