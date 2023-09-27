import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  View,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  StatusBar,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { launchImageLibrary } from 'react-native-image-picker'
import storage from '@react-native-firebase/storage'

import FormStyles from '../../../../common/Styles/FormStyles'
import Colors from '../../../../common/Colors'
import Fonts from '../../../../common/Fonts'
import { useDispatch, useSelector } from 'react-redux'
import { addNewAccountShells } from '../../../../store/actions/accounts'
import useAccountShellCreationCompletionEffect from '../../../../utils/hooks/account-effects/UseAccountShellCreationCompletionEffect'
import { resetStackToAccountDetails } from '../../../../navigation/actions/NavigationActions'
import { DonationSubAccountDescribing } from '../../../../common/data/models/SubAccountInfo/Interfaces'
import { RFValue } from 'react-native-responsive-fontsize'
import openLink from '../../../../utils/OpenLink'
import SourceAccountKind from '../../../../common/data/enums/SourceAccountKind'
import Loader from '../../../../components/loader'
import ButtonBlue from '../../../../components/ButtonBlue'
import { newAccountsInfo } from '../../../../store/sagas/accounts'
import { AccountType, Wallet } from '../../../../bitcoin/utilities/Interface'
import useAccountsState from '../../../../utils/hooks/state-selectors/accounts/UseAccountsState'

export type Props = {
  navigation: any;
  route: any;
};

