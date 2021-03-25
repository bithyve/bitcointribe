import React, { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { AppBottomSheetTouchableWrapper } from "../../components/AppBottomSheetTouchableWrapper";
import RadioButton from "../../components/RadioButton";
import { LevelHealthInterface } from "../../bitcoin/utilities/Interface";
import { useSelector } from "react-redux";

export default function KeeperTypeModalContents(props) {
  const [keeperTypesData, setKeeperTypesData] = useState([
    {
      type: "contact",
      name: "Friends and Family",
      info: "Lorem ipsum dolor sit amet, consectetur",
      image: require("../../assets/images/icons/icon_contact.png"),
    },
    {
      type: "device",
      name: "Keeper Device",
      info: "Lorem ipsum dolor sit amet, consectetur",
      image: require("../../assets/images/icons/icon_secondarydevice.png"),
    },
    {
      type: "pdf",
      name: "Pdf Keeper",
      info: "Lorem ipsum dolor sit amet, consectetur",
      image: require("../../assets/images/icons/files-and-folders-2.png"),
    },
  ]);
  const [SelectedKeeperType, setSelectedKeeperType] = useState({
    type: "",
    name: "",
  });
  const levelHealth: LevelHealthInterface[] = useSelector(
    (state) => state.health.levelHealth
  );
  const currentLevel = useSelector((state) => state.health.currentLevel);
  const [completedKeeperType, setCompletedKeeperType] = useState([]);

  const restrictChangeToContactType = () => {
    let completedKeeperType = [];
    let contactCount = 0;
    let pdfCount = 0;
    let deviceCount = 0;
    let levelhealth: LevelHealthInterface[] = [];
    if (
      levelHealth[1] &&
      levelHealth[1].levelInfo.findIndex((v) => v.updatedAt > 0) > -1
    )
      levelhealth = [levelHealth[1]];
    if (
      levelHealth[2] &&
      levelHealth[2].levelInfo.findIndex((v) => v.updatedAt > 0) > -1
    )
      levelhealth = [levelHealth[1], levelHealth[2]];
    if (levelHealth[2] && currentLevel == 3) levelhealth = [levelHealth[2]];
    for (let i = 0; i < levelhealth.length; i++) {
      const element = levelhealth[i];
      for (let j = 2; j < element.levelInfo.length; j++) {
        const element2 = element.levelInfo[j];
        if (
          props.keeper &&
          levelhealth[i] &&
          element2.shareType == "contact" &&
          props.keeper.shareId != element2.shareId
        ) {
          contactCount++;
        } else if (
          !props.keeper &&
          levelhealth[i] &&
          element2.shareType == "contact"
        )
          contactCount++;
        if (
          props.keeper &&
          levelhealth[i] &&
          element2.shareType == "pdf" &&
          props.keeper.shareId != element2.shareId
        ) {
          pdfCount++;
        } else if (
          !props.keeper &&
          levelhealth[i] &&
          element2.shareType == "pdf"
        )
          pdfCount++;
        if (
          props.keeper &&
          levelhealth[i] &&
          element2.shareType == "device" &&
          props.keeper.shareId != element2.shareId
        ) {
          deviceCount++;
        } else if (
          !props.keeper &&
          levelhealth[i] &&
          element2.shareType == "device"
        ) {
          deviceCount++;
        }
      }
    }
    console.log("contactCount", contactCount);
    console.log("pdfCount", pdfCount);
    console.log("deviceCount", deviceCount);
    if (contactCount >= 2) completedKeeperType.push("contact");
    if (pdfCount >= 1) completedKeeperType.push("pdf");
    if (deviceCount >= 2) completedKeeperType.push("device");
    setCompletedKeeperType(completedKeeperType);
  };

  useEffect(() => {
    restrictChangeToContactType();
  }, [levelHealth]);

  const [selectedLevelId, setSelectedLevelId] = useState(
    props.selectedLevelId ? props.selectedLevelId : false
  );
  const onKeeperSelect = (value) => {
    if (value.type != SelectedKeeperType.type) {
      setSelectedKeeperType(value);
    }
  };
  useEffect(() => {
    setSelectedLevelId(props.selectedLevelId);
  }, [props.selectedLevelId]);

  return (
    <View style={{ ...styles.modalContentContainer, height: "100%" }}>
      <View style={{ height: "100%" }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>Add Keeper</Text>
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp("1.5%"),
              color: Colors.lightTextColor,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View
          style={{
            ...styles.successModalAmountView,
            flex: 1,
          }}
        >
          {keeperTypesData.map((value, index) => {
            if (
              value.type === "pdf" &&
              completedKeeperType.findIndex((value) => value == "pdf") > -1
            ) {
              return;
            }
            if (
              value.type === "contact" &&
              completedKeeperType.findIndex((value) => value == "contact") > -1
            ) {
              return;
            }
            if (
              value.type === "device" &&
              completedKeeperType.findIndex((value) => value == "device") > -1
            ) {
              return;
            }
            return (
              <AppBottomSheetTouchableWrapper
                activeOpacity={10}
                onPress={() => onKeeperSelect(value)}
                style={styles.keeperTypeElementView}
                key={index}
              >
                <View style={styles.typeRadioButtonView}>
                  <RadioButton
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={value.type == SelectedKeeperType.type}
                    onpress={() => onKeeperSelect(value)}
                  />
                </View>
                <Image
                  style={{
                    width: wp("9%"),
                    height: wp("9%"),
                    resizeMode: "contain",
                    alignSelf: "center",
                    marginRight: wp("5%"),
                  }}
                  source={value.image}
                />
                <View>
                  <Text style={styles.keeperTypeTitle}>{value.name}</Text>
                  <Text numberOfLines={1} style={styles.keeperTypeInfo}>
                    {value.info}
                  </Text>
                </View>
              </AppBottomSheetTouchableWrapper>
            );
          })}
        </View>
        <View style={styles.successModalAmountView}>
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: wp("5%"),
              marginTop: "auto",
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View style={styles.bottomButtonView}>
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressSetup(
                SelectedKeeperType.type,
                SelectedKeeperType.name
              );
            }}
            style={{
              ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
              backgroundColor: Colors.blue,
            }}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              Setup keeper
            </Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={styles.backButtonView}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              Back
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp("8%"),
    marginLeft: wp("8%"),
    marginTop: wp("5%"),
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    marginRight: wp("8%"),
    marginLeft: wp("8%"),
    marginTop: hp("1%"),
  },
  successModalButtonView: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: "center",
    marginLeft: wp("8%"),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  typeRadioButtonView: {
    justifyContent: "center",
    width: wp("10%"),
    height: wp("10%"),
  },
  keeperTypeTitle: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
  keeperTypeInfo: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    width: wp("70%"),
  },
  bottomButtonView: {
    height: "auto",
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: wp("8%"),
  },
  backButtonView: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    alignItems: "center",
  },
  keeperTypeElementView: {
    flexDirection: "row",
    marginTop: wp("5%"),
    marginBottom: wp("5%"),
  },
});
