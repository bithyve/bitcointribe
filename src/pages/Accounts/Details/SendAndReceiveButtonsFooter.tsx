import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ImageSourcePropType,
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import NetworkKind from '../../../common/data/enums/NetworkKind'
import Fonts from '../../../common/Fonts'

type FooterButtonProps = {
  style?: Record<string, unknown>;
  title: string;
  subtitle: string;
  imageSource: ImageSourcePropType;
  onPress: () => void;
};

export type Props = {
  onSendPressed: () => void;
  onReceivePressed: () => void;
  averageTxFees: any;
  network: NetworkKind;
};

const FooterButton: React.FC<FooterButtonProps> = ( {
  style = {
  },
  title,
  subtitle,
  imageSource,
  onPress,
} ) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        ...styles.buttonContainer,
        ...style
      }}
    >
      <View style={styles.buttonImageContainer}>
        <Image source={imageSource} style={styles.buttonImage} />
      </View>

      <View style={styles.buttonTextContainer}>
        <Text style={styles.buttonTitleText}>{title}</Text>
        <Text style={styles.buttonSubtitleText}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  )
}

const SendAndReceiveButtonsFooter: React.FC<Props> = ( {
  onSendPressed,
  onReceivePressed,
  averageTxFees,
  network,
} ) => {
  return (
    <View style={styles.rootContainer}>
      <FooterButton
        style={{
          marginRight: 8
        }}
        onPress={onSendPressed}
        title="Send"
        subtitle={`Tran Fee: ~${
          averageTxFees ? averageTxFees[ network ].low.averageTxFee : 0
        } (${network === NetworkKind.TESTNET ? 't-sats' : 'sats'})`}
        imageSource={require( '../../../assets/images/icons/icon_send.png' )}
      />
      <FooterButton
        onPress={onReceivePressed}
        title="Receive"
        subtitle={''}
        imageSource={require( '../../../assets/images/icons/icon_receive_translucent.png' )}
      />
    </View>
  )
}

const styles = StyleSheet.create( {
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
    paddingHorizontal: 24,
    borderRadius: 15,
    borderColor: '#E3E3E3',
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
    fontSize: RFValue( 15 ),
  },

  buttonSubtitleText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 9 ),
  },
} )

export default SendAndReceiveButtonsFooter
