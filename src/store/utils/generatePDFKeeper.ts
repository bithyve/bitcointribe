import { Platform, NativeModules } from 'react-native'
import { getFormattedString } from '../../common/CommonFunctions'

let pdfFilePath = ''

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
  if( Platform.OS=='ios' ){
    const pdfPath = await getPdfPath( pdfDatas )
    return pdfPath
  } else {
    const PdfPassword = await NativeModules.PdfPassword
    await PdfPassword.createPdfKeeper(
      JSON.stringify( pdfDatas ),
      async ( err: any ) => {
        return await err
      },
      async ( path: any ) => {
        pdfFilePath = path
      },
    )
    return pdfFilePath
  }
}

const getPdfPath = async ( pdfData: any ) => {
  if( pdfData ){
    if ( Platform.OS == 'ios' ) {
      const PdfPassword = await NativeModules.PdfPassword
      console.log( 'create pdf', pdfData )
      return await PdfPassword.createPdfKeeper( JSON.stringify( pdfData ) )
    }
  }
}
