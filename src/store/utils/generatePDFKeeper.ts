import { Platform, NativeModules } from 'react-native'
import { PermissionsAndroid } from 'react-native'
import { getFormattedString } from '../../common/CommonFunctions'


export default async ( pdfData, fileName, title ) => {
  const { qrData } = pdfData
  const qrcode: string[] = []
  const qrCodeString: string[][] = []
  qrData.forEach( ( qrString ) => {
    qrcode.push( getFormattedString( qrString ) )
    qrCodeString.push( qrString )
  } )
  const pdfDatas = {
    title,
    fileName,
    qrcode,
    qrCodeString,
  }
  const pdfPath = await getPdfPath( pdfDatas )
  console.log( {
    pdfPath
  } )
  return pdfPath
}
const getPdfPath = async ( pdfData: any ) => {
  if( pdfData ){
    console.log( 'PDFDATA', pdfData )
    if ( Platform.OS == 'ios' ) {
      const PdfPassword = await NativeModules.PdfPassword
      console.log( 'PADFPASSWORD', PdfPassword )
      return await PdfPassword.createPdfKeeper( JSON.stringify( pdfData ) )
    } else {
      const PdfPassword = await NativeModules.PdfPassword
      await PdfPassword.createPdfKeeper(
        JSON.stringify( pdfData ),
        async ( err: any ) => {
          return await err
        },
        async ( path: any ) => {
        // console.log({ path });
          return await path
        },
      )
      return '/storage/emulated/0/' + pdfData.fileName
    }
  }
}
