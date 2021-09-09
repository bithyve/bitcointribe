import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ImageSourcePropType,
  Image,
  FlatList,
  Keyboard
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import idx from 'idx'

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CommonStyles from '../../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import Colors from '../../../common/Colors'
import HeaderTitle from '../../../components/HeaderTitle'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import { getVersions } from '../../../common/utilities'
import ModalContainer from '../../../components/home/ModalContainer'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SecurityQuestion from './SecurityQuestion'
import EnterPasscodeScreen from './EnterPasscodeScreen'
import EditWalletName from './EditWalletName'
import EditWalletSuccess from './EditWalletSuccess'
import { updateWalletName } from '../../../store/actions/trustedContacts'
import { LevelHealthInterface } from '../../../bitcoin/utilities/Interface'
import CloudBackupStatus from '../../../common/data/enums/CloudBackupStatus'
import { updateCloudData } from '../../../store/actions/cloud'
import { NavigationActions, StackActions } from 'react-navigation'
// import { goHomeAction } from '../../../navigation/actions/NavigationActions'
import { translations } from '../../../common/content/LocContext'

interface MenuOption {
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    screenName?: string;
    onOptionPressed?: () => void;
    // isSwitch: boolean;
  }


const AppInfo = ( props ) => {
  const [ securityQue, showSecurityQuestion ] = useState( false )
  const [ securityPin, showSecurityPin ] = useState( false )
  const [ editName, showEditName ] = useState( false )
  const [ success, setSuccess ] = useState( false )
  const cloudBackupStatus = useSelector( ( state ) => state.cloud.cloudBackupStatus || CloudBackupStatus.PENDING, )
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]
  const keeperInfo = useSelector( ( state ) => state.bhr.keeperInfo )

  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const currentLevel = useSelector( ( state ) => state.bhr.currentLevel )
  const walletName = useSelector(
    ( state ) => state.storage.wallet?.walletName,
  )
  const walletId = useSelector(
    ( state ) => state.storage.wallet?.walletId,
  )

  const dispatch = useDispatch()

  const versionHistory = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  const restoreVersions = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) )

  const menuOptions: MenuOption[] = [
    {
      title: 'Wallet Name',
      imageSource: require( '../../../assets/images/icons/icon_wallet_setting.png' ),
      subtitle: strings.Edityourwalletnamehere,
      onOptionPressed: () => showModal()
    },
    {
      title: 'Wallet ID',
      imageSource: require( '../../../assets/images/icons/icon_wallet_setting.png' ),
      subtitle: 'Your Wallet ID is unique to your Hexa App',
      screenName: '',
    },
    {
      title: strings.VersionHistory,
      imageSource: require( '../../../assets/images/icons/icon_versionhistory_tilt.png' ),
      subtitle: strings.currentversion,
      screenName: 'VersionHistory',
    },
  ]
  const listItemKeyExtractor = ( item: MenuOption ) => item.title
  const [ data, setData ] = useState( [] )

  useEffect( () => {
    const versions = getVersions( versionHistory, restoreVersions )
    if( versions.length ){
      setData( versions )
    }
  }, [] )

  const showModal = () => {
    showSecurityQuestion( true )

  }

  const handleOptionSelection = ( menuOption: MenuOption ) => {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      props.navigation.navigate( menuOption.screenName )
    }
  }

  const saveConfirmationHistory = async () => {
    const securityQuestionHistory = JSON.parse(
      await AsyncStorage.getItem( 'securityQuestionHistory' ),
    )
    if ( securityQuestionHistory ) {
      const updatedSecurityQuestionsHistory = {
        ...securityQuestionHistory,
        confirmed: Date.now(),
      }
      // Removed sss file
      // updateShareHistory( updatedSecurityQuestionsHistory )
      await AsyncStorage.setItem(
        'securityQuestionHistory',
        JSON.stringify( updatedSecurityQuestionsHistory ),
      )
    }
  }

  const requestSecurityQuestionModal = useCallback( () => {
    return (
      <SecurityQuestion
        onClose={() => showSecurityQuestion( false )}
        onPressConfirm={async () => {
          Keyboard.dismiss()
          saveConfirmationHistory()
          showSecurityQuestion( false )
          showSecurityPin( true )
        }}
      />
    )
  }, [] )

  const updateCloud = () => {
    // console.log( 'cloudBackupStatus', cloudBackupStatus, currentLevel )
    // if( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    dispatch( updateCloudData() )
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <ModalContainer visible={securityQue} closeBottomSheet={() => {}}>
        {requestSecurityQuestionModal()}
      </ModalContainer>
      <ModalContainer visible={securityPin} closeBottomSheet={() => {}}>
        <EnterPasscodeScreen
          closeBottomSheet={() => showSecurityPin( false )}
          onPressConfirm={async () => {
            Keyboard.dismiss()
            showSecurityPin( false )
            showEditName( true )
          }}
        />
      </ModalContainer>
      <ModalContainer visible={editName} closeBottomSheet={() => {}}>
        <EditWalletName
          closeBottomSheet={() => showEditName( false )}
          onPressConfirm={async ( newName ) => {
            dispatch( updateWalletName( newName ) )
            showEditName( false )
            setSuccess( true )
            setTimeout( () => {
              updateCloud()
            }, 200 )

          }}
        />
      </ModalContainer>
      <ModalContainer visible={success} closeBottomSheet={() => {}}>
        <EditWalletSuccess
          closeBottomSheet={() => setSuccess( false )}
          onPressConfirm={() => {
            setSuccess( false )
            const resetAction = StackActions.reset( {
              index: 0,
              actions: [
                NavigationActions.navigate( {
                  routeName: 'Landing'
                } )
              ],
            } )

            props.navigation.dispatch( resetAction )
          }}
        />
      </ModalContainer>

      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
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
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={strings.AppInfo}
        secondLineTitle={strings.AppInfoSub}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <FlatList
        data={menuOptions}
        keyExtractor={listItemKeyExtractor}
        renderItem={( { item: menuOption }: { item: MenuOption } ) => {
          return <AppBottomSheetTouchableWrapper
            onPress={() => handleOptionSelection( menuOption )}
            style={styles.addModalView}
          >
            <View style={styles.modalElementInfoView}>

              <View style={{
                justifyContent: 'center', marginLeft: 10
              }}>
                <Text style={styles.addModalTitleText}>{menuOption.title}</Text>
                <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
              </View>
              <View style={{
                justifyContent: 'flex-start', marginVertical: 9,
                marginHorizontal: 10, flexDirection: 'row',
              }}>
                <Image
                  source={menuOption.imageSource}
                  style={{
                    width: 36, height: 36, resizeMode: 'contain'
                  }}
                />
                {menuOption.title === 'Wallet Name' &&
                  <Text style={styles.headerTitleText}>{`${walletName}’s Wallet`}</Text>
                }
                { menuOption.title === 'Wallet ID' &&
                  <Text style={styles.headerTitleText}>{`${walletId.length > 22 ? walletId.substr( 0, 22 )+'...' : walletId}`}</Text>
                }
                { menuOption.title === 'Version History' &&
                  <Text style={styles.headerTitleText}>{`Hexa ${data && data.length && data[ 0 ].version}`}</Text>
                }
              </View>
            </View>

          </AppBottomSheetTouchableWrapper>
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 16 ),
    // marginBottom: wp( '1%' ),
    alignSelf: 'center',
    marginHorizontal: wp( 2 ),
    letterSpacing: 0.48
  },
  addModalView: {
    backgroundColor: Colors.backgroundColor1,
    paddingVertical: 4,
    paddingHorizontal: 18,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    borderRadius: wp( '2' ),
    marginBottom: hp( '1' ),
    shadowOpacity: 0.16,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 5,
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
    letterSpacing: 0.01
  },

  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },

  modalElementInfoView: {
    flex: 1,
    marginVertical: 10,
    height: hp( '13%' ),
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
  },
} )

export default AppInfo
