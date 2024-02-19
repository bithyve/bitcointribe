import React, { useRef, useState, Dispatch, SetStateAction, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import {
  widthPercentageToDP as wp,
} from "react-native-responsive-screen";
import Colors from "../common/Colors";
import { RFValue } from "react-native-responsive-fontsize";

export type IPassCodeTextBoxProps = {
  passcode: string;
  setPasscode: Dispatch<SetStateAction<string>>;
  setDisabled: Dispatch<SetStateAction<boolean>>;
};

const PassCodeTextBox: React.FC<IPassCodeTextBoxProps> = ({passcode, setPasscode, setDisabled}) => {
  const ref = useRef<TextInput>();

  const [errMsg, setErrmsg] = useState<string>("");

  const [active, setActive] = useState<boolean>(false);

  useEffect(()=>{
if(active)
ref.current.focus()
// setTimeout(() => ref.current.focus(), 100);
  },[active])

  useEffect(() => {
    if (passcode.length === 6) {
      setErrmsg('');
      setDisabled(false);
    }
  }, [passcode]);

  return (
    <View style={{
      alignSelf: 'center',
    }}>
      <TextInput
        ref={ref}
        style={styles.textBoxStyles}
        // style={{ display: "none" }}
        value={passcode}
        onChangeText={(text) => {
          if (text.length <= 6) {
            setPasscode(text);
          }
        }}
        // returnKeyType="done"
        // returnKeyLabel="Done"
        // keyboardType={
        //   Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
        // }
        // onFocus={() => {
        //   // if ( Platform.OS == 'ios' ) {
        //   // props.bottomSheetRef.current?.expand()
        //   setDisabled( true )
        //   // }
        // }}
        // onBlur={() => {
        //   // if ( Platform.OS == 'ios' ) {
        //   if (
        //     ( passcode.length == 0 ||
        //       passcode.length == 6 ) 
        //   ) {
        //     // props.bottomSheetRef.current?.snapTo( 1 )
        //     setDisabled( false )
        //   }
        //   // }
        // }}
        // autoCorrect={false}
        // onLayout={()=> ref.current.focus()}
        // autoCompleteType="off"
      />
      <Text style={{color: 'red'}}>{errMsg}</Text>
      <TouchableOpacity
        onPress={() => {
          // setTimeout(() => ref.current.focus(), 1000);
          setActive(true);
        }}
        onLongPress={async () => {
          const data = await Clipboard.getString();
          if (data.length !== 6) {
            setErrmsg("You are trying to copy invalid OTP");
          } else {
            setPasscode(data.toUpperCase());
          }
        }}
      >
        {/* <View
          style={{
            flexDirection: "row",
            marginBottom: wp("5%"),
          }}
        >
          <Text style={active && passcode.length === 0 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 1 ? passcode[0] : active ? "|" : ""}
          </Text>
          <Text style={active && passcode.length === 1 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 2
              ? passcode[1]
              : active && passcode.length === 1
              ? "|"
              : ""}
          </Text>
          <Text style={active && passcode.length === 2 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 3
              ? passcode[2]
              : active && passcode.length === 2
              ? "|"
              : ""}
          </Text>
          <Text style={active && passcode.length === 3 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 4
              ? passcode[3]
              : active && passcode.length === 3
              ? "|"
              : ""}
          </Text>
          <Text style={active && passcode.length === 4 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 5
              ? passcode[4]
              : active && passcode.length === 4
              ? "|"
              : ""}
          </Text>
          <Text style={active && passcode.length === 5 ? styles.textBoxActive : styles.textBoxStyles}>
            {passcode.length >= 6
              ? passcode[5]
              : active && passcode.length === 5
              ? "|"
              : ""}
          </Text>
        </View> */}
      </TouchableOpacity>
    </View>
  );
};

export default PassCodeTextBox;

const styles = StyleSheet.create({
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("80%"),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(20),
    // textAlign: "center",
    paddingHorizontal: 20,
    textAlignVertical: 'center'
  },
  textBoxActive: {
    flexDirection: 'row',
    borderWidth: 0.5,
    height: wp("12%"),
    width: wp("12%"),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    borderColor: Colors.borderColor,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(20),
    textAlign: "center",
    textAlignVertical: 'center'
  },
});
