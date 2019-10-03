import React from "react";
import {
  Image,
  StyleSheet,
  Dimensions,
  View,
  StatusBar,
  ImageBackground,
  AsyncStorage,
  Platform
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
  Footer
} from "native-base";
import Icon from "react-native-vector-icons/FontAwesome";
import Share from "react-native-share";

//TODO: Custome Pages
import { images, localDB } from "bithyve/src/app/constants/Constants";
var dbOpration = require( "bithyve/src/app/manage/database/DBOpration" );

//localization
import { localization } from "bithyve/src/app/manage/Localization/i18n";

export default class BackupPhraseScreen extends React.Component {
  constructor ( props ) {
    super( props );
    StatusBar.setHidden( false );
    this.state = {
      mnemonicValues: [],
      visible: false
    };
  }

  componentWillMount() {
    this.getWalletsData();
  }

  componentWillUnmount() {
    try {
      AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
    } catch ( e ) {
      console.log( e );
    }
  }

  async getWalletsData() {
    const resultWallet = await dbOpration.readTablesData(
      localDB.tableName.tblWallet
    );
    let data = resultWallet.temp;
    let mnemonicValue = data[ 0 ].mnemonic;
    this.setState( {
      mnemonicValues: mnemonicValue.split( "," )
    } );
    console.log( this.state.mnemonicValues );
    if ( this.state.mnemonicValues.length > 0 ) {
      this.setState( {
        spinner: false
      } );
    }
  }

  onCancel() {
    this.setState( { visible: false } );
  }
  onOpen() {
    this.setState( { visible: true } );
  }

  render() {
    const textSecurityKey = this.state.mnemonicValues.map( ( type, index ) => (
      <Text key={ index } style={ styles.secrityChar }>
        { " " }
        { type }{ " " }
      </Text>
    ) );
    var numanicKey = this.state.mnemonicValues.toString();
    let shareOptions = {
      title: "Numeric key",
      message: numanicKey,
      url: "\nhttps://bithyve.com/",
      subject: "HexaWallet" //  for email
    };

    return (
      <Container>
        <ImageBackground source={ images.appBackgound } style={ styles.container }>
          <Header transparent>
            <Left>
              <Button
                transparent
                onPress={ () => this.props.navigation.goBack() }
              >
                <Icon name="chevron-left" size={ 25 } color="#ffffff" />
              </Button>
            </Left>

            <Body style={ { flex: 0, alignItems: "center" } }>
              <Title
                adjustsFontSizeToFit={ true }
                numberOfLines={ 1 }
                style={ styles.titleUserName }
              >
                { localization( "BackupPhraseScreen.headerTitle" ) }
              </Title>
            </Body>
            <Right />
          </Header>
          <Content contentContainerStyle={ styles.container }>
            <View style={ styles.viewImageAndTitle }>
              <Image
                style={ styles.backupImg }
                resizeMode="contain"
                source={ images.backupPhraseScreen.backupPhraseLogo }
              />
              <Text style={ styles.desc }>
                { localization( "BackupPhraseScreen.bodyMsg1" ) }
              </Text>
              <Text style={ styles.desc }>
                { localization( "BackupPhraseScreen.bodyMsg2" ) }
              </Text>
            </View>
            <View style={ styles.viewNumanicValue }>{ textSecurityKey }</View>
            <View>
              <Button
                transparent
                style={ styles.btnCopy }
                onPress={ () => {
                  try {
                    AsyncStorage.setItem(
                      "flag_BackgoundApp",
                      JSON.stringify( false )
                    );

                    Share.open( shareOptions )
                      .then( res => {
                        if ( Platform.OS == "ios" ) {
                          AsyncStorage.setItem(
                            "flag_BackgoundApp",
                            JSON.stringify( true )
                          );
                        }
                      } )
                      .catch( err => {
                        err && console.log( err );
                      } );
                  } catch ( e ) {
                    console.log( e );
                  }
                } }
              >
                <Text
                  style={ {
                    fontWeight: "bold",
                    fontSize: 16,
                    color: "#F5951D"
                  } }
                >
                  { localization( "BackupPhraseScreen.btnCopy" ) }
                </Text>
              </Button>
            </View>
          </Content>
          <Footer style={ styles.footer }>
            <Button
              style={ styles.btnNext }
              onPress={ () =>
                this.props.navigation.push( "VerifyBackupPhraseScreen", {
                  numanicValues: this.state.mnemonicValues
                } )
              }
            >
              <Text
                style={ {
                  fontWeight: "bold",
                  fontSize: 16,
                  textAlign: "center"
                } }
              >
                { localization( "BackupPhraseScreen.btnNext" ) }
              </Text>
            </Button>
          </Footer>
        </ImageBackground>
      </Container>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1,
    backgroundColor: "#ffffff"
  },
  titleUserName: {
    color: "#ffffff"
  },
  viewImageAndTitle: {
    flex: 0.6,
    alignItems: "center",
    marginTop: 40
  },
  backupImg: {
    marginBottom: 20
  },
  desc: {
    marginLeft: 5,
    marginRight: 5,
    textAlign: "center",
    color: "gray"
  },
  //Numanic Values show
  viewNumanicValue: {
    backgroundColor: "#ECF0F4",
    height: 100,
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 10
  },
  secrityChar: {
    fontSize: 20,
    padding: 1
  },
  btnCopy: {
    alignSelf: "center",
    fontWeight: "bold",
    marginTop: 10
  },
  //next button style
  btnNext: {
    backgroundColor: "#F5951D",
    width: Dimensions.get( "screen" ).width - 50,
    height: 40,
    borderColor: "transparent",
    borderWidth: 0,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: "center"
  },
  //Fotter
  footer: {
    backgroundColor: "transparent"
  }
} );
