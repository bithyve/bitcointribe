import React, { useEffect, useState } from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Config from '../../bitcoin/HexaConfig'
import CommonStyles from '../../common/Styles/Styles'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import HeaderTitle from '../../components/HeaderTitle'
import { translations } from '../../common/content/LocContext'
import { useDispatch, useSelector } from 'react-redux'
import { LevelData, Wallet } from '../../bitcoin/utilities/Interface'
import BackupWithKeeperState from '../../common/data/enums/BackupWithKeeperState'
import CreateWithKeeperState from '../../common/data/enums/CreateWithKeeperState'
import { backUpMessage } from '../../common/CommonFunctions/BackUpMessage'
import BorderWalletIcon from '../../assets/images/svgs/borderWallet.svg'
import moment from 'moment'
import AsyncStorage from '@react-native-async-storage/async-storage'
import dbManager from '../../storage/realm/dbManager'

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
      width: 15, height: 15
    },
    paddingVertical: 15,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    marginVertical: 10
  }
} )

export default function BackupMethods( { navigation } ) {
  const strings  = translations[ 'bhr' ]
  const levelData: LevelData[] = useSelector( ( state ) => state.bhr.levelData )
  const backupWithKeeperStatus: BackupWithKeeperState =useSelector( ( state ) => state.bhr.backupWithKeeperStatus )
  const createWithKeeperStatus: CreateWithKeeperState  = useSelector( ( state ) => state.bhr.createWithKeeperStatus )
  const borderWalletBackup  = useSelector( ( state ) => state.bhr.borderWalletBackup )

  const [ days, setDays ] = useState( 0 )
  const wallet: Wallet =  dbManager.getWallet()
  const dispatch = useDispatch()

  useEffect( () => {
    async function fetchWalletDays() {
      const walletBackupDate = await AsyncStorage.getItem( 'walletBackupDate' )
      if( walletBackupDate && walletBackupDate != null ){
        const backedupDate = moment( JSON.parse( walletBackupDate ) )
        // const currentDate = moment( '2023-04-10T11:27:25.000Z' )
        const currentDate = moment( Date() )
        setDays( currentDate.diff( backedupDate, 'days' ) )
      }
    }

    fetchWalletDays()
  }, [] )

  function onKeeperButtonPress () {
    navigation.navigate( 'SeedBackupHistory' )
  }

  function onPressBackupWithKeeper() {
    // if( backupWithKeeperStatus!==BackupWithKeeperState.BACKEDUP ) {
    navigation.navigate( 'BackupWithKeeper' )
    // dispatch( setBackupWithKeeperState( BackupWithKeeperState.INITIATED ) )
    // }
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={ Colors.blue } barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        marginTop: hp( 5 )
      } ]}>
        <TouchableOpacity
          style={[ CommonStyles.headerLeftIconContainer, {
            marginTop: 20
          } ]}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>

      </View>
      <HeaderTitle
        firstLineTitle={strings.WalletBackup}
        secondLineTitle={ backUpMessage( days, levelData, createWithKeeperStatus, backupWithKeeperStatus )}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />

      <View style={styles.body}>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
          }}
          onPress={() => navigation.navigate( 'SeedBackupHistory' )}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center'
            // , elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
            //   width: 15, height: 15
            // }
          }}
          >
            {levelData[ 0 ].keeper1.status == 'accessible' &&
            <View style={{
              left: -10, height: 12, width: 12, borderRadius: 6, backgroundColor: Colors.green, top: 0, justifyContent: 'center', alignItems: 'center'
            }}>
              <FontAwesome name={'check'} color={Colors.white} size={7} />
            </View>
            }
            <Image style={{
              height: 20, width: 20, tintColor: Colors.blue
            }} resizeMode={'contain'} source={require( '../../assets/images/icons/seedwords.png' )} />

          </View>
          <Text style={{
            fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, color: Colors.black, margin: 10, textAlign: 'center'
          }}>
            { levelData[ 0 ].keeper1ButtonText}
          </Text>
        </TouchableOpacity>

      </View>

      <View style={styles.body}>

        <TouchableOpacity
          style={{
            flexDirection: 'row',
          }}
          onPress={onPressBackupWithKeeper}
        >
          <View style={{
            width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
            //   elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
            //   width: 15, height: 15
            // }
          }}
          >
            {backupWithKeeperStatus === BackupWithKeeperState.BACKEDUP &&
            <View style={{
              left: -4, height: 12, width: 12, borderRadius: 6,
              backgroundColor: Colors.green, top: 0, justifyContent: 'center', alignItems: 'center'
            }}>
              <FontAwesome
                name={'check'}
                color={Colors.white} size={10} />
            </View>
            }
            <Image style={{
              height: 20, width: 20
              // , tintColor: Colors.blue
            }} resizeMode={'contain'} source={require( '../../assets/images/icons/keeper.png' )} />

          </View>
          <Text style={{
            fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, color: Colors.black, margin: 10, textAlign: 'center'
          }}>
            Backup with Keeper
          </Text>
        </TouchableOpacity>

      </View>
      {
        wallet.borderWalletMnemonic !=='' && (
          <View style={styles.body}>
            <TouchableOpacity
              onPress={()=> {navigation.navigate( 'BackupGridMnemonic' )}}
              style={{
                flexDirection: 'row',
              }}
            >

              <View style={{
                width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center',
              //   elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
              //   width: 15, height: 15
              // }
              }}
              >
                {borderWalletBackup && borderWalletBackup.status &&
                <View style={{
                  left: -10, height: 12, width: 12, borderRadius: 6,
                  backgroundColor: Colors.green, top: -1, justifyContent: 'center', alignItems: 'center'
                }}>
                  <FontAwesome
                    name={'check' }
                    color={Colors.white} size={10} />
                </View>
                }
                <BorderWalletIcon/>
              </View>

              <Text style={{
                fontSize: RFValue( 11 ), fontFamily: Fonts.Regular, color: Colors.black, margin: 10, textAlign: 'center'
              }}>
              Backup with Border wallet
              </Text>
            </TouchableOpacity>

          </View>
        )
      }
    </View>
  )
}

