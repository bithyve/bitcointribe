import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image, Platform } from "react-native";
import Fonts from "../../../common/Fonts";
import BackupStyles from "./Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import BottomInfoBox from "../../BottomInfoBox";
import CopyThisText from "../../CopyThisText";
import { useDispatch, useSelector } from "react-redux";
import { uploadEncMShare, ErrorSending } from "../../../store/actions/sss";
import ErrorModalContents from '../../../components/ErrorModalContents';
import ModalHeader from '../../../components/ModalHeader';
import DeviceInfo from "react-native-device-info";
import BottomSheet from "reanimated-bottom-sheet";
import QRCodeWrapper from "../../qr-hoc";

const SecondaryDevice = props => {
  const [ErrorBottomSheet, setErrorBottomSheet] = useState(React.createRef());
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessageHeader, setErrorMessageHeader] = useState('');
  const isErrorSendingFailed = useSelector(state => state.sss.errorSending);
  const [selectedStatus, setSelectedStatus] = useState("Ugly"); // for preserving health of this entity
  const [secondaryQR, setSecondaryQR] = useState("");
  const [appVersion, setAppVersion] = useState(null)
  const { SHARES_TRANSFER_DETAILS } = useSelector(
    state => state.storage.database.DECENTRALIZED_BACKUP
  );
  const { loading } = useSelector(state => state.sss);

  SHARES_TRANSFER_DETAILS[0] && !secondaryQR
    ? setSecondaryQR(
      JSON.stringify({
        ...SHARES_TRANSFER_DETAILS[0],
        type: "secondaryDeviceQR",
      })
    )
    : null;
  const dispatch = useDispatch();

  useEffect(() => {
    if (!secondaryQR) {
      dispatch(uploadEncMShare(0));
    }
  }, []);

  useEffect(() => {
    if (appVersion !== null) {
      let appVersion = getVersion()
      setAppVersion(appVersion)
    }
  })




  const renderErrorModalContent = useCallback(() => {
    return (
      <ErrorModalContents
        modalRef={ErrorBottomSheet}
        title={errorMessageHeader}
        info={errorMessage}
        proceedButtonText={'Try again'}
        onPressProceed={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
        isBottomImage={true}
        bottomImage={require('../../../assets/images/icons/errorImage.png')}
      />
    );
  }, [errorMessage, errorMessageHeader]);

  const renderErrorModalHeader = useCallback(() => {
    return (
      <ModalHeader
        onPressHeader={() => {
          (ErrorBottomSheet as any).current.snapTo(0);
        }}
      />
    );
  }, []);

  if (isErrorSendingFailed) {
    setTimeout(() => {
      setErrorMessageHeader('Error sending Recovery Secret');
      setErrorMessage(
        'There was an error while sending your Recovery Secret, please try again in a little while',
      );
    }, 2);
    (ErrorBottomSheet as any).current.snapTo(1);
    dispatch(ErrorSending(null));
  }
  debugger
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
            <QRCodeWrapper value={secondaryQR} size={hp("27%")} />
          )}
        {secondaryQR ? <CopyThisText text={secondaryQR} /> : null}
      </View>
      <BottomInfoBox
        title={"Note"}
        infoText={
          "Share your Recovery Secret Open the QR scanner at the bottom of the Home screen on your Secondary Device and scan this QR"
        }
      />
      <BottomSheet
        enabledInnerScrolling={true}
        ref={ErrorBottomSheet}
        snapPoints={[
          -50,
          Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp('35%') : hp('40%'),
        ]}
        renderContent={renderErrorModalContent}
        renderHeader={renderErrorModalHeader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { height: hp("27%"), justifyContent: "center" }
});

export default SecondaryDevice;
