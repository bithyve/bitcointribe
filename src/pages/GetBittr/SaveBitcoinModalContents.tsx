import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper';

export default function SaveBitcoinModalContents(props) {
    const [ addData, setAddData ] = useState( [
		{
      title: 'Recurring Buy',
      image: require('../../assets/images/icons/icon_getbitter.png'), info: 'Setup a recurring payment to stack sats',
      type: "recurringBuy"
		},
		{
      title: `Credit Card`,
      image: require( '../../assets/images/icons/icon_fastbicoin.png' ), info: 'Buy bitcoins using credit card',
      type: "creditCard"
		},
		{
      title: 'Voucher',
      image: require( '../../assets/images/icons/icon_addcontact.png' ), info: 'Purchase a voucher or use a voucher you own',
      type: "voucher"
		},
		{
      title: 'Existing Saving Methods',
      image: require( '../../assets/images/icons/icon_addaccount.png' ), info: 'Lorem ipsum dolor sit amet, consecteture adipiscing',
      type: "existingSavingMethods"
		},
	] )
  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => props.onPressBack()}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.modalHeaderTitleText}>Save Bitcoins</Text>
            <Text style={styles.pageInfoText}>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vitae rem
              porro ducimus repudiandae alias optio accusantium numquam illum
              autem
            </Text>
          </View>
        </View>
      </View>
      <FlatList
        data={addData}
        ItemSeparatorComponent={() => (
          <View style={{ backgroundColor: Colors.white }}>
            <View style={styles.separatorView} />
          </View>
        )}
        renderItem={({ item }) => (
          <AppBottomSheetTouchableWrapper
            onPress={() => props.onPressElements(item.type)}
            style={styles.addModalView}
          >
            <View style={styles.modalElementInfoView}>
              <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                <Image source={item.image} style={{ width: 25, height: 25 }} resizeMode='contain'  />
              </View>
              <View style={{ justifyContent: 'center', marginLeft: 10 }}>
                <Text style={styles.addModalTitleText}>{item.title} </Text>
                <Text style={styles.addModalInfoText}>{item.info}</Text>
              </View>
            </View>
          </AppBottomSheetTouchableWrapper>
        )}
      />
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
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: 15,
    paddingTop: 10,
    marginLeft: 20,
    marginBottom: 15,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansMedium,
  },
  pageInfoText: {
    marginRight: 15,
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
  },
  separatorView: {
    marginLeft: 15,
    marginRight: 15,
    height: 2,
    backgroundColor: Colors.backgroundColor,
  },
  modalElementInfoView: {
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addModalView: {
    backgroundColor: Colors.white,
    padding: 7,
    flexDirection: 'row',
    display: 'flex',
    // marginTop: 10,
    justifyContent: 'space-between',
  },
  addModalTitleText: {
    color: Colors.blue,
    fontSize: RFValue(13),
  },
  addModalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
  },
});
