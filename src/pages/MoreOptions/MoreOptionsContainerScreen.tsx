import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, Linking, FlatList, Image, TouchableOpacity, StatusBar, ImageSourcePropType } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import openLink from '../../utils/OpenLink'
import Header from '../../navigation/stacks/Header'
import CurrencyKindToggleSwitch from '../../components/CurrencyKindToggleSwitch'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import useCurrencyKind from '../../utils/hooks/state-selectors/UseCurrencyKind'
import { useSelector, useDispatch } from 'react-redux'
import { currencyKindSet } from '../../store/actions/preferences'
import { ScrollView } from 'react-native-gesture-handler'

export type Props = {
  navigation: any;
  containerStyle: {}
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  screenName?: string;
  onOptionPressed?: () => void;
  // isSwitch: boolean;
}

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
    title: 'Account Management',
    imageSource: require( '../../assets/images/icons/icon_account_management.png' ),
    subtitle: 'View and manage your accounts',
    screenName: 'AccountManagement',
  },
  /*
  Commenting this out as per https://github.com/bithyve/hexa/issues/2560
  leaving the option here so that it can be enabled in a future release.

  {
    title: 'Friends and Family',
    imageSource: require( '../../assets/images/icons/addressbook.png' ),
    subtitle: 'View and manage your contacts',
    screenName: 'FriendsAndFamily',
  },
  */
  {
    title: 'Node Settings',
    imageSource: require( '../../assets/images/icons/own-node.png' ),
    subtitle: 'Connect Hexa wallet to your own node',
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
    title: 'Wallet Settings',
    imageSource: require( '../../assets/images/icons/settings.png' ),
    subtitle: 'Your wallet settings & preferences',
    screenName: 'WalletSettings',
  },
  {
    title: 'App Info',
    imageSource: require( '../../assets/images/icons/icon_info.png' ),
    subtitle: 'Lorem Ipsum dolor amet cons',
    screenName: 'AppInfo',
  },
]

const listItemKeyExtractor = ( item: MenuOption ) => item.title

const MoreOptionsContainerScreen: React.FC<Props> = ( { navigation }: Props ) => {
  // currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
  const [ isEnabled, setIsEnabled ] = useState( false )
  const toggleSwitch = () => setIsEnabled( previousState => !previousState )
  const currencyCode = useSelector(
    ( state ) => state.preferences.currencyCode,
  )

  function handleOptionSelection( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      navigation.navigate( menuOption.screenName )
    }
  }
  const dispatch = useDispatch()

  const currencyKind: CurrencyKind = useCurrencyKind()

  const prefersBitcoin = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  return (
    <View style={{
      backgroundColor: Colors.blue
    }}>
      <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
      {/* <Header from={'More'} /> */}
      <View style={styles.accountCardsSectionContainer}>

        <Text style={{
          color: Colors.blue,
          fontSize: RFValue( 16 ),
          // marginLeft: 2,
          fontFamily: Fonts.FiraSansMedium,
          paddingTop: heightPercentageToDP( 4 ),
          paddingLeft: widthPercentageToDP( 4 ),
          paddingBottom: heightPercentageToDP( 1 )
        }}>
            Settings & More
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
                    <Image
                      source={menuOption.imageSource}
                      style={{
                        width: 25, height: 25, resizeMode: 'contain'
                      }}
                    />
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
                  alert( 'Make sure Telegram installed on your device' )
                } )
            }}
            style={[ styles.otherCards, styles.extraHeight ]}
          >
            <Image
              source={require( '../../assets/images/icons/question_active.png' )}
              style={{
                width: widthPercentageToDP( 8 ),
                height: widthPercentageToDP( 8 ),
              }}
            />
            <View style={{
              marginLeft: 10
            }}>
              <Text style={styles.addModalTitleText}>
              FAQ
              </Text>
              <Text style={styles.addModalInfoText}>
              Your questions answered
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
            <Image
              source={require( '../../assets/images/icons/icon_telegram.png' )}
              style={{
                width: widthPercentageToDP( 7 ),
                height: widthPercentageToDP( 7 ),
                resizeMode: 'contain'
              }}
            />
            <View style={{
              marginLeft: 10
            }}>
              <Text style={styles.addModalTitleText}>
              Hexa Community Telegram Group
              </Text>
              <Text style={styles.addModalInfoText}>
              Questions, feedback and more
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
    height: heightPercentageToDP( '70.83%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor,
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
    flex: 1,
    justifyContent: 'space-between',
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
    width: '95%',
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    backgroundColor: Colors.white,
    paddingVertical: heightPercentageToDP( 2 ),
    paddingHorizontal: widthPercentageToDP( 4 ),
    marginTop: heightPercentageToDP( '1%' ),
    alignItems: 'center'
  },
  extraHeight: {
    marginTop: heightPercentageToDP( '3%' ),
  },
  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 4,
    paddingHorizontal: widthPercentageToDP( 5 ),
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    width: '95%',
    alignSelf: 'center',
    borderRadius: widthPercentageToDP( '2' ),
    marginBottom: heightPercentageToDP( '1' )
  },

  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular
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
} )

export default MoreOptionsContainerScreen
