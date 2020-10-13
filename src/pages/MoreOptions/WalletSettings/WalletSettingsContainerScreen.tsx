import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Image } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { AppBottomSheetTouchableWrapper } from '../../../components/AppBottomSheetTouchableWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { widthPercentageToDP } from 'react-native-responsive-screen';

export type Props = {
  navigation: any;
};

interface MenuOption {
  title: string;
  subtitle: string;
  imageSource: NodeRequire;
  screenName?: string;
}

const versionString = `Version ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`;

const menuOptions: MenuOption[] = [
  {
    title: 'Manage Passcode',
    subtitle: 'Change your passcode',
    imageSource: require('../../../assets/images/icons/managepin.png'),
    screenName: 'ManagePasscode',
  },
  {
    title: 'Change Currency',
    subtitle: 'Choose your currency',
    imageSource: require('../../../assets/images/icons/country.png'),
    screenName: 'ChangeCurrency',
  },
  {
    title: 'Hexa Release',
    subtitle: versionString,
    imageSource: require('../../../assets/images/icons/settings.png'),
  },
];


const WalletSettingsContainerScreen: React.FC<Props> = ({
  navigation,
}: Props) => {

  function handleOptionSelection(menuOption: MenuOption) {
    if (menuOption.screenName !== undefined) {
      navigation.navigate(menuOption.screenName);
    }
  }

  return (
    <View style={styles.modalContainer}>
      <ScrollView style={{ flex: 1 }}>
        {menuOptions.map((menuOption) => {
          return (
            <AppBottomSheetTouchableWrapper
              onPress={() => handleOptionSelection(menuOption)}
              style={styles.selectedContactsView}
            >
              <Image
                source={menuOption.imageSource}
                style={{
                  width: widthPercentageToDP('7%'),
                  height: widthPercentageToDP('7%'),
                  resizeMode: 'contain',
                  marginLeft: widthPercentageToDP('3%'),
                  marginRight: widthPercentageToDP('3%'),
                }}
              />
              <View
                style={{ justifyContent: 'center', marginRight: 10, flex: 1 }}
              >
                <Text style={styles.titleText}>{menuOption.title}</Text>
                <Text style={styles.infoText}>{menuOption.subtitle}</Text>
              </View>

              <View style={{ marginLeft: 'auto' }}>
                {menuOption.screenName !== undefined && (
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{
                      marginLeft: widthPercentageToDP('3%'),
                      marginRight: widthPercentageToDP('3%'),
                      alignSelf: 'center',
                    }}
                  />
                )}
              </View>
            </AppBottomSheetTouchableWrapper>
          );
        })}
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.white,
    alignSelf: 'center',
    width: '100%',
  },
  selectedContactsView: {
    marginLeft: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
  titleText: {
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
  },
  infoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    marginTop: 5,
  },
});

export default WalletSettingsContainerScreen;
