import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  Text,
  Image,
  AsyncStorage,
} from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Fonts from '../../common/Fonts';
import Colors from '../../common/Colors';
import CommonStyles from '../../common/Styles/Styles';
import { RFValue } from 'react-native-responsive-fontsize';
import HeaderTitle from '../../components/HeaderTitle';

export default function RestoreSelectedContactsList(props) {
  const selectDocument = async type => {
    if (type == 'cloud') {
      await AsyncStorage.setItem(
        'selectedDocuments',
        JSON.stringify([{ title: 'Cloud', status: '' }]),
      );
      props.navigation.navigate('RestoreSelectedContactsList');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={{ flex: 1 }}>
        <View style={CommonStyles.headerContainer}>
          <TouchableOpacity
            style={CommonStyles.headerLeftIconContainer}
            onPress={() => {
              props.navigation.goBack();
              // props.navigation.navigate('RestoreSelectedContactsList');
            }}
            hitSlop={{top: 20, left: 20, bottom: 20, right: 20}}
          >
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 2 }}>
          <HeaderTitle
            firstLineTitle={'Restore wallet using'}
            secondLineTitle={'Documents'}
            infoTextNormal={'Sources where you have kept a document '}
            infoTextBold={'copy of the Recovery Key'}
          />
        </View>
        <View style={{ flex: 8 }}>
          <TouchableOpacity
            onPress={() => selectDocument('cloud')}
            style={styles.listElements}
          >
            <Image
              style={styles.listElementsIconImage}
              source={require('../../assets/images/icons/icon-print.png')}
            />
            <View style={{ justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.listElementsTitle}>Cloud</Text>
              {/* <Text style={styles.listElementsInfo} numberOfLines={1}>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
              </Text> */}
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={10}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listElements}>
            <Image
              style={styles.listElementsIconImage}
              source={require('../../assets/images/icons/icon-print.png')}
            />
            <View style={{ justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.listElementsTitle}>Email</Text>
              {/* <Text style={styles.listElementsInfo} numberOfLines={1}>
                Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
                diam nonumy eirmod tempor invidunt ut labore et dolore magna
              </Text> */}
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={10}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listElements}>
            <Image
              style={styles.listElementsIconImage}
              source={require('../../assets/images/icons/icon-print.png')}
            />
            <View style={{ justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.listElementsTitle}>Print</Text>
              {/* <Text style={styles.listElementsInfo} numberOfLines={1}>
                Lorem ipsum dolor sit amet, consetetur
              </Text> */}
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={10}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.listElements}>
            <Image
              style={{
                resizeMode: 'contain',
                width: 20,
                height: 25,
                alignSelf: 'center',
              }}
              source={require('../../assets/images/icons/icon-usb.png')}
            />
            <View style={{ justifyContent: 'space-between', flex: 1 }}>
              <Text style={styles.listElementsTitle}>Local</Text>
              {/* <Text style={styles.listElementsInfo}>
                Lorem ipsum dolor sit amet,
              </Text> */}
            </View>
            <View style={styles.listElementIcon}>
              <Ionicons
                name="ios-arrow-forward"
                color={Colors.textColorGrey}
                size={10}
                style={{ alignSelf: 'center' }}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listElements: {
    flexDirection: 'row',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    borderBottomWidth: 0.5,
    borderColor: Colors.borderColor,
    paddingBottom: 20,
    justifyContent: 'center',
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
