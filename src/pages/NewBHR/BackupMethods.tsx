import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  Image,
  NativeModules,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import { SafeAreaView } from 'react-native-safe-area-context'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import ErrorModalContents from 'src/components/ErrorModalContents'
import LoaderModal from 'src/components/LoaderModal'
import BorderWalletIcon from '../../assets/images/svgs/borderWallet.svg'
import { LevelData, Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { backUpMessage } from '../../common/CommonFunctions/BackUpMessage'
import { translations } from '../../common/content/LocContext'
import BackupWithKeeperState from '../../common/data/enums/BackupWithKeeperState'
import CreateWithKeeperState from '../../common/data/enums/CreateWithKeeperState'
import Fonts from '../../common/Fonts'
import BWHealthCheckModal from '../../components/border-wallet/BWHealthCheckModal'
import HeaderTitle from '../../components/HeaderTitle'
import ModalContainer from '../../components/home/ModalContainer'
import Toast from '../../components/Toast'
import RGBServices from '../../services/RGBServices'
import dbManager from '../../storage/realm/dbManager'
import { onPressKeeper } from '../../store/actions/BHR'
import { updateLastBackedUp } from '../../store/actions/rgb'

const GoogleDrive = NativeModules.GoogleDrive

const styles = StyleSheet.create( {
  body: {
    // flex: 1,
    alignItems: 'center',
    position: 'relative',
    flexDirection: 'row',
    // flexWrap: 'wrap',
    backgroundColor: Colors.white,
    borderRadius: wp( '5%' ) / 2,
    elevation: 10,
    shadowColor: Colors.shadowColor,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15,
      height: 15,
    },
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginVertical: 10,
  },
} )

