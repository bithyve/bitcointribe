import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Platform,
  TouchableOpacity,
  Image,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import moment from "moment";
import Share from "react-native-share";
import Colors from "../common/Colors";
import Fonts from "../common/Fonts";
import { RFValue } from "react-native-responsive-fontsize";
import QRCode from "./QRCode";
import {
  REGULAR_ACCOUNT,
  TEST_ACCOUNT,
  SECURE_ACCOUNT,
} from "../common/constants/wallet-service-types";
import CopyThisText from "../components/CopyThisText";
import HeaderTitle from "./HeaderTitle";
import { translations } from "../common/content/LocContext";
import GiftCard from "../assets/images/svgs/icon_gift.svg";
import Link from "../assets/images/svgs/link.svg";
import More from "../assets/images/svgs/icon_more_gray.svg";
import BackIcon from "../assets/images/backWhite.svg";
import { useSelector } from "react-redux";
import CommonStyles from "../common/Styles/Styles";
import BottomInfoBox from "./BottomInfoBox";
import DashedContainer from "../pages/FriendsAndFamily/DashedContainer";
import DashedLargeContainer from "../pages/FriendsAndFamily/DahsedLargeContainer";
import ButtonGroupWithIcon from "../pages/FriendsAndFamily/ButtonGroupWithIcon";
import ThemeList from "../pages/FriendsAndFamily/Theme";
import { withNavigation } from "react-navigation";
import { nameToInitials } from "../common/CommonFunctions";
import { DeepLinkEncryptionType } from "../bitcoin/utilities/Interface";

