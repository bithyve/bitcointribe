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
        logo={require( '../assets/images/icons/icon_hexa_christmas.png' )}
        logoSize={80}
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
    backgroundColor: '#e3e3e3',
  },
  textQr: {
    color: '#6c6c6c',
    fontSize: 17,
    textAlign: 'center',
    paddingVertical: 7,
  },
} )

export default QRCode
