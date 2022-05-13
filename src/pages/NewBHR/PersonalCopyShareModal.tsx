import React, { useState, useRef, useCallback, useEffect } from 'react'
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  Platform,
  TouchableOpacity,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import Icons from '../../common/Icons'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import { useDispatch } from 'react-redux'
import BottomInfoBox from '../../components/BottomInfoBox'
import { RFValue } from 'react-native-responsive-fontsize'
import BottomSheet from 'reanimated-bottom-sheet'
import ModalHeader from '../../components/ModalHeader'
import { sharePDF } from '../../store/actions/BHR'

export default function PersonalCopyShareModal( props ) {
  // const [flagRefreshing, setFagRefreshing] = useState(false);
  const [ isShared, setIsShared ] = useState( false )
  const [ mailOptionsBottomSheet, setMailOptionsBottomSheet ] = useState( React.createRef() )
  const [ personalCopyShareOptions, setPersonalCopyShareOptions ] = useState( [
    {
      id: 1,
      title: 'Sending Email',
      type: 'Email',
      flagShare: false,
      info: 'Make sure that you delete the message from your device once it is sent',
      imageIcon: Icons.manageBackup.PersonalCopy.email,
    },
    {
      id: 2,
      title: 'Printing a copy',
      type: 'Print',
      flagShare: false,
      info: 'Keep all the pages of the printed copy safe',
      imageIcon: Icons.manageBackup.PersonalCopy.print,
    },
    {
      id: 3,
      title: 'Other options',
      type: 'Other',
      flagShare: false,
      info: 'Make sure that you delete the message from your device once it is sent',
      imageIcon: Icons.manageBackup.PersonalCopy.icloud,
    },
  ] )

  const dispatch = useDispatch()

  const onShare = async ( shareOption, isEmailOtherOptions ) => {
    console.log( 'SHARE', shareOption, isEmailOtherOptions )
    dispatch( sharePDF( shareOption.type, isEmailOtherOptions ) )
    props.onPressShare()
  }

  const onConfirm = async () => {
    props.onPressConfirm()
  }

  const renderMailOptionsHeader = () => {
    return(
      <ModalHeader
        onPressHeader={() => {
          ( mailOptionsBottomSheet as any ).current.snapTo( 0 )
        }}
      />
    )
  }

  const renderMailOptionsContent = () => {
    return(
      <View style={{
        height:hp( '20%' ), flexDirection: 'row', alignItems: 'center', justifyContent: 'space-evenly', backgroundColor: Colors.white
      }}>
        <TouchableOpacity style={{
          flexDirection: 'column', alignItems: 'center'
        }} onPress={() => {
          onShare( personalCopyShareOptions[ 0 ], false )
          setIsShared( true )
        }}
        >
          <Image style={{
            height: wp( '15%' ), width: wp( '15%' )
          }} source={require( '../../assets/images/icons/ios_mail.png' )} />
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, marginTop: 5,
          }}>Mail</Text>
        </TouchableOpacity>
        <TouchableOpacity style={{
          flexDirection: 'column', alignItems: 'center'
        }} onPress={() => {
          onShare( personalCopyShareOptions[ 0 ], true )
          setIsShared( true )
        }}
        >
          <Image style={{
            height: wp( '15%' ), width: wp( '15%' ), borderWidth: 1, borderColor: Colors.textColorGrey, borderRadius: 10
          }} source={require( '../../assets/images/icons/icon_more.png' )} />
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, marginTop: 5,
          }}>More Options</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[ styles.modalContainer ]}>
      <View
        style={{
          borderBottomWidth: 1,
          borderColor: Colors.borderColor,
          flexDirection: 'row',
          paddingRight: 10,
          paddingBottom: hp( '1.5%' ),
          marginRight: 10,
          marginBottom: hp( '1.5%' ),
          paddingTop: hp( '1.5%' ),
          alignItems: 'center',
          marginLeft: 20,
          marginTop: hp( 1 )
        }}
      >
        <Text
          style={{
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.FiraSansMedium,
          }}
        >
          Store PDF via
        </Text>
      </View>
      <View style={{
        // flex: 1
      }}>
        <FlatList
          data={personalCopyShareOptions}
          extraData={props.personalCopyDetails}
          renderItem={( { item, index } ) => (
            <View>
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                  if( Platform.OS == 'ios' ) {
                    //( mailOptionsBottomSheet as any ).current.snapTo( 1 )
                    if( item.type === 'Email' ){
                      onShare( personalCopyShareOptions[ 0 ], false )
                      setIsShared( true )
                    }else if( item.type === 'Other' ){
                      onShare( personalCopyShareOptions[ 0 ], true )
                      setIsShared( true )
                    }else if( item.type === 'Print' ){
                      onShare( item, false )
                      setIsShared( true )
                    }
                  }
                  else {
                    onShare( item, false )
                    setIsShared( true )
                  }
                }}
                style={[
                  styles.listElements,
                ]}
              >
                <Image
                  style={styles.listElementsIconImage}
                  source={item.imageIcon}
                />
                <View style={{
                  justifyContent: 'space-between',
                }}>
                  <Text style={styles.listElementsTitle}>{item.title}</Text>
                  <Text style={styles.listElementsInfo}>{item.info}</Text>
                </View>
                <View style={styles.listElementIcon}>
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{
                      alignSelf: 'center'
                    }}
                  />
                </View>
              </AppBottomSheetTouchableWrapper>
              <View
                style={{
                  marginLeft: 20,
                  marginRight: 20,
                  marginTop: 2,
                  marginBottom: 2,
                  height: 1,
                  backgroundColor: Colors.borderColor,
                }}
              />
            </View>
          )}
          keyExtractor={( item, index ) => index.toString()}
        />
        <View style={{
          marginTop: hp( '3%' )
        }}>
          <BottomInfoBox
            title={'Security question and answer'}
            infoText={
              'Share the PDF via any of the methods above. Then click on the button below.'
            }
          />
        </View>
        <AppBottomSheetTouchableWrapper
          disabled={isShared? false : true}
          onPress={() => {
            // console.log('Confirm');
            onConfirm()
          }}
          style={{
            ...styles.proceedButtonView,
            elevation: 10,
            backgroundColor:
              isShared ? Colors.blue : Colors.lightBlue,
          }}
        >
          <Text style={styles.proceedButtonText}>Yes, I have shared</Text>
        </AppBottomSheetTouchableWrapper>
      </View>

      <BottomSheet
        enabledInnerScrolling={false}
        ref={mailOptionsBottomSheet as any}
        snapPoints={[
          -50,
          hp( '20%' )
        ]}
        renderHeader={renderMailOptionsHeader}
        renderContent={renderMailOptionsContent}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
  modalContainer: {
    // height: '100%',
    backgroundColor: Colors.white,
    width: '100%',
  },
  headerContainer: {
    flexDirection: 'row',
    marginTop: 10,
    alignItems: 'center',
    height: 54,
  },
  headerLeftIconContainer: {
    height: 54,
  },
  headerLeftIconInnerContainer: {
    width: 54,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp( '1.5%' ),
    paddingTop: hp( '1%' ),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp( '1.5%' ),
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 12 ),
    marginTop: 5,
  },
  listElements: {
    flexDirection: 'row',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 25,
    paddingBottom: 25,
    // paddingLeft: 10,
    alignItems: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
    width: wp( 60 )
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
  proceedButtonView: {
    marginTop: hp( '2%' ),
    marginBottom: hp( '4%' ),
    height: wp( '13%' ),
    width: wp( '40%' ),
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
} )
