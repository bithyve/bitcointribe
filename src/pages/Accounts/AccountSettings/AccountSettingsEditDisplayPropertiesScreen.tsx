import React, { useMemo, useRef, useState, useEffect } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Input } from 'react-native-elements'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import FormStyles from '../../../common/Styles/FormStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { updateAccountSettings } from '../../../store/actions/accounts'
import useAccountSettingsUpdatedEffect from '../../../utils/hooks/account-effects/UseAccountSettingsUpdatedEffect'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import { useDispatch } from 'react-redux'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { translations } from '../../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'

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
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={styles.confirmButtonView}
          >
            <Text style={styles.confirmButtonText}>{common.confirmProceed}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
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
    elevation: 10,
    alignSelf: 'center',
    marginLeft: 15,
    padding: 15
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )


export default AccountSettingsEditDisplayPropertiesScreen
