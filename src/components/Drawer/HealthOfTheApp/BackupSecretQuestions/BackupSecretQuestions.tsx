import React, { Component } from 'react';
import { StyleSheet, View, ImageBackground, SafeAreaView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// TODO: Custome Compontes
import { CustomStatusBar } from 'hexaCustStatusBar';
import {
  ModelBackupSecretQuestionsFirstQuestion,
  ModelQuestionsSuccessfullyBackedUp,
} from 'hexaCustModel';

// TODO: Custome Object
import { colors, images, localDB } from 'hexaConstants';

const dbOpration = require('hexaDBOpration');

export default class BackupSecretQuestions extends Component {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
      walletDetails: [],
      arr_ModelBackupSecretQuestionsFirstQuestion: [],
      arr_ModelQuestionsSuccessfullyBackedUp: [],
    };
  }

  componentWillMount() {
    const data = this.props.navigation.getParam('data');
    // console.log( { data } );

    const walletDetails = this.props.navigation.getParam('walletDetails');
    setTimeout(() => {
      this.setState({
        data,
        walletDetails,
        arr_ModelBackupSecretQuestionsFirstQuestion: [
          {
            modalVisible: true,
            data,
          },
        ],
      });
    }, 100);
  }

  // TODO: Click Sucess Popup click_GoToWallet

  click_GoToWallet = async () => {
    const { walletDetails } = this.state;
    const arr_History = JSON.parse(walletDetails.setUpWalletAnswerDetails);
    // console.log( { arr_History } );
    const dateTime = Date.now();
    const JsonData = {};
    JsonData.Question = arr_History[0].Question;
    JsonData.Answer = arr_History[0].Answer;
    const temp = [JsonData];
    arr_History.push.apply(arr_History, temp);
    const resUpdateWalletAns = await dbOpration.updateWalletBackedUpSecretQue(
      localDB.tableName.tblWallet,
      dateTime,
    );
    if (resUpdateWalletAns) {
      this.props.navigation.pop();
    }
  };

  render() {
    // array
    const {
      data,
      arr_ModelBackupSecretQuestionsFirstQuestion,
      arr_ModelQuestionsSuccessfullyBackedUp,
    } = this.state;
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <ImageBackground
            source={images.WalletSetupScreen.WalletScreen.backgoundImage}
            style={styles.container}
          >
            <KeyboardAwareScrollView
              enableAutomaticScroll
              automaticallyAdjustContentInsets={true}
              keyboardOpeningTime={0}
              enableOnAndroid={true}
              contentContainerStyle={{ flexGrow: 1 }}
            >
              <ModelBackupSecretQuestionsFirstQuestion
                data={arr_ModelBackupSecretQuestionsFirstQuestion}
                click_Next={() => {
                  this.setState({
                    arr_ModelBackupSecretQuestionsFirstQuestion: [
                      {
                        modalVisible: false,
                        data,
                      },
                    ],
                    arr_ModelQuestionsSuccessfullyBackedUp: [
                      {
                        modalVisible: true,
                      },
                    ],
                  });
                }}
                pop={() => {
                  this.setState({
                    arr_ModelBackupSecretQuestionsFirstQuestion: [
                      {
                        modalVisible: false,
                        data,
                      },
                    ],
                  });
                  this.props.navigation.pop();
                }}
              />
              <ModelQuestionsSuccessfullyBackedUp
                data={arr_ModelQuestionsSuccessfullyBackedUp}
                click_GoToWallet={() => {
                  this.setState({
                    arr_ModelQuestionsSuccessfullyBackedUp: [
                      {
                        modalVisible: false,
                      },
                    ],
                  });
                  this.click_GoToWallet();
                }}
              />
            </KeyboardAwareScrollView>
          </ImageBackground>
        </SafeAreaView>
        <CustomStatusBar
          backgroundColor={colors.appColor}
          hidden={false}
          barStyle="light-content"
        />
      </View>
    );
  }
}

let styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F8BCD',
  },
  viewSetupWallet: {
    flex: 4,
    margin: 10,
  },
  viewAppLogo: {
    marginTop: 20,
    flex: 1,
    alignItems: 'center',
  },
  imgAppLogo: {
    height: 70,
    width: 70,
  },
  txtWhiteColor: {
    color: '#ffffff',
  },
});
