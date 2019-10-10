import React from "react";
import { StyleSheet, ImageBackground, View, Linking, Platform, SafeAreaView, FlatList, TouchableOpacity, Alert } from "react-native";
import {
  Container,
  Button,
  Left,
  Right,
  Text,
  List, ListItem,
} from "native-base";
import { SvgIcon } from "hexaComponent/Icons";
import { RkCard } from "react-native-ui-kitten";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import InAppBrowser from 'react-native-inappbrowser-reborn'


import { ImageSVG } from "hexaComponent/ImageSVG";


//TODO: Custome Pages
import { StatusBar } from "hexaComponent/StatusBar";



//TODO: Custome StyleSheet Files       
import FontFamily from "hexaComponent/Styles/FontFamily";



//TODO: Custome Object
import { colors, images, svgIcon } from "hexaConstants";
var utils = require( "hexaUtils" );


export default class Setting extends React.Component<any, any> {

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
        svgIcon: Platform.OS == "ios" ? "healthSVG" : "healthPNG"
      },
      // {
      //   title: "Change Backup Method",
      //   subTitle: subTitle,
      //   svgIcon: "backupMethod"
      // },
      {
        title: "Address Book",
        subTitle: "Contacts you have trusted or the ones who have trusted you",
        svgIcon: Platform.OS == "ios" ? "addressBookSVG" : "addressBookPNG"
      },
      {
        title: "Settings",
        subTitle: "Advanced Settings",
        svgIcon: Platform.OS == "ios" ? "settingsSVG" : "settingsPNG"
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
      Alert.alert( "coming soon." );
    }
  }



  //TODO: Open social site
  click_OpenSocialUrl = async ( url: string ) => {
    try {
      if ( await InAppBrowser.isAvailable() ) {
        await InAppBrowser.open( url, {
          // iOS Properties
          dismissButtonStyle: 'cancel',
          preferredBarTintColor: colors.appColor,
          preferredControlTintColor: 'white',
          readerMode: false,
          animated: true,
          modalPresentationStyle: 'overFullScreen',
          modalTransitionStyle: 'partialCurl',
          modalEnabled: true,
          // Android Properties
          showTitle: true,
          toolbarColor: colors.appColor,
          secondaryToolbarColor: 'black',
          enableUrlBarHiding: true,
          enableDefaultShare: true,
          forceCloseOnRedirection: false,
          // Specify full animation resource identifier(package:anim/name)
          // or only resource name(in case of animation bundled with app).
          animations: {
            startEnter: 'slide_in_right',
            startExit: 'slide_out_left',
            endEnter: 'slide_in_left',
            endExit: 'slide_out_right'
          },
          headers: {
            'my-custom-header': 'my custom header value'
          },
          waitForRedirectDelay: 0
        } )
      }
      else Linking.openURL( url )
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  click_SecoundMenuItem = async ( item: any ) => {
    try {
      console.log( { item } );
      let url = "";
      if ( item.title == "FAQ's" )
        url = "https://hexawallet.io/faq"
      else if ( item.title == "Contact Us" )
        url = "https://hexawallet.io/#contact"
      else
        Alert.alert( 'coming soon' )
      if ( url != "" ) {
        if ( await InAppBrowser.isAvailable() ) {
          await InAppBrowser.open( url, {
            // iOS Properties  
            dismissButtonStyle: 'cancel',
            preferredBarTintColor: colors.appColor,
            preferredControlTintColor: 'white',
            readerMode: false,
            animated: true,
            modalPresentationStyle: 'overFullScreen',
            modalTransitionStyle: 'partialCurl',
            modalEnabled: true,
            // Android Properties
            showTitle: true,
            toolbarColor: colors.appColor,
            secondaryToolbarColor: 'black',
            enableUrlBarHiding: true,
            enableDefaultShare: true,
            forceCloseOnRedirection: false,
            // Specify full animation resource identifier(package:anim/name)
            // or only resource name(in case of animation bundled with app).
            animations: {
              startEnter: 'slide_in_right',
              startExit: 'slide_out_left',
              endEnter: 'slide_in_left',
              endExit: 'slide_out_right'
            },
            headers: {
              'my-custom-header': 'my custom header value'
            },
            waitForRedirectDelay: 0
          } )
        }
        else Linking.openURL( url )
      }
    } catch ( error ) {
      Alert.alert( error )
    }
  }

  render() {
    let arr_FirstListItem = this.state.arr_FirstListItem;
    return (
      <Container>
        <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
          <SafeAreaView style={ [ styles.container, { backgroundColor: 'transparent' } ] }>
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={ true }
              keyboardOpeningTime={ 0 }
              enableOnAndroid={ true }
              contentContainerStyle={ { flexGrow: 1 } }
            >
              <View style={ { margin: 10, marginTop: 30 } }>
                <Text style={ [ FontFamily.ffFiraSansMedium, { color: "#000000", fontSize: 28, marginLeft: 0 } ] }>More</Text>
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
                          <View style={ { flex: 0.23, justifyContent: "center", alignItems: "flex-start" } }>
                            <ImageSVG
                              size={ 40 }
                              source={
                                svgIcon.moreScreen[ item.svgIcon ]
                              }
                            />
                          </View>
                          <View style={ { flex: 1, flexDirection: "column" } }>
                            <Text
                              style={ [ FontFamily.ffFiraSansMedium, { fontSize: 12 } ] }
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
                  keyExtractor={ ( item, index ) => index.toString() }
                />
              </View>
              <View style={ { flex: 0.61, borderRadius: 10, padding: 10, margin: 8 } }>
                <FlatList
                  data={ this.state.arr_SecondtListItem }
                  showsVerticalScrollIndicator={ false }
                  scrollEnabled={ false }
                  renderItem={ ( { item } ) => (
                    <List>
                      <ListItem onPress={ () => this.click_SecoundMenuItem( item ) }>
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
                  ) }
                  keyExtractor={ ( item, index ) => index }
                />
              </View>
              <View style={ { flex: 0.4, alignItems: "center", marginTop: 20 } }>
                <Text note style={ [ FontFamily.ffFiraSansMedium ] }>Follow Us</Text>
                <View style={ { alignItems: "center", flexDirection: "row" } }>
                  <Button
                    transparent
                    style={ styles.btnSocial }
                    onPress={ () => this.click_OpenSocialUrl( "https://twitter.com/HexaWallet" ) }
                  >
                    <SvgIcon
                      name="twitter-logo-silhouette"
                      color="#BABABA"
                      size={ 20 }
                    />
                  </Button>

                  <Button
                    transparent
                    style={ styles.btnSocial }
                    onPress={ () => this.click_OpenSocialUrl( "https://www.linkedin.com/company/bithyve" ) }
                  >
                    <SvgIcon
                      name="linkedin-logo"
                      color="#BABABA"
                      size={ 20 }
                    />
                  </Button>
                  <Button
                    transparent
                    style={ styles.btnSocial }
                    onPress={ () => this.click_OpenSocialUrl( "https://medium.com/bitbees" ) }
                  >
                    <SvgIcon
                      name="medium-size"
                      color="#BABABA"
                      size={ 20 }
                    />
                  </Button>


                </View>
                <Text note>© 2019  All Rights Reserved. Bithyve | www.bithyve.com</Text>
              </View>
            </KeyboardAwareScrollView>
          </SafeAreaView>
        </ImageBackground>
        <StatusBar backgroundColor={ colors.white } hidden={ false } barStyle="dark-content" />
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
