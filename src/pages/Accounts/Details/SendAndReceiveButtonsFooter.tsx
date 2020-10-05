import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import Colors from '../../../common/Colors';
import Fonts from '../../../common/Fonts';

type FooterButtonProps = {
  style?: Record<string, unknown>;
  title: string;
  subtitle: string;
  imageSource: NodeRequire;
  onPress: () => void;
}

export type Props = {
  onSendPressed: () => void;
  onReceivePressed: () => void;
}

const FooterButton: React.FC<FooterButtonProps> = ({
  style,
  title,
  subtitle,
  imageSource,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ ...styles.buttonContainer, ...style }}
    >
      <View style={styles.buttonImageContainer}>
        <Image
          source={imageSource}
          style={styles.buttonImage}
        />
      </View>

      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitleText}>{title}</Text>
        <Text style={styles.buttonSubtitleText}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

const SendAndReceiveButtonsFooter: React.FC<Props> = ({
  onSendPressed,
  onReceivePressed,
}) => {
  return (
    <View style={styles.rootContainer}>
      <FooterButton
        style={{marginLeft: 10}}
        onPress={onSendPressed}
        title="Send"
        subtitle="Tran Fee: 0.032 (sats)"
        imageSource={require('../../../assets/images/icons/icon_send.png')}
      />
      <FooterButton
        onPress={onReceivePressed}
        title="Receive"
        subtitle="Tran Fee: 0.032 (sats)"
        imageSource={require('../../../assets/images/icons/icon_receive_translucent.png')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  buttonContainer: {
    width: 165,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 18,
    borderRadius: 15,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    backgroundColor: Colors.white,
  },

  buttonImage: {
    width: 25,
    height: 25,
  },

  buttonImageContainer: {
    marginRight: 10,
  },

  buttonTextContainer: {
  },

  buttonTitleText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(15),
  },

  buttonSubtitleText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(9),
  },
});

export default SendAndReceiveButtonsFooter;
