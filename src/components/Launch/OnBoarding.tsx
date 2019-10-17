import React from 'react';
import {
  StyleSheet,
  View,
  SafeAreaView,
  Image,
  AsyncStorage,
  Dimensions,
  Alert,
} from 'react-native';
import { Text } from 'native-base';
import { StackActions, NavigationActions } from 'react-navigation';

import CreateTables from 'HexaWallet/src/app/manage/database/CreateTables';
import IconFontAwe from 'react-native-vector-icons/FontAwesome';

//Custome Compontes
import { CustomStatusBar } from 'hexaCustStatusBar';
import { FullLinearGradientButton } from 'hexaCustomeLinearGradientButton';

//TODO: Custome StyleSheet Files
import FontFamily from 'hexaStyles';

//TODO: Custome object
import { colors, images, asyncStorageKeys } from 'hexaConstants';

//localization
import localization from 'hexaLocalization/i18n';

export default class OnBoarding extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      data: [],
    };
  }

  componentWillMount() {
    try {
      //PrivacySnapshot.enabled( true );
      //   this.setState( {
      //     data: localization( "OnBoarding.onBoarding" )
      //   } );
    } catch (error) {
      Alert.alert(error);
    }
  }

  //TODO: func click_Done
  click_Done() {
    try {
      AsyncStorage.setItem(
        asyncStorageKeys.rootViewController,
        'PasscodeConfirm',
      );
      const resetAction = StackActions.reset({
        index: 0, // <-- currect active route from actions array
        key: null,
        actions: [NavigationActions.navigate({ routeName: 'PasscodeConfirm' })],
      });
      this.props.navigation.dispatch(resetAction);
    } catch (error) {
      Alert.alert(error);
    }
  }

  render() {
    // const data = [
    //   {
    //     backgroundColor: this.state.data[ 0 ].backgroundColor,
    //     image: images.onBoardingScreen.onB1,
    //     title: this.state.data[ 0 ].title,
    //     subtitle: this.state.data[ 0 ].subtitle
    //   },
    //   {
    //     backgroundColor: this.state.data[ 1 ].backgroundColor,
    //     image: images.onBoardingScreen.onB2,
    //     title: this.state.data[ 1 ].title,
    //     subtitle: this.state.data[ 2 ].subtitle
    //   },
    //   {
    //     backgroundColor: this.state.data[ 2 ].backgroundColor,
    //     image: images.onBoardingScreen.onB3,
    //     title: this.state.data[ 2 ].title,
    //     subtitle: this.state.data[ 2 ].subtitle
    //   }
    // ];
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.container}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={[FontFamily.ffFiraSansBold, { fontSize: 30 }]}>
              Wallet Reimagined
            </Text>
            <View
              style={{
                flexDirection: 'row',
                margin: 20,
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text note style={{ margin: 10 }}>
                Simple
              </Text>
              <IconFontAwe name="circle" color="#2F2F2F" size={8} />
              <Text note style={{ margin: 10 }}>
                Smart
              </Text>
              <IconFontAwe name="circle" color="#2F2F2F" size={8} />
              <Text note style={{ margin: 10 }}>
                Secure
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Image
              style={{
                width: Dimensions.get('screen').width,
                height: 300,
              }}
              resizeMode="contain"
              source={images.onBoardingScreen.simpleSecureSmart}
            />
          </View>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <FullLinearGradientButton
              title="Get Started"
              disabled={this.state.flag_ConfirmDisableBtn}
              style={[{ opacity: 1 }, { borderRadius: 10, margin: 10 }]}
              click_Done={() => this.click_Done()}
            />
          </View>
          <CreateTables />
        </SafeAreaView>
        <CustomStatusBar
          backgroundColor={colors.white}
          hidden={false}
          barStyle="dark-content"
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  slide: {
    flex: 1, // Take up all screen
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
  },
  // Header styles
  header: {
    color: '#000000',
    fontSize: 30,
    marginVertical: 15,
    margin: 20,
    textAlign: 'center',
  },
  // Text below header
  text: {
    fontFamily: 'Avenir',
    fontSize: 18,
    marginHorizontal: 40,
    textAlign: 'center',
  },
});
