import React, { useState } from 'react';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import { ScrollView } from 'react-native-gesture-handler';
export default function TestAccountHelperModalContents(props) {
  const mainView = () =>{
    return (<View
          style={{
            height: '100%',
            marginLeft: wp('8%'),
            marginRight: wp('8%'),
          }}
        >
          <View
            style={{
              marginTop: hp('1%'),
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontFamily: Fonts.FiraSansMedium,
                fontSize: RFValue(15),
                fontWeight: 'bold',
                marginTop: hp('1%'),
                marginBottom: hp('1%'),
              }}
            >
              {props.topButtonText}
            </Text>
          </View>
          {props.boldPara ? (
            <View
              style={{
                marginTop: hp('1%'),
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue(12),
                  fontFamily: Fonts.FiraSansMedium,
                }}
              >
                {props.boldPara}
              </Text>
            </View>
          ) : null}

          <View
            style={{
              marginTop: hp('1%'),
            }}
          >
            <Text
              style={{
                color: Colors.white,
                fontSize: RFValue(12),
                fontFamily: Fonts.FiraSansRegular,
              }}
            >
              {props.helperInfo}
            </Text>
          </View>
        </View>
    )
  }
  return (
    <View style={styles.modalContainer}>
      {
        props.topButtonText == 'Receiving bitcoin'?
        (<ScrollView>
          {mainView()}
        </ScrollView>) : 
        (<View>
        {mainView()}
        </View>)
      }
      {/* <View
        style={{
          flexDirection: 'row',
          marginTop: hp('1%'),
          marginBottom: hp('2%'),
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressContinue()}
          style={{
            width: wp('40%'),
            height: wp('13%'),
            backgroundColor: Colors.white,
            borderRadius: 10,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
          }}
        >
          <Text
            style={{
              color: Colors.blue,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.continueButtonText}
          </Text>
        </AppBottomSheetTouchableWrapper>
         <AppBottomSheetTouchableWrapper
          onPress={() => props.onPressQuit()}
          style={{
            width: wp('20%'),
            height: wp('13%'),
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: Colors.white,
              fontSize: RFValue(13),
              fontFamily: Fonts.FiraSansRegular,
            }}
          >
            {props.quitButtonText}
          </Text>
        </AppBottomSheetTouchableWrapper> 
      </View>*/}
      {props.image ? (
        <View style={{ marginTop: 'auto', marginLeft: 'auto' }}>
          <Image
            source={props.image}
            style={{
              width: wp('28%'),
              height: wp('28%'),
              resizeMode: 'contain',
            }}
          />
        </View>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  modalContainer: {
    height: '100%',
    backgroundColor: Colors.blue,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 10,
    shadowOffset: { width: 0, height: 2 },
  },
});
