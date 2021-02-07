import LocalizedContent from 'react-localization'

const content = new LocalizedContent( {
  en: require( './language/en.json' ),
  es: require( './language/es.json' )
} )

const setDisplayLanguage = async ( language ) => {
  if( language ) content.setLanguage( language )
}

setDisplayLanguage( 'es' )

export default content
