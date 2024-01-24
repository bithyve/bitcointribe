import StaggeredList from '@mindinventory/react-native-stagger-view'
import React, { useEffect, useState } from 'react'
import {
  FlatList,
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useDispatch, useSelector } from 'react-redux'
import RGBIntroModal from 'src/components/rgb/RGBIntroModal'
import { RGBConfig, RGB_ASSET_TYPE, Wallet } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { translations } from '../../common/content/LocContext'
import Fonts from '../../common/Fonts'
import BottomSheetAddWalletInfo from '../../components/bottom-sheets/add-wallet/BottomSheetAddWalletInfo'
import ModalContainer from '../../components/home/ModalContainer'
import RGBServices from '../../services/RGBServices'
import dbManager from '../../storage/realm/dbManager'
import { setRgbConfig, syncRgb } from '../../store/actions/rgb'
import BottomSheetCoinsHeader from './BottomSheetCoinsHeader'

const keyExtractor = ( item: any ) => item.toString()

const assetColors = [ '#6992B0', '#D88383', '#A29DD3', '#5CB5A1', '#A29DD3' ]

export enum BottomSheetState {
  Closed,
  Open,
}
export default function AssetsScreen( props ) {
  const { syncing, balances, rgb20Assets, rgb25Assets } = useSelector(
    state => state.rgb,
  )
  const rgbConfig: RGBConfig = useSelector( state => state.rgb.config )
  const wallet : Wallet = dbManager.getWallet()
  const dispatch = useDispatch()
  const strings = translations[ 'f&f' ]
  const [ selectedTab, setSelectedTab ] = useState( 0 )
  const [ coinsData, setCoinsData ] = useState( [ {
  } ] )
  const [ bottomSheetState, setBottomSheetState ] = useState(
    BottomSheetState.Closed,
  )

  useEffect(() => {
    initiateRgb()
  }, [])

  useEffect( () => {
    const assets = []
    assets.push( {
      name: 't-sats',
      ticker: 'BTC',
      amount: balances.total,
      color: '#5CB5A1',
      type: 'bitcoin',
    } )
    if ( rgb20Assets ) {
      rgb20Assets?.forEach( ( asset, index ) => {
        assets.push( {
          ...asset,
          color: assetColors[ index % assetColors.length ],
          type: 'rgb',
          amount: asset.spendableBalance,
        } )
      } )
    }
    setCoinsData( assets )
  }, [ syncing, rgb20Assets ] )

  const backupRgb = async()=> {
    const isReqired = await RGBServices.isBackupRequired()
    if(isReqired) RGBServices.backup('', wallet.primaryMnemonic)
  }

  const initiateRgb = async () => {
    if( !rgbConfig || rgbConfig.mnemonic ==='' ) {
      const wallet : Wallet = dbManager.getWallet()
      const config = await  RGBServices.restoreKeys( wallet.primaryMnemonic )
      dispatch( setRgbConfig( config ) )
      const isRgbInit =  RGBServices.initiate( rgbConfig.mnemonic, rgbConfig.xpub  )
      if( isRgbInit ) {
        dispatch( syncRgb() )
        backupRgb()
      }
    } else {
      const isRgbInit =  await RGBServices.initiate( rgbConfig.mnemonic, rgbConfig.xpub  )
      if( isRgbInit ) {
        dispatch( syncRgb() )
        backupRgb()
      }
    }
  }

  const renderTabs = () => {
    return (
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={styles.collectibleContainer}
          onPress={() => {
            setSelectedTab( 1 )
          }}
          activeOpacity={1}>
          <View
            style={[
              styles.collectibleInnerContainer,
              {
                backgroundColor:
                  selectedTab == 1 ? Colors.CLOSE_ICON_COLOR : null,
              },
            ]}>
            <Text
              style={[
                styles.collectibleText,
                {
                  color:
                    selectedTab == 1
                      ? Colors.white
                      : Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
                },
              ]}>
              COINS
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.collectibleContainer}
          onPress={() => {
            setSelectedTab( 0 )
          }}
          activeOpacity={1}>
          <View
            style={[
              styles.collectibleInnerContainer,
              {
                backgroundColor:
                  selectedTab == 0 ? Colors.CLOSE_ICON_COLOR : null,
              },
            ]}>
            <Text
              style={[
                styles.collectibleText,
                {
                  color:
                    selectedTab == 0
                      ? Colors.white
                      : Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
                },
              ]}>
              COLLECTIBLES
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  const renderCoinItems = ( { item, index } ) => {
    return (
      <TouchableOpacity
        style={styles.coinItemContainer}
        activeOpacity={1}
        onPress={() => {
          if ( item.type === 'bitcoin' ) {
            props.navigation.navigate( 'RGBWalletDetail' )
          } else {
            props.navigation.navigate( 'RGBTxDetail', {
              asset: item,
            } )
          }
        }}>
        <View
          style={[
            styles.labelContainer,
            {
              backgroundColor: item.color,
            },
          ]}>
          <Text style={styles.labelText}>{item.ticker.substring( 0, 3 )}</Text>
        </View>
        <Text numberOfLines={1} style={styles.nameText}>
          {item.name}
        </Text>
        <Text style={styles.labelOuterText}>{item.ticker}</Text>
        <Text style={styles.amountText}>
          {item.balance ? item.balance.settled : item.amount}
        </Text>
      </TouchableOpacity>
    )
  }

  const renderCollectibleItems = ( item, index ) => {
    return (
      <TouchableOpacity
        style={
          index == 7
            ? styles.collectibleRandomItemContainer
            : styles.collectibleItemContainer
        }
        activeOpacity={1}
        onPress={() =>
          props.navigation.navigate( 'RGB121TxDetail', {
            asset: item,
          } )
        }>
        <View
          style={
            index == 7 ? styles.randomImageContainer : styles.imageContainer
          }>
          <Image
            style={styles.image}
            source={{
              uri: Platform.select( {
                android: `file://${item.dataPaths[ 0 ].filePath}`,
                ios: item.dataPaths[ 0 ].filePath,
              } ),
            }}
          />
        </View>
        <Text style={styles.collectibleOuterText}>{item.name}</Text>
        <Text style={styles.collectibleAmountText}>
          {item.balance ? item.balance.spendable : item.spendableBalance}
        </Text>
      </TouchableOpacity>
    )
  }

  const closeBottomSheet = () => {
    setBottomSheetState( BottomSheetState.Closed )
  }

  const renderBottomSheetContent = () => {
    return (
      <>
        <BottomSheetCoinsHeader
          title={'Add ' + ( selectedTab == 0 ? 'Collectibles' : 'Coins' )}
          onPress={closeBottomSheet}
        />
        {/* <Text numberOfLines={2} style={styles.descText}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}</Text> */}

        <BottomSheetAddWalletInfo
          onRGBWalletClick={() => {
            closeBottomSheet()
            props.navigation.navigate( 'IssueScreen', {
              issueType: selectedTab == 0 ? 'collectible' : 'coin',
            } )
          }}
          onLighteningWalletClick={() => {
            closeBottomSheet()

            props.navigation.navigate( 'RGBReceive', {
              assetType: RGB_ASSET_TYPE.RGB20,
            } )
          }}
          title1="Issue"
          title2="Recieve"
        />
      </>
    )
  }

  return (
    <View
      style={{
        backgroundColor: Colors.blue,
      }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={syncing}
            onRefresh={() => {
              dispatch( syncRgb() )
            }}
          />
        }
        style={styles.container}>
        <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
        <View style={styles.headerContainer}>
          <Text style={styles.pageTitle}>{'My Assets'}</Text>
          <TouchableOpacity
            onPress={() => {
              setBottomSheetState( BottomSheetState.Open )
            }}>
            <LinearGradient
              colors={[ Colors.blue, Colors.blue ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              locations={[ 0.2, 1 ]}
              style={{
                ...styles.selectedContactsView,
                backgroundColor: Colors.lightBlue,
              }}>
              <Text
                style={[
                  styles.addNewText,
                  {
                    fontSize: RFValue( 18 ),
                  },
                ]}>
                +{' '}
              </Text>
              <Text style={styles.addNewText}>{strings[ 'AddNew' ]}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
        {renderTabs()}
        {selectedTab == 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled={true}
            alwaysBounceVertical={false}>
            {/* <FlatList
                        data={coinsData}
                        contentContainerStyle={styles.flatListStyle}
                        keyExtractor={keyExtractor}
                        renderItem={renderCollectibleItems}
                        numColumns={Math.ceil(coinsData.length/3)}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                    /> */}
            <StaggeredList
              numColumns={3}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              data={rgb25Assets}
              animationType={'NONE'}
              style={{
                marginVertical: 10,
              }}
              ListEmptyComponent={() => (
                <Text
                  style={{
                    fontFamily: Fonts.Medium,
                    fontSize: 14,
                    textAlign: 'center',
                    marginVertical: 100,
                    alignSelf: 'center',
                    marginLeft: 20
                  }}>
                  Click on Add New to issue new collectible asset.
                </Text>
              )}
              contentContainerStyle={styles.flatListStyle}
              renderItem={( { item, i } ) => renderCollectibleItems( item, i )}
            />
          </ScrollView>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            directionalLockEnabled={true}
            alwaysBounceVertical={false}>
            <FlatList
              data={coinsData}
              extraData={[ coinsData, syncing ]}
              contentContainerStyle={styles.flatListStyle}
              keyExtractor={keyExtractor}
              renderItem={renderCoinItems}
              numColumns={3}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              scrollEnabled={false}
            />
          </ScrollView>
        )}
      </ScrollView>
      <ModalContainer
        onBackground={() => {
          closeBottomSheet()
        }}
        visible={bottomSheetState == BottomSheetState.Open}
        closeBottomSheet={() => {}}>
        {renderBottomSheetContent()}
      </ModalContainer>
      <ModalContainer
        onBackground={()=>{}}
        closeBottomSheet={() => {}}
        visible={syncing}
      >
        <RGBIntroModal
          title={'Syncing Asset'}
          info={'Embark on journey with Bitcoin Tribe wallet, Your Comprehensive solution for managing RGB assets effortlessly.'}
          otherText={'To regenerate your Grid at a later date'}
          proceedButtonText={'Continue'}
          isIgnoreButton={false}
          isBottomImage={true}
          bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
        />
      </ModalContainer>
    </View>
  )
}

const styles = StyleSheet.create( {
  container: {
    height: hp( '71.46%' ),
    // marginTop: 30,
    backgroundColor: '#F2F2F2',
    opacity: 1,
    borderTopLeftRadius: 25,
    shadowColor: 'black',
    shadowOpacity: 0.4,
    shadowOffset: {
      width: 2,
      height: -1,
    },
    // flexDirection: 'column',
    // justifyContent: 'space-around'
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: hp( 3.5 ),
    marginHorizontal: wp( 6 ),
  },
  pageTitle: {
    color: Colors.THEAM_TEXT_COLOR,
    fontSize: RFValue( 16 ),
    letterSpacing: 0.54,
    // fontFamily: Fonts.Regular,
    fontFamily: Fonts.SemiBold,
    alignItems: 'center',
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.blue,
    borderRadius: wp( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 ),
  },
  addNewText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  tabContainer: {
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    marginHorizontal: wp( 6 ),
    marginTop: hp( 2 ),
  },
  collectibleContainer: {
    flex: 1,
  },
  collectibleInnerContainer: {
    flex: 1,
    borderRadius: 10,
    marginHorizontal: 5,
    marginVertical: 3,
    justifyContent: 'center',
  },
  collectibleText: {
    fontFamily: Fonts.Medium,
    fontSize: 13,
    textAlign: 'center',
  },
  coinItemContainer: {
    width: 110,
    borderRadius: 10,
    backgroundColor: Colors.white,
    marginTop: 15,
    marginEnd: 15,
    padding: 10,
  },
  collectibleItemContainer: {
    height: 120,
    width: 120,
    borderRadius: 10,
    padding: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectibleRandomItemContainer: {
    width: 280,
    height: 280,
    borderRadius: 10,
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 20,
    height: 36,
    width: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    borderRadius: 10,
    height: 90,
    width: 90,
    justifyContent: 'center',
    alignItems: 'center',
  },
  randomImageContainer: {
    borderRadius: 10,
    height: 240,
    width: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    borderRadius: 10,
    aspectRatio: 1,
  },

  labelText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  flatListStyle: {
    marginStart: 20,
    alignSelf: 'flex-start',
  },
  nameText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 5,
  },
  labelOuterText: {
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    marginTop: 5,
  },
  amountText: {
    fontSize: 11,
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    marginTop: 2,
  },
  collectibleOuterText: {
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    marginTop: 5,
    textAlign: 'center',
  },
  collectibleAmountText: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
  },
  //   descText: {
  //     color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
  //     fontSize: RFValue( 11 ),
  //     fontFamily: Fonts.Regular,
  //     // marginTop: 10,
  //     // paddingVertical:10,
  //     backgroundColor: Colors.bgColor
  //   },
} )
