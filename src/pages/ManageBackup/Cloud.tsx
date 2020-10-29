import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import NavStyles from '../../common/Styles/NavStyles';
import CommonStyles from '../../common/Styles/Styles';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { RFValue } from 'react-native-responsive-fontsize';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getIconByStatus } from './utils';
import FontAwesome from 'react-native-vector-icons/FontAwesome';


const Cloud = (props) => {
  const [selectedStatus] = useState('Ugly'); // for preserving health of this entity
  const [cloudData] = useState([
    {
      title: 'iCloud Drive',
      info: 'Store backup in iCloud Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'Google Drive',
      info: 'Store backup in Google Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'One Drive',
      info: 'Store backup in One Drive',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
    {
      title: 'DropBox Storage',
      info: 'Store backup in Dropbox Storage',
      imageIcon: require('../../assets/images/icons/logo_brand_brands_logos_icloud.png'),
    },
  ]);

  // const dispatch = useDispatch();
  // const { loading } = useSelector((state) => state.sss);

  // useEffect(() => {
  //   dispatch(generatePersonalCopies());
  // }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            props.navigation.goBack();
          }}
          hitSlop={{ top: 20, left: 20, bottom: 20, right: 20 }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>
      <View style={NavStyles.modalHeaderTitleView}>
        <View style={{ marginTop: hp('1%') }}>
          <Text style={NavStyles.modalHeaderTitleText}>Cloud</Text>
          <Text style={NavStyles.modalHeaderInfoText}>Never backed up</Text>
        </View>
        <Image
          style={CommonStyles.cardIconImage}
          source={getIconByStatus(selectedStatus)}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            marginLeft: 30,
            color: Colors.textColorGrey,
            fontFamily: Fonts.FiraSansRegular,
            fontSize: RFValue(12),
            marginTop: 5,
            marginBottom: 5,
          }}
        >
          Select cloud drive to{' '}
          <Text
            style={{
              fontFamily: Fonts.FiraSansMediumItalic,
              fontWeight: 'bold',
            }}
          >
            store recovery key
          </Text>
        </Text>
        <View style={{ flex: 1 }}>
          <FlatList
            data={cloudData}
            renderItem={({ item }) => (
              <View style={styles.listElements}>
                <Image
                  style={styles.listElementsIconImage}
                  source={item.imageIcon}
                />
                <View style={{ justifyContent: 'space-between', flex: 1 }}>
                  <Text style={styles.listElementsTitle}>{item.title}</Text>
                  <Text style={styles.listElementsInfo} numberOfLines={1}>
                    {item.info}
                  </Text>
                </View>
                <View style={styles.listElementIcon}>
                  <Ionicons
                    name="ios-arrow-forward"
                    color={Colors.textColorGrey}
                    size={15}
                    style={{ alignSelf: 'center' }}
                  />
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listElements: {
    flexDirection: 'row',
    marginLeft: 20,
    marginRight: 20,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingTop: 25,
    paddingBottom: 25,
    paddingLeft: 10,
    alignItems: 'center',
  },
  listElementsTitle: {
    color: Colors.blue,
    fontSize: RFValue(13),
    marginLeft: 13,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementsInfo: {
    color: Colors.textColorGrey,
    fontSize: RFValue(11),
    marginLeft: 13,
    marginTop: 5,
    fontFamily: Fonts.FiraSansRegular,
  },
  listElementIcon: {
    paddingRight: 5,
    marginLeft: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listElementsIconImage: {
    resizeMode: 'contain',
    width: 25,
    height: 25,
    alignSelf: 'center',
  },
});

export default Cloud;
