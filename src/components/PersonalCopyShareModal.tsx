import React, { useCallback, useState } from 'react'
import {
  FlatList, Image, Platform, StyleSheet, Text, TouchableOpacity, View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useDispatch } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import Icons from '../common/Icons'
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper'
import BottomInfoBox from './BottomInfoBox'
import ModalHeader from './ModalHeader'

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
      title: 'Print a copy',
      type: 'Print',
      flagShare: false,
      info: 'Keep all the pages of the printed copy safe',
      imageIcon: Icons.manageBackup.PersonalCopy.print,
    },
    {
      id: 3,
      title: 'Store/ send pdf using other options',
      type: 'Other',
      flagShare: false,
      info:
        'Make sure that you delete the message from your device once it is sent',
      imageIcon: Icons.manageBackup.PersonalCopy.icloud,
    },
  ] )

  const dispatch = useDispatch()

  const onShare = async ( shareOption, isEmailOtherOptions ) => {
    props.onPressShare()
  }

  const onConfirm = async () => {
    props.onPressConfirm()
  }

  const disableSharingOption = useCallback(
    ( shareOption ) => {
      if ( !props.personalCopyDetails ) return false

      const alternateCopy =
        props.personalCopyDetails[
          props.selectedPersonalCopy.type === 'copy1' ? 'copy2' : 'copy1'
        ]
      if ( alternateCopy && alternateCopy.sharingDetails ) {
        return alternateCopy.sharingDetails.shareVia == shareOption.type
          ? true
          : false
      } else {
        return false
      }
    },
    [ props.personalCopyDetails, props.selectedPersonalCopy ],
  )

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
          }} source={require( '../assets/images/icons/ios_mail.png' )} />
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, marginTop: 5,
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
          }} source={require( '../assets/images/icons/icon_more.png' )} />
          <Text style={{
            color: Colors.textColorGrey, fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, marginTop: 5,
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
          paddingTop: hp( '0.5%' ),
          alignItems: 'center',
          marginLeft: 20,
        }}
      >
        <Text
          style={{
            color: Colors.blue,
            fontSize: RFValue( 18 ),
            fontFamily: Fonts.Medium,
          }}
        >
          Store personal copy PDF
        </Text>
      </View>
      <View style={{
        flex: 1
      }}>
        <FlatList
          data={personalCopyShareOptions}
          extraData={props.personalCopyDetails}
          renderItem={( { item, index } ) => (
            <View>
              <AppBottomSheetTouchableWrapper
                onPress={() => {
                  if( item.type === 'Email' && Platform.OS == 'ios' ) {
                    ( mailOptionsBottomSheet as any ).current.snapTo( 1 )
                  }
                  else {
                    onShare( item, false )
                    setIsShared( true )
                  }
                }}
                disabled={disableSharingOption( item )}
                style={[
                  styles.listElements,
                  disableSharingOption( item )
                    ? {
                      backgroundColor: Colors.borderColor
                    }
                    : null,
                ]}
              >
                <Image
                  style={styles.listElementsIconImage}
                  source={item.imageIcon}
                />
                <View style={{
                  justifyContent: 'space-between', flex: 1
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
        <AppBottomSheetTouchableWrapper
          disabled={isShared? false : true}
          onPress={() => {
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
      <BottomInfoBox
        title={'Security question and answer'}
        infoText={
          'The answer to your security question is used to password protect personal copies. Please use your answer (case sensitive) to open these copies'
        }
      />
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
    height: '100%',
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
    fontFamily: Fonts.Medium,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
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
    fontFamily: Fonts.Regular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.Regular,
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
    marginTop: hp( '4%' ),
    marginBottom: hp( '2%' ),
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
    fontFamily: Fonts.Medium,
  },
} )
