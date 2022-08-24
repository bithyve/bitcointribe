import React, { useEffect } from "react";
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "react-native-elements";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import CommonStyles from "../common/Styles/Styles";
import Colors from "../common/Colors";
import ButtonStyles from "../common/Styles/ButtonStyles";
import HeaderTitle from "../components/HeaderTitle";
import { widthPercentageToDP } from "react-native-responsive-screen";
import { useDispatch, useSelector } from "react-redux";
import { toggleClipboardAccess } from "../store/actions/misc";

const EnableClipboardAutoRead = (props) => {
  const dispatcher = useDispatch();

  const enabled = useSelector((state) => state.misc.clipboardAccess);

  useEffect(() => {
    console.log(enabled);
  }, [enabled]);

  const changePermission = () => {
    dispatcher(toggleClipboardAccess());
  };

  return (
    <SafeAreaView style={style.wrapper}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: Colors.backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
        firstLineTitle={"Clipboard Access"}
        secondLineTitle={
          "Scans your clipboard for BTC addresses, and send sats faster"
        }
        infoTextNormal={""}
        infoTextBold={""}
        infoTextNormal1={""}
        step={""}
      />
      <View style={style.buttonWrapper}>
        <Button
          raised
          title={enabled ? "Deny" : "Allow"}
          containerStyle={{
            borderRadius: 9999,
          }}
          buttonStyle={{
            ...ButtonStyles.floatingActionButton,
            borderRadius: 9999,
            paddingHorizontal: widthPercentageToDP(5),
          }}
          titleStyle={{
            ...ButtonStyles.floatingActionButtonText,
            marginLeft: 8,
          }}
          onPress={changePermission}
        />
      </View>
    </SafeAreaView>
  );
};

export default EnableClipboardAutoRead;

const style = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  buttonWrapper: {
    width: widthPercentageToDP(35),
    marginHorizontal: widthPercentageToDP(5),
  },
});
