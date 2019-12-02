import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";
import Fonts from "../../../common/Fonts";
import Colors from "../../../common/Colors";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import BottomInfoBox from "../../BottomInfoBox";
import QRCode from "react-native-qrcode-svg";
import CopyThisText from "../../CopyThisText";
import { useDispatch, useSelector } from "react-redux";
import { uploadEncMShare } from "../../../store/actions/sss";

const SecondaryDevice = props => {
  console.log("Re-rendering");
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
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
          <Text style={styles.modalHeaderTitleText}>Secondary Device</Text>
          <Text style={styles.modalHeaderInfoText}>
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
          style={styles.cardIconImage}
          source={props.getIconByStatus(selectedStatus)}
        />
      </View>
      <View style={styles.modalContentView}>
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
  cardIconImage: {
    width: 12,
    height: 14,
    resizeMode: "contain",
    marginLeft: "auto"
  },
  modalContainer: {
    height: "100%",
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: Colors.borderColor,
    alignSelf: "center",
    width: "100%"
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginTop: 20,
    marginRight: 20,
    marginBottom: 15
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18, 812),
    fontFamily: Fonts.FiraSansMedium
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12, 812),
    marginTop: 5
  },
  modalContentView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  loader: { height: hp("27%"), justifyContent: "center" }
});

export default SecondaryDevice;
