import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image
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
      {props.data && props.data.length ? 
      <View style={{ flex: 1 }}>
        <ScrollView style={{ }}>
        {props.data.map(value => {
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
        {props.data.length<=1 ? 
        <View style={{ backgroundColor:Colors.backgroundColor, }}>
          <View style={{ margin:15, backgroundColor:Colors.white, padding:10, paddingTop:20, borderRadius:7}}>
            <Text style={{color:Colors.black, fontSize:RFValue(13), fontFamily:Fonts.FiraSansRegular}}>You don't have history of your Recovery Secret yet</Text>
            <Text style={{color:Colors.textColorGrey, fontSize:RFValue(12), fontFamily:Fonts.FiraSansRegular}}>The history of your Recovery Secret will appear here</Text>
          </View>
        </View>
          : null
      }
      </View>
      :
      <View style={{flex:1, }}>
        <ScrollView>
        {[1,2,3,4].map((value)=>{
          return <View style={{ margin: wp('3%'), backgroundColor: Colors.white, borderRadius: 10, height: wp('20%'), width: wp('90%'), paddingLeft: wp('3%'), paddingRight: wp('3%'),
          alignSelf: 'center', flexDirection:'row', alignItems:'center', justifyContent: 'space-between' }}>
            <View>
              <View style={{backgroundColor:Colors.backgroundColor, height:wp('4%'), width:wp('40%'), borderRadius:10}}/>
              <View style={{backgroundColor:Colors.backgroundColor, height:wp('4%'), width:wp('30%'), marginTop:5, borderRadius:10}}/>
              </View>
          </View>
          })}
        </ScrollView>
        <View style={{ backgroundColor:Colors.backgroundColor, }}>
          <View style={{ margin:15, backgroundColor:Colors.white, padding:10, paddingTop:20, borderRadius:7}}>
            <Text style={{color:Colors.black, fontSize:RFValue(13), fontFamily:Fonts.FiraSansRegular}}>You don't have history of your Recovery Secret yet</Text>
            <Text style={{color:Colors.textColorGrey, fontSize:RFValue(12), fontFamily:Fonts.FiraSansRegular}}>The history of your Recovery Secret will appear here</Text>
          </View>
        </View>
      </View>
    }
      
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
              Change contact
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
