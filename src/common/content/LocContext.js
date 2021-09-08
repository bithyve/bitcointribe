import AsyncStorage from '@react-native-async-storage/async-storage'
import React, { createContext, useState } from 'react'
import * as RNLocalize from 'react-native-localize'
import en from './language/en.json'
import es from './language/es.json'
import de from './language/de.json'
import mr from './language/mr.json'
import hi from './language/hi.json'
import fr from './language/fr.json'
import pt from './language/pt.json'
import gu from './language/gu.json'
import bn from './language/bn.json'

import moment from 'moment'
import 'moment/locale/es'
import 'moment/locale/de'
import LocalizedContent from 'react-localization'

const DEFAULT_LANGUAGE = 'en'
const APP_LANGUAGE = 'appLanguage'

const languages = {
  en, es, de, mr, hi, fr, pt, gu, bn
}
export const translations = new LocalizedContent( languages )

export const LocalizationContext = createContext( {
  translations,
  setAppLanguage: () => {},
  appLanguage: DEFAULT_LANGUAGE,
  initializeAppLanguage: () => {},
} )


export const LocalizationProvider = ( { children } ) => {
  const [ appLanguage, setAppLanguage ] = useState( DEFAULT_LANGUAGE )

  const setLanguage = language => {
    translations.setLanguage( language )
    setAppLanguage( language )
    AsyncStorage.setItem( APP_LANGUAGE, language )
  }

  const formatString = ( ...param ) => {
    return translations.formatString( ...param )
  }

  const initializeAppLanguage = async () => {
    const currentLanguage = await AsyncStorage.getItem( APP_LANGUAGE )
    if ( currentLanguage ) {
      setLanguage( currentLanguage )
      moment.locale( currentLanguage )
    } else {
      let localeCode = DEFAULT_LANGUAGE
      const supportedLocaleCodes = translations.getAvailableLanguages()
      const phoneLocaleCodes = RNLocalize.getLocales().map(
        locale => locale.languageCode,
      )
      phoneLocaleCodes.some( code => {
        if ( supportedLocaleCodes.includes( code ) ) {
          localeCode = code
          return true
        }
      } )
      moment.locale( localeCode )

      setLanguage( localeCode )
    }
  }

  return(
    <LocalizationContext.Provider
      value={{
        translations,
        setAppLanguage: setLanguage,
        appLanguage,
        initializeAppLanguage,
        formatString,
      }}>
      {children}
    </LocalizationContext.Provider>
  )
}
