import React, { useState } from "react";
import { View, Text, StyleSheet, Image, FlatList } from "react-native";
import Fonts from "../../../common/Fonts";
import Colors from "../../../common/Colors";
import { heightPercentageToDP as hp } from "react-native-responsive-screen";
import { RFValue } from "react-native-responsive-fontsize";
import Ionicons from "react-native-vector-icons/Ionicons";

const Cloud = props => {
  const [selectedStatus, setSelectedStatus] = useState("error"); // for preserving health of this entity
  const [cloudData, setCloudData] = useState([
    {
      title: "iCloud Drive",
      info: "Store backup in iCloud Drive",
      imageIcon: require("../../../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "Google Drive",
      info: "Store backup in Google Drive",
      imageIcon: require("../../../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "One Drive",
      info: "Store backup in One Drive",
      imageIcon: require("../../../assets/images/icons/logo_brand_brands_logos_icloud.png")
    },
    {
      title: "DropBox Storage",
      info: "Store backup in Dropbox Storage",
      imageIcon: require("../../../assets/images/icons/logo_brand_brands_logos_icloud.png")
    }
  ]);

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ marginTop: hp("2%") }}>
          <Text style={styles.modalHeaderTitleText}>Cloud</Text>
          <Text style={styles.modalHeaderInfoText}>Never backed up</Text>
        </View>
        <Image
          style={styles.cardIconImage}
          source={props.getIconByStatus(selectedStatus)}
        />
      </View>

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

export default Cloud;
