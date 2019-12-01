import React, { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import CopyThisText from "../components/CopyThisText";
import QRCode from "react-native-qrcode-svg";
import { useDispatch, useSelector } from "react-redux";
import { uploadEncMShare } from "../store/actions/sss";

const SecondaryQR = props => {
  const dispatch = useDispatch();
  const [secondaryQR, setSecondaryQR] = useState("");
  const { SHARES_TRANSFER_DETAILS } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  SHARES_TRANSFER_DETAILS[0] && !secondaryQR
    ? setSecondaryQR(
        JSON.stringify({
          ...SHARES_TRANSFER_DETAILS[0],
          type: "secondaryDeviceQR"
        })
      )
    : null;

  useEffect(() => {
    if (!secondaryQR) {
      dispatch(uploadEncMShare(0));
    }
  }, []);

  return (
    <View style={{ ...props.style }}>
      <QRCode
        value={secondaryQR ? secondaryQR : "Place holder"}
        size={hp("27%")}
      />
      <CopyThisText text={secondaryQR} />
    </View>
  );
};

const styles = StyleSheet.create({});

export default React.memo(SecondaryQR);
