import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
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
  }, []);

  return (
    <View style={BackupStyles.modalContainer}>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
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
  );
};

const styles = StyleSheet.create({
  loader: { height: hp("27%"), justifyContent: "center" }
});

export default ReceivingAddress;
