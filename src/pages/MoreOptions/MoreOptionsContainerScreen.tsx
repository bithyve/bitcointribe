import React, { useState, useContext, useEffect } from 'react'
import { View, Text, StyleSheet, Linking, FlatList, Image, TouchableOpacity, StatusBar, ImageSourcePropType, Dimensions, Switch } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import { ScrollView } from 'react-native-gesture-handler'
import AccManagement from '../../assets/images/svgs/icon_accounts.svg'
import Node from '../../assets/images/svgs/node.svg'
import Wallet from '../../assets/images/svgs/icon_settings.svg'
import AppInfo from '../../assets/images/svgs/icon_info.svg'
import DocumentPad from '../../assets/images/svgs/icons_document_copy.svg'
import QueActive from '../../assets/images/svgs/question_inactive.svg'
import Telegram from '../../assets/images/svgs/icon_telegram.svg'
import { LocalizationContext } from '../../common/content/LocContext'
import { LevelData, LevelHealthInterface } from '../../bitcoin/utilities/Interface'
import ModalContainer from '../../components/home/ModalContainer'
import CrossButton from '../../assets/images/svgs/icons_close.svg'
import { toggleClipboardAccess } from '../../store/actions/misc'
import { onPressKeeper } from '../../store/actions/BHR'

export type Props = {
  navigation: any;
  containerStyle: {}
};

interface MenuOption {
  title: string;
  subtitle: string;
  screenName?: string;
  name?: string,
  onOptionPressed?: () => void;
  // isSwitch: boolean;
  imageSource: ImageSourcePropType;
}

const listItemKeyExtractor = ( item: MenuOption ) => item.title

const { height } = Dimensions.get( 'window' )

const MoreOptionsContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  const dispatch = useDispatch()
  const { translations, } = useContext( LocalizationContext )
  // currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
  const levelData: LevelData[] = useSelector( ( state ) => state.bhr.levelData )
  const levelHealth: LevelHealthInterface[] = useSelector( ( state ) => state.bhr.levelHealth )
  const navigationObj: any = useSelector( ( state ) => state.bhr.navigationObj )
  const [ isEnabled, setIsEnabled ] = useState( false )
  const toggleSwitch = () => setIsEnabled( previousState => !previousState )
  const currencyCode = useSelector(
    ( state ) => state.preferences.currencyCode,
  )
  const strings = translations[ 'settings' ]
  const bhrStrings = translations[ 'bhr' ]
  const common = translations[ 'common' ]
  const menuOptions: MenuOption[] = [
    // {
    //   title: 'Use FaceId',
    //   imageSource: require( '../../assets/images/icons/addressbook.png' ),
    //   subtitle: 'Unlock your wallet using FaceId',
    //   // screenName: 'FriendsAndFamily',
    //   isSwitch: true
    // },
    // {
    //   title: 'Dark Mode',
    //   imageSource: require( '../../assets/images/icons/addressbook.png' ),
    //   subtitle: 'Use dark Mode on your wallet',
    //   // screenName: 'FriendsAndFamily',
    //   isSwitch: true
    // },
    {
      imageSource: require( '../../assets/images/icons/icon_info.png' ),
      subtitle: levelData[ 0 ].keeper1.status == 'notSetup'
        ? bhrStrings[ 'WalletBackupInfo1' ]
        : levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed'
          ? 'Wallet backup confirmed'
          :'Confirm backup phrase to secure your wallet',
      title: bhrStrings[ 'WalletBackup' ],
      screenName: 'WalletBackup',
    },
    {
      title: strings.accountManagement,
      imageSource: require( '../../assets/images/icons/icon_account_management.png' ),
      subtitle: strings.accountManagementSub,
      screenName: 'AccountManagement',
    },
    /*
    Commenting this out as per https://github.com/bithyve/hexa/issues/2560
    leaving the option here so that it can be enabled in a future release.
    {
      title: 'Friends & Family',
      imageSource: require( '../../assets/images/icons/addressbook.png' ),
      subtitle: 'View and manage your contacts',
      screenName: 'FriendsAndFamily',
    },
    */
    {
      title: strings.node,
      imageSource: require( '../../assets/images/icons/own-node.png' ),
      subtitle: strings.nodeSub,
      screenName: 'NodeSettings',
    },
    /*
    Commenting this out as per https://github.com/bithyve/hexa/issues/2560
    leaving the option here so that it can be enabled in a future release.
    {
      title: 'Funding Sources',
      imageSource: require( '../../assets/images/icons/existing_saving_method.png' ),
      subtitle: 'Buying methods integrated in your wallet',
      screenName: 'FundingSources',
    },
    */
    // {
    //   title: 'Hexa Community (Telegram)',
    //   imageSource: require( '../../assets/images/icons/telegram.png' ),
    //   subtitle: 'Questions, feedback and more',
    //   onOptionPressed: () => {
    //     Linking.openURL( 'https://t.me/HexaWallet' )
    //       .then( ( _data ) => { } )
    //       .catch( ( _error ) => {
    //         alert( 'Make sure Telegram installed on your device' )
    //       } )
    //   },
    // },
    {
      imageSource: require( '../../assets/images/icons/settings.png' ),
      subtitle: strings.walletSettingsSub,
      title: strings.walletSettings,
      screenName: 'WalletSettings',
    },
    {
      title: strings.AppInfo,
      imageSource: require( '../../assets/images/icons/icon_info.png' ),
      subtitle: strings.AppInfoSub,
      screenName: 'AppInfo',
    },
    // {
    //   title: 'Enable Auto-Read from Clipboard',
    //   imageSource: require( '../../assets/images/svgs/icons_document_copy.svg' ),
    //   subtitle: 'App will prompt to send sats to copied address',
    //   onOptionPressed: () => {
    //     setModalVisible( true )
    //   }
    // },
  ]

  const [ onKeeperButtonClick, setOnKeeperButtonClick ] = useState( false )
  const [ modalVisible, setModalVisible ] = useState( false )
  const defaultKeeperObj: {
    shareType: string
    updatedAt: number;
    status: string
    shareId: string
    reshareVersion: number;
    name?: string
    data?: any;
    channelKey?: string
  } = {
    shareType: '',
    updatedAt: 0,
    status: 'notAccessible',
    shareId: '',
    reshareVersion: 0,
    name: '',
    data: {
    },
    channelKey: ''
  }
  const [ selectedKeeper, setSelectedKeeper ]: [{
    shareType: string;
    updatedAt: number;
    status: string;
    shareId: string;
    reshareVersion: number;
    name?: string;
    data?: any;
    channelKey?: string;
  }, any] = useState( defaultKeeperObj )

  const listItemKeyExtractor = ( item: MenuOption ) => item.title

  useEffect( () => {
    if ( navigationObj.selectedKeeper && onKeeperButtonClick ) {
      setSelectedKeeper( navigationObj.selectedKeeper )
      const navigationParams = {
        selectedTitle: navigationObj.selectedKeeper.name,
        SelectedRecoveryKeyNumber: 1,
        selectedKeeper: navigationObj.selectedKeeper,
        selectedLevelId: levelData[ 0 ].id
      }
      navigation.navigate( 'SeedBackupHistory', navigationParams )
    }
  }, [ navigationObj ] )

  //const [ strings, setstrings ] = useState( content.settings )
  function handleOptionSelection( menuOption: MenuOption ) {
    console.log( 'menuoption', menuOption )
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      console.log( 'menuoption inside', menuOption )
      if( menuOption.screenName == 'WalletBackup' ) {
        console.log( 'skk leveldataaaa', levelData )
        if( levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'seed'||
        levelData[ 0 ].keeper1ButtonText?.toLowerCase() == 'write down seed-words' ){
          if ( ( levelHealth.length == 0 ) || ( levelHealth.length && levelHealth[ 0 ].levelInfo.length && levelHealth[ 0 ].levelInfo[ 0 ].status == 'notSetup' ) ) {
            // if( levelData[ 0 ].status == 'notSetup' )
            navigation.navigate( 'BackupSeedWordsContent' )
          } else {
            setSelectedKeeper( levelData[ 0 ].keeper1 )
            dispatch( onPressKeeper( levelData[ 0 ], 1 ) )
            setOnKeeperButtonClick( true )
          }
        } else navigation.navigate( menuOption.screenName )
      } else navigation.navigate( menuOption.screenName )
    }
  }

  const findImage = ( name ) => {
    switch ( name ) {
        case strings.accountManagement:
          return ( <AccManagement /> )
        case strings.node:
          return ( <Node /> )
        case strings.walletSettings:
          return ( <Wallet /> )
        case strings.AppInfo:
          return ( <AppInfo /> )
        case bhrStrings[ 'WalletBackup' ]:
          return ( <Image
            source={require( '../../assets/images/icons/keeper_sheild.png' )}
            style={{
              width: widthPercentageToDP( 5 ),
              height: widthPercentageToDP( 6 ),
            }}
          /> )
        case 'Enable Auto-Read from Clipboard':
          return ( <DocumentPad /> )
        default:
          return null
    }
  }

  const enabled = useSelector( ( state ) => state.misc.clipboardAccess )

  const dispatcher = useDispatch()

  const changePermission = () => {
    dispatcher( toggleClipboardAccess() )
  }

  const ReadClipboardModal = () => {
    return (
      <View style={styles.wrapper}>
        <View style={{
          flex: 1
        }}>
          <AppBottomSheetTouchableWrapper
            style={{
              backgroundColor: Colors.lightBlue,
              width: 30,
              height: 30,
              borderRadius: 15,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'flex-end',
              margin: widthPercentageToDP( 2 ),
            }}
            onPress={() => setModalVisible( false )}
          >
            <CrossButton />
          </AppBottomSheetTouchableWrapper>
          <View style={{
            marginHorizontal: widthPercentageToDP( 10 )
          }}>
            <Text
              style={{
                color: Colors.blue,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue( 20 ),
              }}
            >
              Auto-Read from Clipboard
            </Text>
            <Text
              style={{
                fontSize: RFValue( 13 ),
                fontFamily: Fonts.FiraSansRegular,
                color: Colors.gray8,
                lineHeight: RFValue( 20 ),
              }}
            >
              {
                'Grant Hexa access to clipboard \nto copy and paste BTC addresses'
              }
            </Text>
            <View style={{
              marginTop: '15%', flexDirection: 'row', justifyContent: 'space-between'
            }}>
              <Text
                style={{
                  alignSelf: 'center',
                  color: Colors.textColorGrey,
                  fontSize: RFValue( 16 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Allow auto-read access
              </Text>
              <Switch
                onValueChange={changePermission}
                trackColor={{
                  false: Colors.gray1, true: Colors.blue
                }}
                thumbColor={isEnabled ? Colors.textColorGrey : Colors.white}
                value={enabled}
              />
            </View>
            <TouchableOpacity
              style={{
                marginTop: '20%',
                backgroundColor: Colors.blue,
                width: widthPercentageToDP( 30 ),
                height: heightPercentageToDP( 7.5 ),
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: widthPercentageToDP( 3 )
              }}
              onPress={() => setModalVisible( false )}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontFamily: Fonts.FiraSansSemiBold,
                }}
              >
                Proceed
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={{
      backgroundColor: Colors.blue
    }}>
      <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
      {/* <Header from={'More'} /> */}
      <ModalContainer visible={modalVisible} closeBottomSheet={() => setModalVisible( false )}>
        {ReadClipboardModal()}
      </ModalContainer>
      <View style={styles.accountCardsSectionContainer}>
        {console.log( 'skk leveldata', levelData )}
        <Text style={{
          color: Colors.blue,
          fontSize: RFValue( 18 ),
          letterSpacing: 0.54,
          // marginLeft: 2,
          fontFamily: Fonts.FiraSansMedium,
          paddingTop: heightPercentageToDP( 4 ),
          paddingLeft: widthPercentageToDP( 4 ),
          paddingBottom: heightPercentageToDP( 1 )
        }}>
          {strings.settingsAndMore}
        </Text>
        {/* <View style={{
            flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', margin: 15
          }}>
            <Image
              source={require( '../../assets/images/icons/recurring_buy.png' )}
              style={{
                width: widthPercentageToDP( 8 ),
                height: widthPercentageToDP( 8 ),
              }}
            />
            <View>
              <Text style={styles.addModalTitleText}>
          Show in Bitcoin
              </Text>
              <Text style={styles.addModalInfoText}>
        Lorem ipsum dolor sit amet, consectetur
              </Text>
            </View>
            <CurrencyKindToggleSwitch
              fiatCurrencyCode={currencyCode}
              onpress={() => {
                dispatch(
                  currencyKindSet(
                    prefersBitcoin ? CurrencyKind.FIAT : CurrencyKind.BITCOIN
                  )
                )
              }}
              isOn={prefersBitcoin}
            />
          </View> */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: heightPercentageToDP( 3 ),
          }}>
          <FlatList
            data={menuOptions}
            keyExtractor={listItemKeyExtractor}
            // ItemSeparatorComponent={() => (
            //   <View style={{
            //     backgroundColor: Colors.white
            //   }}>
            //     <View style={styles.separatorView} />
            //   </View>
            // )}
            renderItem={( { item: menuOption }: { item: MenuOption } ) => {
              return <AppBottomSheetTouchableWrapper
                onPress={() => handleOptionSelection( menuOption )}
                style={styles.addModalView}
              >
                <View style={styles.modalElementInfoView}>
                  <View style={{
                    justifyContent: 'center',
                  }}>
                    {findImage( menuOption.title )}
                  </View>
                  <View style={{
                    justifyContent: 'center', marginLeft: 10
                  }}>
                    <Text style={styles.addModalTitleText}>{menuOption.title}</Text>
                    <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
                  </View>
                  {/* {menuOption.isSwitch &&
                <View style={{
                  alignItems: 'flex-end',
                  marginLeft: 'auto'
                }}>
                  <Switch
                    value={isEnabled}
                    onValueChange={toggleSwitch}
                    thumbColor={isEnabled ? Colors.blue : Colors.white}
                    trackColor={{
                      false: Colors.borderColor, true: Colors.lightBlue
                    }}
                    onTintColor={Colors.blue}
                  />
                </View>
                  } */}
                </View>
                <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
                  style={{
                    width: widthPercentageToDP( '2.5%' ),
                    height: widthPercentageToDP( '2.5%' ),
                    alignSelf: 'center',
                    resizeMode: 'contain'
                  }}
                />

              </AppBottomSheetTouchableWrapper>
            }}
          />
          <TouchableOpacity
            onPress={() => {
              Linking.openURL( 'https://hexawallet.io/faq/' )
                .then( ( _data ) => { } )
                .catch( ( _error ) => {
                } )
            }}
            style={[ styles.otherCards, styles.extraHeight ]}
          >
            <QueActive />
            <View style={{
              marginLeft: 10
            }}>
              <Text style={styles.addModalTitleText}>
                {strings.FAQ}
              </Text>
              <Text style={styles.addModalInfoText}>
                {strings.yourQuestions}
              </Text>
            </View>
            <Image source={require( '../../assets/images/icons/icon_arrow.png' )}
              style={{
                width: widthPercentageToDP( '2.5%' ),
                height: widthPercentageToDP( '2.5%' ),
                alignSelf: 'center',
                marginLeft: 'auto',
                resizeMode: 'contain'
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL( 'https://t.me/HexaWallet' )
                .then( ( _data ) => { } )
                .catch( ( _error ) => {
                  alert( 'Make sure Telegram installed on your device' )
                } )
            }}
            style={styles.otherCards}
          >
            <Telegram />
            <View style={{
              marginLeft: 10,
              flex: 1
            }}>
              <Text style={styles.addModalTitleText}>
                {strings.hexaCommunity}
              </Text>
              <Text style={styles.addModalInfoText}>
                {strings.questionsFeedback}
              </Text>

            </View>
            <Image
              source={require( '../../assets/images/icons/link.png' )}
              style={{
                width: widthPercentageToDP( 4 ),
                height: widthPercentageToDP( 4 ),
                resizeMode: 'contain',
                marginLeft: 'auto'
              }}
            />
          </TouchableOpacity>
          {/* </View> */}

          {/* <View
          style={styles.webLinkBarContainer}
        >
          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'http://hexawallet.io/faq' )}
          >
            <Text style={styles.addModalTitleText}>FAQs</Text>
          </AppBottomSheetTouchableWrapper>

          <View
            style={{
              height: 20, width: 1, backgroundColor: Colors.borderColor
            }}
          />

          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'https://hexawallet.io/terms-of-service/' )}
          >
            <Text style={styles.addModalTitleText}>Terms of Service</Text>
          </AppBottomSheetTouchableWrapper>

          <View
            style={{
              height: 20, width: 1, backgroundColor: Colors.borderColor
            }}
          />

          <AppBottomSheetTouchableWrapper
            onPress={() => openLink( 'http://hexawallet.io/privacy-policy' )}
          >
            <Text style={styles.addModalTitleText}>Privacy Policy</Text>
          </AppBottomSheetTouchableWrapper>
        </View> */}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  accountCardsSectionContainer: {
    height: heightPercentageToDP( '71.46%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor1,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    flexDirection: 'column',
    justifyContent: 'space-around'
  },
  modalContentContainer: {
    backgroundColor: Colors.white,
    padding: 10,
    maxHeight: '80%',
    minHeight: '60%',
  },

  list: {
    marginTop: 20,
    flexGrow: 1,
    paddingBottom: 40,
  },

  containerItem: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
  },

  containerItemSelected: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignItems: 'center',
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
  },

  textLanName: {
    fontSize: 18,
    flex: 1,
    color: 'black',
  },

  flag: {
    fontSize: 35,
    paddingRight: 15,
    color: 'black',
  },

  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },
  otherCards: {
    flex: 1,
    flexDirection: 'row',
    width: '90%',
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    backgroundColor: Colors.white,
    paddingVertical: heightPercentageToDP( 2 ),
    paddingHorizontal: widthPercentageToDP( 4 ),
    marginTop: heightPercentageToDP( '1.2%' ),
    alignItems: 'center',
    shadowOpacity: 0.05,
    // shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 6,
  },
  extraHeight: {
    marginTop: heightPercentageToDP( '3%' ),
  },
  addModalView: {
    backgroundColor: Colors.gray7,
    paddingVertical: 4,
    paddingHorizontal: widthPercentageToDP( 5 ),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    marginBottom: heightPercentageToDP( '1.2' ),
    shadowOpacity: 0.05,
    // shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 10, height: 10
    },
    shadowRadius: 6,
    elevation: 6,
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
  },

  textBeta: {
    color: 'white',
    fontSize: 12,
  },

  containerBeta: {
    marginHorizontal: 10,
    backgroundColor: Colors.blue,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
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
    height: heightPercentageToDP( '5%' ),
    flexDirection: 'row',
    // justifyContent: 'center',
    alignItems: 'center',
  },

  webLinkBarContainer: {
    flexDirection: 'row',
    elevation: 10,
    shadowColor: '#00000017',
    shadowOpacity: 1,
    shadowRadius: 10,
    backgroundColor: Colors.white,
    justifyContent: 'space-around',
    height: 40,
    alignItems: 'center',
    marginHorizontal: 16,
    paddingHorizontal: 10,
    marginBottom: heightPercentageToDP( 2 ),
    borderRadius: 10,
  },
  wrapper: {
    height: height > 720 ? heightPercentageToDP( 35 ) : heightPercentageToDP( 50 ),
    backgroundColor: Colors.backgroundColor,
  },
} )

export default MoreOptionsContainerScreen
