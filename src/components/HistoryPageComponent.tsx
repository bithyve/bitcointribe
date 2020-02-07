import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Fonts from '../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';

const HistoryPageComponent = props => {
  const [SelectedOption, setSelectedOption] = useState(0);
  const SelectOption = Id => {
    if (Id == SelectedOption) {
      setSelectedOption(0);
    } else {
      setSelectedOption(Id);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }}>
        {props.data.map(value => {
          if (SelectedOption == value.id) {
            return (
              <TouchableOpacity
                onPress={() => SelectOption(value.id)}
                style={{
                  margin: wp('3%'),
                  backgroundColor: Colors.white,
                  borderRadius: 10,
                  height: wp('20%'),
                  width: wp('90%'),
                  justifyContent: 'center',
                  paddingLeft: wp('3%'),
                  paddingRight: wp('3%'),
                  alignSelf: 'center',
                }}
              >
                <Text
                  style={{
                    color: Colors.blue,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {value.title}
                </Text>
                {/* <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp('0.5%'),
                  }}
                >
                  Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit
                </Text> */}
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(9),
                    fontFamily: Fonts.FiraSansRegular,
                    marginTop: hp('0.3%'),
                  }}
                >
                  {value.date}
                </Text>
              </TouchableOpacity>
            );
          }
          return (
            <TouchableOpacity
              onPress={() => SelectOption(value.id)}
              style={{
                margin: wp('3%'),
                backgroundColor: Colors.white,
                borderRadius: 10,
                height: wp('15%'),
                width: wp('85%'),
                justifyContent: 'center',
                paddingLeft: wp('3%'),
                paddingRight: wp('3%'),
                alignSelf: 'center',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(10),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  {value.title}
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(9),
                    fontFamily: Fonts.FiraSansRegular,
                    marginLeft: 'auto',
                  }}
                >
                  {value.date}
                </Text>
              </View>
              {/* <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(8),
                  fontFamily: Fonts.FiraSansRegular,
                  marginTop: hp('0.5%'),
                }}
              >
                Lorem ipsum dolor Lorem dolor sit amet, consectetur{' '}
                <Text style={{ fontFamily: Fonts.FiraSansMediumItalic }}>
                  dolor sit
                </Text>
              </Text> */}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          height: hp('25%'),
          backgroundColor: Colors.white,
        }}
      >
        {props.reshareInfo ? (
          <Text
            style={{
              opacity: props.IsReshare ? 1 : 0.5,
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              color: Colors.textColorGrey,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.reshareInfo}
            <Text
              onPress={() => {
                props.IsReshare ? props.onPressReshare() : {};
              }}
              style={{ color: Colors.blue, textDecorationLine: 'underline' }}
            >
              Reshare
            </Text>
          </Text>
        ) : null}

        {props.changeInfo ? (
          <Text
            style={{
              opacity: props.IsReshare ? 1 : 0.5,
              marginTop: hp('1%'),
              marginBottom: hp('1%'),
              color: Colors.textColorGrey,
              fontSize: RFValue(10),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.changeInfo}
            <Text
              onPress={() => {
                props.IsReshare ? props.onPressChange() : {};
              }}
              style={{ color: Colors.blue, textDecorationLine: 'underline' }}
            >
              Change Source
            </Text>
          </Text>
        ) : null}

        {props.IsReshare ? (
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressConfirm();
            }}
            style={{
              backgroundColor: Colors.blue,
              height: wp('13%'),
              width: wp('40%'),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginTop: hp('3%'),
              marginBottom: hp('3%'),
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Confirm
            </Text>
          </AppBottomSheetTouchableWrapper>
        ) : (
          <AppBottomSheetTouchableWrapper
            onPress={() => {
              props.onPressContinue();
            }}
            style={{
              backgroundColor: Colors.blue,
              height: wp('13%'),
              width: wp('40%'),
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 10,
              marginTop: hp('3%'),
              marginBottom: hp('3%'),
              elevation: 10,
              shadowColor: Colors.shadowBlue,
              shadowOpacity: 1,
              shadowOffset: { width: 15, height: 15 },
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(10),
                fontFamily: Fonts.FiraSansMedium,
              }}
            >
              Backup Now
            </Text>
          </AppBottomSheetTouchableWrapper>
        )}
      </View>
    </View>
  );
};

export default HistoryPageComponent;

const styles = StyleSheet.create({});