export default function BackupMethods( { navigation } ) {
  const strings = translations[ 'bhr' ]
  const levelData: LevelData[] = useSelector( state => state.bhr.levelData )
  const navigationObj: LevelData[] = useSelector(
    state => state.bhr.navigationObj,
  )
  const [ btnPress, setBtnPress ] = useState( false )
  const backupWithKeeperStatus: BackupWithKeeperState = useSelector(
    state => state.bhr.backupWithKeeperStatus,
  )
  const createWithKeeperStatus: CreateWithKeeperState = useSelector(
    state => state.bhr.createWithKeeperStatus,
  )
  const borderWalletBackup = useSelector( state => state.bhr.borderWalletBackup )
  const { lastBackedUp } = useSelector(
    state => state.rgb,
  )
  const [ days, setDays ] = useState( 0 )
  const wallet: Wallet = dbManager.getWallet()
  const dispatch = useDispatch()
  const [ visibleModal, setVisibleModal ] = useState( false )
  const [ googleVisibleModal, setGoogleVisibleModal] = useState( false )
  const [ rgbBackupModal, setRgbBackupModal] = useState( false )
  const [ rgbBackupIOSModal, setRgbBackupIOSModal] = useState( false )
  const [ErrorBottomSheet] = useState(React.createRef<BottomSheet>());

  useEffect( () => {
    async function fetchWalletDays() {
      const walletBackupDate = await AsyncStorage.getItem( 'walletBackupDate' )
      if ( walletBackupDate && walletBackupDate != null ) {
        const backedupDate = moment( JSON.parse( walletBackupDate ) )
        // const currentDate = moment( '2023-04-10T11:27:25.000Z' )
        const currentDate = moment( Date() )
        setDays( currentDate.diff( backedupDate, 'days' ) )
      }
    }

    fetchWalletDays()
  }, [] )

  function onKeeperButtonPress() {
    setBtnPress( true )
    if ( levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed' ) {
      dispatch( onPressKeeper( levelData[ 0 ], 1 ) )
    } else {
      navigation.navigate( 'SeedBackup', {
        screen: 'SeedBackupHistory',
      } )
    }
  }
console.log('wallet', wallet)
  useEffect( () => {
    if ( navigationObj.selectedKeeper && btnPress ) {
      const navigationParams = {
        selectedTitle: navigationObj.selectedKeeper.name,
        SelectedRecoveryKeyNumber: 1,
        selectedKeeper: navigationObj.selectedKeeper,
        selectedLevelId: levelData[ 0 ].id,
      }
      navigation.navigate( 'SeedBackupHistory', navigationParams )
    }
  }, [ navigationObj ] )

  function onPressBackupWithKeeper() {
    navigation.navigate( 'BackupWithKeeper' )
  }

  async function onPressBackupRGB() {
    try {
      if(Platform.OS === 'android') {

      // Alert.alert(
      //   'Select a Google Account',
      //   'This account will be used to upload the RGB backup data file. The file is encrypted with your Backup Phrase.',
      //   [
      //     {
      //       text: 'Cancel',
      //       onPress: () => {},
      //       style: 'cancel',
      //     },
      //     {
      //       text: 'Continue',
      //       onPress: async () => {
      //         setGoogleVisibleModal(true)
      //         await GoogleDrive.setup()
      //         const login = await GoogleDrive.login()
      //         if( login.error ) {
      //           Toast( login.error )
      //           setGoogleVisibleModal(false)
      //         } else {
      //           await RGBServices.backup( '', wallet.primaryMnemonic )
      //           dispatch( updateLastBackedUp() )
      //           setGoogleVisibleModal(false)
      //           Toast('Backuped successfully')
      //         }
      //       },
      //       style: 'default',
      //     },
      //   ],
      //   {
      //     cancelable: true,
      //   },
      // )
      setRgbBackupModal(true)
      } else {
        setRgbBackupIOSModal(true)
        // Alert.alert(
        //   '',
        //   'This step will upload the RGB backup data file on your iCloud. The file is encrypted with your Backup Phrase.',
        //   [
        //     {
        //       text: 'Cancel',
        //       onPress: () => {},
        //       style: 'cancel',
        //     },
        //     {
        //       text: 'Continue',
        //       onPress: async () => {
        //         const response = await RGBServices.backup( '', wallet.primaryMnemonic )
        //         if( response.error ) {
        //           Toast( response.error )
        //           setGoogleVisibleModal(false)
        //         } else {
        //           dispatch( updateLastBackedUp() )
        //           Toast('Backuped successfully')
        //         }
        //       },
        //       style: 'default',
        //     },
        //   ],
        //   {
        //     cancelable: true,
        //   },
        // )
      }
    } catch ( error ) {
      // error
    }
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}>
      <StatusBar backgroundColor={Colors.blue} barStyle="dark-content" />

      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={strings.WalletBackup}
        secondLineTitle={backUpMessage(
          days,
          levelData,
          createWithKeeperStatus,
          backupWithKeeperStatus,
          borderWalletBackup,
          wallet && wallet.borderWalletMnemonic !== '',
        )}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View
        style={{
          marginTop: 25,
        }}>
        <View style={styles.body}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
            }}
            //TODO: check
            onPress={onKeeperButtonPress}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.white,
                justifyContent: 'center',
                alignItems: 'center',
                // , elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
                //   width: 15, height: 15
                // }
              }}>
              {levelData[ 0 ].keeper1.status == 'accessible' && (
                <View
                  style={{
                    left: -10,
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: Colors.green,
                    top: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FontAwesome name={'check'} color={Colors.white} size={7} />
                </View>
              )}
              <Image
                style={{
                  height: 20,
                  width: 20,
                  tintColor: Colors.blue,
                }}
                resizeMode={'contain'}
                source={require( '../../assets/images/icons/seedwords.png' )}
              />
            </View>
            <Text
              style={{
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.Regular,
                color: Colors.black,
                margin: 10,
                textAlign: 'center',
              }}>
              {levelData[ 0 ].keeper1ButtonText}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.body}>
          <TouchableOpacity
            style={{
              flexDirection: 'row',
            }}
            onPress={onPressBackupWithKeeper}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: Colors.white,
                justifyContent: 'center',
                alignItems: 'center',
                //   elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
                //   width: 15, height: 15
                // }
              }}>
              {backupWithKeeperStatus === BackupWithKeeperState.BACKEDUP && (
                <View
                  style={{
                    left: -4,
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: Colors.green,
                    top: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <FontAwesome name={'check'} color={Colors.white} size={10} />
                </View>
              )}
              <Image
                style={{
                  height: 20,
                  width: 20,
                  // , tintColor: Colors.blue
                }}
                resizeMode={'contain'}
                source={require( '../../assets/images/icons/keeper.png' )}
              />
            </View>
            <Text
              style={{
                fontSize: RFValue( 11 ),
                fontFamily: Fonts.Regular,
                color: Colors.black,
                margin: 10,
                textAlign: 'center',
              }}>
              Backup with Keeper
            </Text>
          </TouchableOpacity>
        </View>

        {
          Platform.OS === 'android' && (
            <View style={styles.body}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
              }}
              onPress={onPressBackupRGB}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Image
                  style={{
                    height: 20,
                    width: 20,
                  }}
                  resizeMode={'contain'}
                  source={require( '../../assets/images/icons/rgb_logo_round.png' )}
                />
              </View>
              <View>
                <Text
                  style={{
                    fontSize: RFValue( 11 ),
                    fontFamily: Fonts.Regular,
                    color: Colors.black,
                    marginHorizontal: 10,
                    textAlign: 'center',
                  }}>
                RGB data Backup on Cloud
                </Text>
  
                <Text
                  style={{
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.Regular,
                    color: Colors.black,
                    marginHorizontal: 10,
                    marginTop: 2
                  }}>
                  {`Last backup: ${lastBackedUp ? moment( lastBackedUp ).format( 'DD MMM YYYY' ): 'Never'}`}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          )
        }
        {wallet && wallet.borderWalletMnemonic !== '' && (
          <View style={styles.body}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate( 'BackupGridMnemonic' )
                // setVisibleModal( true )
              }}
              style={{
                flexDirection: 'row',
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: Colors.white,
                  justifyContent: 'center',
                  alignItems: 'center',
                  //   elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
                  //   width: 15, height: 15
                  // }
                }}>
                {borderWalletBackup && borderWalletBackup.status && (
                  <View
                    style={{
                      left: -10,
                      height: 12,
                      width: 12,
                      borderRadius: 6,
                      backgroundColor: Colors.green,
                      top: -1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <FontAwesome
                      name={'check'}
                      color={Colors.white}
                      size={10}
                    />
                  </View>
                )}
                <BorderWalletIcon />
              </View>

              <Text
                style={{
                  fontSize: RFValue( 11 ),
                  fontFamily: Fonts.Regular,
                  color: Colors.black,
                  margin: 10,
                  textAlign: 'center',
                }}>
                Backup with Border wallet
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <ModalContainer
        onBackground={()=>{}}
        closeBottomSheet={() => {}}
        visible={googleVisibleModal}
      >
        <LoaderModal
          headerText={'Backup In Progress'}
          messageText={'RGB protocol allows you to issue and manage fungible (coins) and non-fungible (collectibles) assets on the bitcoin network'}
          messageText2={'Syncing assets with RGB nodes'}
          showGif={false}
        />
      </ModalContainer>
      <ModalContainer
        onBackground={() => setVisibleModal( false )}
        visible={visibleModal}
        closeBottomSheet={() => setVisibleModal( false )}>
        <BWHealthCheckModal
          title={'Backup wallet using BW'}
          onPressClose={() => setVisibleModal( false )}
          proceedButtonText={'Backup Now'}
          cancelButtonText={'Skip'}
        />
      </ModalContainer>
      <ModalContainer
        onBackground={() => setRgbBackupModal(false)}
        visible={rgbBackupModal}
        closeBottomSheet={() => {}}
      >
        <ErrorModalContents
          modalRef={ErrorBottomSheet}
          title={'Select a Google Account'}
          info={
            'This account will be used to upload the RGB backup data file. The file is encrypted with your Backup Phrase.'
          }
          note={'Note : '}
          noteNextLine={'Ensure you use the correct Google Account for uploading your RGB backup file.'}
          proceedButtonText={'Continue'}
          isIgnoreButton={true}
          cancelButtonText={'Cancel'}
          onPressIgnore={()=>{setRgbBackupModal(false)}}
          onPressProceed={async() => {
            setRgbBackupModal(false)
            setGoogleVisibleModal(true)
              await GoogleDrive.setup()
              const login = await GoogleDrive.login()
              if( login.error ) {
                Toast( login.error )
                setGoogleVisibleModal(false)
              } else {
                await RGBServices.backup( '', wallet.primaryMnemonic )
                dispatch( updateLastBackedUp() )
                setGoogleVisibleModal(false)
                Toast('Backuped successfully')
              }
          }}
          type={'small'}
        />
      </ModalContainer>
      <ModalContainer
        onBackground={() => setRgbBackupIOSModal(false)}
        visible={rgbBackupIOSModal}
        closeBottomSheet={() => {}}
      >
        <ErrorModalContents
          modalRef={ErrorBottomSheet}
          title={''}
          info={
            'This step will upload the RGB backup data file on your iCloud. The file is encrypted with your Backup Phrase.'
          }
          // note={'Note : '}
          // noteNextLine={'Ensure you use the correct Google Account for uploading your RGB backup file.'}
          proceedButtonText={'Continue'}
          isIgnoreButton={true}
          cancelButtonText={'Cancel'}
          onPressIgnore={()=>{setRgbBackupIOSModal(false)}}
          onPressProceed={async() => {
            setRgbBackupIOSModal(false)
            const response = await RGBServices.backup( '', wallet.primaryMnemonic )
                if( response.error ) {
                  Toast( response.error )
                  setGoogleVisibleModal(false)
                } else {
                  dispatch( updateLastBackedUp() )
                  Toast('Backuped successfully')
                }
          }}
          type={'small'}
        />
      </ModalContainer>
    </SafeAreaView>
  )
}