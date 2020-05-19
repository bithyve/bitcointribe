import React from 'react';
import {
  View,
  Image,
  Text,
  Clipboard,
} from 'react-native';
import Colors from '../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';
import Toast from '../components/Toast';
import { AppBottomSheetTouchableWrapper } from './AppBottomSheetTouchableWrapper';
export default function CopyThisText(props) {
  function writeToClipboard() {
    Clipboard.setString(props.text);
    Toast('Copied Successfully');
  }

  return (
    <View
      style={{
        marginTop: 30,
        paddingLeft: 25,
        paddingRight: 25,
        marginLeft:25, marginRight:25,
        alignItems:'center', justifyContent:'center'
      }}
    >
      <AppBottomSheetTouchableWrapper
        onPress={() => (props.openLink ? props.openLink() : writeToClipboard())}
        style={{
          flexDirection: 'row',
          }}
      >
        <View
          style={{
            backgroundColor: Colors.backgroundColor,
            borderBottomLeftRadius: 8,
            borderTopLeftRadius: 8,
            height: 50,
            paddingLeft: 15,
            paddingRight: 15,
            justifyContent: 'center',
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              fontSize: RFValue(13),
              color: Colors.lightBlue,
            }}
          >
            {props.text}
          </Text>
        </View>
        <View
          style={{
            width: 48,
            height: 50,
            backgroundColor: Colors.borderColor,
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Image
            style={{ width: 18, height: props.openLink ? 18 : 20 }}
            source={
              props.openLink
                ? require('../assets/images/icons/openlink.png')
                : require('../assets/images/icons/icon-copy.png')
            }
          />
        </View>
      </AppBottomSheetTouchableWrapper>
    </View>
  );
}
