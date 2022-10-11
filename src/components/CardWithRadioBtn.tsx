import React, { Component } from 'react';
import { View, Image, TouchableOpacity, Text, Dimensions } from 'react-native';
import Colors from '../common/Colors';
import Fonts from '../common/Fonts';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import CheckMark from '../assets/images/svgs/checkmark.svg';
import Arrow from '../assets/images/svgs/icon_arrow.svg';

const {width} = Dimensions.get('window')

export default function CardWithRadioBtn({
  setActiveIndex,
  geticon = undefined,
  mainText,
  subText,
  italicText,
  isSelected,
  index,
  changeBgColor,
  boldText,
  hideRadioBtn = false,
  tag = '',
}) {
  return (
    <TouchableOpacity
      onPress={() => setActiveIndex(index)}
      style={{
        width: '95%',
        height: hp('11%'),
        backgroundColor: isSelected && changeBgColor ? Colors.lightBlue : Colors.white,
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: wp('4'),
        marginVertical: hp('1%'),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          // justifyContent: 'space-between',

          marginHorizontal: wp('4%'),
          flex: 1,
          marginVertical: hp('1.8%'),
        }}
      >
        {!hideRadioBtn && (
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 9,
              // borderWidth: 0.3,
              // borderColor: Colors.borderColor,
              backgroundColor: Colors.white,
              justifyContent: 'center',
              alignItems: 'center',
              elevation: 6,
              // shadowColor: Colors.gray,
              shadowOpacity: 0.1,
              shadowOffset: {
                width: 1,
                height: 1,
              },
            }}
          >
            {isSelected && (
              <CheckMark
                style={{
                  marginLeft: 6,
                  marginTop: 6,
                }}
              />
            )}
          </View>
        )}
        {geticon !== '' && (
          <View
            style={{
              marginLeft: wp('3%'),
            }}
          >
            {geticon()}
          </View>
        )}
        <View
          style={{
            flex: 1,
            marginLeft: width > 450 ? 15 : wp(4)
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={
                {
                  // // flex: 1,
                }
              }
            >
              <Text>
                <Text
                  style={{
                    fontSize: RFValue(12.8),
                    fontFamily: isSelected && changeBgColor ? Fonts.FiraSansMedium : Fonts.FiraSansRegular,
                    color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.blue,
                    marginBottom: hp(0.5),
                  }}
                >
                  {`${mainText} `}
                </Text>
              </Text>
            </View>
            {tag !== '' && (
              <View
                style={{
                  alignItems: 'center',
                  borderRadius: 5,
                  backgroundColor: isSelected ? Colors.white : Colors.lightBlue,
                  justifyContent: 'center',
                  marginLeft: 3,
                  padding: 3,
                }}
              >
                <Text
                  style={{
                    fontSize: RFValue(9),
                    fontFamily: Fonts.FiraSansRegular,
                    color: isSelected ? Colors.lightBlue : Colors.white,
                  }}
                >
                  {tag}
                </Text>
              </View>
            )}
          </View>

          <View style={{ paddingTop: 5 }}>
            {subText !== '' && (
              <Text
                style={{
                  fontSize: RFValue(11),
                  fontFamily: Fonts.FiraSansRegular,
                  color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.textColorGrey,
                }}
              >
                {subText}
                {boldText !== '' && (
                  <Text
                    style={{
                      fontWeight: '700',
                    }}
                  >
                    {boldText}
                  </Text>
                )}
              </Text>
            )}
            {italicText !== '' && (
              <Text
                style={{
                  fontSize: RFValue(11),
                  fontFamily: Fonts.FiraSansItalic,
                  color: isSelected && changeBgColor ? Colors.backgroundColor1 : Colors.textColorGrey,
                  width: wp(65),
                  fontWeight: '600',
                }}
              >
                {italicText}
              </Text>
            )}
          </View>
        </View>
        <Arrow
          color="red"
          height={15}
          width={15}
          style={{
            marginLeft: 6,
            marginTop: 6,
          }}
        />
      </View>
      {/* {isSelected && ( */}

      {/* )} */}
    </TouchableOpacity>
  );
}
