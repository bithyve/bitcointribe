import React, { useState } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';
import RadioButton from '../../components/RadioButton';

export default function KeeperTypeModalContents(props) {
  const [keeperTypesData, setKeeperTypesData] = useState([
    {
      type: 'contact',
      name: 'Keeper Contact',
      info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    },
    {
      type: 'device',
      name: 'Keeper Device',
      info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    },
    {
      type: 'pdf',
      name: 'Pdf Keeper',
      info: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,',
    },
  ]);
  const [SelectedKeeperType, setSelectedKeeperType] = useState({
    type: '',
    name: '',
  });

  const onKeeperSelect = (value) => {
    if (value.type != SelectedKeeperType.type) {
      setSelectedKeeperType(value);
    }
  };

  return (
    <View style={{ ...styles.modalContentContainer, height: '100%' }}>
      <View style={{ height: '100%' }}>
        <View style={styles.successModalHeaderView}>
          <Text style={styles.headerText}>Add Keeper</Text>
          <Text
            style={{
              ...styles.modalInfoText,
              marginTop: wp('1.5%'),
              color: Colors.lightTextColor,
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View
          style={{
            ...styles.successModalAmountView,
            flex: 1,
          }}
        >
          {keeperTypesData.map((value) => {
            return (
              <AppBottomSheetTouchableWrapper
                activeOpacity={10}
                onPress={() => onKeeperSelect(value)}
                style={styles.keeperTypeElementView}
              >
                <View style={styles.typeRadioButtonView}>
                  <RadioButton
                    size={15}
                    color={Colors.lightBlue}
                    borderColor={Colors.borderColor}
                    isChecked={value.type == SelectedKeeperType.type}
                    onpress={() => onKeeperSelect(value)}
                  />
                </View>
                <View>
                  <Text style={styles.keeperTypeTitle}>{value.name}</Text>
                  <Text numberOfLines={1} style={styles.keeperTypeInfo}>
                    {value.info}
                  </Text>
                </View>
              </AppBottomSheetTouchableWrapper>
            );
          })}
        </View>
        <View style={styles.successModalAmountView}>
          <Text
            style={{
              ...styles.modalInfoText,
              marginBottom: wp('5%'),
              marginTop: 'auto',
            }}
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore.
          </Text>
        </View>
        <View style={styles.bottomButtonView}>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressSetup()}
            style={{
              ...styles.successModalButtonView,
              shadowColor: Colors.shadowBlue,
              backgroundColor: Colors.blue,
            }}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.white,
              }}
            >
              Setup keeper
            </Text>
          </AppBottomSheetTouchableWrapper>
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressBack()}
            style={styles.backButtonView}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              Back
            </Text>
          </AppBottomSheetTouchableWrapper>
        </View>
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
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  successModalAmountView: {
    marginRight: wp('8%'),
    marginLeft: wp('8%'),
    marginTop: hp('1%'),
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp('8%'),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  headerText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  typeRadioButtonView: {
    justifyContent: 'center',
    width: wp('10%'),
    height: wp('10%'),
  },
  keeperTypeTitle: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(13),
    marginBottom: 5,
  },
  keeperTypeInfo: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    width: wp('70%'),
  },
  bottomButtonView: {
    height: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: wp('8%'),
  },
  backButtonView: {
    height: wp('13%'),
    width: wp('35%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  keeperTypeElementView: {
    flexDirection: 'row',
    marginTop: wp('5%'),
    marginBottom: wp('5%'),
  }
});
