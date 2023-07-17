import React, { useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
  Image,
  FlatList
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
import idx from 'idx'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import LinearGradient from 'react-native-linear-gradient'
import { translations } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import BottomSheetWalletHeader from '../Accounts/BottomSheetWalletHeader'
import BottomSheetAddWalletInfo from '../../components/bottom-sheets/add-wallet/BottomSheetAddWalletInfo'
import BottomSheet from 'reanimated-bottom-sheet'
import BottomSheetCoinsHeader from './BottomSheetCoinsHeader'
import StaggeredList from '@mindinventory/react-native-stagger-view';

const keyExtractor = ( item: any ) => item.toString()

  export enum BottomSheetState {
    Closed,
    Open,
  }
export default function AssetsScreen( props ) {
    const strings = translations[ 'f&f' ]
    const [ selectedTab, setSelectedTab ] = useState( 0 )
    const [ coinsData, setCoinsData ] = useState([
        {name:'My Bitcoin',label:'BTC',amount:'20000', color: '#A29DD3'},
    {name:'Dollor',label:'USD',amount:'50000', color: '#5CB5A1'},
    {name:'Larum ipsam',label:'CUS',amount:'2000', color: '#6992B0'},
    {name:'Larum ipsam',label:'INR',amount:'20000', color: '#6992B0'},
    {name:'Larum ipsam',label:'CNY',amount:'1000', color: '#D88383'},
    {name:'Larum ipsam',label:'USD',amount:'2000', color: '#A29DD3'},
    {name:'My Bitcoin',label:'BTC',amount:'20000', color: '#A29DD3'},
    {name:'Dollor',label:'USD',amount:'50000', color: '#5CB5A1'},
    {name:'Larum ipsam',label:'CUS',amount:'2000', color: '#6992B0'},
    {name:'Larum ipsam',label:'INR',amount:'20000', color: '#6992B0'},
    {name:'Larum ipsam',label:'CNY',amount:'1000', color: '#D88383'}
    ])
    const [bottomSheetState,setBottomSheetState] = useState(BottomSheetState.Closed)

    const renderTabs = () => {
        return(
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.collectibleContainer} onPress={()=>{
              setSelectedTab( 0 )
            }
            } activeOpacity={1}>
              <View style={[ styles.collectibleInnerContainer, {
                backgroundColor: selectedTab == 0? Colors.CLOSE_ICON_COLOR:null,
              } ]}>
                <Text style={[ styles.collectibleText, {
                  color: selectedTab == 0 ?  Colors.white : Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
                } ]}>COLLECTIBLES</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={styles.collectibleContainer} onPress={()=>{
              setSelectedTab( 1 )
            }} activeOpacity={1}>
              <View style={[ styles.collectibleInnerContainer, {
                backgroundColor: selectedTab == 1 ? Colors.CLOSE_ICON_COLOR:null,
              } ]}>
                <Text style={[ styles.collectibleText, {
                  color: selectedTab == 1 ?  Colors.white : Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
                } ]}>COINS</Text>
              </View>
            </TouchableOpacity>
          </View>
        )
      }

    const renderCoinItems = ({item, index})=> {
        return(    
        <TouchableOpacity style={styles.coinItemContainer} activeOpacity={1} 
        onPress= {() =>
            props.navigation.navigate( 'CollectibleDetailScreen')
        }
        >
            <View style={[styles.labelContainer, {backgroundColor:item.color}]}>
                <Text style={styles.labelText}>{item.label}</Text>
            </View>            
            <Text style={styles.nameText}>{item.name}</Text>
            <Text style={styles.labelOuterText}>{item.label}</Text>
            <Text style={styles.amountText}>{item.amount}</Text>
        </TouchableOpacity>
    )
    
    }
    const renderCollectibleItems = (item, index)=> {
        return(    
            <TouchableOpacity style={index == 7 ? 
                styles.collectibleRandomItemContainer : 
                styles.collectibleItemContainer} activeOpacity={1} 
            onPress= {() =>
                props.navigation.navigate( 'CollectibleDetailScreen')
            }
            >
                <View style={index == 7 ? styles.randomImageContainer :styles.imageContainer}>
                    <Image style={styles.image} 
                    source={require('../../assets/images/BottomSheetMessages/success-stars.png')}
                    />
                </View>
                <Text style={styles.collectibleOuterText}>{item.label}</Text>
                <Text style={styles.collectibleAmountText}>{item.amount}</Text>
            </TouchableOpacity>
        )
        }

    const closeBottomSheet = () => {
        setBottomSheetState(BottomSheetState.Closed)
      }

    const renderBottomSheetContent = () => {
        return (
            <>
              <BottomSheetCoinsHeader title={"Add " + (selectedTab == 0 ? 'Collectibles' : 'Coins')}  onPress={closeBottomSheet} />
              {/* <Text numberOfLines={2} style={styles.descText}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'}</Text> */}

             <BottomSheetAddWalletInfo
                onRGBWalletClick={() => {
                    closeBottomSheet()
                    props.navigation.navigate( 'IssueScreen', { issueType:selectedTab == 0 ? 'collectible' : 'coin'})

                }}
                onLighteningWalletClick={() => {
                    // props.navigation.navigate( 'RGBReceive', {
                    //     // accountShell,
                    //     // assetType
                    //   } )
                }}
                title1='Issue'
                title2='Recieve'
            />
            </>
        )
    }

    return (
        <View style={{backgroundColor: Colors.darkBlue}}>
            <View style={styles.container}>
                <StatusBar backgroundColor={Colors.blue} barStyle="light-content" />
                <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>
                {"My Assets"}
                </Text>
                <TouchableOpacity onPress={() => { 
                    setBottomSheetState(BottomSheetState.Open)
                }}>
                <LinearGradient colors={[ Colors.blue ]}
                    start={{
                    x: 0, y: 0
                    }} end={{
                    x: 1, y: 0
                    }}
                    locations={[ 0.2, 1 ]}
                    style={{
                    ...styles.selectedContactsView, backgroundColor: Colors.lightBlue,
                    }}
                >
                    <Text style={[ styles.addNewText, {
                    fontSize: RFValue( 18 )
                    } ]}>+ </Text>
                    <Text style={styles.addNewText}>{strings[ 'AddNew' ]}</Text>
                </LinearGradient>
                </TouchableOpacity>
                </View>
                {renderTabs()}
                {selectedTab == 0?
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    directionalLockEnabled={true}
                    alwaysBounceVertical={false}
                >
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
                        numColumns={Math.ceil(coinsData.length/3)}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        data={coinsData}
                        animationType={'FADE_IN_FAST'}
                        contentContainerStyle={styles.flatListStyle}
                        renderItem={({item, i})=>renderCollectibleItems(item, i)}
                    />
                </ScrollView>
                : 
                <ScrollView 
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    directionalLockEnabled={true}
                    alwaysBounceVertical={false}
                >
                    <FlatList
                        data={coinsData}
                        contentContainerStyle={styles.flatListStyle}
                        keyExtractor={keyExtractor}
                        renderItem={renderCoinItems}
                        numColumns={Math.ceil(coinsData.length/3)}
                        showsVerticalScrollIndicator={false}
                        showsHorizontalScrollIndicator={false}
                        scrollEnabled={false}
                    />
                </ScrollView>
                }
          </View>
        <ModalContainer
          onBackground={()=>{
            closeBottomSheet()
          } }
          visible={bottomSheetState == BottomSheetState.Open}
          closeBottomSheet={() => {}}
        >
          {renderBottomSheetContent()}
        </ModalContainer>
      </View>
    )
  }

