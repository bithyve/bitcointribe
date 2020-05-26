import React from 'react'
import QRCode from 'react-native-qrcode-svg';
import { getVersion } from 'react-native-device-info'

const generateQRCode = (value) => {
    let parsedValue = JSON.parse(value)
    let version = getVersion()
    return JSON.stringify({ ...parsedValue, v: version })

}

const QRCodeWrapper = ({ value, size }) => {
    let qrValue = generateQRCode(value)
    // console.log("QR Value Calculated", qrValue)
    return (
        <QRCode value={qrValue} size={size} />
    )
}

export default QRCodeWrapper


