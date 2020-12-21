import React from 'react'
import { View, Text, StyleSheet, Linking, FlatList, Image, SafeAreaView, ImageSourcePropType } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { heightPercentageToDP } from 'react-native-responsive-screen'
import openLink from '../../utils/OpenLink'

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

const menuOptions: MenuOption[] = [
  {
    title: 'Account Management',
    imageSource: require( '../../assets/images/icons/icon_hexa.png' ),
    subtitle: 'View and manage your accounts',
    screenName: 'AccountManagement',
  },
  {
    title: 'Friends and Family',
    imageSource: require( '../../assets/images/icons/addressbook.png' ),
    subtitle: 'View and manage your contacts',
    screenName: 'FriendsAndFamily',
  },
  {
    title: 'Funding Sources',
    imageSource: require( '../../assets/images/icons/existing_saving_method.png' ),
    subtitle: 'Buying methods integrated in your wallet',
    screenName: 'FundingSources',
  },
  {
    title: 'Hexa Community (Telegram)',
    imageSource: require( '../../assets/images/icons/telegram.png' ),
    subtitle: 'Questions, feedback and more',
    onOptionPressed: () => {
      Linking.openURL( 'https://t.me/HexaWallet' )
        .then( ( _data ) => { } )
        .catch( ( _error ) => {
          alert( 'Make sure Telegram installed on your device' )
        } )
    },
  },
  {
    title: 'Wallet Settings',
    imageSource: require( '../../assets/images/icons/settings.png' ),
    subtitle: 'Wallet setting and preferences',
    screenName: 'WalletSettings',
  },
]

const listItemKeyExtractor = ( item: MenuOption ) => item.title

const MoreOptionsContainerScreen: React.FC<Props> = ( { navigation, }: Props ) => {

  function handleOptionSelection( menuOption: MenuOption ) {
    if ( typeof menuOption.onOptionPressed === 'function' ) {
      menuOption.onOptionPressed()
    } else if ( menuOption.screenName !== undefined ) {
      navigation.navigate( menuOption.screenName )
    }
  }

  return (
    <SafeAreaView style={styles.modalContentContainer}>
      <View style={{
        flex: 1
      }}>
        <FlatList
          data={menuOptions}
          keyExtractor={listItemKeyExtractor}
          ItemSeparatorComponent={() => (
            <View style={{
              backgroundColor: Colors.white
            }}>
              <View style={styles.separatorView} />
            </View>
          )}
          renderItem={( { item: menuOption }: { item: MenuOption } ) => {
            return <AppBottomSheetTouchableWrapper
              onPress={() => handleOptionSelection( menuOption )}
              style={styles.addModalView}
            >
              <View style={styles.modalElementInfoView}>
                <View style={{
                  justifyContent: 'center'
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
                  <Text style={styles.addModalTitleText}>{menuOption.title} </Text>
                  <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
                </View>
              </View>
            </AppBottomSheetTouchableWrapper>
          }}
        />
      </View>

      <View
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
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
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

  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 4,
    paddingHorizontal: 24,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
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
    margin: 10,
    height: heightPercentageToDP( '5%' ),
    flexDirection: 'row',
    justifyContent: 'center',
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