function RequestKeyFromContact(props) {
  const [shareLink, setShareLink] = useState("");
  const strings = translations["f&f"];
  const common = translations["common"];
  const contact =
    props.contact &&
    props.contact.contactDetails &&
    props.contact.contactDetails[0];
  const [serviceType, setServiceType] = useState(
    props.serviceType ? props.serviceType : ""
  );
  const [Contact, setContact] = useState(props.contact ? props.contact : {});
  const walletName = useSelector((state) => state.storage.wallet.walletName);

  useEffect(() => {
    setShareLink(props.link.replace(/\s+/g, ""));
  }, [props.link]);

  useEffect(() => {
    if (contact) {
      setContact(props.contact);
    }
  }, [contact]);

  useEffect(() => {
    if (props.serviceType) {
      setServiceType(props.serviceType);
    }
  }, [props.serviceType]);

  const shareOption = async () => {
    try {
      // const url = 'https://awesome.contents.com/';
      const title = "Request";

      const options = Platform.select({
        default: {
          title,
          message: `${walletName} wants to add you as ${
            props.isKeeper ? "keeper" : "Friends and Family"
          } on Hexa. Click on the link below and follow the steps in your Hexa app \n\n${shareLink}`,
        },
      });

      Share.open(options)
        .then((res) => {
          // if (res.success) {
          props.onPressShare();
          // }
        })
        .catch((err) => {});
    } catch (error) {
      // console.log(error);
    }
  };

  const getTheme = () => {
    // props.themeId
    const filteredArr = ThemeList.filter((item) => item.id === props.themeId);
    return filteredArr[0];
  };

  const numberWithCommas = (x) => {
    return x ? x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "";
  };

  const shareViaLinkOrQR = (type) => {
    props.onPressShare();
    props.navigation.navigate("SendViaLinkAndQR", {
      type,
      qrCode: props.QR,
      link: shareLink,
      ...props,
      setActiveTab: props.navigation.state.params.setActiveTab,
      OTP: props.encryptionKey,
      encryptLinkWith: props.encryptLinkWith,
    });
  };
  const setPhoneNumber = () => {
    const phoneNumber = Contact && Contact.phoneNumbers[0].number;
    let number = phoneNumber.replace(/[^0-9]/g, ""); // removing non-numeric characters
    number = number.slice(number.length - 10); // last 10 digits only
    return number;
  };

  return (
    <View style={styles.modalContainer}>
      <View
        style={{ flexDirection: "row", marginTop: 20, marginLeft: wp("5%") }}
      >
        {Contact && Contact.name &&<View
          style={{
            backgroundColor: Colors.white,
            borderRadius: 30,
            height: 60,
            width: 60,
            marginLeft: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              marginTop: 15,
              textAlign: "center",
              color: Colors.lightBlue,
              fontWeight: "900",
            }}
          >
            {Contact && Contact.name && Contact.name.match(/\b(\w)/g).join("")}
          </Text>
        </View>}
        {Contact && Contact.name && <View style={{ flexDirection: "column", marginLeft: wp('3%') }}>
          <Text
            style={{
              fontFamily: Fonts.RobotoSlabRegular,
              fontSize: 10,
              color: Colors.textColorGrey,
            }}
          >
            Adding as Friends & Family
          </Text>
          <View>
            <Text style={{fontFamily: Fonts.RobotoSlabRegular,
              fontSize: 22,}}>
              {Contact.name &&
                Contact.name.split(" ").map((x, index) => {
                  const i = Contact && Contact.name.split(" ").length;
                  return (
                    <Text
                      style={{
                        color: Colors.black,
                      }}
                    >
                      {index !== i - 1 ? (
                        `${x} `
                      ) : (
                        <Text
                          style={{
                            fontFamily: Fonts.RobotoSlabRegular,
                          }}
                        >
                          {x}
                        </Text>
                      )}
                    </Text>
                  );
                })}
            </Text>
          </View>
          <View style={{ marginTop: 3 }}>
            {Contact.emails != null || Contact.emails != undefined ? (
              <Text
                style={{
                  fontFamily: Fonts.RobotoSlabRegular,
                  fontSize: 10,
                  color: Colors.textColorGrey,
                }}
              >
                {Contact.emails[0].email}
              </Text>
            ) : (
              <Text
                style={{
                  fontFamily: Fonts.RobotoSlabRegular,
                  fontSize: 10,
                  color: Colors.black,
                }}
              >
                {Contact && Contact.phoneNumbers && Contact.phoneNumbers[0].number}
              </Text>
            )}
          </View>
        </View>}
      </View>
      {props.isGift && (
        <>
          <TouchableOpacity
            disabled
            onPress={() =>
              props.onSelectionChange && props.onSelectionChange(true)
            }
            style={{
              width: "90%",
              backgroundColor: Colors.gray7,
              shadowOpacity: 0.06,
              shadowOffset: {
                width: 10,
                height: 10,
              },
              shadowRadius: 10,
              elevation: 2,
              alignSelf: "center",
              borderTopRightRadius: wp(2),
              borderBottomRightRadius: wp(2),
              borderTopLeftRadius:
                contact && Object.keys(contact).length !== 0
                  ? wp(90 / 2)
                  : wp(90 / 2),
              borderBottomLeftRadius:
                contact && Object.keys(contact).length !== 0
                  ? wp(90 / 2)
                  : wp(90 / 2),
              marginTop: hp(1),
              marginBottom: hp(1),
              paddingVertical:
                contact && Object.keys(contact).length !== 0 ? hp(0) : hp(0),
              paddingRight: wp(3),
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal:
                contact && Object.keys(contact).length !== 0 ? hp(0) : wp(0),
            }}
          >
            <View style={styles.contactProfileImageContainer}>
              {contact ? (
                Object.keys(contact).length !== 0 ? (
                  contact.imageAvailable ? (
                    <Image
                      source={contact && contact.image}
                      style={{
                        ...styles.contactProfileImage,
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: Colors.backgroundColor,
                        width: 80,
                        height: 80,
                        borderRadius: 80 / 2,
                        // shadowColor: Colors.shadowBlue,
                        // shadowOpacity: 1,
                        // shadowOffset: {
                        //   width: 2, height: 2
                        // },
                      }}
                    >
                      <Text
                        style={{
                          textAlign: "center",
                          fontSize: RFValue(20),
                          lineHeight: RFValue(20), //... One for top and one for bottom alignment
                        }}
                      >
                        {nameToInitials(
                          Contact && Contact.firstName && Contact.lastName
                            ? Contact.firstName + " " + Contact.lastName
                            : Contact && Contact.firstName && !Contact.lastName
                            ? Contact.firstName
                            : Contact && !Contact.firstName && Contact.lastName
                            ? Contact.lastName
                            : ""
                        )}
                      </Text>
                    </View>
                  )
                ) : (
                  <GiftCard />
                )
              ) : (
                <GiftCard />
              )}
            </View>

            <View
              style={{
                marginHorizontal: wp(3),
              }}
            >
              {contact && Object.keys(contact).length !== 0 && (
                <Text
                  style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp(0.3),
                    lineHeight: 12,
                  }}
                >
                  Friends & Family
                </Text>
              )}
              {Contact &&
              Contact.phoneNumbers &&
              Contact.phoneNumbers.length &&
              props.encryptLinkWith === DeepLinkEncryptionType.NUMBER ? (
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(14),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp(0.01),
                    letterSpacing: 5,
                    lineHeight: 30,
                    width: wp("54%"),
                  }}
                >
                  {setPhoneNumber()}
                </Text>
              ) : Contact &&
                Contact.emails &&
                Contact.emails.length &&
                props.encryptLinkWith === DeepLinkEncryptionType.EMAIL ? (
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(14),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp(0.01),
                    lineHeight: 30,
                    width: wp("54%"),
                  }}
                >
                  {Contact && Contact.emails[0].email}
                </Text>
              ) : contact &&
                Object.keys(contact).length !== 0 &&
                props.encryptLinkWith !== DeepLinkEncryptionType.OTP ? (
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(14),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp(0.01),
                    letterSpacing: 5,
                    lineHeight: 30,
                    width: wp("54%"),
                  }}
                >
                  {props.encryptionKey}
                </Text>
              ) : null}

              {contact && contact.name ? (
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansMediumItalic,
                  }}
                >
                  {contact.name}
                </Text>
              ) : (
                <>
                  <Text
                    style={{
                      color: Colors.lightTextColor,
                      fontSize: RFValue(10),
                      fontFamily: Fonts.FiraSansRegular,
                      lineHeight: 27,
                    }}
                  >
                    from{" "}
                    <Text
                      style={{
                        color: Colors.textColorGrey,
                        fontSize: RFValue(11),
                        fontFamily: Fonts.FiraSansMediumItalic,
                      }}
                    >
                      {props.accountName}
                    </Text>
                  </Text>
                  <Text
                    style={{
                      color: Colors.lightTextColor,
                      fontSize: RFValue(10),
                      fontFamily: Fonts.FiraSansRegular,
                      marginTop: hp(0.3),
                      lineHeight: 12,
                    }}
                  >
                    {moment().format("lll")}
                  </Text>
                </>
              )}
            </View>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginLeft: "auto",
              }}
            >
              {/* <Text style={{
              color: Colors.black,
              fontSize: RFValue( 24 ),
              fontFamily: Fonts.FiraSansRegular
            }}>
              {props.amt}
              <Text style={{
                color: Colors.lightTextColor,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular
              }}> sats
              </Text>
            </Text> */}
              {!props.isGift && <More />}
            </View>
          </TouchableOpacity>
        </>
      )}
      {props.isGift &&
        props.encryptLinkWith !== DeepLinkEncryptionType.DEFAULT && (
          // <BottomInfoBox
          //   infoText={'Your friend will be prompted to enter their OTP while accepting the gift card'}
          // />
          <Text
            style={{
              color: Colors.textColorGrey,
              fontSize: RFValue(12),
              letterSpacing: 0.6,
              // marginBottom: 2,
              // fontFamily: Fonts.FiraSansRegular,
              marginHorizontal: wp(6),
              marginRight: wp(10),
              lineHeight: 18,
              marginVertical: hp(2),
              marginBottom: hp(6),
            }}
          >
            {"Your friend will be prompted to enter "}
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              {props.encryptLinkWith === DeepLinkEncryptionType.NUMBER
                ? "phone number "
                : props.encryptLinkWith === DeepLinkEncryptionType.EMAIL
                ? "email "
                : props.encryptLinkWith === DeepLinkEncryptionType.SECRET_PHRASE
                ? "secret phrase "
                : "OTP "}
            </Text>
            while accepting the gift
          </Text>
        )}
      {!props.isGift && (
        <View
          style={[
            styles.mainContainer,
            {
              marginTop: !props.isModal ? hp("2%") : hp("1.7%"),
              marginBottom: !props.isModal ? hp("2%") : hp("1.7%"),
            },
          ]}
        >
          <View
            style={[
              styles.qrContainer,
              {
                marginVertical: hp("4%"),
              },
            ]}
          >
            {!props.link ? (
              <ActivityIndicator size="large" color={Colors.babyGray} />
            ) : (
              <QRCode
                title={
                  props.isGift
                    ? "Bitcoin Address"
                    : props.isKeeper
                    ? "Keeper request"
                    : "Bitcoin Address"
                }
                value={props.link}
                size={hp("27%")}
              />
            )}
          </View>
          {props.OR ? (
            <CopyThisText
              backgroundColor={Colors.backgroundColor}
              text={props.OR}
              width={"20%"}
              height={"15%"}
            />
          ) : null}
        </View>
      )}
      {!props.isGift && (
        <CopyThisText
          openLink={shareLink ? shareOption : () => {}}
          backgroundColor={Colors.white}
          text={shareLink ? shareLink : strings.Creating}
          width={"20%"}
          height={"18%"}
        />
      )}
      {/* <TouchableOpacity
        onPress={() => {}}
        style={styles.dashedContainer}>
        <View style={styles.dashedStyle}>
        </View>
      </TouchableOpacity> */}
      {props.isGift && (
        <DashedLargeContainer
          titleText={"Gift Sats"}
          titleTextColor={Colors.black}
          subText={props.senderName}
          extraText={
            props.giftNote
              ? props.giftNote
              : "This is to get you started!\nWelcome to Bitcoin"
          }
          amt={props.amt}
          image={<GiftCard height={60} width={60} />}
          theme={getTheme()}
          isSend
        />
      )}
      {props.isGift && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            margin: wp(6),
          }}
        >
          <Text style={styles.subHeaderText}>
            If the recipient does not accept in 7 days, the link/QR will expire
            and the gift will revert back to you
          </Text>
        </View>
      )}
      {props.isGift && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            margin: wp(6),
          }}
        >
          <ButtonGroupWithIcon
            buttonOneIcon={<Link />}
            buttonOneText={"Share Link"}
            onButtonPress={(type) => shareViaLinkOrQR(type)}
            buttonTwoIcon={<Link />}
            buttonTwoText={"Share QR"}
          />

          <View style={styles.statusIndicatorView}>
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorInactiveView} />
            <View style={styles.statusIndicatorActiveView} />
          </View>
        </View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  contactProfileImage: {
    width: 81,
    height: 81,
    resizeMode: "cover",
    borderRadius: 81 / 2,
  },
  contactProfileImageContainer: {
    width: 90,
    height: 90,
    resizeMode: "cover",
    borderRadius: 90 / 2,
    backgroundColor: Colors.white,
    justifyContent: "center",
    alignItems: "center",
    borderColor: Colors.offWhite,
    borderWidth: 1,
  },
  dashedStyle: {
    backgroundColor: Colors.gray7,
    borderRadius: wp(2),
    paddingVertical: hp(1),
    paddingHorizontal: wp(4),
    borderColor: Colors.lightBlue,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  // normalStyle: {
  //   backgroundColor: Colors.gray7,
  //   paddingTop: hp( 1 ),
  //   paddingHorizontal: wp( 2 ),
  // },
  dashedContainer: {
    width: "90%",
    backgroundColor: Colors.gray7,
    // shadowOpacity: 0.06,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // shadowRadius: 10,
    // elevation: 2,
    alignSelf: "center",
    borderRadius: wp(2),
    marginTop: hp(1),
    marginBottom: hp(1),
    paddingVertical: wp(1),
    paddingHorizontal: wp(1),
    borderColor: Colors.lightBlue,
    borderWidth: 1,
  },
  statusIndicatorView: {
    flexDirection: "row",
    marginLeft: "auto",
  },
  statusIndicatorActiveView: {
    height: 5,
    width: 25,
    backgroundColor: Colors.blue,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 5,
    width: 5,
    backgroundColor: Colors.lightBlue,
    borderRadius: 10,
    marginLeft: 5,
  },
  inputField: {
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    width: wp(90),
  },
  inputBox: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  inputBoxFocused: {
    borderWidth: 0.5,
    borderRadius: 10,
    marginLeft: 20,
    marginRight: 20,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: {
      width: 10,
      height: 10,
    },
    backgroundColor: Colors.backgroundColor1,
  },
  modalInputBox: {
    flex: 1,
    height: 50,
    fontSize: RFValue(13),
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    paddingLeft: 15,
    width: "90%",
  },
  modalInfoText: {
    width: wp(90),
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: "justify",
    lineHeight: 18,
    marginLeft: wp(5),
    paddingVertical: wp(1),
  },
  titleStyle: {
    color: Colors.black,
    fontSize: RFValue(20),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalContainer: {
    backgroundColor: Colors.backgroundColor,
    alignSelf: "center",
    width: "100%",
  },
  qrContainer: {
    height: hp("27%"),
    justifyContent: "center",
    marginLeft: 20,
    marginRight: 20,
    alignItems: "center",
  },
  containerQrCode: {
    backgroundColor: "gray",
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  textQr: {
    color: "white",
    fontSize: 17,
    textAlign: "center",
    paddingVertical: 5,
  },
  containerTextQr: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  mainContainer: {
    marginLeft: 20,
    marginRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  topContainer: {
    marginHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  subHeaderText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
    paddingTop: 5,
  },
  mainView: {
    alignItems: "center",
    flexDirection: "row",
    paddingRight: 10,
    paddingBottom: hp("1.5%"),
    paddingTop: hp("1%"),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp("1.5%"),
  },
  backButton: {
    height: 30,
    width: 30,
    justifyContent: "center",
  },
  topSubView: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
  },
});

export default withNavigation(RequestKeyFromContact);
