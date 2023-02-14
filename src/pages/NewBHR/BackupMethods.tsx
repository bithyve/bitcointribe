import React from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native'
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
import { LevelData } from '../../bitcoin/utilities/Interface'
import BackupWithKeeperState from '../../common/data/enums/BackupWithKeeperState'
import { setBackupWithKeeperState } from '../../store/actions/BHR'

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
  const dispatch = useDispatch()

  function onKeeperButtonPress () {
    navigation.navigate( 'SeedBackupHistory' )
  }

  function onPressBackupWithKeeper() {
    if( backupWithKeeperStatus!==BackupWithKeeperState.BACKEDUP ) {
      navigation.navigate( 'BackupWithKeeper' )
      dispatch( setBackupWithKeeperState( BackupWithKeeperState.INITIATED ) )
    }
  }

  return (
    <View style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
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
        firstLineTitle={strings.WalletBackup}
        secondLineTitle={strings.WalletBackupInfo1}
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
            width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, borderColor:
          levelData[ 0 ].keeper1.status == 'accessible'
            ? Colors.white : Colors.yellow, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
              width: 15, height: 15
            }
          }}
          >
            <View style={{
              right: -4, height: 12, width: 12, borderRadius: 6, backgroundColor: levelData[ 0 ].keeper1.status == 'accessible' ? Colors.green : Colors.yellow, top: 0, justifyContent: 'center', alignItems: 'center'
            }}>
              <FontAwesome name={levelData[ 0 ].keeper1.status == 'accessible' ? 'check' : 'exclamation' } color={Colors.white} size={7} />
            </View>
            <Image style={{
              height: 20, width: 20, tintColor: Colors.blue
            }} resizeMode={'contain'} source={require( '../../assets/images/icons/seedwords.png' )} />

          </View>
          <Text style={{
            fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: Colors.black, margin: 10, textAlign: 'center'
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
            width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.white, borderColor:
            backupWithKeeperStatus === BackupWithKeeperState.BACKEDUP
              ? Colors.white : Colors.yellow, borderWidth: 1, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Colors.shadowColor, shadowOpacity: 2, shadowOffset: {
              width: 15, height: 15
            }
          }}
          >
            <View style={{
              right: -4, height: 12, width: 12, borderRadius: 6,
              backgroundColor: backupWithKeeperStatus === BackupWithKeeperState.BACKEDUP ? Colors.green : Colors.yellow, top: 0, justifyContent: 'center', alignItems: 'center'
            }}>
              <FontAwesome
                name={backupWithKeeperStatus === BackupWithKeeperState.BACKEDUP ? 'check' : 'exclamation' }
                color={Colors.white} size={10} />
            </View>
            <Image style={{
              height: 20, width: 20, tintColor: Colors.blue
            }} resizeMode={'contain'} source={require( '../../assets/images/icons/seedwords.png' )} />

          </View>
          <Text style={{
            fontSize: RFValue( 11 ), fontFamily: Fonts.FiraSansRegular, color: Colors.black, margin: 10, textAlign: 'center'
          }}>
            Backup width Keeper
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  )
}


