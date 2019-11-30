import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Text,
  Image,
  FlatList,
  AsyncStorage,
  Platform
} from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AntDesign from "react-native-vector-icons/AntDesign";
import Fonts from "../common/Fonts";
import Colors from "../common/Colors";
import CommonStyles from "../common/Styles";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp
} from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import BottomSheet from "reanimated-bottom-sheet";
import DeviceInfo from "react-native-device-info";
import BottomInfoBox from "../components/BottomInfoBox";
import CopyThisText from "../components/CopyThisText";
import ContactList from "../components/ContactList";
import Ionicons from "react-native-vector-icons/Ionicons";
import QRCode from "react-native-qrcode-svg";

import { useDispatch, useSelector } from "react-redux";
import { initHealthCheck, uploadEncMShare } from "../store/actions/sss";
import S3Service from "../bitcoin/services/sss/S3Service";

export default function ManageBackup(props) {
  const [bottomSheet, setBottomSheet] = useState(React.createRef());
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("error");
  const [temp, setTemp] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [cloudData, setCloudData] = useState([
    {
      title: "iCloud Drive",
      info: "Store backup in iCloud Drive",
      imageIcon: require("../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "Google Drive",
      info: "Store backup in Google Drive",
      imageIcon: require("../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "One Drive",
      info: "Store backup in One Drive",
      imageIcon: require("../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "DropBox Storage",
      info: "Store backup in Dropbox Storage",
      imageIcon: require("../assets/images/icons/logo_brand_brands_logos_icloud.png")
    }
  ]);
  const [pageData, setPageData] = useState([
    {
      title: "Secondary Device",
      time: "3 months ago",
      status: "error",
      type: "secondaryDevice"
    },
    {
      title: "Pam Shelby",
      time: "1 month ago",
      status: "error",
      type: "contact"
    },
    {
      title: "Grace Shelby",
      time: "12 days ago",
      status: "warning",
      type: "contact"
    },
    {
      title: "Cloud",
      time: "2 days ago",
      status: "success",
      type: "cloud"
    },
    {
      title: "Print",
      time: "3 days ago",
      status: "success",
      type: "print"
    },
    {
      title: "Security Questions",
      time: "1 day ago",
      status: "success",
      type: "security"
    }
  ]);

  useEffect(() => {
    setTimeout(() => {
      if (!selectedType) {
        setSelectedType("secondaryDevice");
        setSelectedStatus("error");
      }
    }, 3000);
  });

  function selectedContactsList(list) {
    setContacts(list);
  }

  function continueNProceed() {
    bottomSheet.current.snapTo(0);
    setTimeout(() => {
      setSelectedType("cloud");
      setSelectedStatus("success");
    }, 1000);
  }

  function openModal(type) {
    bottomSheet.current.snapTo(1);
  }

  function getImageByType(type) {
    if (type == "secondaryDevice") {
      return require("../assets/images/icons/icon_secondarydevice.png");
    } else if (type == "contact") {
      return require("../assets/images/icons/icon_user.png");
    } else if (type == "cloud") {
      return require("../assets/images/icons/icon_cloud.png");
    }
    if (type == "print") {
      return require("../assets/images/icons/print.png");
    } else if (type == "security") {
      return require("../assets/images/icons/icon_securityquestion.png");
    }
  }

  function getIconByStatus(status) {
    if (status == "error") {
      return require("../assets/images/icons/icon_error_red.png");
    } else if (status == "warning") {
      return require("../assets/images/icons/icon_error_yellow.png");
    } else if (status == "success") {
      return require("../assets/images/icons/icon_check.png");
    }
  }

  function onCloseEnd() {
    if (selectedType == "secondaryDevice") {
      setSelectedType("contact");
      setSelectedStatus("warning");
    }
  }

  function renderContent() {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.modalHeaderTitleView}>
          <View style={{ marginTop: hp("2%") }}>
            <Text style={styles.modalHeaderTitleText}>
              {selectedType == "contact"
                ? "Trusted Contact"
                : selectedType == "cloud"
                ? "Cloud"
                : "Secondary Device"}
            </Text>
            {selectedType == "contact" || selectedType == "cloud" ? (
              <Text style={styles.modalHeaderInfoText}>Never backed up</Text>
            ) : (
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
            )}
          </View>
          <Image
            style={styles.cardIconImage}
            source={getIconByStatus(selectedStatus)}
          />
        </View>
        {selectedType == "secondaryDevice" ? (
          <View style={styles.modalContentView}>
            <QRCode value={secondaryQR} size={hp("27%")} />
            <CopyThisText text={secondaryQR} />
          </View>
        ) : selectedType == "cloud" ? (
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginLeft: 30,
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12, 812),
                marginTop: 5,
                marginBottom: 5
              }}
            >
              Select cloud drive to{" "}
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: "bold"
                }}
              >
                store recovery secret
              </Text>
            </Text>
            <View style={{ flex: 1 }}>
              <FlatList
                data={cloudData}
                renderItem={({ item, index }) => (
                  <View style={styles.listElements}>
                    <Image
                      style={styles.listElementsIconImage}
                      source={item.imageIcon}
                    />
                    <View style={{ justifyContent: "space-between", flex: 1 }}>
                      <Text style={styles.listElementsTitle}>{item.title}</Text>
                      <Text style={styles.listElementsInfo} numberOfLines={1}>
                        {item.info}
                      </Text>
                    </View>
                    <View style={styles.listElementIcon}>
                      <Ionicons
                        name="ios-arrow-forward"
                        color={Colors.textColorGrey}
                        size={15}
                        style={{ alignSelf: "center" }}
                      />
                    </View>
                  </View>
                )}
              />
            </View>
          </View>
        ) : selectedType == "contact" ? (
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginLeft: 30,
                color: Colors.textColorGrey,
                fontFamily: Fonts.FiraSansRegular,
                fontSize: RFValue(12, 812),
                marginTop: 5
              }}
            >
              Select contact to{" "}
              <Text
                style={{
                  fontFamily: Fonts.FiraSansMediumItalic,
                  fontWeight: "bold"
                }}
              >
                send recovery secret
              </Text>
            </Text>
            <ContactList
              style={{}}
              onPressContinue={() => continueNProceed()}
              onSelectContact={list => selectedContactsList(list)}
            />
          </View>
        ) : null}
        {selectedType == "secondaryDevice" ? (
          <BottomInfoBox
            title={"Note"}
            infoText={
              "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna"
            }
          />
        ) : null}
      </View>
    );
  }

  function renderHeader() {
    return (
      <TouchableOpacity
        activeOpacity={10}
        onPress={() => {
          bottomSheet.current.snapTo(0);
        }}
        style={styles.modalHeader}
      >
        <View style={styles.modalHeaderHandle} />
      </TouchableOpacity>
    );
  }

  const s3Service: S3Service = useSelector(state => state.sss.service);
  useEffect(() => {
    if (!s3Service.sss.healthCheckInitialized) dispatch(initHealthCheck());
  }, []);

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
    if (selectedType === "secondaryDevice") {
      if (!secondaryQR) {
        dispatch(uploadEncMShare(0));
      }
      console.log(secondaryQR);
    }
  }, [selectedType]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.navigate("Home");
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
        <ScrollView>
          <View style={{ flexDirection: "row", marginTop: 10 }}>
            <View style={{ flex: 2 }}>
              <Text style={{ ...CommonStyles.headerTitles, marginLeft: 25 }}>
                Manage Backup
              </Text>
              <Text
                style={{ ...CommonStyles.headerTitlesInfoText, marginLeft: 25 }}
              >
                The wallet backup is not secured. Please complete the setup to
                safeguard against loss of funds
              </Text>
              <TouchableOpacity style={styles.knowMoreButton}>
                <Text style={styles.knowMoreButtonText}>Know More</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }}>
              <Image
                source={require("../assets/images/icons/sheild_error.png")}
                style={styles.shieldImage}
              />
            </View>
          </View>
          <FlatList
            data={pageData}
            extraData={selectedType}
            renderItem={({ item, index }) => (
              <View
                style={{
                  opacity: !selectedType || item.type == selectedType ? 1 : 0.5
                }}
              >
                <TouchableOpacity
                  disabled={item.type == selectedType ? false : true}
                  onPress={() => openModal(item.type)}
                  style={{
                    ...styles.manageBackupCard,
                    borderColor:
                      item.status == "error"
                        ? Colors.red
                        : item.status == "warning"
                        ? Colors.yellow
                        : item.status == "success"
                        ? Colors.green
                        : Colors.blue,
                    elevation:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowColor:
                      selectedType && item.type == selectedType
                        ? Colors.borderColor
                        : Colors.white,
                    shadowOpacity:
                      selectedType && item.type == selectedType ? 10 : 0,
                    shadowOffset:
                      selectedType && item.type == selectedType
                        ? { width: 0, height: 10 }
                        : { width: 0, height: 0 },
                    shadowRadius:
                      selectedType && item.type == selectedType ? 10 : 0
                  }}
                >
                  <Image
                    style={styles.cardImage}
                    source={getImageByType(item.type)}
                  />
                  <View style={{ marginLeft: 15 }}>
                    <Text style={styles.cardTitleText}>{item.title}</Text>
                    <Text style={styles.cardTimeText}>
                      Last backup{" "}
                      <Text
                        style={{
                          fontFamily: Fonts.FiraSansMediumItalic,
                          fontWeight: "bold"
                        }}
                      >
                        {item.time}
                      </Text>
                    </Text>
                  </View>
                  <Image
                    style={styles.cardIconImage}
                    source={getIconByStatus(item.status)}
                  />
                </TouchableOpacity>
              </View>
            )}
          />
        </ScrollView>
        <BottomSheet
          onCloseEnd={() => onCloseEnd()}
          enabledInnerScrolling={true}
          ref={bottomSheet}
          snapPoints={[-30, hp("90%")]}
          renderContent={renderContent}
          renderHeader={renderHeader}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  knowMoreButton: {
    marginTop: 10,
    height: wp("6%"),
    width: wp("18%"),
    marginLeft: 25,
    backgroundColor: Colors.lightBlue,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 5
  },
  knowMoreButtonText: {
    color: Colors.white,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(12, 812)
  },
  shieldImage: {
    width: wp("16%"),
    height: wp("25%"),
    resizeMode: "contain",
    marginLeft: "auto",
    marginRight: 20
  },
  modalHeaderHandle: {
    width: 50,
    height: 5,
    backgroundColor: Colors.borderColor,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 15
  },
  modalHeader: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    height: 25,
    width: "80%",
    alignSelf: "center",
    borderColor: Colors.borderColor
  },
  addressView: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    height: 50,
    paddingLeft: 15,
    paddingRight: 15,
    justifyContent: "center"
  },
  addressText: {
    fontSize: RFValue(13, 812),
    color: Colors.lightBlue
  },
  copyIconView: {
    width: 48,
    height: 50,
    backgroundColor: Colors.borderColor,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  manageBackupCard: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 10,
    marginTop: 10,
    marginLeft: 10,
    marginRight: 10,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: Colors.white
  },
  cardImage: {
    width: 30,
    height: 30,
    resizeMode: "contain"
  },
  cardTitleText: {
    color: Colors.blue,
    fontSize: RFValue(13, 812),
    fontFamily: Fonts.FiraSansRegular
  },
  cardTimeText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(10, 812)
  },
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
  listElements: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 10,
    alignItems: "center"
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13, 812),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11, 812),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: "center",
    alignItems: "center"
  },
  listElementsIconImage: {
    resizeMode: "contain",
    width: 25,
    height: 25,
    alignSelf: "center"
  }
});
