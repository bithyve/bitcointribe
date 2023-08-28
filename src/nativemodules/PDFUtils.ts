import { NativeModules } from 'react-native'

const { PDFModule } = NativeModules

export default class PDFUtils {
  static pdfToText = async ( path: string ): Promise<string[]> =>
    PDFModule.pdfToText( path );
}
