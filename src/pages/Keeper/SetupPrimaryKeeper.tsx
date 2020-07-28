import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

export default function SetupPrimaryKeeper(props) {
  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={{ height: '100%' }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>
            Setup Primary Keeper{'\n'}on a Personal Device
          </Text>
          <Text style={styles.modalInfoText}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressContinue()}
          activeOpacity={10}
          style={{
            ...styles.grayBox,
            width: wp('90%'),
            height: wp('20%'),
          }}
        >
          <Image
            source={require('../../assets/images/icons/setupPK.png')}
            style={{ width: wp('85%'), height: wp('15%'), resizeMode: 'cover' }}
          />
        </AppBottomSheetTouchableWrapper>
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressContinue()}
          activeOpacity={10}
          style={{
            ...styles.grayBox,
            width: wp('85%'),
            height: wp('15%'),
          }}
        >
          <Text numberOfLines={1} style={styles.grayBoxLinkText}>
            http://hexawallet.io/keeperapp
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: wp('5%'),
  },
  modalInfoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: wp('1.5%'),
    color: Colors.lightTextColor,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  grayBox: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: wp('5%'),
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    alignSelf: 'center',
  },
  grayBoxLinkText: {
    fontFamily: Fonts.FiraSansRegular,
    width: wp('70%'),
    textAlign: 'center',
    color: Colors.blue,
    fontSize: RFValue(13),
  },
});