const styles = StyleSheet.create( {
container:{
    height: hp( '71.46%' ),
    // marginTop: 30,
    backgroundColor: Colors.backgroundColor1,
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
headerContainer:{
    flexDirection: 'row', justifyContent: 'space-between', 
    alignItems: 'center', marginTop: hp( 3.5 ),
    marginHorizontal: wp ( 6 ),
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
    borderRadius: wp ( 2 ),
    height: hp( 4 ),
    paddingHorizontal: wp( 2 )
  },
  addNewText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  tabContainer:{
    height: 45, borderRadius: 10, backgroundColor:Colors.white,
    flexDirection:'row', 
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 2, height: 2
    },
    marginHorizontal: wp ( 6 ),
    marginTop: hp(2)
  },
  collectibleContainer:{
    flex:1,
  },
  collectibleInnerContainer:{
    flex:1,  borderRadius: 10, marginHorizontal: 5, marginVertical: 3,
    justifyContent:'center'
  },
  collectibleText:{
    fontFamily: Fonts.Medium,
    fontSize: 13,
    textAlign:'center',
  },
  coinItemContainer: {
    width: 110,
    borderRadius: 10,
    backgroundColor:Colors.white,
    marginTop: 20,
    marginEnd: 20,
    padding: 10
  },
  collectibleItemContainer: {
    width: 110,
    height: 110,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginTop: 20,
    marginEnd: 20,
    padding: 10
  },
  collectibleRandomItemContainer: {
    width: 240,
    height: 240,
    borderRadius: 10,
    backgroundColor: 'transparent',
    marginTop: 20,
    marginEnd: 20,
    padding: 10
  },
  labelContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 20,
    height: 36,
    width: 36,
    justifyContent:'center',
    alignItems:'center'
  },
  imageContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    height: 90,
    width: 90,
    justifyContent:'center',
    alignItems:'center'
  },
  randomImageContainer: {
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    height: 240,
    width: 240,
    justifyContent:'center',
    alignItems:'center'
  },
  image: {
    height: '100%',
    width: '100%',
    borderRadius:4
  },
 
  labelText:{
    fontSize: RFValue(9),
    fontFamily: Fonts.SemiBold,
    color: Colors.white,
  },
  flatListStyle:{
    marginStart: 20,
    alignSelf:'flex-start'
  },
  nameText:{
    fontSize: RFValue(9),
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_TEXT_COLOR,
    marginTop: 12
  },
  labelOuterText:{
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    marginTop: 5
  },
  amountText:{
    fontSize: 11,
    fontFamily: Fonts.Regular,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
  },
  collectibleOuterText:{
    fontSize: 9,
    fontFamily: Fonts.SemiBold,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    marginTop: 5,
    textAlign: 'center',

  },
  collectibleAmountText:{
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
})