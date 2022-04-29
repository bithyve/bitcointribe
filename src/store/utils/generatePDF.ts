import { Platform, NativeModules, Alert } from 'react-native'
import { getFormattedString } from '../../common/CommonFunctions'

const chunkArray = ( arr: any, n: any ) => {
  const chunkLength = Math.max( arr.length / n, 1 )
  const chunks = []
  for ( let i = 0; i < n; i++ ) {
    if ( chunkLength * ( i + 1 ) <= arr.length )
      chunks.push( arr.slice( chunkLength * i, chunkLength * ( i + 1 ) ) )
  }
  return chunks
}


export default async ( pdfData, fileName, title, password ) => {
  const { qrData, secondaryMnemonic, secondaryXpub, bhXpub } = pdfData
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
    password,
    secondaryXpub,
    secondaryMnemonic,
    bhXpub,
  }

  return await getPdfPath( pdfDatas )
}

const getPdfPath = async ( pdfData: any ) => {
  if ( Platform.OS == 'ios' ) {
    const PdfPassword = NativeModules.PdfPassword
    return await PdfPassword.createPdf( JSON.stringify( pdfData ) )
  } else {
    const PdfPassword = await NativeModules.PdfPassword
    await PdfPassword.createPdf(
      JSON.stringify( pdfData ),
      async ( err: any ) => {
        return await err
      },
      async ( path: any ) => {
        return await path
      },
    )
    return '/storage/emulated/0/' + pdfData.fileName
  }
}
