import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  TouchableWithoutFeedback,
  TouchableOpacity,
  StatusBar
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import { useDispatch, useSelector } from "react-redux";
import { storeCreds } from "../store/actions/setupAndAuth";

export default function PasscodeConfirm(props) {
  const [passcode, setPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");
  const [passcodeFlag, setPasscodeFlag] = useState(true);
  const [confirmPasscodeFlag, setConfirmPasscodeFlag] = useState(0);

  function onPressNumber(text) {
    let tmpPasscode = passcode;
    let tmpConfirmPasscode = confirmPasscode;
    if (passcodeFlag) {
      if (passcode.length < 4) {
        if (text != "x") {
          tmpPasscode += text;
          setPasscode(tmpPasscode);
        }
      }
      if (passcode && text == "x") {
        setPasscode(passcode.slice(0, -1));
      }
    } else if (confirmPasscodeFlag) {
      if (confirmPasscode.length < 4) {
        if (text != "x") {
          tmpConfirmPasscode += text;
          setConfirmPasscode(tmpConfirmPasscode);
        }
      }
      if (confirmPasscode && text == "x") {
        setConfirmPasscode(confirmPasscode.slice(0, -1));
      }
    }
  }

  useEffect(() => {
    if (confirmPasscode.length == 4 && passcode.length == 4) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(2);
    } else if (passcode.length == 4 && confirmPasscodeFlag != 2) {
      setPasscodeFlag(false);
      setConfirmPasscodeFlag(1);
    } else if (
      !confirmPasscode &&
      passcode.length == 4 &&
      confirmPasscodeFlag == 2
    ) {
      setPasscodeFlag(true);
      setConfirmPasscodeFlag(0);
    }
  }, [passcode, confirmPasscode]);

  const dispatch = useDispatch();
  const { hasCreds } = useSelector(state => state.setupAndAuth);
  if (hasCreds) props.navigation.replace("RestoreAndReoverWallet");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar />
      <View style={{ flex: 1 }}>
        <View style={{}}>
          <Text style={styles.headerTitleText}>Hello!</Text>
          <View>
            <Text style={styles.headerInfoText}>
              Please enter a <Text style={styles.boldItalicText}>passcode</Text>
            </Text>

            <View>
              <View style={styles.passcodeTextInputView}>
                <View
                  style={[
                    passcode.length == 0 && passcodeFlag == true
                      ? styles.textBoxActive
                      : styles.textBoxStyles
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 0 && passcodeFlag == true
                        ? styles.textFocused
                        : styles.textStyles
                    ]}
                  >
                    {passcode.length >= 1 ? (
                      <Text
                        style={{
                          fontSize: RFValue(10, 812),
                          textAlignVertical: "center",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        <FontAwesome
                          size={8}
                          name={"circle"}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 0 && passcodeFlag == true ? (
                      <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                    ) : (
                      ""
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 1
                      ? styles.textBoxActive
                      : styles.textBoxStyles
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 1
                        ? styles.textFocused
                        : styles.textStyles
                    ]}
                  >
                    {passcode.length >= 2 ? (
                      <Text style={{ fontSize: RFValue(10, 812) }}>
                        <FontAwesome
                          size={8}
                          name={"circle"}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 1 ? (
                      <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                    ) : (
                      ""
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 2
                      ? styles.textBoxActive
                      : styles.textBoxStyles
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 2
                        ? styles.textFocused
                        : styles.textStyles
                    ]}
                  >
                    {passcode.length >= 3 ? (
                      <Text style={{ fontSize: RFValue(10, 812) }}>
                        <FontAwesome
                          size={8}
                          name={"circle"}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 2 ? (
                      <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                    ) : (
                      ""
                    )}
                  </Text>
                </View>
                <View
                  style={[
                    passcode.length == 3
                      ? styles.textBoxActive
                      : styles.textBoxStyles
                  ]}
                >
                  <Text
                    style={[
                      passcode.length == 3
                        ? styles.textFocused
                        : styles.textStyles
                    ]}
                  >
                    {passcode.length >= 4 ? (
                      <Text style={{ fontSize: RFValue(10, 812) }}>
                        <FontAwesome
                          size={8}
                          name={"circle"}
                          color={Colors.black}
                        />
                      </Text>
                    ) : passcode.length == 3 ? (
                      <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                    ) : (
                      ""
                    )}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {passcode.length == 4 ? (
            <View>
              <Text style={styles.headerInfoText}>
                Re-enter the <Text style={styles.boldItalicText}>passcode</Text>
                to <Text style={styles.boldItalicText}>verify and login.</Text>
              </Text>
              <View>
                <View style={{ flexDirection: "row", marginTop: hp("1.5%") }}>
                  <View
                    style={[
                      confirmPasscode.length == 0
                        ? styles.textBoxActive
                        : {
                            ...styles.textBoxStyles,
                            borderColor:
                              passcode != confirmPasscode &&
                              confirmPasscode.length == 4
                                ? Colors.red
                                : Colors.borderColor
                          }
                    ]}
                  >
                    <Text
                      style={[
                        confirmPasscode.length == 0 && confirmPasscodeFlag == 1
                          ? { ...styles.textFocused }
                          : styles.textStyles
                      ]}
                    >
                      {confirmPasscode.length >= 1 ? (
                        <Text style={{ fontSize: RFValue(10, 812) }}>
                          <FontAwesome
                            size={8}
                            name={"circle"}
                            color={Colors.black}
                          />
                        </Text>
                      ) : confirmPasscode.length == 0 &&
                        confirmPasscodeFlag == 1 ? (
                        <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                      ) : (
                        ""
                      )}
                    </Text>
                  </View>
                  <View
                    style={[
                      confirmPasscode.length == 1
                        ? styles.textBoxActive
                        : {
                            ...styles.textBoxStyles,
                            borderColor:
                              passcode != confirmPasscode &&
                              confirmPasscode.length == 4
                                ? Colors.red
                                : Colors.borderColor
                          }
                    ]}
                  >
                    <Text
                      style={[
                        confirmPasscode.length == 1
                          ? {
                              ...styles.textFocused,
                              borderColor: Colors.borderColor
                            }
                          : styles.textStyles,
                        {
                          borderColor:
                            passcode != confirmPasscode &&
                            confirmPasscode.length == 4
                              ? Colors.red
                              : Colors.borderColor
                        }
                      ]}
                    >
                      {confirmPasscode.length >= 2 ? (
                        <Text style={{ fontSize: RFValue(10, 812) }}>
                          <FontAwesome
                            size={8}
                            name={"circle"}
                            color={Colors.black}
                          />
                        </Text>
                      ) : confirmPasscode.length == 1 ? (
                        <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                      ) : (
                        ""
                      )}
                    </Text>
                  </View>
                  <View
                    style={[
                      confirmPasscode.length == 2
                        ? styles.textBoxActive
                        : {
                            ...styles.textBoxStyles,
                            borderColor:
                              passcode != confirmPasscode &&
                              confirmPasscode.length == 4
                                ? Colors.red
                                : Colors.borderColor
                          }
                    ]}
                  >
                    <Text
                      style={[
                        confirmPasscode.length == 2
                          ? {
                              ...styles.textFocused,
                              borderColor: Colors.borderColor
                            }
                          : styles.textStyles,
                        {
                          borderColor:
                            passcode != confirmPasscode &&
                            confirmPasscode.length == 4
                              ? Colors.red
                              : Colors.borderColor
                        }
                      ]}
                    >
                      {confirmPasscode.length >= 3 ? (
                        <Text style={{ fontSize: RFValue(10, 812) }}>
                          <FontAwesome
                            size={8}
                            name={"circle"}
                            color={Colors.black}
                          />
                        </Text>
                      ) : confirmPasscode.length == 2 ? (
                        <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                      ) : (
                        ""
                      )}
                    </Text>
                  </View>
                  <View
                    style={[
                      confirmPasscode.length == 3
                        ? styles.textBoxActive
                        : {
                            ...styles.textBoxStyles,
                            borderColor:
                              passcode != confirmPasscode &&
                              confirmPasscode.length == 4
                                ? Colors.red
                                : Colors.borderColor
                          }
                    ]}
                  >
                    <Text
                      style={[
                        confirmPasscode.length == 3
                          ? {
                              ...styles.textFocused,
                              borderColor: Colors.borderColor
                            }
                          : styles.textStyles,
                        {
                          borderColor:
                            passcode != confirmPasscode &&
                            confirmPasscode.length == 4
                              ? Colors.red
                              : Colors.borderColor
                        }
                      ]}
                    >
                      {confirmPasscode.length >= 4 ? (
                        <Text style={{ fontSize: RFValue(10, 812) }}>
                          <FontAwesome
                            size={8}
                            name={"circle"}
                            color={Colors.black}
                          />
                        </Text>
                      ) : confirmPasscode.length == 3 ? (
                        <Text style={styles.passcodeTextInputText}>{"|"}</Text>
                      ) : (
                        ""
                      )}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity
                disabled={passcode == confirmPasscode ? false : true}
                onPress={() => dispatch(storeCreds(passcode))}
                style={{
                  ...styles.proceedButtonView,
                  backgroundColor:
                    passcode == confirmPasscode ? Colors.blue : Colors.lightBlue
                }}
              >
                <Text style={styles.proceedButtonText}>Proceed</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
        <View style={{ marginTop: "auto" }}>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber("1")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("1")}
              >
                1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("2")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("2")}
              >
                2
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("3")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("3")}
              >
                3
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber("4")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("4")}
              >
                4
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("5")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("5")}
              >
                5
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("6")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("6")}
              >
                6
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <TouchableOpacity
              onPress={() => onPressNumber("7")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("7")}
              >
                7
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("8")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("8")}
              >
                8
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("9")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("9")}
              >
                9
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.keyPadRow}>
            <View style={styles.keyPadElementTouchable}>
              <Text style={{ flex: 1, padding: 15 }}></Text>
            </View>
            <TouchableOpacity
              onPress={() => onPressNumber("0")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("0")}
              >
                0
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onPressNumber("x")}
              style={styles.keyPadElementTouchable}
            >
              <Text
                style={styles.keyPadElementText}
                onPress={() => onPressNumber("x")}
              >
                <Ionicons name="ios-backspace" size={30} color={Colors.blue} />
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp("13%"),
    width: wp("13%"),
    borderRadius: 7,
    marginLeft: 20,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp("13%"),
    width: wp("13%"),
    borderRadius: 7,
    marginLeft: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white
  },
  textStyles: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  textFocused: {
    color: Colors.black,
    fontSize: RFValue(13, 812),
    textAlign: "center",
    lineHeight: 18
  },
  keyPadRow: {
    flexDirection: "row",
    height: hp("8%")
  },
  keyPadElementTouchable: {
    flex: 1,
    height: hp("8%"),
    fontSize: RFValue(18, 812),
    justifyContent: "center",
    alignItems: "center"
  },
  keyPadElementText: {
    color: Colors.blue,
    fontSize: RFValue(25, 812),
    fontFamily: Fonts.FiraSansRegular,
    fontStyle: "normal"
  },
  proceedButtonView: {
    marginLeft: 20,
    marginTop: hp("4%"),
    height: wp("13%"),
    width: wp("30%"),
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 }
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontWeight: "bold",
    fontStyle: "italic"
  },
  headerTitleText: {
    color: Colors.blue,
    fontSize: RFValue(25, 812),
    marginLeft: 20,
    marginTop: hp("10%"),
    fontFamily: Fonts.FiraSansRegular
  },
  headerInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12, 812),
    marginLeft: 20,
    fontFamily: Fonts.FiraSansRegular
  },
  passcodeTextInputText: {
    color: Colors.blue,
    fontWeight: "bold",
    fontSize: RFValue(13, 812)
  },
  passcodeTextInputView: {
    flexDirection: "row",
    marginTop: hp("4.5%"),
    marginBottom: hp("4.5%")
  }
});
