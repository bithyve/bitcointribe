import React, { useEffect, useMemo, useRef, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Input } from 'react-native-elements'

import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import Fonts from '../../../common/Fonts'
import FormStyles from '../../../common/Styles/FormStyles'
import HeaderTitle from '../../../components/HeaderTitle'
import { updateAccountSettings } from '../../../store/actions/accounts'
import useAccountSettingsUpdatedEffect from '../../../utils/hooks/account-effects/UseAccountSettingsUpdatedEffect'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'

export type Props = {
  route: any;
  navigation: any;
};

const AccountSettingsEditDisplayPropertiesScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const accountShell = useAccountShellFromRoute( route )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const [ accountName, setAccountName ] = useState(
    primarySubAccount?.customDisplayName ||
    primarySubAccount?.defaultTitle ||
    ''
  )

  const [ accountDescription, setAccountDescription ] = useState(
    primarySubAccount?.customDescription ||
    primarySubAccount?.defaultDescription ||
    ''
  )

  const canSaveChanges = useMemo( () => {
    return (
      accountName.length > 0 &&
      accountDescription.length > 0
    )
  }, [ accountName, accountDescription ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  // TODO: We need a bit more design clarity about what to do after an
  // account settings update operation succeeds or fails.
  useAccountSettingsUpdatedEffect( () => {
    navigation.goBack()
  } )

  function handleSaveButtonPress() {
    const settings = {
      accountName,
      accountDescription,
    }
    dispatch( updateAccountSettings( {
      accountShell, settings
    } ) )
    navigation.navigate( 'Home' )
  }

  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={'Name and Description'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <View style={styles.rootContainer}>
        <View style={styles.headerSection}>
          <View style={{
            flexDirection: 'row'
          }}>
            <Text style={styles.headerText}>{strings.Youcanset}</Text>
            {/* <Text style={{
            ...styles.headerText, fontStyle: 'italic'
          }}>Name and Description</Text> */}
          </View>
        </View>

        <View style={styles.formContainer}>
          <Input
            inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholder={strings.Enteraccountname}
            placeholderTextColor={FormStyles.placeholderText.color}
            // underlineColorAndroid={FormStyles.placeholderText.color}
            value={accountName}
            maxLength={24}
            numberOfLines={1}
            textContentType="name"
            onChangeText={setAccountName}
            ref={nameInputRef}
          />

          <Input
            inputContainerStyle={[ FormStyles.textInputContainer, styles.textInputContainer ]}
            inputStyle={FormStyles.inputText}
            placeholder={strings.Enterdescription}
            placeholderTextColor={FormStyles.placeholderText.color}
            // underlineColorAndroid={FormStyles.placeholderText.color}
            value={accountDescription}
            numberOfLines={2}
            onChangeText={setAccountDescription}
            maxLength={40}
          />
        </View>

        <View style={styles.listFooterSection}>
          <TouchableOpacity onPress={handleSaveButtonPress} disabled={canSaveChanges === false}>
            <View
              style={styles.confirmButtonView}
            >
              <Text style={styles.confirmButtonText}>{common.confirmProceed}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    paddingVertical: 20,
    paddingHorizontal: 24,
  },

  headerSection: {
    paddingVertical: 24,
    marginBottom: 10,
  },

  headerText: {
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
  },

  formContainer: {
  },

  textInputContainer: {
    marginBottom: 10,
  },

  listFooterSection: {
    // paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  confirmButtonView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'center',
    marginLeft: 15,
    padding: 15,
    backgroundColor: Colors.blue
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )


export default AccountSettingsEditDisplayPropertiesScreen
