import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Ionicons from "react-native-vector-icons/Ionicons";
import Fonts from "../common/Fonts";
import Colors from "../common/Colors";
import CommonStyles from "../common/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import Feather from "react-native-vector-icons/Feather";
import { RFValue } from "react-native-responsive-fontsize";
import HeaderTitle from "../components/HeaderTitle";
import BottomInfoBox from "../components/BottomInfoBox";

import { useDispatch, useSelector } from "react-redux";
import { initializeSetup } from "../store/actions/setupAndAuth";

export default function NewWalletQuestion(props) {
  const [dropdownBoxOpenClose, setDropdownBoxOpenClose] = useState(false);
  const [dropdownBoxList, setDropdownBoxList] = useState([
    { id: "1", question: "Name of your first pet?" },
    { id: "2", question: "Name of your favourite food?" },
    { id: "3", question: "Name of your first company?" },
    { id: "4", question: "Name of your first employee?" },
    { id: "5", question: "Name of your first pet?" },
    { id: "6", question: "Name of your favourite teacher?" },
    { id: "7", question: "Name of your favourite teacher?" }
  ]);
  const [dropdownBoxValue, setDropdownBoxValue] = useState({
    id: "",
    question: ""
  });
  const [answerInputStyle, setAnswerInputStyle] = useState(styles.inputBox);
  const [confirmInputStyle, setConfirmAnswerInputStyle] = useState(
    styles.inputBox
  );
  const [confirmAnswer, setConfirmAnswer] = useState("");
  const [answer, setAnswer] = useState("");
  const [hideShowConfirmAnswer, setHideShowConfirmAnswer] = useState(true);
  const [hideShowAnswer, setHdeShowAnswer] = useState(true);

  const dispatch = useDispatch();
  const walletName = props.navigation.getParam("walletName");
  const { isInitialized } = useSelector(state => state.setupAndAuth);

  if (isInitialized) {
    props.navigation.navigate("HomeNav");
  }
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate("RestoreAndReoverWallet");
            }}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS == "ios" ? "padding" : ""}
          enabled
        >
          <TouchableOpacity
            activeOpacity={10}
            style={{ flex: 1 }}
            onPress={() => {
              setDropdownBoxOpenClose(false);
              Keyboard.dismiss();
            }}
          >
            <ScrollView>
              <HeaderTitle
                firstLineTitle={"New Hexa Wallet"}
                secondLineTitle={""}
                infoTextNormal={"Setup "}
                infoTextBold={"secret question and answer"}
              />
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
                <Text style={styles.dropdownBoxText}>
                  {dropdownBoxValue.question
                    ? dropdownBoxValue.question
                    : "Select Question"}
                </Text>
                <Ionicons
                  style={{ marginLeft: "auto" }}
                  name={
                    dropdownBoxOpenClose ? "ios-arrow-up" : "ios-arrow-down"
                  }
                  size={20}
                  color={Colors.textColorGrey}
                />
              </TouchableOpacity>
              {dropdownBoxOpenClose ? (
                <View style={styles.dropdownBoxModal}>
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
                </View>
              ) : null}
              {dropdownBoxValue.id ? (
                <View style={{ marginTop: 15 }}>
                  <View
                    style={{
                      ...answerInputStyle,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingRight: 15,
                      borderColor:
                        confirmAnswer && answer && confirmAnswer != answer
                          ? Colors.red
                          : Colors.borderColor
                    }}
                  >
                    <TextInput
                      style={styles.modalInputBox}
                      secureTextEntry={hideShowAnswer}
                      placeholder={"Enter your answer"}
                      placeholderTextColor={Colors.borderColor}
                      value={answer}
                      onChangeText={text => setAnswer(text)}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setAnswerInputStyle(styles.inputBoxFocused);
                      }}
                      onBlur={() => {
                        setAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                      }}
                    />
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setHdeShowAnswer(!hideShowAnswer);
                      }}
                    >
                      <Feather
                        style={{ marginLeft: "auto", padding: 10 }}
                        size={15}
                        color={Colors.blue}
                        name={hideShowAnswer ? "eye-off" : "eye"}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                  <View
                    style={{
                      ...confirmInputStyle,
                      marginBottom: 15,
                      flexDirection: "row",
                      alignItems: "center",
                      paddingRight: 15,
                      marginTop: 15,
                      borderColor:
                        confirmAnswer && answer && confirmAnswer != answer
                          ? Colors.red
                          : Colors.borderColor
                    }}
                  >
                    <TextInput
                      style={styles.modalInputBox}
                      secureTextEntry={hideShowConfirmAnswer}
                      placeholder={"Confirm your answer"}
                      placeholderTextColor={Colors.borderColor}
                      value={confirmAnswer}
                      onChangeText={text => setConfirmAnswer(text)}
                      onFocus={() => {
                        setDropdownBoxOpenClose(false);
                        setConfirmAnswerInputStyle(styles.inputBoxFocused);
                      }}
                      onBlur={() => {
                        setConfirmAnswerInputStyle(styles.inputBox);
                        setDropdownBoxOpenClose(false);
                      }}
                    />
                    <TouchableWithoutFeedback
                      onPress={() => {
                        setHideShowConfirmAnswer(!hideShowConfirmAnswer);
                        setDropdownBoxOpenClose(false);
                      }}
                    >
                      <Feather
                        style={{ marginLeft: "auto", padding: 10 }}
                        size={15}
                        color={Colors.blue}
                        name={hideShowConfirmAnswer ? "eye-off" : "eye"}
                      />
                    </TouchableWithoutFeedback>
                  </View>
                </View>
              ) : (
                <View style={{ marginTop: 15 }} />
              )}
              {confirmAnswer && answer && confirmAnswer != answer ? (
                <View
                  style={{
                    marginLeft: 20,
                    marginRight: 20,
                    flexDirection: "row"
                  }}
                >
                  <Text
                    style={{
                      color: Colors.red,
                      fontFamily: Fonts.FiraSansMediumItalic,
                      fontSize: RFValue(10, 812),
                      marginLeft: "auto"
                    }}
                  >
                    Answers do not match
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.bottomButtonView}>
              {answer.trim() == confirmAnswer.trim() &&
              confirmAnswer.trim() &&
              answer.trim() ? (
                <TouchableOpacity
                  onPress={() => dispatch(initializeSetup(walletName, answer))}
                  style={styles.buttonView}
                >
                  <Text style={styles.buttonText}>Confirm & Proceed</Text>
                </TouchableOpacity>
              ) : (
                <View
                  style={{
                    height: wp("13%"),
                    width: wp("30%")
                  }}
                />
              )}
              <View style={styles.statusIndicatorView}>
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorActiveView} />
              </View>
            </View>
            {dropdownBoxValue.id.trim() == "" ? (
              <BottomInfoBox
                title={"This question will serve as a hint"}
                infoText={"For you to remember what the answer was"}
              />
            ) : null}
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dropdownBox: {
    flexDirection: "row",
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    alignItems: "center"
  },
  dropdownBoxOpened: {
    flexDirection: "row",
    borderColor: Colors.borderColor,
    borderWidth: 0.5,
    borderRadius: 10,
    marginTop: 30,
    height: 50,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 15,
    paddingRight: 15,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white,
    alignItems: "center"
  },
  buttonView: {
    height: wp("13%"),
    width: wp("35%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.blue
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  bottomButtonView: {
    flexDirection: "row",
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 40,
    paddingTop: 30,
    alignItems: "center"
  },
  statusIndicatorView: {
    flexDirection: "row",
    marginLeft: "auto"
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5
  },
  statusIndicatorInactiveView: {
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 2, height: 2 },
    backgroundColor: Colors.white
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13, 812),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15
  },
  dropdownBoxText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13, 812)
  },
  dropdownBoxModal: {
    borderRadius: 10,
    margin: 15,
    height: "auto",
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 10 },
    backgroundColor: Colors.white
  },
  dropdownBoxModalElementView: {
    height: 55,
    justifyContent: "center",
    paddingLeft: 15,
    paddingRight: 15
  }
});
