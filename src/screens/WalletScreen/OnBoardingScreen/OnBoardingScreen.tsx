import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CreateTables from "../../../app/manager/database/CreateTables";
//Custome Compontes
import ViewOnBoarding from "../../../app/custcompontes/view/ViewOnBoarding";
//Json Files
import onBoardingData from "../../../assets/jsonfiles/onBoardingScreen/onBoardingScreen.json";

//TODO: Custome object
import { colors, images } from "../../../app/constants/Constants";

export default class OnBoardingScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    this.setState({
      data: onBoardingData.onBoarding
    });
  }

  //TODO: func click_Done
  click_Done() {
    console.log("click");
    const resetAction = StackActions.reset({
      index: 0, // <-- currect active route from actions array
      key: null,
      actions: [
        NavigationActions.navigate({ routeName: "PasscodeConfirmScreen" })
      ]
    });
    this.props.navigation.dispatch(resetAction);
  }

  render() {
    const data = [
      {
        backgroundColor: "#fff",
        image: images.onBoardingScreen.onB1,
        title: "SOUND MONEY. SIMPLIFIED",
        subtitle: ""
      },
      {
        backgroundColor: "#fff",
        image: images.onBoardingScreen.onB2,
        title: "Secure",
        subtitle:
          "While money needs to be smart, more importantly it needs to be secure. We are very keen to use the best industry standards in software delivery and cryptography to ensure this."
      },
      {
        backgroundColor: "#fff",
        image: images.onBoardingScreen.onB3,
        title: "Self-sovereign",
        subtitle:
          "Our wallets are non-custodial and a user always has the control of their keys."
      }
    ];
    return (
      <View style={styles.container}>
        <Text style={{ marginTop: 20, color: colors.appColor, fontSize: 30 }}>
          Color{" "}
        </Text>
        <ViewOnBoarding data={data} click_Done={() => this.click_Done()} />
        <CreateTables />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
