import React, { useEffect, useState } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SeedPageComponent from "../NewBHR/SeedPageComponent";
import RNPreventScreenshot from "react-native-screenshot-prevent";
import BottomInputModalContainer from "../../components/home/BottomInputModalContainer";
import ConfirmSeedWordsModal from "../NewBHR/ConfirmSeedWordsModal";
import SeedBacupModalContents from "../NewBHR/SeedBacupModalContents";
import ModalContainer from "../../components/home/ModalContainer";
import Colors from "../../common/Colors";
import SeedHeaderComponent from "../NewBHR/SeedHeaderComponent";

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
          onPressConfirm={(seed, seedData) => {
            setSeedPosition(0);
            setSeedData(seedData);

            setTimeout(() => {
              setConfirmSeedWordModal(true);
            }, 500);
          }}
          data={[]}
          confirmButtonText={"Next"}
          proceedButtonText={"Proceed"}
          disableChange={false}
          onPressReshare={() => {}}
          onPressChange={() => {
            RNPreventScreenshot.enabled(false);
            // props.navigation.goBack()
            props.navigation.pop();
          }}
          showButton={true}
          changeButtonText={"Back"}
          previousButtonText={"Previous"}
          isChangeKeeperAllow={true}
          setHeaderMessage={(message) => setHeaderTitle(message)}
        />
      </KeyboardAwareScrollView>
      <BottomInputModalContainer
        onBackground={() => setConfirmSeedWordModal(false)}
        visible={confirmSeedWordModal}
        closeBottomSheet={() => {}}
        showBlurView={true}
      >
        <ConfirmSeedWordsModal
          proceedButtonText={"Next"}
          seedNumber={seedRandomNumber ? seedRandomNumber[seedPosition] : 0}
          onPressProceed={(word) => {}}
          bottomBoxInfo={true}
          onPressIgnore={() => {
            setConfirmSeedWordModal(false);
            props.navigation.goBack();
          }}
          isIgnoreButton={true}
          cancelButtonText={"Start Over"}
        />
      </BottomInputModalContainer>
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
