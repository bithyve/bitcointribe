import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';

const HistoryPageComponent = (props) => {
  const [SelectedOption, setSelectedOption] = useState(0);
  const SelectOption = (Id) => {
    if (Id == SelectedOption) {
      setSelectedOption(0);
    } else {
      setSelectedOption(Id);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {props.data && props.data.length ? (
        <View style={{ flex: 1 }}>
          <ScrollView style={{}}>
            {props.data.map((value) => {
              if (SelectedOption == value.id) {
                return (
                  <TouchableOpacity
                    key={value.id}
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
                  key={value.id}
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
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          {props.data.length <= 1 ? (
            <View style={{ backgroundColor: Colors.backgroundColor }}>
              <View
                style={{
                  margin: 15,
                  backgroundColor: Colors.white,
                  padding: 10,
                  paddingTop: 20,
                  borderRadius: 7,
                }}
              >
                <Text
                  style={{
                    color: Colors.black,
                    fontSize: RFValue(13),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  Recovery Key History
                </Text>
                <Text
                  style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue(12),
                    fontFamily: Fonts.FiraSansRegular,
                  }}
                >
                  The history of your Recovery Key will appear here
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView>
            {[1, 2, 3, 4].map((value) => {
              return (
                <View
                  style={{
                    margin: wp('3%'),
                    backgroundColor: Colors.white,
                    borderRadius: 10,
                    height: wp('20%'),
                    width: wp('90%'),
                    paddingLeft: wp('3%'),
                    paddingRight: wp('3%'),
                    alignSelf: 'center',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <View>
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp('4%'),
                        width: wp('40%'),
                        borderRadius: 10,
                      }}
                    />
                    <View
                      style={{
                        backgroundColor: Colors.backgroundColor,
                        height: wp('4%'),
                        width: wp('30%'),
                        marginTop: 5,
                        borderRadius: 10,
                      }}
                    />
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={{ backgroundColor: Colors.backgroundColor }}>
            <View
              style={{
                margin: 15,
                backgroundColor: Colors.white,
                padding: 10,
                paddingTop: 20,
                borderRadius: 7,
              }}
            >
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue(13),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                No history
              </Text>
              <Text
                style={{
                  color: Colors.textColorGrey,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                The history of your Recovery Key will appear here
              </Text>
            </View>
          </View>
        </View>
      )}
      <View
        style={{
          height: hp('18%'),
          flexDirection: 'row',
          marginTop: 'auto',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginLeft: wp('8%'),
          marginRight: wp('8%'),
        }}
      >
        <TouchableOpacity
          onPress={() => {
            props.onPressConfirm();
          }}
          style={styles.successModalButtonView}
        >
          <Text
            style={{
              ...styles.proceedButtonText,
              color: Colors.white,
            }}
          >
            Confirm Question
          </Text>
        </TouchableOpacity>
          <TouchableOpacity
            onPress={() => props.onPressChangeQuestion()}
            style={{
              height: wp('13%'),
              width: wp('40%'),
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                ...styles.proceedButtonText,
                color: Colors.blue,
              }}
            >
              Change Question
            </Text>
          </TouchableOpacity>
      </View>
    </View>
  );
};

export default HistoryPageComponent;

const styles = StyleSheet.create({
  bottomButtonInnerView: {
    flexDirection: 'row',
    backgroundColor: Colors.blue,
    height: 60,
    borderRadius: 10,
    marginLeft: 25,
    marginRight: 25,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(12),
    fontFamily: Fonts.FiraSansRegular,
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  successModalButtonView: {
    height: wp('13%'),
    width: wp('40%'),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 15, height: 15 },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
});
