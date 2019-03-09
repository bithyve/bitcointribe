import React from "react";
import { StyleSheet, View, Text, StatusBar } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CreateTables from "bithyve/src/app/manager/database/CreateTables";
import PushController from "bithyve/src/app/manager/Notification/PushController";
//Custome Compontes
import ViewOnBoarding from "bithyve/src/app/custcompontes/view/ViewOnBoarding";
//Json Files
import onBoardingData from "bithyve/src/assets/jsonfiles/onBoardingScreen/onBoardingScreen.json";
//TODO: Custome object
import { colors, images, msg } from "bithyve/src/app/constants/Constants";

//localization
import { localization } from "bithyve/src/app/manager/Localization/i18n";

export default class OnBoardingScreen extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: []
    };
  }

  componentWillMount() {
    this.setState({
      data: localization("OnBoardingScreen.onBoarding")
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
        backgroundColor: this.state.data[0].backgroundColor,
        image: images.onBoardingScreen.onB1,
        title: this.state.data[0].title,
        subtitle: this.state.data[0].subtitle
      },
      {
        backgroundColor: this.state.data[1].backgroundColor,
        image: images.onBoardingScreen.onB2,
        title: this.state.data[1].title,
        subtitle: this.state.data[2].subtitle
      },
      {
        backgroundColor: this.state.data[2].backgroundColor,
        image: images.onBoardingScreen.onB3,
        title: this.state.data[2].title,
        subtitle: this.state.data[2].subtitle
      }
    ];
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={colors.appColor} barStyle="dark-content" />
        <ViewOnBoarding data={data} click_Done={() => this.click_Done()} />
        <CreateTables />
        <PushController />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
