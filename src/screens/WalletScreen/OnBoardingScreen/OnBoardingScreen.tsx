import React from "react";
import { StyleSheet, View, Text } from "react-native";
import { StackActions, NavigationActions } from "react-navigation";
import CreateTables from "bithyve/src/app/manager/database/CreateTables";
import PushController from "bithyve/src/app/manager/Notification/PushController";
//Custome Compontes
import ViewOnBoarding from "bithyve/src/app/custcompontes/view/ViewOnBoarding";
//Json Files
import onBoardingData from "bithyve/src/assets/jsonfiles/onBoardingScreen/onBoardingScreen.json";
//TODO: Custome object
import { colors, images, msg } from "bithyve/src/app/constants/Constants";

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
        title: msg.onBoarding.title1,
        subtitle: msg.onBoarding.subTitle1
      },
      {
        backgroundColor: "#fff",
        image: images.onBoardingScreen.onB2,
        title: msg.onBoarding.title2,
        subtitle: msg.onBoarding.subTitle2
      },
      {
        backgroundColor: "#fff",
        image: images.onBoardingScreen.onB3,
        title: msg.onBoarding.title3,
        subtitle: msg.onBoarding.subTitle3
      }
    ];
    return (
      <View style={styles.container}>
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
