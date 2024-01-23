import AsyncStorage from '@react-native-async-storage/async-storage'
import moment from 'moment'
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Image,
  NativeModules,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { useDispatch, useSelector } from 'react-redux'
import BorderWalletIcon from '../../assets/images/svgs/borderWallet.svg'
import { LevelData, Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { backUpMessage } from '../../common/CommonFunctions/BackUpMessage'
import Fonts from '../../common/Fonts'
import { translations } from '../../common/content/LocContext'
import BackupWithKeeperState from '../../common/data/enums/BackupWithKeeperState'
import CreateWithKeeperState from '../../common/data/enums/CreateWithKeeperState'
import HeaderTitle from '../../components/HeaderTitle'
import Toast from '../../components/Toast'
import BWHealthCheckModal from '../../components/border-wallet/BWHealthCheckModal'
import ModalContainer from '../../components/home/ModalContainer'
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
      Alert.alert(
        'Select a Google Account',
        'This account will be used to upload the RGB backup data file. The file is encrypted with your Backup Phrase.',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: async () => {
              await GoogleDrive.setup()
              const login = await GoogleDrive.login()
              if( !login.error ) {
                Toast( login.error )
              } else {
                await RGBServices.backup( '', wallet.primaryMnemonic )
                dispatch( updateLastBackedUp() )
              }
            },
            style: 'default',
          },
        ],
        {
          cancelable: true,
        },
      )
    } catch ( error ) {
      console.log( error )
    }
  }

  return (
    <View
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
        {wallet.borderWalletMnemonic !== '' && (
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
    </View>
  )
}