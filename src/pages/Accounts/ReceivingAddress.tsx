import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity,SafeAreaView,
  StatusBar } from "react-native";
import Fonts from "../../common/Fonts";
import BackupStyles from "../ManageBackup/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import BottomInfoBox from "../../components/BottomInfoBox";
import QRCode from "react-native-qrcode-svg";
import CopyThisText from "../../components/CopyThisText";
import { useDispatch, useSelector } from "react-redux";
import { SECURE_ACCOUNT } from "../../common/constants/serviceTypes";
import { fetchAddress } from "../../store/actions/accounts";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from "../../common/Colors";

const ReceivingAddress = props => {
  const serviceType = props.navigation.getParam("serviceType");

  const { loading, service } = useSelector(
    state => state.accounts[serviceType]
  );

  const { receivingAddress } =
    serviceType === SECURE_ACCOUNT ? service.secureHDWallet : service.hdWallet;

  const dispatch = useDispatch();
  useEffect(() => {
    if (!receivingAddress) dispatch(fetchAddress(serviceType));
  }, [serviceType]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
    <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
    <View style={BackupStyles.modalContainer}>
      <View style={BackupStyles.modalHeaderTitleView}>
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
          <Text style={BackupStyles.modalHeaderTitleText}>
            Receiving Address
          </Text>
          </View>
      </View>
      <View style={BackupStyles.modalContentView}>
        {!receivingAddress ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={receivingAddress} size={hp("27%")} />
        )}
        {receivingAddress ? <CopyThisText text={receivingAddress} /> : null}
      </View>
      <BottomInfoBox
        title={"Note"}
        infoText={
          "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
        }
      />
    </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp("27%"), justifyContent: "center" }
});

export default ReceivingAddress;
