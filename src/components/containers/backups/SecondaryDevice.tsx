import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import Fonts from "../../../common/Fonts";
import BackupStyles from "./Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import BottomInfoBox from "../../BottomInfoBox";
import QRCode from "react-native-qrcode-svg";
import CopyThisText from "../../CopyThisText";
import { useDispatch, useSelector } from "react-redux";
import { uploadEncMShare } from "../../../store/actions/sss";

const SecondaryDevice = props => {
  const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
  const [secondaryQR, setSecondaryQR] = useState("");
  const { SHARES_TRANSFER_DETAILS } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  const { loading } = useSelector(state => state.sss);

  SHARES_TRANSFER_DETAILS[0] && !secondaryQR
    ? setSecondaryQR(
        JSON.stringify({
          ...SHARES_TRANSFER_DETAILS[0],
          type: "secondaryDeviceQR"
        })
      )
    : null;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!secondaryQR) {
      dispatch(uploadEncMShare(0));
    }
  }, []);

  return (
    <View style={BackupStyles.modalContainer}>
      <View style={BackupStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
          <Text style={BackupStyles.modalHeaderTitleText}>
            Secondary Device
          </Text>
          <Text style={BackupStyles.modalHeaderInfoText}>
            Last backup{" "}
            <Text
              style={{
                fontFamily: Fonts.FiraSansMediumItalic,
                fontWeight: "bold"
              }}
            >
              {"3 months ago"}
            </Text>
          </Text>
        </View>
        <Image
          style={BackupStyles.cardIconImage}
          source={props.getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={BackupStyles.modalContentView}>
        {loading.uploadMetaShare || !secondaryQR ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <QRCode value={secondaryQR} size={hp("27%")} />
        )}
        {secondaryQR ? <CopyThisText text={secondaryQR} /> : null}
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

export default SecondaryDevice;
