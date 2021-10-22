import { Platform, NativeModules } from 'react-native'
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
  return pdfPath
}
const getPdfPath = async ( pdfData: any ) => {
  if( pdfData ){
    if ( Platform.OS == 'ios' ) {
      const PdfPassword = await NativeModules.PdfPassword
      return await PdfPassword.createPdfKeeper( JSON.stringify( pdfData ) )
    } else {
      // alert( 'ANDROID'+JSON.stringify( pdfData ) )
      const PdfPassword = await NativeModules.PdfPassword
      await PdfPassword.createPdfKeeper(
        JSON.stringify( pdfData ),
        async ( err: any ) => {
          // alert( 'ERROR'+err )
          return await err
        },
        async ( path: any ) => {
          const data = await path
          // alert( path+ ' => '+ data )
          return path
        },
      )
      // return '/storage/emulated/0/' + pdfData.fileName
    }
  }
}
