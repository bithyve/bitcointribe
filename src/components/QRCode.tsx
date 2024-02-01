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
import Fonts from '../common/Fonts'
import Toast from './Toast'

export type Props = {
  value: string;
  size?: number;
  title? : string;
};

const QRCode: React.FC<Props> = ( {
  value = '',
  size = hp( '30%' ),
  title = '',
}: Props ) => {

  return (
    <View style={styles.containerQrCode}>
      <QR
        logo={require( '../assets/images/icons/icon_qr_logo.png' )}
        logoSize={45}
        logoMargin={1}
        logoBackgroundColor="white"
        logoBorderRadius={45}
        value={value}
        onError={()=>{
          Toast('Something went wrong, please try again')
        }}
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
    fontFamily: Fonts.Regular
  },
} )

export default QRCode
