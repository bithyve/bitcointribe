import React from "react";
import {
  View,
  ImageBackground,
  Dimensions,
  StatusBar,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  RefreshControl,
  Platform,
  SafeAreaView,
  FlatList,
  ScrollView,
  Animated,
  LayoutAnimation
} from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body,
  Text,
  List,
  ListItem
} from "native-base";
import { RkCard } from "react-native-ui-kitten";
import DropdownAlert from "react-native-dropdownalert";
import { Icon } from "@up-shared/components";
import IconFontAwe from "react-native-vector-icons/FontAwesome";

//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import SCLAlertAccountTypes from "HexaWallet/src/app/custcompontes/alert/SCLAlertAccountTypes";
import ViewRecentTransaction from "HexaWallet/src/app/custcompontes/view/ViewRecentTransaction";
import TabBarWalletScreen from "HexaWallet/src/app/custcompontes/view/tabbar/TabBarWalletScreen/TabBarWalletScreen";
import ViewWalletScreenCards from "HexaWallet/src/app/custcompontes/view/ViewWalletScreenCards/ViewWalletScreenCards";




//TODO: Custome object
import {
  colors,
  images,
  localDB,
  errorMessage
} from "HexaWallet/src/app/constants/Constants";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
var utils = require( "HexaWallet/src/app/constants/Utils" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";
import Singleton from "HexaWallet/src/app/constants/Singleton";


let isNetwork: boolean;
const { width: viewportWidth, height: viewportHeight } = Dimensions.get(
  "window"
);

function wp( percentage: number ) {
  const value = ( percentage * viewportWidth ) / 100;
  return Math.round( value );
}
const slideHeight = viewportHeight * 0.36;
const slideWidth = wp( 75 );
const itemHorizontalMargin = wp( 2 );
const sliderWidth = viewportWidth;
const itemWidth = slideWidth + itemHorizontalMargin * 2;
const SLIDER_1_FIRST_ITEM = 0;

//TODO: Bitcoin Files
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";


//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";
export default class WalletScreen extends React.Component {
  constructor ( props: any ) {
    super( props );
    this.state = {
      isNetwork: true,
      arr_wallets: [],
      arr_accounts: [],
      tranDetails: [],
      accountTypeList: [],
      arr_WalletScreenCard: [],
      accountTypeVisible: false,
      popupData: [],
      recentTransactionData: [],

      slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
      isOpen: false,
      refreshing: false,
      isLoading: false,
      isLoading1: false,
      isNoTranstion: false,
      cardIndexNo: 0,
      scrollY: new Animated.Value( 0 )
    };
    isNetwork = utils.getNetwork();
  }
  //TODO: Page Life Cycle
  componentWillMount() {
    this.willFocusSubscription = this.props.navigation.addListener(
      "willFocus",
      () => {
        isNetwork = utils.getNetwork();
        this.connnection_FetchData();
      }
    );
    //TODO: Animation View
    this.startHeaderHeight = 200;
    this.endHeaderHeight = 100;
    this.animatedHeaderHeight = this.state.scrollY.interpolate( {
      inputRange: [ 0, 100 ],
      outputRange: [ this.startHeaderHeight, this.endHeaderHeight ],
      extrapolate: "clamp"
    } );

    this.animatedMarginTopScrolling = this.animatedHeaderHeight.interpolate( {
      inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
      outputRange: [ 10, -35 ],
      extrapolate: "clamp"
    } );

    this.animatedAppTextSize = this.animatedHeaderHeight.interpolate( {
      inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
      outputRange: [ 18, 24 ],
      extrapolate: "clamp"
    } );

    this.animatedTextOpacity = this.animatedHeaderHeight.interpolate( {
      inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
      outputRange: [ 0, 1 ],
      extrapolate: "clamp"
    } );

    this.animatedShieldViewFlex = this.animatedHeaderHeight.interpolate( {
      inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
      outputRange: [ 2, 2 ],
      extrapolate: "clamp"
    } );

    this.animatedShieldIconSize = this.animatedHeaderHeight.interpolate( {
      inputRange: [ this.endHeaderHeight, this.startHeaderHeight ],
      outputRange: [ 50, 70 ],
      extrapolate: "clamp"
    } );
  }

  componentWillUnmount() {
    this.willFocusSubscription.remove();
  }


  //TODO: func connnection_FetchData
  async connnection_FetchData() {
    const dateTime = Date.now();
    const lastUpdateDate = Math.floor( dateTime / 1000 );
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    const resAccount = await dbOpration.readTablesData(
      localDB.tableName.tblAccount
    );
    console.log( { resAccount } );

    this.setState( {
      arr_wallets: resultWallet.temp,
      arr_accounts: resAccount.temp
    } );
  }




  render() {
    return (
      <Container>
        <Content scrollEnabled={ false } contentContainerStyle={ styles.container }>
          <CustomeStatusBar backgroundColor={ colors.appColor } flagShowStatusBar={ true } barStyle="light-content" />
          <SafeAreaView style={ styles.container }>
            {/* title */ }
            <Animated.View
              style={ {
                height: this.animatedHeaderHeight,
                backgroundColor: colors.appColor,
                flexDirection: "row",
                zIndex: 0
              } }
            >
              <Animated.View
                style={ {
                  marginLeft: 20,
                  flex: 4
                } }
              >
                <Animated.Text
                  style={ {
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: this.animatedAppTextSize,
                    marginTop: 20,
                    marginBottom: 30
                  } }
                >
                  My Wallets
                </Animated.Text>
                <Animated.Text
                  style={ {
                    color: "#fff",
                    fontSize: 16,
                    opacity: this.animatedTextOpacity
                  } }
                >
                  Looks like your app needs a quick check to maintain good
                  health
                </Animated.Text>
              </Animated.View>

              <Animated.View
                style={ {
                  flex: this.animatedShieldViewFlex,
                  marginRight: 10,
                  alignItems: "flex-end",
                  justifyContent: "center"
                } }
              >
                <TouchableHighlight onPress={ () =>
                  this.props.navigation.push( "WalletSetUpScreen", {
                    walletDetails: this.state.arr_wallets,
                  } )
                }>
                  <Animated.Image
                    source={ images.walletScreen.shield }
                    style={ [
                      {
                        height: this.animatedShieldIconSize,
                        width: this.animatedShieldIconSize
                      }
                    ] }
                  />
                </TouchableHighlight>
              </Animated.View>
            </Animated.View>
            {/*  cards */ }
            <Animated.View
              style={ {
                flex: 6,
                marginTop: this.animatedMarginTopScrolling,
                zIndex: 1
              } }
            >
              <ScrollView
                scrollEventThrottle={ 40 }
                contentContainerStyle={ { flex: 0 } }
                horizontal={ false }
                pagingEnabled={ false }
                onScroll={ Animated.event( [
                  {
                    nativeEvent: { contentOffset: { y: this.state.scrollY } }
                  }
                ] ) }
              >
                <FlatList
                  data={ this.state.arr_accounts }
                  showsVerticalScrollIndicator={ false }
                  renderItem={ ( { item } ) => (
                    <RkCard
                      rkType="shadowed"
                      style={ {
                        flex: 1,
                        margin: 10,
                        borderRadius: 10
                      } }
                    >
                      <View
                        rkCardHeader
                        style={ {
                          flex: 1,
                          borderBottomColor: "#F5F5F5",
                          borderBottomWidth: 1
                        } }
                      >
                        <Icon
                          name="icon_dailywallet"
                          color="#37A0DA"
                          size={ 40 }
                        />
                        <Text
                          style={ {
                            flex: 2,
                            fontSize: 16,
                            fontWeight: "bold",
                            marginLeft: 10
                          } }
                        >
                          { item.accountName }
                        </Text>

                        <Icon name="icon_more" color="gray" size={ 15 } />
                      </View>
                      <View
                        rkCardContent
                        style={ {
                          flex: 1,
                          flexDirection: "row"
                        } }
                      >
                        <View
                          style={ {
                            flex: 1,
                            justifyContent: "center"
                          } }
                        >
                          <Icon name="icon_bitcoin" color="gray" size={ 40 } />
                        </View>
                        <View style={ { flex: 4 } }>
                          <Text note>Anant's Savings</Text>
                          <Text style={ { fontWeight: "bold", fontSize: 18 } }>
                            60,000
                          </Text>
                        </View>
                        <View
                          style={ {
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "flex-end",
                            justifyContent: "flex-end"
                          } }
                        >
                          <Button transparent>
                            <Icon
                              name="icon_timelock"
                              color="gray"
                              size={ 25 }
                            />
                          </Button>
                          <Button transparent>
                            <Icon name="icon_multisig" color="gray" size={ 20 } />
                          </Button>
                        </View>
                      </View>
                    </RkCard>
                  ) }
                  keyExtractor={ ( item, index ) => index }
                />
              </ScrollView>
            </Animated.View>
          </SafeAreaView>
        </Content>
        <DropdownAlert ref={ ref => ( this.dropdown = ref ) } />
        <Button transparent style={ styles.plusButtonBottom }>
          <IconFontAwe name="plus" size={ 20 } color="#fff" />
        </Button>
      </Container>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  backgroundImage: {
    flex: 1,
    width: "100%"
  },
  plusButtonBottom: {
    width: 40,
    height: 40,
    borderRadius: 20,
    position: "absolute",
    bottom: 10,
    right: 10,
    alignSelf: "center",
    backgroundColor: colors.appColor,
    justifyContent: "center"
  },
  svgImage: {
    width: "100%",
    height: "100%"
  }
} );
