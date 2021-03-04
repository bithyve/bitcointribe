import React, { memo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../common/Colors';
import { AppBottomSheetTouchableWrapper } from '../AppBottomSheetTouchableWrapper';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Fonts from '../../common/Fonts';

const ReceiveAmountContent = ({
    title,
    message,
    selectedAmount,
    onPressConfirm,
    onPressBack
}) => {
  const [amount, setAmount] = useState(selectedAmount);

  return (
    <View style={styles.modalContentContainer}>
      <View style={{ flex: 1 }}>
      <View style={styles.successModalHeaderView}>
        <Text style={styles.modalTitleText}>{title}</Text>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>{message}</Text>
      </View>
      <View style={styles.textBoxView}>
          <View style={styles.amountInputImage}>
            <Image
              style={styles.textBoxImage}
              source={require('../../assets/images/icons/icon_bitcoin_gray.png')}
            />
          </View>
          <TextInput
            style={{
              ...styles.textBox, paddingLeft: 10
            }}
            placeholder={'Enter amount'}
            value={amount}
            returnKeyLabel="Done"
            returnKeyType="done"
            keyboardType={'numeric'}
            onChangeText={(value) => setAmount(value)}
            placeholderTextColor={Colors.borderColor}
            autoCorrect={false}
            autoFocus={false}
            autoCompleteType="off"
          />
        </View> 
        <View style={styles.successModalHeaderView}>
        <Text style={{
          ...styles.modalInfoText, marginTop: wp( '1.5%' )
        }}>{'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna'}</Text>
        </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 'auto',
          alignItems: 'center',
          marginBottom: hp( '4%' ),
        }}
      >
        <AppBottomSheetTouchableWrapper
          onPress={() => {
            onPressConfirm( amount )
          }}
          style={styles.successModalButtonView}
        >
          <Text style={styles.proceedButtonText}>Receive</Text>
        </AppBottomSheetTouchableWrapper>
        <AppBottomSheetTouchableWrapper
          onPress={() => onPressBack()}
          style={styles.backButton}
        >
          <Text style={{
            ...styles.proceedButtonText, color: Colors.blue 
          }}>
            Back
          </Text>
        </AppBottomSheetTouchableWrapper>
      </View>
      </View>
    </View>
  );
};

export default memo(ReceiveAmountContent);

const styles = StyleSheet.create({
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  successModalHeaderView: {
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginTop: wp( '5%' ),
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
    textAlign: 'justify'
  },
  successModalButtonView: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15 
    },
    backgroundColor: Colors.blue,
    alignSelf: 'center',
    marginLeft: wp( '8%' ),
  },
  proceedButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  backButton:{
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: 50,
    marginRight: wp( '10%' ),
    marginLeft: wp( '10%' ),
    marginBottom: hp(4),
    marginTop: hp(2),
  },
  textBoxImage: {
    width: wp('6%'),
    height: wp('6%'),
    resizeMode: 'contain',
  },
  amountInputImage: {
    width: 40,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.borderColor,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(13),
  },
});
