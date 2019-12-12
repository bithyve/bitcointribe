import React, { useState } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
  TextInput
} from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Ionicons from "react-native-vector-icons/Ionicons";
import KnowMoreButton from "../../components/KnowMoreButton";

export default function RecoveryQuestionModalContents(props) {
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: "",
    question: ""
  });
  const [answer, setAnswer] = useState("");
  const [dropdownBoxList, setDropdownBoxList] = useState([
    { id: "1", question: "Name of your first pet?" },
    { id: "2", question: "Name of your favourite food?" },
    { id: "3", question: "Name of your first company?" },
    { id: "4", question: "Name of your first employee?" },
    { id: "5", question: "Name of your first pet?" },
    { id: "6", question: "Name of your favourite teacher?" },
    { id: "7", question: "Name of your favourite teacher?" }
  ]);

  return (
    <View style={{ ...styles.modalContentContainer, height: "100%" }}>
      <View>
        <View style={{ flexDirection: "row", padding: wp("7%") }}>
          <View style={{ flex: 3, justifyContent: "center" }}>
            <Text style={styles.modalTitleText}>
              Enter Security Question{"\n"}and Answer
            </Text>
            <Text style={{ ...styles.modalInfoText, marginTop: wp("1.5%") }}>
              To recover your wallet you have to select the security question
              and enter its answer
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <KnowMoreButton
              onpress={() => {}}
              containerStyle={{ marginLeft: "auto", marginTop: 10 }}
              textStyle={{}}
            />
          </View>
        </View>
        <View style={{ paddingLeft: wp("6%"), paddingRight: wp("6%") }}>
          <TouchableOpacity
            activeOpacity={10}
            style={
              dropdownBoxOpenClose
                ? styles.dropdownBoxOpened
                : styles.dropdownBox
            }
            onPress={() => {
              setDropdownBoxOpenClose(!dropdownBoxOpenClose);
            }}
          >
            <Text
              style={{
                ...styles.dropdownBoxText,
                color: dropdownBoxValue.question
                  ? Colors.textColorGrey
                  : Colors.borderColor
              }}
            >
              {dropdownBoxValue.question
                ? dropdownBoxValue.question
                : "Select Security Question"}
            </Text>
            <Ionicons
              style={{ marginLeft: "auto" }}
              name={dropdownBoxOpenClose ? "ios-arrow-up" : "ios-arrow-down"}
              size={15}
              color={Colors.borderColor}
            />
          </TouchableOpacity>
          <View style={{ position: "relative" }}>
            {dropdownBoxOpenClose && (
              <View style={styles.dropdownBoxModal}>
                <ScrollView>
                  {dropdownBoxList.map((value, index) => (
                    <TouchableOpacity
                      onPress={() => {
                        setDropdownBoxValue(value);
                        setDropdownBoxOpenClose(false);
                      }}
                      style={{
                        ...styles.dropdownBoxModalElementView,
                        borderTopLeftRadius: index == 0 ? 10 : 0,
                        borderTopRightRadius: index == 0 ? 10 : 0,
                        borderBottomLeftRadius:
                          index == dropdownBoxList.length - 1 ? 10 : 0,
                        borderBottomRightRadius:
                          index == dropdownBoxList.length - 1 ? 10 : 0,
                        paddingTop: index == 0 ? 5 : 0,
                        backgroundColor:
                          dropdownBoxValue.id == value.id
                            ? Colors.lightBlue
                            : Colors.white
                      }}
                    >
                      <Text
                        style={{
                          color:
                            dropdownBoxValue.id == value.id
                              ? Colors.blue
                              : Colors.black,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(12, 812)
                        }}
                      >
                        {value.question}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
            <TextInput
              style={{
                ...styles.inputBox,
                width: "100%",
                marginTop: 15,
                marginBottom: hp("6%")
              }}
              placeholder={"Enter Security Answer"}
              placeholderTextColor={Colors.borderColor}
              value={answer}
              onChangeText={text => {
                setAnswer(text);
              }}
              onFocus={() => {
                setDropdownBoxOpenClose(false);
              }}
              onBlur={() => {
                setDropdownBoxOpenClose(false);
              }}
            />
            <Text style={styles.modalInfoText}>
              The Security Answer is case sensitive, make sure you{"\n"}enter
              the case, numeric or symbolic values correctly
            </Text>
          </View>
          <TouchableOpacity
            disabled={dropdownBoxValue.id && answer ? false : true}
            onPress={() =>
              props.navigation.navigate("RestoreSelectedContactsList")
            }
            style={styles.questionConfirmButton}
          >
            <Text style={styles.proceedButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderLeftColor: Colors.borderColor,
    borderLeftWidth: 1,
    borderTopRightRadius: 10,
    borderRightColor: Colors.borderColor,
    borderRightWidth: 1,
    borderTopColor: Colors.borderColor,
    borderTopWidth: 1
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  dropdownBoxText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13, 812)
  },
  dropdownBoxModal: {
    borderRadius: 10,
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    marginTop: hp("1%"),
    width: "100%",
    height: "110%",
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white,
    position: "absolute",
    zIndex: 9999,
    overflow: "hidden"
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: "center",
    paddingLeft: 15,
    paddingRight: 15
  },
  dropdownBox: {
    marginTop: hp("2%"),
    flexDirection: "row",
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: "center",
    backgroundColor: Colors.white
  },
  dropdownBoxOpened: {
    marginTop: hp("2%"),
    flexDirection: "row",
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: "center"
  },
  questionConfirmButton: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    borderRadius: 8,
    alignItems: "center",
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue,
    marginTop: hp("6%")
  },
  inputBox: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp("85%"),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13, 812),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular
  },
  inputBoxFocused: {
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    width: wp("85%"),
    height: 50,
    paddingLeft: 15,
    fontSize: RFValue(13, 812),
    color: Colors.textColorGrey,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    fontFamily: Fonts.FiraSansRegular
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  }
});
