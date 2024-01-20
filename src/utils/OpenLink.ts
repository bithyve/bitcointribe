import { Linking } from 'react-native'

export default async function openLink( urlPath: string ) {
  try {
    await Linking.openURL( urlPath )
  } catch ( err ) {
    throw Error( `Unable to open URL at path: ${urlPath}` )
  }
}

