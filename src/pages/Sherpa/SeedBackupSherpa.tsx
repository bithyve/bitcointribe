import React, { useEffect, useState } from "react";
import { SafeAreaView, Share, StatusBar, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SeedPageComponent from "../NewBHR/SeedPageComponent";
import RNPreventScreenshot from "react-native-screenshot-prevent";
import BottomInputModalContainer from "../../components/home/BottomInputModalContainer";
import ConfirmSeedWordsModal from "../NewBHR/ConfirmSeedWordsModal";
import SeedBacupModalContents from "../NewBHR/SeedBacupModalContents";
import ModalContainer from "../../components/home/ModalContainer";
import Colors from "../../common/Colors";
import SeedHeaderComponent from "../NewBHR/SeedHeaderComponent";
import Toast from "../../components/Toast";

export type ISeedBackupSherpaProps = { navigation: any };

const SeedBackupSherpa: React.FC<ISeedBackupSherpaProps> = (props) => {
  const [seedWordModal, setSeedWordModal] = useState(false);
  const [confirmSeedWordModal, setConfirmSeedWordModal] = useState(false);
  const [seedRandomNumber, setSeedRandomNumber] = useState([]);
  const [seedData, setSeedData] = useState([]);
  const [seedPosition, setSeedPosition] = useState(0);
  const [headerTitle, setHeaderTitle] = useState("Backup phrase");

  useEffect(() => {
    //set random number
    const i = 12,
      ranNums = [];
    for (let j = 0; j < 2; j++) {
      const tempNumber = Math.floor(Math.random() * i);
      if (
        ranNums.length == 0 ||
        (ranNums.length > 0 && ranNums[j] != tempNumber)
      ) {
        if (tempNumber == undefined || tempNumber == 0) {
          ranNums.push(1);
        } else {
          ranNums.push(tempNumber);
        }
      } else j--;
    }
    setSeedRandomNumber(ranNums);
  }, []);

  const shareCode = async (code) => {
    try {
      await Share.share({
        message: `Send this backup phrases to your ward and paste them on the Seed backup Screen.\n\n${code}`,
        title: "Share Sherpa Code",
      });
    } catch (error) {
      console.log("SharePhrasesError", error);
      Toast("Something went wrong");
    }
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.backgroundColor,
      }}
    >
      <SafeAreaView
        style={{
          flex: 0,
          backgroundColor: Colors.backgroundColor,
        }}
      />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <SeedHeaderComponent
        onPressBack={() => {
          // RNPreventScreenshot.enabled( false )
          props.navigation.goBack();
          // props.navigation.navigate( 'Home' )
        }}
        info={"Make sure you keep them safe"}
        selectedTitle={headerTitle}
      />
      <KeyboardAwareScrollView
        // scrollEnabled={false}
        contentContainerStyle={{
          // flex: 1,
          // backgroundColor: background,
          flex: 1,
          flexDirection: "column",
          justifyContent: "flex-end",
          // alignItems: 'center',
          // paddingBottom: Platform.OS === 'ios' ? hp( '6%' ) : 2,
          // paddingHorizontal: wp( '2%' ),
          // borderRadius: 20
        }}
        extraScrollHeight={100}
        enableOnAndroid={true}
        resetScrollToCoords={{
          x: 0,
          y: 0,
        }}
        keyboardShouldPersistTaps="always"
      >
        <SeedPageComponent
          infoBoxTitle={"Note"}
          infoBoxInfo={
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt"
          }
          onPressConfirm={() => {
            props.navigation.goBack();
          }}
          data={[]}
          confirmButtonText={"Next"}
          proceedButtonText={"Proceed"}
          disableChange={false}
          onPressReshare={() => {}}
          onPressChange={(phrases) => {
            RNPreventScreenshot.enabled(false);
            // props.navigation.goBack()
            // props.navigation.pop();

            shareCode(phrases);
          }}
          showButton={true}
          changeButtonText={"Copy Words"}
          previousButtonText={"Previous"}
          isChangeKeeperAllow={true}
          setHeaderMessage={(message) => setHeaderTitle(message)}
          sherpa
        />
      </KeyboardAwareScrollView>
      <ModalContainer
        onBackground={() => setSeedWordModal(false)}
        visible={seedWordModal}
        closeBottomSheet={() => setSeedWordModal(false)}
      >
        <SeedBacupModalContents
          title={"Backup phrase \nSuccessful"}
          info={
            "You have successfully confirmed your backup\n\nMake sure you store the words in a safe place. The app will request you to confirm the words periodically to ensure you have the access"
          }
          proceedButtonText={"View Health"}
          onPressProceed={() => {
            props.navigation.navigate("SeedBackupHistory", {});
          }}
          onPressIgnore={() => setSeedWordModal(false)}
          isIgnoreButton={false}
          isBottomImage={true}
          bottomImage={require("../../assets/images/icons/success.png")}
        />
      </ModalContainer>
    </View>
  );
};

export default SeedBackupSherpa;
