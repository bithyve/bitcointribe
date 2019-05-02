import React from "react";
import { StyleSheet, View, SafeAreaView, Image, StatusBar } from "react-native";
import { Text } from "native-base";
import { StackActions, NavigationActions } from "react-navigation";
import CreateTables from "HexaWallet/src/app/manager/database/CreateTables";

//Custome Compontes
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import OnBoarding from "HexaWallet/src/app/custcompontes/OnBoarding/OnBoarding";


//TODO: Custome StyleSheet Files       
import globalStyle from "HexaWallet/src/app/manager/Global/StyleSheet/Style";

//TODO: Custome object
import { colors, images, msg } from "HexaWallet/src/app/constants/Constants";

//localization 
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

export default class OnBoardingScreen extends React.Component<any, any> {
  constructor ( props: any ) {
    super( props );
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    this.setState( {
      data: localization( "OnBoardingScreen.onBoarding" )
    } );
  }

  //TODO: func click_Done  
  click_Done() {
    console.log( "click" );
    const resetAction = StackActions.reset( {
      index: 0, // <-- currect active route from actions array
      key: null,
      actions: [
        NavigationActions.navigate( { routeName: "PasscodeConfirmScreen" } )
      ]
    } );
    this.props.navigation.dispatch( resetAction );
  }

  render() {
    const data = [
      {
        backgroundColor: this.state.data[ 0 ].backgroundColor,
        image: images.onBoardingScreen.onB1,
        title: this.state.data[ 0 ].title,
        subtitle: this.state.data[ 0 ].subtitle
      },
      {
        backgroundColor: this.state.data[ 1 ].backgroundColor,
        image: images.onBoardingScreen.onB2,
        title: this.state.data[ 1 ].title,
        subtitle: this.state.data[ 2 ].subtitle
      },
      {
        backgroundColor: this.state.data[ 2 ].backgroundColor,
        image: images.onBoardingScreen.onB3,
        title: this.state.data[ 2 ].title,
        subtitle: this.state.data[ 2 ].subtitle
      }
    ];
    return (
      <View style={ styles.container }>
        <CustomeStatusBar backgroundColor={ colors.white } barStyle="dark-content" />
        <SafeAreaView style={ styles.container }>
          <OnBoarding click_GetStarted={ () => this.click_Done() }>
            {/* First screen */ }
            <View style={ [ styles.slide ] }>
              <Image
                style={ { width: 240, height: 240 } }
                resizeMode="contain"
                source={ data[ 0 ].image }
              />
              <Text style={ [ styles.header, globalStyle.ffFiraSansBold ] }>{ data[ 0 ].title }</Text>
              <Text note style={ [ styles.text, globalStyle.ffFiraSansMedium ] }>
                { data[ 0 ].subtitle }
              </Text>
            </View>
            {/* Second screen */ }
            <View style={ [ styles.slide ] }>
              <Image
                style={ { width: 240, height: 240 } }
                resizeMode="contain"
                source={ data[ 1 ].image }
              />
              <Text style={ [ styles.header, globalStyle.ffFiraSansBold ] }>{ data[ 1 ].title }</Text>
              <Text note style={ [ styles.text, globalStyle.ffFiraSansMedium ] }>
                { data[ 1 ].subtitle }
              </Text>
            </View>
            {/* Third screen */ }
            <View style={ [ styles.slide ] }>
              <Image
                style={ { width: 240, height: 240 } }
                resizeMode="contain"
                source={ data[ 2 ].image }
              />
              <Text style={ [ styles.header, globalStyle.ffFiraSansBold ] }>{ data[ 2 ].title }</Text>
              <Text note style={ [ styles.text, globalStyle.ffFiraSansMedium ] }>
                { data[ 2 ].subtitle }
              </Text>
            </View>
          </OnBoarding>
          <CreateTables />
          {/* <PushController /> */ }
        </SafeAreaView>
      </View>
    );
  }
}

const styles = StyleSheet.create( {
  container: {
    flex: 1
  },
  slide: {
    flex: 1, // Take up all screen
    justifyContent: "center", // Center vertically
    alignItems: "center" // Center horizontally
  },
  // Header styles
  header: {
    color: "#000000",
    fontSize: 30,
    marginVertical: 15,
    margin: 20,
    textAlign: "center"
  },
  // Text below header
  text: {
    fontFamily: "Avenir",
    fontSize: 18,
    marginHorizontal: 40,
    textAlign: "center"
  }
} );
