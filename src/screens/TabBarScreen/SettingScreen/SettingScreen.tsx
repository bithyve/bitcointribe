import React from "react";
import { StyleSheet, ImageBackground, View, ScrollView, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Item,
  Input,
  Button,
  Left,
  Right,
  Body,
  Text,
  List, ListItem,
} from "native-base";
import { SvgIcon } from "@up-shared/components";
import { RkCard } from "react-native-ui-kitten";
import IconFontAwe from "react-native-vector-icons/FontAwesome";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


//TODO: Custome Pages
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";
import WalletSetUpScrolling from "HexaWallet/src/app/custcompontes/OnBoarding/WalletSetUpScrolling/WalletSetUpScrolling";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";



//TODO: Custome Object
import { colors, images, localDB } from "HexaWallet/src/app/constants/Constants";
var utils = require( "HexaWallet/src/app/constants/Utils" );


export default class SettingScreen extends React.Component<any, any> {

  constructor ( props: any ) {
    super( props )
    this.state = ( {
      arr_FirstListItem: []
    } );
  }


  async componentWillMount() {
    let walletDetails = await utils.getWalletDetails();
    let backupType;
    if ( utils.isJson( walletDetails.appHealthStatus ) ) {
      backupType = JSON.parse( walletDetails.appHealthStatus );
      backupType = backupType.backupType;
    } else {
      backupType = "share";
    }
    let subTitle;
    console.log( { backupType } );
    if ( backupType != "share" ) {
      subTitle = "Currently your wallet is backed via Mnemonic";
    } else {
      subTitle = "Currently your wallet is backed via Trusted Contacts";
    }

    this.setState( {
      arr_FirstListItem: [ {
        title: "Health of the App",
        subTitle: "Urgent action required to maintain health",
        icon: "shield"
      },
      {
        title: "Change Backup Method",
        subTitle: subTitle,
        icon: "shield"
      },
      {
        title: "Address Book",
        subTitle: "Contacts you have trusted or the ones who have trusted you",
        icon: "contact-book"
      },
      {
        title: "Settings",
        subTitle: "Advanced Settings",
        icon: "settings"
      },
      ],
      arr_SecondtListItem: [ {
        title: "Terms and Conditions"
      },
      {
        title: "Privacy policy"
      },
      {
        title: "FAQ's"
      },
      {
        title: "Contact Us"
      },
      ]
    } )
  }

  //TODO: func click_FirstMenuItem
  click_MenuItem( item: any ) {
    let title = item.title;
    if ( title == "Health of the App" ) {
      this.props.navigation.push( "HealthOfTheAppNavigator" );
    }
    else if ( title == "Address Book" ) {
      this.props.navigation.push( "TrustedPartyShareSecretNavigator" );
    } else if ( title == "Settings" ) {
      this.props.navigation.push( "SettingsNavigator" );
    }
    else {
      Alert.alert( "Working." );
    }
  }


  render() {
    let arr_FirstListItem = this.state.arr_FirstListItem;
    return (
      <Container>
        <SafeAreaView style={ styles.container }>
          <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
            <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={ true }
              keyboardOpeningTime={ 0 }
              enableOnAndroid={ true }
              contentContainerStyle={ { flexGrow: 1 } }
            >
              <View style={ { flex: 1, marginLeft: 10, marginTop: 30 } }>
                <Text style={ [ globalStyle.ffFiraSansMedium, { color: "#000000", fontSize: 28, marginLeft: 0 } ] }>More</Text>
              </View>
              <View style={ { flex: 0.7 } }>
                <FlatList
                  data={ arr_FirstListItem }
                  showsVerticalScrollIndicator={ false }
                  scrollEnabled={ false }
                  renderItem={ ( { item } ) => (
                    <TouchableOpacity
                      onPress={ () => this.click_MenuItem( item ) }
                    >
                      <RkCard
                        rkType="shadowed"
                        style={ {
                          flex: 1,
                          borderRadius: 8,
                          marginLeft: 8,
                          marginRight: 8,
                          marginBottom: 4,
                        } }
                      >
                        <View
                          rkCardHeader
                          style={ {
                            flex: 1,
                          } }
                        >
                          <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-start" } }>
                            <SvgIcon
                              name={ item.icon }
                              color="#BABABA"
                              size={ 30 }
                            />
                          </View>
                          <View style={ { flex: 1, flexDirection: "column" } }>
                            <Text
                              style={ [ globalStyle.ffFiraSansMedium, { fontSize: 12 } ] }
                            >
                              { item.title }
                            </Text>
                            <Text note numberOfLines={ 1 } style={ { fontSize: 11 } }>{ item.subTitle }</Text>
                          </View>
                          <View style={ { flex: 0.2, justifyContent: "center", alignItems: "flex-end" } }>
                            <SvgIcon
                              name="icon_forword"
                              color="#BABABA"
                              size={ 20 }
                            />
                          </View>
                        </View>
                      </RkCard>
                    </TouchableOpacity>
                  ) }
                  keyExtractor={ ( item, index ) => index }
                />
              </View>
              <View style={ { flex: 0.61, backgroundColor: "#ffffff", borderRadius: 10, margin: 8 } }>
                <FlatList
                  data={ this.state.arr_SecondtListItem }
                  showsVerticalScrollIndicator={ false }
                  scrollEnabled={ false }
                  renderItem={ ( { item } ) => (
                    <TouchableOpacity
                      onPress={ () => this.click_MenuItem( item ) }
                    >
                      <List>
                        <ListItem>
                          <Left>
                            <Text>{ item.title }</Text>
                          </Left>
                          <Right>
                            <SvgIcon
                              name="icon_forword"
                              color="#BABABA"
                              size={ 20 }
                            />
                          </Right>
                        </ListItem>
                      </List>
                    </TouchableOpacity>
                  ) }
                  keyExtractor={ ( item, index ) => index }
                />
              </View>
              <View style={ { flex: 0.4, alignItems: "center", marginTop: 20 } }>
                <Text note style={ [ globalStyle.ffFiraSansMedium ] }>Follow Us</Text>
                <View style={ { alignItems: "center", flexDirection: "row" } }>
                  <SvgIcon
                    name="twitter-logo-silhouette"
                    color="#BABABA"
                    size={ 20 }
                    style={ styles.btnSocial }
                  />
                  <SvgIcon
                    name="linkedin-logo"
                    color="#BABABA"
                    size={ 20 }
                    style={ styles.btnSocial }
                  />
                  <SvgIcon
                    name="medium-size"
                    color="#BABABA"
                    size={ 20 }
                    style={ styles.btnSocial }
                  />
                </View>
                <Text note>© 2019  All Rights Reserved. Bithyve | www.bithyve.com</Text>
              </View>
            </KeyboardAwareScrollView>
          </ImageBackground>
        </SafeAreaView>
      </Container >
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  viewPagination: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 30,
    marginRight: 30
  },
  viewInputFiled: {
    flex: 3,
    alignItems: "center",
    margin: 10
  },
  itemInputWalletName: {
    borderWidth: 0,
    borderRadius: 10,
    shadowOffset: { width: 2, height: 2 },
    shadowColor: 'gray',
    shadowOpacity: 0.3,
    backgroundColor: '#FFFFFF'

  },
  viewProcedBtn: {
    flex: 2,
    justifyContent: "flex-end"
  },
  btnSocial: {
    margin: 10
  }
} );
