import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  ImageSourcePropType,
  Image
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'

import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CommonStyles from '../../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import Colors from '../../../common/Colors'
import HeaderTitle from '../../../components/HeaderTitle'
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper'

interface MenuOption {
    title: string;
    subtitle: string;
    imageSource: ImageSourcePropType;
    screenName?: string;
    onOptionPressed?: () => void;
    // isSwitch: boolean;
  }
const menuOptions: MenuOption[] = [
  {
    title: 'Wallet Settings',
    imageSource: require( '../../../assets/images/icons/settings.png' ),
    subtitle: 'Your wallet settings & preferences',
    screenName: 'WalletSettings',
  },
  {
    title: 'App Info',
    imageSource: require( '../../../assets/images/icons/icon_info.png' ),
    subtitle: 'Lorem Ipsum dolor amet cons',
    screenName: 'AppInfo',
  },
]

export default function AppInfo( props ) {
  const [ isOTPType, setIsOTPType ] = useState( false )




  return (
    <SafeAreaView style={{
      flex: 1, backgroundColor: Colors.backgroundColor
    }}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      {/* <View style={NavStyles.modalContainer}> */}
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack()
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
        firstLineTitle={'App Info'}
        secondLineTitle={'Lorem Ipsum dolor amet cons'}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
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
            onPress={() => {}}
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

          </AppBottomSheetTouchableWrapper>
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  accountCardsSectionContainer: {
    height: hp( '70.83%' ),
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

  addModalView: {
    backgroundColor: Colors.white,
    paddingVertical: 4,
    paddingHorizontal: 18,
    flexDirection: 'row',
    display: 'flex',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
    borderRadius: wp( '2' ),

    marginBottom: hp( '1' )
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
    height: hp( '5%' ),
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
    marginBottom: hp( 2 ),
    borderRadius: 10,
  },
} )