const AddNewDonationAccountDetailsScreen: React.FC<Props> = ( { navigation, route }: Props ) => {
  const dispatch = useDispatch()
  const nameInputRef = useRef<Input>( null )
  const currentSubAccount: DonationSubAccountDescribing = useMemo( () => {
    return route.params?.currentSubAccount
  }, [ route.params ] )

  const wallet: Wallet = useSelector( ( state ) => state.storage.wallet )
  const { accountShells } = useAccountsState()
  const [ accountName, setAccountName ] = useState( '' )
  const [ doneeName, setDoneeName ] = useState( currentSubAccount.doneeName )
  const [ accountDescription, setAccountDescription ] = useState( '' )
  const [ isTFAEnabled, setIsTFAEnabled ] = useState(
    currentSubAccount.isTFAEnabled
  )
  const [ organisedBy, setOrganisedBy ] = useState( '' )
  const [ youtubeUrl, setyoutubeUrl ] = useState( '' )
  const [ showLoader, setShowLoader ] = useState( false )
  const [ pickImageUrl, setPickImageUrl ] = useState( '' )
  const [ photo, setPhoto ] = React.useState( null )

  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount
  )

  const canProceed = useMemo( () => {
    return accountName.length > 0 && accountDescription.length > 0 && pickImageUrl.length > 0
  }, [ accountName, doneeName, accountDescription, pickImageUrl ] )

  useEffect( () => {
    nameInputRef.current?.focus()
  }, [] )

  useAccountShellCreationCompletionEffect( () => {
    const shellId = accountShells[ accountShells.length - 1 ].id
    navigation.dispatch(
      resetStackToAccountDetails( {
        accountShellID: shellId,
      } )
    )
  } )
  const handleChoosePhoto = () => {
    try {
      launchImageLibrary(
        {
          noData: true,
        },
        async ( response ) => {
          if ( response.didCancel ) {
            console.log( 'Image picker cancelled' )
          } else {
            await setPhoto( response.assets[ 0 ] )
            await setPickImageUrl(
              Platform.OS === 'ios'
                ? response.assets[ 0 ].uri.replace( 'file://', '' )
                : response.assets[ 0 ].uri
            )
          }
        }
      )
    } catch ( e ) {
      console.log( e )
    }
  }
  async function handleProceedButtonPress() {
    setShowLoader( true )
    const reference = await storage().ref(
      `/hexa-donation-uploads/dev/${photo.fileName}`
    )
    await reference.putFile( pickImageUrl )
    const firebaseImageUrl = await reference.getDownloadURL()

    // currentSubAccount.customDisplayName = "Donation Account";
    // currentSubAccount.doneeName = doneeName;
    // currentSubAccount.customDescription = accountName;
    // currentSubAccount.isTFAEnabled = isTFAEnabled;
    // currentSubAccount.sourceKind = currentSubAccount.isTFAEnabled
    //   ? SourceAccountKind.SECURE_ACCOUNT
    //   : SourceAccountKind.REGULAR_ACCOUNT;

    const newAccountInfo: newAccountsInfo = {
      accountType: AccountType.DONATION_ACCOUNT,
      accountDetails: {
        name: accountName,
        description: accountDescription,
        is2FAEnabled: isTFAEnabled,
        doneeName: doneeName,
        youtubeURL: youtubeUrl,
        imageURL: firebaseImageUrl,
      },
    }
    dispatch( addNewAccountShells( [ newAccountInfo ] ) )
  }

  async function openTermsAndConditions() {
    await openLink( 'https://hexawallet.io/donee-terms-conditions/' )
  }

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: Colors.offWhite,
      }}
    >
      <StatusBar backgroundColor={'white'} barStyle="dark-content" />
      <KeyboardAvoidingView
        style={styles.rootContainer}
        behavior={Platform.OS == 'ios' ? 'padding' : 'height'}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <FontAwesome name="long-arrow-left" color={Colors.homepageButtonColor} size={17} />
        </TouchableOpacity>
        <ScrollView
          style={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.titleWrapperView}>
            <Text style={styles.titleText}>Setup Donation Account</Text>
          </View>
          <View style={styles.uploadImgParrentView}>
            <>
              <TouchableOpacity
                style={styles.uploadImgWrapperView}
                onPress={handleChoosePhoto}
              >
                {pickImageUrl ? (
                  <>
                    <TouchableOpacity
                      style={styles.closeIconWrapper}
                      onPress={() => setPickImageUrl( '' )}
                    >
                      <Icon name={'close-outline'} color={'#000'} size={20} />
                    </TouchableOpacity>
                    <Image
                      style={{
                        height: 120,
                        width: '99%',
                        borderRadius: 10,
                      }}
                      source={{
                        uri: pickImageUrl,
                      }}
                    />
                  </>
                ) : (
                  <View style={styles.plusIconWrapper}>
                    <Icon name={'add-outline'} color={'#006DB4'} size={25} />
                    <Text style={styles.uploadImgText}>Upload Image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </>
            <View style={{
              width: '67%'
            }}>
              <TextInput
                style={[ styles.textInputContainer, styles.descInputContainer ]}
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
              <TextInput
                style={[ styles.textInputContainer, styles.descInputContainer ]}
                placeholder={'Organised by'}
                placeholderTextColor={FormStyles.placeholderText.color}
                underlineColorAndroid={'transparent'}
                value={organisedBy}
                numberOfLines={1}
                textContentType="name"
                onChangeText={setOrganisedBy}
              />
            </View>
          </View>
          <View>
            <TextInput
              style={[
                styles.descInputContainer,
                {
                  height: 50, marginVertical: 5
                },
              ]}
              placeholder={'Paste youtube url'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={youtubeUrl}
              numberOfLines={1}
              textContentType="URL"
              onChangeText={setyoutubeUrl}
            />
            <TextInput
              style={[
                styles.descInputContainer,
                {
                  height: 70, marginVertical: 5
                },
              ]}
              placeholder={'Enter a description'}
              placeholderTextColor={FormStyles.placeholderText.color}
              underlineColorAndroid={'transparent'}
              value={accountDescription}
              numberOfLines={4}
              textContentType="name"
              onChangeText={setAccountDescription}
            />
          </View>
          {/* <View style={styles.checkTwoFAuthView}>
            <Icon
              name={"checkmark-circle"}
              color={isTFAEnabled ? Colors.darkBlue : Colors.textColorGrey}
              size={25}
              onPress={() => setIsTFAEnabled(!isTFAEnabled)}
            />
            <Text style={styles.checkTwoFAuthText}>
              Enable two factor authentication
            </Text>
          </View> */}
          <View style={{
            flexDirection: 'row', marginVertical: 10
          }}>
            <Text style={styles.agreeTermsText}>
              By clicking proceed you agree to our
            </Text>
            <TouchableOpacity onPress={openTermsAndConditions}>
              <Text style={styles.termsAndConditionText}>
                &nbsp;Terms and Conditions
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.footerSection}>
            <ButtonBlue
              buttonText="Proceed"
              handleButtonPress={handleProceedButtonPress}
              buttonDisable={canProceed === false}
            />
          </View>
        </ScrollView>
        {showLoader ? <Loader isLoading={true} /> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    margin: 25,
  },
  scrollContainer: {
    flex: 1,
  },
  titleWrapperView: {
    marginVertical: 20,
  },
  titleText: {
    fontSize: RFValue( 25 ),
    color: Colors.darkBlue,
    fontFamily: Fonts.Regular,
  },
  uploadImgParrentView: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
  },
  uploadImgWrapperView: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    width: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadImgText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 11 ),
    marginTop: 10,
  },
  textInputContainer: {
    marginVertical: 5,
    marginLeft: 10,
    height: 50,
  },
  descInputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.white,
    width: '100%',
    paddingHorizontal: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    textAlign: 'left',
  },
  inputText: {
    paddingHorizontal: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    textAlign: 'left',
  },
  checkTwoFAuthView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkTwoFAuthText: {
    marginLeft: 10,
    color: Colors.gray4,
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
  },
  agreeTermsText: {
    color: Colors.gray4,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 11 ),
  },
  termsAndConditionText: {
    color: Colors.darkBlue,
    fontFamily: Fonts.Italic,
    fontSize: RFValue( 11 ),
  },
  proceedBtnView: {
    backgroundColor: Colors.darkBlue,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
    borderRadius: 10,
    marginTop: 20,
    shadowColor: Colors.skyBlue,
    shadowOpacity: 0.8,
    elevation: 6,
  },
  proceedBtnText: {
    color: Colors.white,
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 13 ),
  },
  footerSection: {
    paddingVertical: 10,
    alignItems: 'flex-start',
  },
  //
  closeIconWrapper: {
    position: 'absolute',
    top: -2,
    right: -3,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
    borderRadius: 20,
  },
  plusIconWrapper: {
    height: 110,
    width: '99%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderRadius: 20,
  },
} )

export default AddNewDonationAccountDetailsScreen
