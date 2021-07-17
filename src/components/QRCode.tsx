import React from 'react'
import {
  View,
  Text,
  StyleSheet,
} from 'react-native'
import QR from 'react-native-qrcode-svg'
import {
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'

export type Props = {
  value: string;
  size?: number;
  title? : string;
};

const QRCode: React.FC<Props> = ( {
  value = '',
  size = hp( '27%' ),
  title = '',
}: Props ) => {

  return (
    <View style={styles.containerQrCode}>
      <QR
        logo={require( '../assets/images/icons/icon_hexa.png' )}
        logoSize={50}
        logoMargin={2}
        logoBackgroundColor="white"
        logoBorderRadius={50}
        value={value}
        size={size} />
      {
        title !== '' && (
          <Text style={styles.textQr}>{title}</Text>

        )
      }
    </View>
  )
}

const styles = StyleSheet.create( {
  containerQrCode: {
    backgroundColor: 'gray',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  textQr: {
    color: 'white',
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 5,
  },
} )

export default QRCode
