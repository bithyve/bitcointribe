import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Button,
  SafeAreaView,
  StatusBar
} from "react-native";
import Colors from "../../common/Colors";
import Fonts from "../../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Slider from "react-native-slider";
import { useDispatch, useSelector } from "react-redux";
import {
  transferST1,
  clearTransfer,
  transferST2,
  fetchTransactions,
  transferST3
} from "../../store/actions/accounts";
import SendStatusModalContents from "../../components/SendStatusModalContents";
import TransparentHeaderModal from "../../components/TransparentHeaderModal";
import BottomSheet from "reanimated-bottom-sheet";
import CustodianRequestOtpModalContents from "../../components/CustodianRequestOtpModalContents";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";

export default function Send(props) {
  const serviceType = props.navigation.getParam("serviceType");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState();
  const [token, setToken] = useState("");
  const [description, setDescription] = useState("");
  const [sliderValue, setSliderValue] = useState(4);
  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef()
  );

  const stage2 = () => (
    <View style={{ margin: 40 }}>
      <Text style={{ marginVertical: 5 }}>Sending to: {recipientAddress}</Text>
      <Text style={{ marginVertical: 5 }}>Amount: {amount}</Text>
      <Text style={{ marginVertical: 10 }}>
        Transaction Fee: {transfer.stage1.fee}
      </Text>
      {loading.transfer ? (
        <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
      ) : (
        <View>
          <Button
            title="Send"
            onPress={() => {
              dispatch(transferST2(serviceType));
            }}
          />
          <Button
            title="Cancel"
            onPress={() => {
              dispatch(clearTransfer(serviceType));
            }}
          />
        </View>
      )}
    </View>
  );

  const renderSuccessStatusContents = () => (
    <SendStatusModalContents
      title1stLine={"Sent Successfully"}
      title2ndLine={""}
      info1stLine={"Bitcoins successfully sent to"}
      info2ndLine={""}
      userName={recipientAddress}
      modalRef={SendSuccessBottomSheet}
      isSuccess={true}
      onPressViewAccount={() => {
        dispatch(clearTransfer(serviceType));
        dispatch(fetchTransactions(serviceType));
        props.navigation.navigate("Accounts");
      }}
      transactionId={transfer.txid}
      transactionDateTime={Date()}
    />
  );

  const dispatch = useDispatch();

  const { transfer, loading } = useSelector(
    state => state.accounts[serviceType]
  );

  if (transfer.txid) return renderSuccessStatusContents();
  else if (!transfer.txid && transfer.executed === "ST2")
    props.navigation.navigate("TwoFAToken", { serviceType, recipientAddress });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
    <View style={styles.modalContentContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == "ios" ? "padding" : ""}
        enabled
      >
        <ScrollView>
          <View style={styles.modalHeaderTitleView}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => {props.navigation.goBack();}}
                style={{ height: 30, width: 30, justifyContent: "center" }}
              >
                <FontAwesome
                  name="long-arrow-left"
                  color={Colors.blue}
                  size={17}
                />
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitleText}>{"Send"}</Text>
            </View>
          </View>
          <View style={{ paddingLeft: 20, paddingRight: 20 }}>
            <View style={styles.textBoxView}>
              <TextInput
                // ref={refs => setTextContactNameRef(refs)}
                style={styles.textBox}
                placeholder={"Address"}
                value={recipientAddress}
                onChangeText={setRecipientAddress}
                placeholderTextColor={Colors.borderColor}
                // onFocus={() => {
                //   props.modalRef.current.snapTo(2);
                // }}
                // onBlur={() => {
                //   if (
                //     !textAmountRef.isFocused() &&
                //     !descriptionRef.isFocused()
                //   ) {
                //     props.modalRef.current.snapTo(1);
                //   }
                // }}
              />
              {/* <View style={styles.contactNameInputImageView}>
                <Image
                  style={styles.textBoxImage}
                  source={require("../../assets/images/icons/phone-book.png")}
                />
              </View> */}
            </View>
            <View style={styles.textBoxView}>
              <View style={styles.amountInputImage}>
                <Image
                  style={styles.textBoxImage}
                  source={require("../../assets/images/icons/icon_bitcoin_gray.png")}
                />
              </View>
              <TextInput
                // ref={refs => setTextAmountRef(refs)}
                style={{ ...styles.textBox, paddingLeft: 10 }}
                placeholder={"Enter Amount"}
                value={amount}
                onChangeText={setAmount}
                placeholderTextColor={Colors.borderColor}
                // onFocus={() => {
                //   props.modalRef.current.snapTo(2);
                // }}
                // onBlur={() => {
                //   if (
                //     !descriptionRef.isFocused() &&
                //     !textContactNameRef.isFocused()
                //   ) {
                //     props.modalRef.current.snapTo(1);
                //   }
                // }}
              />
            </View>
            <View style={{ ...styles.textBoxView, height: 100 }}>
              <TextInput
                // ref={refs => setDescriptionRef(refs)}
                multiline={true}
                numberOfLines={4}
                style={{
                  ...styles.textBox,
                  paddingRight: 20,
                  marginTop: 10,
                  marginBottom: 10
                }}
                placeholder={"Description (Optional)"}
                value={description}
                onChangeText={setDescription}
                placeholderTextColor={Colors.borderColor}
                // onFocus={() => {
                //   props.modalRef.current.snapTo(2);
                // }}
                // onBlur={() => {
                //   if (
                //     !textAmountRef.isFocused() &&
                //     !textContactNameRef.isFocused()
                //   ) {
                //     props.modalRef.current.snapTo(1);
                //   }
                // }}
              />
            </View>
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: Colors.borderColor,
              marginRight: 10,
              marginLeft: 10,
              marginTop: hp("3%"),
              marginBottom: hp("3%")
            }}
          />
          <View style={{ paddingLeft: 20, paddingRight: 20 }}>
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(13, 812),
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Transaction Priority
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12, 812),
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Set priority for your transaction
            </Text>
            <View
              style={{
                ...styles.textBoxView,
                height: 55,
                marginTop: hp("2%"),
                alignItems: "center",
                paddingLeft: 10,
                paddingRight: 10
              }}
            >
              <Slider
                style={{ flex: 1, marginRight: 10 }}
                minimumValue={0}
                maximumValue={10}
                minimumTrackTintColor={Colors.blue}
                maximumTrackTintColor={Colors.borderColor}
                thumbStyle={{
                  borderWidth: 5,
                  borderColor: Colors.white,
                  backgroundColor: Colors.blue,
                  height: 30,
                  width: 30,
                  borderRadius: 15
                }}
                trackStyle={{ height: 8, borderRadius: 10 }}
                thumbTouchSize={{
                  width: 30,
                  height: 30,
                  backgroundColor: "blue"
                }}
                value={sliderValue}
                onValueChange={value => setSliderValue(value)}
              />
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(13, 812),
                  fontFamily: Fonts.FiraSansRegular,
                  marginLeft: "auto"
                }}
              >
                Low
              </Text>
            </View>
          </View>
          <View
            style={{ paddingLeft: 20, paddingRight: 20, marginTop: hp("5%") }}
          >
            <Text
              style={{
                color: Colors.blue,
                fontSize: RFValue(13, 812),
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Transaction Fee
            </Text>
            <Text
              style={{
                color: Colors.textColorGrey,
                fontSize: RFValue(12, 812),
                fontFamily: Fonts.FiraSansRegular
              }}
            >
              Transaction fee will be calculated in the next step according to
              the amount of money being sent
            </Text>
          </View>
          <View
            style={{
              paddingLeft: 20,
              paddingRight: 20,
              flexDirection: "row",
              marginTop: hp("5%"),
              marginBottom: hp("3%")
            }}
          >
            <TouchableOpacity
              onPress={() => {
                dispatch(
                  transferST1(serviceType, {
                    recipientAddress,
                    amount: parseInt(amount)
                  })
                );
              }}
              disabled={loading.transfer}
              style={styles.confirmButtonView}
            >
              {loading.transfer ? (
                <ActivityIndicator size="small" />
              ) : (
                <Text style={styles.buttonText}>Confirm</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                ...styles.confirmButtonView,
                width: wp("30%"),
                backgroundColor: Colors.white
              }}
              onPress={() => {
                dispatch(clearTransfer(serviceType));
                props.navigation.goBack();
              }}
            >
              <Text style={{ ...styles.buttonText, color: Colors.blue }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
          {transfer.executed === "ST1" ? stage2() : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: "100%",
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10,
    paddingBottom: hp("1.5%"),
    paddingTop: hp("1%"),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp("1.5%")
  },
  textBoxView: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginTop: hp("1%"),
    marginBottom: hp("1%")
  },
  contactNameInputImageView: {
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  textBoxImage: {
    width: wp("6%"),
    height: wp("6%"),
    resizeMode: "contain"
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13, 812)
  },
  confirmButtonView: {
    width: wp("50%"),
    height: wp("13%"),
    backgroundColor: Colors.blue,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansMedium
  }
});
