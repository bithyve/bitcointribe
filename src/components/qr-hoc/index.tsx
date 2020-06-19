import React from 'react'
import QRCode from 'react-native-qrcode-svg';
import { getVersion } from 'react-native-device-info'

const generateQRCode = (value) => {
    try {
        let parsedValue = JSON.parse(value)
        let version = getVersion()
        return JSON.stringify({ ...parsedValue, v: version })
    } catch (error) {
        let version = getVersion()
        return JSON.stringify({ value, v: version })
    }


}

const QRCodeWrapper = ({ value, size }) => {
    let qrValue = generateQRCode(value)
    return (
        <QRCode value={qrValue} size={size} />
    )
}

export default QRCodeWrapper


