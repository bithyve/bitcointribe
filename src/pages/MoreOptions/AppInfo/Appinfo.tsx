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
  Image,
  FlatList
} from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { connect } from 'react-redux'
import idx from 'idx'

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
import { getVersions } from '../../../common/utilities'

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
    title: 'Wallet Name',
    imageSource: require( '../../../assets/images/icons/icon_wallet_setting.png' ),
    subtitle: 'Lorem Ipsum dolor amet cons',
    screenName: 'WalletSettings',
  },
  {
    title: 'Version History',
    imageSource: require( '../../../assets/images/icons/icon_versionhistory_tilt.png' ),
    subtitle: 'App version progression',
    screenName: 'AppInfo',
  },
]

const AppInfo = ( props ) => {
  const walletName = useSelector(
    ( state ) => state.storage.wallet.walletName,
  )
  const versionHistory = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  const restoreVersions = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) )


  const listItemKeyExtractor = ( item: MenuOption ) => item.title
  const [ data, setData ] = useState( [] )

  useEffect( () => {
    const versions = getVersions( versionHistory, restoreVersions )
    if( versions.length ){
      setData( versions )

    // setIsDataSet(!isDataSet);
    // SelectOption( versions.length )
    }
  }, [] )

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
                justifyContent: 'center', marginLeft: 10
              }}>
                <Text style={styles.addModalTitleText}>{menuOption.title}</Text>
                <Text style={styles.addModalInfoText}>{menuOption.subtitle}</Text>
              </View>
              <View style={{
                justifyContent: 'flex-start', marginVertical: 20,
                marginHorizontal: 10, flexDirection: 'row',
              }}>
                <Image
                  source={menuOption.imageSource}
                  style={{
                    width: 36, height: 36, resizeMode: 'contain'
                  }}
                />
                {menuOption.title === 'Wallet Name' ?
                  <Text style={styles.headerTitleText}>{`${walletName}’s Wallet`}</Text>
                  :
                  <Text style={styles.headerTitleText}>{`Hexa ${data[ 0 ].version}`}</Text>
                }
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
  headerTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 15 ),
    // marginBottom: wp( '1%' ),
    alignSelf: 'center',
    marginHorizontal: wp( 2 )
  },
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
    height: hp( '13%' ),
    // flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
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

const mapStateToProps = ( state ) => {
  return {
    walletName:
      idx( state, ( _ ) => _.storage.wallet.walletName ) || '',
  }
}

export default connect( mapStateToProps, null )( AppInfo )
