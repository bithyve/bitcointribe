import LocalizedContent from 'react-localization'

const content = new LocalizedContent( {
  en: require( './language/de.json' ),
  es: require( './language/es.json' ),
  de: require( './language/de.json' )
} )

const setDisplayLanguage = async ( language ) => {
  try {
    if( language ) content.setLanguage( language )

  } catch ( error ) {
  //  error
  }
}

setDisplayLanguage( 'es' )

export default content

export {
  setDisplayLanguage
}
