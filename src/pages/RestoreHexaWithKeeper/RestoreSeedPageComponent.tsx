import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Animated, Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import PagerView, { PagerViewOnPageScrollEventData, PagerViewOnPageSelectedEventData } from 'react-native-pager-view'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Icon from 'react-native-vector-icons/dist/MaterialCommunityIcons'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { translations } from '../../common/content/LocContext'
import AlertModalContents from '../../components/AlertModalContents'
import ModalContainer from '../../components/home/ModalContainer'

const AnimatedPagerView = Animated.createAnimatedComponent( PagerView )

const RestoreSeedPageComponent = ( props ) => {
  const strings = translations[ 'bhr' ]

  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const SelectOption = ( Id ) => {
  }
  const [ seedData, setSeedData ] = useState( [
    {
      id: 1, name: ''
    },
    {
      id: 2, name: ''
    },
    {
      id: 3, name: ''
    },
    {
      id: 4, name: ''
    },
    {
      id: 5, name: ''
    }, {
      id: 6, name: ''
    }, {
      id: 7, name: ''
    }, {
      id: 8, name: ''
    }, {
      id: 9, name: ''
    }, {
      id: 10, name: ''
    }, {
      id: 11, name: ''
    }, {
      id: 12, name: ''
    }
  ] )

  const [ total, setTotal ] = useState( 0 )
  const [ partialSeedData, setPartialSeedData ] = useState( [] )
  const [ currentPosition, setCurrentPosition ] = useState( 0 )
  const [ showAlertModal, setShowAlertModal ] = useState( false )
  const [ extraSeeds, setExtraSeeds ] = useState( false )
  const [ suggestedWords, setSuggestedWords ] = useState( [] )
  const [ onChangeIndex, setOnChangeIndex ] = useState( -1 )

  const width = Dimensions.get( 'window' ).width
  const ref = React.useRef<PagerView>( null )
  const scrollOffsetAnimatedValue = React.useRef( new Animated.Value( 0 ) ).current
  const positionAnimatedValue = React.useRef( new Animated.Value( 0 ) ).current
  const onPageSelectedPosition = useRef( new Animated.Value( 0 ) ).current
  const inputRange = [ 0, partialSeedData.length ]
  const inputRefs = useRef<Array<TextInput | null>>( [] )

  const scrollX = Animated.add(
    scrollOffsetAnimatedValue,
    positionAnimatedValue
  ).interpolate( {
    inputRange,
    outputRange: [ 0, partialSeedData.length * width ],
  } )

  useEffect( () => {
    setPartialSeedDataFun( seedData )
  }, [] )

  const setPartialSeedDataFun = ( testingData ) => {
    const tempData = []
    let innerTempData = []
    let initPosition = 0
    let lastPosition = 6
    const totalLength = testingData.length
    testingData.map( ( item, index ) => {
      if ( index != 0 && index % 6 == 0 ) {
        initPosition = initPosition + 6
        lastPosition = ( lastPosition + 6 > totalLength ) ? totalLength : lastPosition
        tempData.push( innerTempData )
        innerTempData = []
      }
      innerTempData.push( item )
    } )
    if ( innerTempData.length > 0 ) {
      tempData.push( innerTempData )
    }
    setPartialSeedData( tempData )
    setTotal( totalLength )
  }

  const onNextClick = () => {
    const nextPosition = currentPosition + 1
    setCurrentPosition( nextPosition )
    ref.current?.setPage( nextPosition )
  }

  const getSuggestedWords = ( text ) => {
    const filteredData = props.mnemonicSuggestions.filter( data => data.toLowerCase().startsWith( text ) )
    setSuggestedWords( filteredData )
  }

  const onCheckPressed = () => {
    const tempData = [ ...seedData ]
    if ( !extraSeeds ) {
      for ( let i = 13; i < 25; i++ ) {
        tempData.push( {
          id: i, name: ''
        } )
      }
    } else {
      tempData.splice( 12, 12 )
    }
    setSeedData( [ ...tempData ] )
    setExtraSeeds( !extraSeeds )
    setPartialSeedDataFun( tempData )
  }

  const onProceedClick = () => {
    let seed = ''
    let showValidation = false
    seedData.forEach( ( { name } ) => {
      if ( name == null || name == '' ) {
        showValidation = true
        return
      }
      if ( !seed ) seed = name
      else seed = seed + ' ' + name
    } )
    if ( showValidation ) {
      setShowAlertModal( true )
    } else {
      props.onPressConfirm( seed )
    }
  }

  const onPreviousClick = () => {
    const nextPosition = currentPosition - 1
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

  const getIndex = ( index, seedIndex ) => {
    const newIndex = index + 1 + ( seedIndex * 6 )

    // let newIndex = index + 1 + ( seedIndex * 6 )
    // let isAdd = false
    // if ( index % 2 == 0 ) isAdd = true

    // let tempNumber = 0
    // if ( index == 0 || index == 5 ) tempNumber = 0
    // else if ( index == 1 || index == 4 ) tempNumber = 2
    // else tempNumber = 1

    // if ( isAdd )
    //   newIndex -= tempNumber
    // else newIndex += tempNumber

    return newIndex
  }

  const getTextIndex = ( index ) => {
    const newIndex = index
    // let isAdd = false
    // if ( index % 2 == 0 ) isAdd = true

    // let tempNumber = 0
    // if ( index == 0 || index == 5 ) tempNumber = 0
    // else if ( index == 1 || index == 4 ) tempNumber = 2
    // else tempNumber = 1

    // if ( isAdd )
    //   newIndex -= tempNumber
    // else newIndex += tempNumber

    return newIndex
  }

  const getPosition = ( index ) => {
    switch ( index ) {
        case 0:
        case 1:
          return 1

        case 2:
        case 3:
          return 2

        case 4:
        case 5:
          return 3

        default:
          break
    }
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
            setSuggestedWords( [] )
          },
          useNativeDriver: true,
        }
      ),
    []
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'sl' : 'height'}
      style={{
        flex: 1
      }} >
      {partialSeedData && partialSeedData.length > 0 && partialSeedData[ currentPosition ] != undefined &&
        partialSeedData[ currentPosition ] ? (
          <AnimatedPagerView
            initialPage={0}
            ref={ref}
            style={{
              flex: 1
            }}
            onPageScroll={onPageScroll}
            onPageSelected={onPageSelected}
          >
            {partialSeedData.map( ( seedItem, seedIndex ) => (
              <View key={seedIndex} style={{
                flex: 1, marginTop: 10
              }} >
                <FlatList
                  keyExtractor={( item, index ) => index.toString()}
                  data={seedItem}
                  extraData={seedItem}
                  showsVerticalScrollIndicator={false}
                  numColumns={2}
                  contentContainerStyle={{
                    marginStart: 15, zIndex: -100
                  }}
                  renderItem={( { value, index } ) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        onPress={() => SelectOption( value?.id )}
                        style={styles.historyCard}
                      >
                        <Text style={styles.numberText}>{getFormattedNumber( getIndex( index, seedIndex ) )}</Text>
                        <TextInput
                          ref={input => {inputRefs.current[ getIndex( index, seedIndex ) - 1 ] = input}}
                          style={[ styles.modalInputBox,
                            partialSeedData[ currentPosition ][ getTextIndex( index ) ]?.name.length > 0 ? styles.selectedInput : null,
                          // value?.name.length > 0 ? styles.selectedInput : null,
                          ]}
                          placeholder={`Enter ${getPlaceholder( getIndex( index, seedIndex ) )} Phrase`}
                          placeholderTextColor={Colors.borderColor}
                          value={partialSeedData[ currentPosition ][ getTextIndex( index ) ]?.name}
                          // value={value}
                          blurOnSubmit={false}
                          // autoCompleteType="off"
                          keyboardType='ascii-capable'
                          textContentType="none"
                          returnKeyType="next"
                          autoCorrect={false}
                          // editable={isEditable}
                          autoCapitalize="none"
                          onSubmitEditing={() => {
                            setSuggestedWords( [] )
                            const pos = getIndex( index, seedIndex )
                            if ( pos < inputRefs.current.length ) {
                              if ( pos % 6 === 0 ) onNextClick()
                              inputRefs.current[ pos ].focus()
                            }
                          }}
                          onFocus={() => {
                            setSuggestedWords( [] )
                            setOnChangeIndex( index )
                          }}
                          onChangeText={( text ) => {
                            const data = [ ...partialSeedData ]
                            data[ currentPosition ][ getTextIndex( index ) ].name = text.trim()
                            setPartialSeedData( data )
                            if ( text.length > 1 ) {
                              setOnChangeIndex( index )
                              getSuggestedWords( text.toLowerCase() )
                            } else {
                              setSuggestedWords( [] )
                            }
                          }}
                        />
                      </TouchableOpacity>
                    )
                  }}
                  ListFooterComponent={() => seedIndex == 1 && props.isTwelveCheckbox &&
                  <TouchableOpacity onPress={() => onCheckPressed()} style={{
                    flexDirection: 'row', alignItems: 'center'
                  }}>
                    <Icon name={extraSeeds ? 'checkbox-marked' : 'checkbox-blank-outline'} size={24} color={Colors.blue} />
                    <Text style={{
                      color: Colors.blue, marginStart: 10
                    }}>{'I have 24 Backup Phrase'}</Text>
                  </TouchableOpacity>}
                />
                {
                  suggestedWords?.length > 0 ?
                    <View style={{
                      zIndex: 1,
                      position: 'absolute',
                      // width:'80%',
                      flex: 1,
                      // minHeight:50,
                      left: 50,
                      right: 20,
                      marginTop: ( onChangeIndex == 4 || onChangeIndex == 5 )
                        ? 50 : ( getPosition( onChangeIndex ) ) * 65,
                      flexDirection: 'row',
                      backgroundColor: 'white',
                      padding: 10,
                      borderRadius: 10,
                      flexWrap: 'wrap',
                      height: ( onChangeIndex == 4 || onChangeIndex == 5 )
                        ? 85 : null,
                      overflow: 'hidden'
                    }}>
                      {suggestedWords.map( ( word, wordIndex ) => {
                        return (
                          <TouchableOpacity key={wordIndex} style={{
                            backgroundColor: Colors.lightBlue, padding: 5, borderRadius: 5,
                            margin: 5
                          }} onPress={() => {
                            const data = [ ...partialSeedData ]
                            data[ currentPosition ][ getTextIndex( onChangeIndex ) ].name = word
                            setPartialSeedData( data )
                            setSuggestedWords( [] )
                            const pos = getIndex( onChangeIndex, seedIndex )
                            if ( pos < inputRefs.current.length ) {
                              if ( pos % 6 === 0 ) onNextClick()
                              if ( onChangeIndex !== 11) inputRefs.current[ pos ].focus()
                            }
                          }}>
                            <Text style={{
                              color: Colors.white
                            }}>{word}</Text>
                          </TouchableOpacity>
                        )
                      } )}
                    </View>
                    : null
                }
                {/* <BottomInfoBox
                  backgroundColor={Colors.white}
                  title={props.infoBoxTitle}
                  infoText={props.infoBoxInfo}
                /> */}
              </View>
            ) )}
          </AnimatedPagerView>
        ) : (
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
              onPress={() => { ( currentPosition * 6 ) != 0 ? onPreviousClick() : props.onPressChange() }}
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
                {( currentPosition * 6 ) != 0 ? props.previousButtonText : props.changeButtonText}
              </Text>
            </TouchableOpacity>
          ) : null}
          <View style={{
            flexDirection: 'row'
          }}>
            {
              partialSeedData.map( ( item, index ) => {
                return (
                  <View key={( index )} style={currentPosition == index ? styles.selectedDot : styles.unSelectedDot} />
                )
              } )
            }
          </View>
        </View>
      </View> : null
      }
      <ModalContainer onBackground={() => { setShowAlertModal( false ) }} visible={showAlertModal} closeBottomSheet={() => { }}>
        <AlertModalContents
          // modalRef={this.ErrorBottomSheet}
          // title={''}
          info={'Please fill all Backup Phrase'}
          proceedButtonText={'Okay'}
          onPressProceed={() => {
            setShowAlertModal( false )
          }}
          isBottomImage={false}
        // bottomImage={require( '../../assets/images/icons/errorImage.png' )}
        />
      </ModalContainer>
    </KeyboardAvoidingView>
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
    // shadowColor: Colors.shadowBlue,
    // shadowOpacity: 1,
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
    fontFamily: Fonts.Medium,
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
    backgroundColor: Colors.backgroundColor1,
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
    fontFamily: Fonts.Regular,
  },
  historyCardDateText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
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
    color: Colors.blue,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    marginEnd: 5,
    paddingStart: 2
  },
  nameText: {
    color: Colors.greyTextColor,
    fontSize: RFValue( 20 ),
    fontFamily: Fonts.Regular,
    marginStart: 25
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    paddingLeft: 15,
    borderRadius: 10,
    // borderColor: '#E3E3E3',
    // borderWidth: 1
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
  selectedDot: {
    width: 25,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.blue,
    marginEnd: 5
  },
  unSelectedDot: {
    width: 6,
    height: 5,
    borderRadius: 5,
    backgroundColor: Colors.blue,
    marginEnd: 5
  }
} )
