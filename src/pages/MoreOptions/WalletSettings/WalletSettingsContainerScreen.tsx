import React, { useEffect, useState } from 'react'
import { Image, ImageSourcePropType, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import { hp } from '../../../common/data/responsiveness/responsive'
import Fonts from '../../../common/Fonts'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'
import AccountShellRescanningPromptBottomSheet from '../../../components/bottom-sheets/account-shell-rescanning-bottom-sheet/AccountShellRescanningPromptBottomSheet'
import WalletRescanningBottomSheet from '../../../components/bottom-sheets/wallet-rescanning-bottom-sheet/WalletRescanningBottomSheet'
import HeaderTitle from '../../../components/HeaderTitle'
import ModalContainer from '../../../components/home/ModalContainer'
import { RescannedTransactionData } from '../../../store/reducers/wallet-rescanning'

export type Props = {
  navigation: any;
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  onOptionPressed?: () => void;
}

const versionString = `Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`


const WalletSettingsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const strings  = translations[ 'settings' ]
  const [ showRescanningPrompt, setShowRescanningPrompt ] = useState( false )
  const [ showRescanningModal, setShowRescanningModal ] = useState( false )
  const menuOptions: MenuOption[] = [
    {
      title: strings.ManagePasscode,
      subtitle: strings.Changeyourpasscode,
      imageSource: require( '../../../assets/images/icons/managepin.png' ),
      screenName: 'ManagePasscode',
    },
    {
      title: strings.ChangeCurrency,
      subtitle: strings.Chooseyourcurrency,
      imageSource: require( '../../../assets/images/icons/country.png' ),
      screenName: 'ChangeCurrency',
    },
    // {
    //   title: 'Full Rescan',
    //   subtitle: 'Completely sync the account',
    //   imageSource: require( '../../../assets/images/icons/icon_checking_blue.png' ),
    //   onOptionPressed: handleRescanListItemSelection,
    // },
    // {
    //   title: 'Version History',
    //   subtitle: 'Version History',
    //   imageSource: require( '../../../assets/images/icons/icon_versionhistory.png' ),
    //   screenName: 'VersionHistory',
    // },
    // {
    //   title: 'Bitcoin Tribe Release',
    //   subtitle: versionString,
    //   imageSource: require( '../../../assets/images/icons/settings.png' ),
    // },
  ]


  function handleOptionSelection( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      navigation.navigate( menuOption.screenName )
    }
  }

  function handleRescanListItemSelection() {
    setShowRescanningPrompt( true )
  }

  function handleTransactionDataSelectionFromRescan( transactionData: RescannedTransactionData ) {
    navigation.navigate( 'TransactionDetails', {
      transactionData: transactionData.details,
      accountShellID: transactionData.accountShell.id,
    } )
  }

  useEffect( () => {
    return () => {
      setShowRescanningModal( false )
      setShowRescanningPrompt( false )
    }
  }, [ navigation ] )

  const showRescanningPromptBottomSheet = () => {
    return (
      <AccountShellRescanningPromptBottomSheet
        onContinue={() => {
          setShowRescanningPrompt( false )
          setTimeout( () => {
            setShowRescanningModal( true )
          }, 800 )
        }}
        onDismiss={() => setShowRescanningPrompt( false )}
      />
    )
  }


  const showRescanningBottomSheet = () => {
    return (
      <WalletRescanningBottomSheet
        onDismiss={() => setShowRescanningModal( false )}
        onTransactionDataSelected={handleTransactionDataSelectionFromRescan}
      />
    )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={'Wallet Settings'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={styles.modalContainer}>
        <ScrollView style={{
          flex: 1
        }}>
          <ModalContainer onBackground={()=>setShowRescanningModal( false )} visible={showRescanningPrompt} closeBottomSheet={() => { }}>
            {showRescanningPromptBottomSheet()}
          </ModalContainer>
          <ModalContainer onBackground={()=>setShowRescanningModal( false )} visible={showRescanningModal} closeBottomSheet={() => { }}>
            {showRescanningBottomSheet()}
          </ModalContainer>
          {menuOptions.map( ( menuOption, index ) => {
            return (
              <AppBottomSheetTouchableWrapper
                onPress={() => handleOptionSelection( menuOption )}
                style={styles.selectedContactsView}
                key={index}
              >
                <Image
                  source={menuOption.imageSource}
                  style={{
                    width: widthPercentageToDP( '7%' ),
                    height: widthPercentageToDP( '7%' ),
                    resizeMode: 'contain',
                    marginLeft: widthPercentageToDP( '3%' ),
                    marginRight: widthPercentageToDP( '3%' ),
                  }}
                />
                <View
                  style={{
                    justifyContent: 'center', marginRight: 10, flex: 1
                  }}
                >
                  <Text style={styles.titleText}>{menuOption.title}</Text>
                  <Text style={styles.infoText}>{menuOption.subtitle}</Text>
                </View>

                <View style={{
                  marginLeft: 'auto'
                }}>
                  {menuOption.screenName !== undefined && (
                    <Ionicons
                      name="ios-arrow-forward"
                      color={Colors.textColorGrey}
                      size={15}
                      style={{
                        marginLeft: widthPercentageToDP( '3%' ),
                        marginRight: widthPercentageToDP( '3%' ),
                        alignSelf: 'center',
                      }}
                    />
                  )}
                </View>
              </AppBottomSheetTouchableWrapper>
            )
          } )}
        </ScrollView>
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  modalContainer: {
    height: '100%',
    // backgroundColor: Colors.white,
    marginTop: hp( 15 ),
    alignSelf: 'center',
    width: '100%',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
    color: Colors.THEAM_TEXT_COLOR,
  },
  infoText: {
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 5,
  },
} )

export default WalletSettingsContainerScreen
