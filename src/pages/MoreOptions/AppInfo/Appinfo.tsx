import AsyncStorage from '@react-native-async-storage/async-storage'
import { CommonActions } from '@react-navigation/native'
import idx from 'idx'
import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  ImageSourcePropType,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import Options from '../../../assets/images/svgs/options.svg'
import { LevelHealthInterface, Wallet } from '../../../bitcoin/utilities/Interface'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import CloudBackupStatus from '../../../common/data/enums/CloudBackupStatus'
import Fonts from '../../../common/Fonts'
import { getVersions } from '../../../common/utilities'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import HeaderTitle from '../../../components/HeaderTitle'
import ModalContainer from '../../../components/home/ModalContainer'
import { updateCloudData } from '../../../store/actions/cloud'
import { updateWalletName } from '../../../store/actions/trustedContacts'
import EditWalletName from './EditWalletName'
import EditWalletSuccess from './EditWalletSuccess'
import EnterPasscodeScreen from './EnterPasscodeScreen'
import SecurityQuestion from './SecurityQuestion'

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

  const walletNameLength = walletName?.split( '' ).length
  const walletNameNew = walletName.split( '' )[ walletNameLength - 1 ].toLowerCase() === 's' ? `${walletName}’ Wallet` : `${walletName}’s Wallet`

  const walletId = useSelector(
    ( state ) => state.storage.wallet?.walletId,
  )
  const { security }: Wallet = useSelector(
    ( state ) => state.storage.wallet,
  )

  const dispatch = useDispatch()

  const versionHistory = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  const restoreVersions = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) )

  const menuOptions: MenuOption[] = [
    {
      title: 'Wallet Name',
      imageSource: require( '../../../assets/images/icons/icon_wallet_id.png' ),
      subtitle: strings.Edityourwalletnamehere,
      onOptionPressed: () => showModal()
    },
    {
      title: 'Wallet ID',
      imageSource: require( '../../../assets/images/icons/icon_wallet_setting.png' ),
      subtitle: 'Your Wallet ID is unique to your Bitcoin Tribe App',
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
    if( security && security.question && security.answer ) showSecurityQuestion( true )
    else showSecurityPin( true )
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
        isNeedAuthentication={true}
      />
    )
  }, [] )

  const updateCloud = () => {
    // if( cloudBackupStatus === CloudBackupStatus.IN_PROGRESS ) return
    dispatch( updateCloudData() )
  }

  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <ModalContainer onBackground={()=>showSecurityQuestion( false )} visible={securityQue} closeBottomSheet={() => {}}>
        {requestSecurityQuestionModal()}
      </ModalContainer>
      <ModalContainer onBackground={()=>showSecurityPin( false )} visible={securityPin} closeBottomSheet={() => {}}>
        <EnterPasscodeScreen
          closeBottomSheet={() => showSecurityPin( false )}
          onPressConfirm={async () => {
            Keyboard.dismiss()
            showSecurityPin( false )
            showEditName( true )
          }}
        />
      </ModalContainer>
      <ModalContainer onBackground={()=>showEditName( false )} visible={editName} closeBottomSheet={() => {}}>
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
      <ModalContainer onBackground={()=>setSuccess( false )} visible={success} closeBottomSheet={() => {}}>
        <EditWalletSuccess
          closeBottomSheet={() => setSuccess( false )}
          onPressConfirm={() => {
            setSuccess( false )
            const resetAction = CommonActions.reset( {
              index: 0,
              routes: [
                {
                  name: 'Home'
                }
              ],
            } )
            props.navigation.dispatch( resetAction )
          }}
        />
      </ModalContainer>
      <HeaderTitle
        navigation={props.navigation}
        backButton={true}
        firstLineTitle={strings.AppInfo}
        secondLineTitle={strings.AppInfoSub}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={{
        height:20
      }}/>
      <FlatList
        style={{
          marginTop: hp( 5 )
        }}
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
                <View style={{
                  flexDirection:'row', alignItems:'center', justifyContent:'space-between'
                }}>
                  <Text style={styles.addModalTitleText}>{menuOption.title}</Text>
                  <TouchableOpacity style={{
                    padding:5, zIndex:1
                  }}><Options/></TouchableOpacity>
                </View>
                <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
              </View>
              <View style={{
                justifyContent: 'flex-start', marginVertical: 9,
                marginHorizontal: 10, flexDirection: 'row',
              }}>
                <Image
                  source={menuOption.imageSource}
                  style={{
                    width: menuOption.title === 'Wallet Name' ? 22 : 30, height:  menuOption.title === 'Wallet Name' ? 28 : 30, resizeMode: 'contain'
                  }}
                />
                {menuOption.title === 'Wallet Name' &&
                  <Text style={styles.headerTitleText}>{walletNameNew}</Text>
                }
                { menuOption.title === 'Wallet ID' &&
                  <Text style={styles.headerTitleText}>{`${walletId.length > 22 ? walletId.substr( 0, 22 )+'...' : walletId}`}</Text>
                }
                { menuOption.title === 'Version History' &&
                  <Text style={styles.headerTitleText}>{`Bitcoin Tribe ${DeviceInfo.getVersion()}`}</Text>
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
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 16 ),
    // marginBottom: wp( '1%' ),
    alignSelf: 'center',
    marginHorizontal: wp( 5 ),
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
    borderRadius: wp( '3' ),
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
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    letterSpacing: 0.01
  },

  addModalInfoText: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginTop: 5,
    fontFamily: Fonts.Regular
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
