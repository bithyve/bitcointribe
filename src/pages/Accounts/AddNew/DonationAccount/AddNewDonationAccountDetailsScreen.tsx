import React, { useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'
import FormStyles from '../../../../common/Styles/FormStyles'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'
import ListStyles from '../../../../common/Styles/ListStyles'
import { Input } from 'react-native-elements'
import { useDispatch, useSelector } from 'react-redux'
import { addNewAccountShells } from '../../../../store/actions/accounts'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetStackToAccountDetails } from '../../../../navigation/actions/NavigationActions'
import {
  DonationSubAccountDescribing,
} from '../../../../common/data/models/SubAccountInfo/Interfaces'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import openLink from '../../../../utils/OpenLink'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'
import Loader from '../../../../components/loader'
import ButtonBlue from '../../../../components/ButtonBlue'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Entypo from 'react-native-vector-icons/Entypo'
import { newAccountsInfo } from '../../../../store/sagas/accounts'
import { AccountType, Wallet } from '../../../../bitcoin/utilities/Interface'
import Toast from '../../../../components/Toast'
import useAccountsState from '../../../../utils/hooks/state-selectors/accounts/UseAccountsState'

export type Props = {
  navigation: any;
};

const AddNewDonationAccountDetailsScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )
  const currentSubAccount: DonationSubAccountDescribing = useMemo( () => {
    return navigation.getParam( 'currentSubAccount' )
  }, [ navigation.state.params ] )

  const wallet: Wallet = useSelector(
    ( state ) => state.storage.wallet
  )
  const { accountShells } = useAccountsState()
  const [ accountName, setAccountName ] = useState( '' )
  const [ doneeName, setDoneeName ] = useState( currentSubAccount.doneeName )
  const [ accountDescription, setAccountDescription ] = useState( '' )
  const [ isTFAEnabled, setIsTFAEnabled ] = useState(
    currentSubAccount.isTFAEnabled,
  )
  const [ showLoader, setShowLoader ] = useState( false )
  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount,
  )

  const canProceed = useMemo( () => {
    return accountName.length > 0 && accountDescription.length > 0
  }, [ accountName, doneeName, accountDescription ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  useAccountShellCreationCompletionEffect( () => {
    const shellId = accountShells[ accountShells.length - 1 ].id
    navigation.dispatch(
      resetStackToAccountDetails( {
        accountShellID: shellId
      } )
    )
  } )

  function handleProceedButtonPress() {
    setShowLoader( true )
    currentSubAccount.customDisplayName = 'Donation Account'
    currentSubAccount.doneeName = doneeName
    currentSubAccount.customDescription = accountName
    currentSubAccount.isTFAEnabled = isTFAEnabled
    currentSubAccount.sourceKind = currentSubAccount.isTFAEnabled
      ? SourceAccountKind.SECURE_ACCOUNT
      : SourceAccountKind.REGULAR_ACCOUNT

    const newAccountInfo: newAccountsInfo = {
      accountType: AccountType.DONATION_ACCOUNT,
      accountDetails: {
        name: accountName,
        description: accountDescription,
        is2FAEnabled: isTFAEnabled,
        doneeName: doneeName
      }
    }
    dispatch( addNewAccountShells( [ newAccountInfo ] ) )
  }

  async function openTermsAndConditions() {
    await openLink( 'https://hexawallet.io/donee-terms-conditions/' )
  }

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={{
        flex: 1
      }}>
        <View style={styles.rootContentContainer}>

          <View style={ListStyles.infoHeaderSection}>
            <Text style={ListStyles.infoHeaderSubtitleText}>Enter details for the new Donation Account</Text>
          </View>

          <View style={styles.formContainer}>
            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Enter donation name'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={accountName}
              maxLength={24}
              numberOfLines={1}
              textContentType="name"
              onChangeText={setAccountName}
              ref={nameInputRef}
            />

            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={FormStyles.inputText}
              placeholder={'Organised by'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={doneeName}
              numberOfLines={1}
              onChangeText={setDoneeName}
            />
            <Input
              inputContainerStyle={[
                FormStyles.textInputContainer,
                FormStyles.textAreaInputContainer,
                styles.textInputContainer,
              ]}
              inputStyle={{
                ...FormStyles.inputText,
                alignSelf: 'flex-start'
              }}
              placeholder={'Donation cause or description'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={accountDescription}
              multiline
              numberOfLines={4}
              onChangeText={setAccountDescription}
            />

            <TouchableOpacity
              style={styles.tfaSelectionField}
              onPress={() =>  !AllowSecureAccount ? Toast( 'Upgrade backup to Level 2 to use this feature' ) : setIsTFAEnabled( !isTFAEnabled )}
              activeOpacity={1}
              // disabled={( !wallet.secondaryXpub && !wallet.details2FA )}
            >
              <View style={styles.tfaSelectionFieldContentContainer}>
                <Text style={{
                  ...styles.smallInfoLabelText, fontSize: RFValue( 12 )
                }}>
              Enable 2-Factor Authentication
                </Text>
                <View style={styles.checkbox}>
                  {isTFAEnabled && (
                    <Entypo
                      name="check"
                      size={RFValue( 20 )}
                      color={Colors.green}
                    />
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View style={{
              marginBottom: 24, paddingHorizontal: 14
            }}>
              <Text style={styles.smallInfoLabelText}>
            By clicking proceed you agree to our{' '}
                <Text onPress={openTermsAndConditions} style={styles.linkText}>
              Terms and Conditions
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.footerSection}>
            <ButtonBlue
              buttonText="Proceed"
              handleButtonPress={handleProceedButtonPress}
              buttonDisable={canProceed === false}
            />
          </View>
        </View>
      </ScrollView>
      {showLoader ? <Loader isLoading={true} /> : null}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },

  rootContentContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 36,
  },

  formContainer: {
    paddingHorizontal: 16,
    flex: 1,
  },

  textInputContainer: {
    marginBottom: 12,
  },

  tfaSelectionField: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    marginBottom: 36,
    marginHorizontal: 14,
    paddingHorizontal: 10,
    padding:10
  },

  tfaSelectionFieldContentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallInfoLabelText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  checkbox: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkText: {
    fontFamily: Fonts.FiraSansItalic,
    color: Colors.blue,
    fontSize: RFValue( 11 ),
    fontWeight: 'bold',
  },

  footerSection: {
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },
} )

export default AddNewDonationAccountDetailsScreen
