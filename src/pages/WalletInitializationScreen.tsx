import React, { useContext, useState } from 'react'
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import { useDispatch } from 'react-redux'
import BorderWallet from '../assets/images/svgs/borderWallet.svg'
import Colors from '../common/Colors'
import { LocalizationContext } from '../common/content/LocContext'
import { hp } from '../common/data/responsiveness/responsive'
import Fonts from '../common/Fonts'
import GenerateEntropyGridModal from '../components/border-wallet/GenerateEntropyGridModal'
import BottomInfoBox from '../components/BottomInfoBox'
import ModalContainer from '../components/home/ModalContainer'
import openLink from '../utils/OpenLink'

const WalletInitializationScreen = props => {
  const { translations } = useContext( LocalizationContext )
  const strings = translations[ 'login' ]
  const dispatch = useDispatch()
  const [ generateEntropyGrid, setGenerateEntropyGrid ] = useState( false )
  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.LIGHT_BACKGROUND
    }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <ScrollView>
        <View style={{
          marginBottom: wp( '5%' ),
        }}>
          <View style={styles.titleView}>
            <Text style={styles.headerTitleText}>{`${strings.new} Wallet`}</Text>
            <Text style={styles.headerInfoText}>
              {strings.appcreates}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => props.navigation.navigate( 'NewWalletName' )}
            style={styles.NewWalletTouchableView}
          >
            <Image
              style={{
                ...styles.iconImage, width: wp( 7 ),
                height: wp( 7 ), marginBottom: wp( 2 )
              }}
              source={require( '../assets/images/icons/icon_newwallet.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>
                {
                  'Start with a new Tribe Wallet'
                }
              </Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.gray12}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => props.navigation.navigate( 'CreateKeeperScreen' )}
            style={[ styles.NewWalletTouchableView, {
              marginTop: hp( 20 )
            } ]}
          >
            <Image
              style={{
                ...styles.iconImage, width: wp( 7 ),
                height: wp( 7 ), marginBottom: wp( 2 )
              }}
              source={require( '../assets/images/icons/icon_createwk.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>
                {
                  'Create with Bitcoin Keeper'
                }
              </Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.gray12}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              props.navigation.navigate( 'CreateWithBorderWallet' )
              // setGenerateEntropyGrid( true )
            }}
            style={[ styles.NewWalletTouchableView, {
              marginTop: hp( 20 ), alignItems: 'center'
            } ]}
          >
            <BorderWallet/>
            <View style={styles.textView}>
              <Text style={styles.touchableText}>
                {
                  'Create with Border Wallet'
                }
              </Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.gray12}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{
          flex: 1,
        }}>
          <View style={{
            ...styles.titleView, marginTop: wp( '2%' )
          }}>
            <Text style={styles.headerTitleText}>{`${strings.Existing} Wallet`}</Text>
            <Text style={styles.headerInfoText}>
              {/* {strings.previously} */}
              {'Use Backup phrase if you have 12/24-word Backup or else try using Border wallet'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={async () => {
              props.navigation.navigate( 'RestoreSeedWordsContent' )
            }}
            style={{
              ...styles.NewWalletTouchableView, marginBottom: wp( '7%' )
            }}
          >
            <Image
              style={styles.iconImage}
              source={require( '../assets/images/icons/seedwords.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>Using Backup Phrase</Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.gray12}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
          {/* <TouchableOpacity
            onPress={async () => {
              dispatch( setDownloadedBackupData( [] ) )
              dispatch( setCloudDataRecovery( null ) )
              dispatch( setIsFileReading( false ) )
              props.navigation.navigate( 'RestoreWithICloud' )
            }}
            style={{
              ...styles.NewWalletTouchableView, marginBottom: wp( '7%' )
            }}
          >
            <Image
              style={styles.iconImage}
              source={require( '../assets/images/icons/icon_secrets.png' )}
            />
            <View style={styles.textView}>
              <Text style={styles.touchableText}>Using Recovery Keys</Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.borderColor}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity> */}
          <TouchableOpacity
            onPress={() => props.navigation.navigate( 'RegenerateEntropyGrid', {
              navigation: props.navigation
            } )}
            style={[ styles.NewWalletTouchableView, {
              alignItems: 'center'
            } ]}
          >
            <BorderWallet/>
            <View style={styles.textView}>
              <Text style={styles.touchableText}>
                {
                  'Using Border Wallet'
                }
              </Text>
            </View>
            <View style={styles.arrowIconView}>
              <MaterialIcons
                name="arrow-forward-ios"
                color={Colors.borderColor}
                size={15}
                style={{
                  alignSelf: 'center'
                }}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}/>
      </ScrollView>
      <BottomInfoBox
        backgroundColor={Colors.white}
        title={strings.TermsService}
        infoText={
          `${strings.proceeding} `
        }
        italicTextTC={strings.TermsService}
        onPress={() => openLink( 'https://bitcointribe.app/terms-of-service/' )}
      />
      <ModalContainer onBackground={() =>setGenerateEntropyGrid( false )}
        visible={generateEntropyGrid}
        closeBottomSheet={() => { }}>
        <GenerateEntropyGridModal closeModal={() => setGenerateEntropyGrid( false )}/>
      </ModalContainer>
    </SafeAreaView>
  )
}

export default WalletInitializationScreen

let styles = StyleSheet.create( {
  headerTitleText: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 22 ),
    marginLeft: 15,
    marginRight: 15,
    fontFamily: Fonts.Medium,
  },
  headerInfoText: {
    color: Colors.THEAM_INFO_TEXT_COLOR,
    fontSize: RFValue( 12 ),
    marginLeft: 15,
    marginRight: 10,
    fontWeight: 'normal',
    marginTop: 5,
    fontFamily: Fonts.Medium,
    lineHeight: RFValue( 16 ),
  },
  NewWalletTouchableView: {
    flexDirection: 'row',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    height: wp( '16%' ),
    backgroundColor: Colors.bgColor,
    borderRadius: 10,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
  },
  iconImage: {
    resizeMode: 'contain',
    width: wp( 9 ),
    height: wp( 9 ),
    alignSelf: 'center',
  },
  textView: {
    marginLeft: 10,
    flex: 1,
    justifyContent: 'center',
  },
  touchableText: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  arrowIconView: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleView: {
    padding: wp( '5%' ),
    paddingLeft: wp( '3%' ),
    marginTop: wp( '5%' ),
    marginBottom: wp( '5%' )
  },
  footer:{
    height:50,
    width:'100%'
  }
} )
