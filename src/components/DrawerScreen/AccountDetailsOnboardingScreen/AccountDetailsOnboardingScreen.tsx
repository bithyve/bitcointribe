import React, { Component } from "react";
import { StyleSheet, AsyncStorage, ScrollView } from "react-native";
import {
  Container,
  Header,
  Title,
  Content,
  Button,
  Left,
  Right,
  Body
} from "native-base";
//Custome Compontes
import ViewOnBoarding from "bithyve/src/app/custcompontes/view/ViewOnBoarding";
import Icon from "react-native-vector-icons/FontAwesome";
//TODO: Custome object
import { images, msg } from "bithyve/src/app/constants/Constants";
//localization
import { localization } from "bithyve/src/app/manage/Localization/i18n";
export default class AccountDetailsOnboardingScreen extends Component<
  any,
  any
  > {
  constructor ( props: any ) {
    super( props );
    this.state = {
      data: [],
      type: null
    };
  }

  //TODO: Page Life Cycle
  componentWillMount() {
    const { navigation } = this.props;
    const type = navigation.getParam( "type" );
    let dataSecure = localization( "AccountDetailsOnboardingScreen.Secure" );
    let dataJoint = localization( "AccountDetailsOnboardingScreen.Joint" );
    let dataVault = localization( "AccountDetailsOnboardingScreen.Vault" );
    if ( type == "Secure" ) {
      this.setState( {
        data: [
          {
            backgroundColor: dataSecure[ 0 ].backgroundColor,
            image: images.accountDetailsOnBoarding.secureAccount.img1,
            title: null, //dataSecure[0].title,
            subtitle: dataSecure[ 0 ].subtitle
          },
          {
            backgroundColor: dataSecure[ 1 ].backgroundColor,
            image: images.accountDetailsOnBoarding.secureAccount.img2,
            title: null, //dataSecure[1].title,
            subtitle: dataSecure[ 1 ].subtitle
          },
          {
            backgroundColor: dataSecure[ 2 ].backgroundColor,
            image: images.accountDetailsOnBoarding.secureAccount.img3,
            title: null, //dataSecure[2].title,
            subtitle: dataSecure[ 2 ].subtitle
          }
        ],
        type: type
      } );
    } else if ( type == "Joint" ) {
      this.setState( {
        data: [
          {
            backgroundColor: dataJoint[ 0 ].backgroundColor,
            image: images.accountDetailsOnBoarding.jointAccount.img1,
            title: null,
            subtitle: dataJoint[ 0 ].subtitle
          },
          {
            backgroundColor: dataJoint[ 1 ].backgroundColor,
            image: images.accountDetailsOnBoarding.jointAccount.img2,
            title: null,
            subtitle: dataJoint[ 1 ].subtitle
          },
          {
            backgroundColor: dataJoint[ 2 ].backgroundColor,
            image: images.accountDetailsOnBoarding.jointAccount.img3,
            title: null,
            subtitle: dataJoint[ 2 ].subtitle
          }
        ],
        type: type
      } );
    } else {
      this.setState( {
        data: [
          {
            backgroundColor: dataVault[ 0 ].backgroundColor,
            image: images.accountDetailsOnBoarding.vaultAccount.img1,
            title: null,
            subtitle: dataVault[ 0 ].subtitle
          },
          {
            backgroundColor: dataVault[ 1 ].backgroundColor,
            image: images.accountDetailsOnBoarding.vaultAccount.img2,
            title: null,
            subtitle: dataVault[ 1 ].subtitle
          }
        ],
        type: type
      } );
    }
  }

  async componentDidMount() {
    try {
      AsyncStorage.setItem( "flag_BackgoundApp", JSON.stringify( true ) );
    } catch ( error ) {
      console.log( error );
    }
  }

  //TODO: func click_Done

  click_Done() {
    if ( this.state.type == "Secure" ) {
      this.props.navigation.push( "SecureAccountScreen" );
      //this.props.navigation.push("ValidateSecureAccountScreen");
    } else if ( this.state.type == "Joint" ) {
      this.props.navigation.push( "CreateJointAccountScreen" );
    } else {
      this.props.navigation.push( "VaultAccountScreen" );
    }
  }

  render() {
    return (
      <Container>
        <Content contentContainerStyle={ styles.container } scrollEnabled={ true }>
          <Header
            transparent
            style={ { backgroundColor: "#fff", position: "relative" } }
          >
            <Left>
              <Button transparent onPress={ () => this.props.navigation.pop() }>
                <Icon name="chevron-left" size={ 25 } color="#000" />
              </Button>
            </Left>
            <Body style={ { flex: 0, alignItems: "center" } }>
              <Title />
            </Body>
            <Right />
          </Header>
          <ScrollView>
            <ViewOnBoarding
              data={ this.state.data }
              click_Done={ () => this.click_Done() }
            />
          </ScrollView>
        </Content>
      </Container>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1
  }
} );
