import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Image,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import Colors from '../../../common/Colors'
import Fonts from '../../../common/Fonts'
import NavStyles from '../../../common/Styles/NavStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import CurrencyKindToggleSwitch from '../../../components/CurrencyKindToggleSwitch'
import Toast from '../../../components/Toast'
import { updateDonationPreferences } from '../../../store/actions/accounts'
import { useDispatch } from 'react-redux'
import { SafeAreaView } from 'react-navigation'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import SmallNavHeaderCloseButton from '../../../components/navigation/SmallNavHeaderCloseButton'
import { BaseNavigationProp } from '../../../navigation/Navigator'
import { DonationAccount } from '../../../bitcoin/utilities/Interface'

export type NavigationParams = {
  account: Record<string, unknown>;
};

export type NavigationProp = {
  params: NavigationParams;
} & BaseNavigationProp;

export type Props = {
  navigation: NavigationProp;
};

const DonationAccountWebViewSettingsScreen: React.FC<Props> = ( { navigation, }: Props ) => {

  const donationAccount: DonationAccount = useMemo( () => {
    return navigation.getParam( 'account' )
  }, [ navigation.params ] )


  const [ isDonationTotalEnable, setIsDonationTotalEnable ] = useState(
    donationAccount.configuration.displayBalance
  )
  const [ isIncomingTxnEnabled, setIsIncomingTxnEnabled ] = useState(
    donationAccount.configuration.displayIncomingTxs
  )
  const [ isOutgoingTxnEnabled, setIsOutgoingTxnEnabled ] = useState(
    donationAccount.configuration.displayOutgoingTxs
  )

  const [ disableSave, setDisableSave ] = useState( true )
  const [ doneeName, setDoneeName ] = useState( donationAccount.donee )
  const [ description, setDescription ] = useState( donationAccount.donationDescription )
  const [ cause, setCause ] = useState( donationAccount.donationName )

  const [ isDonationPause, setIsDonationPause ] = useState(
    donationAccount.disableAccount ? donationAccount.disableAccount : false,
  )

  const dispatch = useDispatch()

  const updatePreferences = () => {
    let preferences

    if ( isDonationPause !== donationAccount.disableAccount ) {
      preferences = preferences
        ? {
          ...preferences, disableAccount: isDonationPause
        }
        : {
          disableAccount: isDonationPause
        }
    }

    if (
      isDonationTotalEnable !== donationAccount.configuration.displayBalance ||
      isIncomingTxnEnabled !== donationAccount.configuration.displayIncomingTxs ||
      isOutgoingTxnEnabled !== donationAccount.configuration.displayOutgoingTxs
    ) {
      const configuration = {
        displayBalance: isDonationTotalEnable,
        displayIncomingTxs: isIncomingTxnEnabled,
        displayOutgoingTxs: isOutgoingTxnEnabled,
      }

      preferences = preferences
        ? {
          ...preferences, configuration
        }
        : {
          configuration
        }
    }

    if (
      ( doneeName && doneeName !== donationAccount.donee ) ||
      ( description && description !== donationAccount.donationDescription ) ||
      ( cause && cause !== donationAccount.donationName )
    ) {
      const accountDetails = {
        donee: doneeName ? doneeName : donationAccount.donee,
        subject: cause ? cause : donationAccount.donationName,
        description: description ? description : donationAccount.donationDescription,
      }
      preferences = preferences
        ? {
          ...preferences, accountDetails
        }
        : {
          accountDetails
        }
    }

    if ( preferences ) {
      Toast( 'Your preferences would be updated shortly' )
      dispatch(
        updateDonationPreferences( donationAccount, preferences ),
      )
      setDisableSave( true )
    }
  }

  useEffect( () => {
    if (
      ( doneeName && doneeName !== donationAccount.donee ) ||
      ( description && description !== donationAccount.donationDescription ) ||
      ( cause && cause !== donationAccount.donationName ) ||
      isDonationTotalEnable !== donationAccount.configuration.displayBalance ||
      isIncomingTxnEnabled !== donationAccount.configuration.displayIncomingTxs ||
      isOutgoingTxnEnabled !== donationAccount.configuration.displayOutgoingTxs ||
      isDonationPause !== donationAccount.disableAccount
    ) {
      setDisableSave( false )
    } else {
      setDisableSave( true )
    }
  }, [
    doneeName,
    description,
    cause,
    isDonationPause,
    isDonationTotalEnable,
    isIncomingTxnEnabled,
    isOutgoingTxnEnabled,
  ] )

  return (
    <SafeAreaView style={styles.modalContentContainer}>
      <KeyboardAvoidingView
        style={{
          flex: 1
        }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView>

          <View style={{
            ...NavStyles.modalHeaderTitleView, paddingHorizontal: 0, justifyContent: 'space-between'
          }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center'
            }}>
              <SmallNavHeaderCloseButton onPress={() => { navigation.pop() }} /> 

              <View>
                <Text style={NavStyles.modalHeaderTitleText}>
                  Web View Settings
                </Text>
              </View>
            </View>

            <TouchableOpacity
              disabled={disableSave}
              onPress={() => {
                updatePreferences()
                navigation.pop()
              }}
              style={{
                height: wp( '8%' ),
                width: wp( '18%' ),
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: disableSave
                  ? Colors.shadowBlue
                  : Colors.lightBlue,
                justifyContent: 'center',
                borderRadius: 8,
                alignSelf: 'center',
                marginLeft: 'auto',
              }}
            >
              <Text
                style={{
                  color: Colors.white,
                  fontSize: RFValue( 12 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{
            paddingLeft: 20, paddingRight: 20
          }}>
            <Text style={styles.titleTextStyle}>Name for the donation</Text>
            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Name for the donation'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                value={cause}
                onChangeText={( text ) => {
                  setCause( text )
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
                autoCorrect={false}
                autoCompleteType="off"
              />
            </View>
            <Text style={styles.titleTextStyle}>Organised by</Text>
            <View style={styles.modalTextBoxView}>
              <TextInput
                style={styles.textBox}
                placeholder={'Organised by'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                value={doneeName}
                onChangeText={( text ) => {
                  setDoneeName( text )
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
                autoCorrect={false}
                autoCompleteType="off"
              />
            </View>
            <Text style={styles.titleTextStyle}>
              Donation cause or description
            </Text>
            <View style={{
              ...styles.modalTextBoxView, height: wp( '20%' )
            }}>
              <TextInput
                style={{
                  ...styles.textBox,
                  paddingRight: 20,
                  marginTop: 10,
                  marginBottom: 10,
                }}
                placeholder={'Donation cause or description'}
                keyboardType={
                  Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'
                }
                multiline={true}
                numberOfLines={4}
                value={description}
                onChangeText={( text ) => {
                  setDescription( text )
                }}
                placeholderTextColor={Colors.borderColor}
                returnKeyType="done"
                returnKeyLabel="Done"
                blurOnSubmit={true}
                autoCorrect={false}
                autoCompleteType="off"
              />
            </View>

            <View style={{
              ...styles.rowContainer, marginTop: 10
            }}>
              <Image
                style={styles.imageStyle}
                source={require( '../../../assets/images/icons/icon_donation_total.png' )}
              />
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Donation Total</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp( '1.2%' ),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show the total funds received for the donation
                </Text>
              </View>
              <CurrencyKindToggleSwitch
                changeSettingToggle={true}
                thumbSize={wp( '6%' )}
                isNotImage={true}
                trackColor={Colors.lightBlue}
                thumbColor={
                  isDonationTotalEnable ? Colors.blue : Colors.white
                }
                onpress={() =>
                  setIsDonationTotalEnable( ( prevState ) => !prevState )
                }
                isOn={isDonationTotalEnable}
              />
            </View>

            <View style={{
              ...styles.rowContainer, marginTop: 10
            }}>
              <Image
                style={styles.imageStyle}
                source={require( '../../../assets/images/icons/icon_donation_transactions.png' )}
              />
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Transactions</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp( '1.2%' ),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show donation transactions
                </Text>
              </View>
              <CurrencyKindToggleSwitch
                changeSettingToggle={true}
                thumbSize={wp( '6%' )}
                isNotImage={true}
                trackColor={Colors.lightBlue}
                thumbColor={
                  isIncomingTxnEnabled ? Colors.blue : Colors.white
                }
                onpress={() =>{
                  // if( isIncomingTxnEnabled ) setIsOutgoingTxnEnabled( false ) // turn off outgoing txs if incoming is turned off
                  setIsIncomingTxnEnabled( ( prevState ) => !prevState )
                  setIsOutgoingTxnEnabled( ( prevState ) => !prevState ) // temporary single switch
                }
                }
                isOn={isIncomingTxnEnabled}
              />
            </View>

            {/* <View style={{
              ...styles.rowContainer, marginTop: 10
            }}>
              <Image
                style={styles.imageStyle}
                source={require( '../../../assets/images/icons/icon_donation_total.png' )}
              />
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Outgoing Transactions</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp( '1.2%' ),
                    color: Colors.lightTextColor,
                  }}
                >
                  Show outgoing donation transactions
                </Text>
              </View>
              <CurrencyKindToggleSwitch
                changeSettingToggle={true}
                thumbSize={wp( '6%' )}
                isNotImage={true}
                trackColor={Colors.lightBlue}
                thumbColor={
                  isOutgoingTxnEnabled ? Colors.blue : Colors.white
                }
                onpress={() => {
                  if( isIncomingTxnEnabled || isOutgoingTxnEnabled ) setIsOutgoingTxnEnabled( ( prevState ) => !prevState )
                }
                }
                isOn={isOutgoingTxnEnabled}
              />
            </View> */}

            <View style={styles.rowContainer}>
              <View
                style={{
                  ...styles.circleShapeView,
                  backgroundColor: Colors.lightBlue,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image
                  style={{
                    ...styles.imageStyle, height: wp( '7%' ), width: wp( '7%' )
                  }}
                  source={require( '../../../assets/images/icons/icon_pause_donation.png' )}
                />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.titleTextStyle}>Pause Donation</Text>
                <Text
                  style={{
                    ...styles.modalInfoText,
                    marginTop: wp( '1.2%' ),
                    color: Colors.lightTextColor,
                  }}
                >
                  Pause Donation
                </Text>
              </View>
              <CurrencyKindToggleSwitch
                changeSettingToggle={true}
                thumbSize={wp( '6%' )}
                isNotImage={true}
                trackColor={Colors.lightBlue}
                thumbColor={isDonationPause ? Colors.blue : Colors.white}
                onpress={() => setIsDonationPause( ( prevState ) => !prevState )}
                isOn={isDonationPause}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  circleShapeView: {
    width: wp( '8%' ),
    height: wp( '8%' ),
    borderRadius: wp( '8%' ) / 2,
    borderColor: Colors.lightBlue,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalContentContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  modalTextBoxView: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    height: wp( '13%' ),
    marginVertical: 10,
  },

  textBox: {
    flex: 1,
    paddingLeft: 20,
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue( 13 ),
  },
  confirmButtonView: {
    width: wp( '50%' ),
    height: wp( '13%' ),
    backgroundColor: Colors.blue,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    elevation: 10,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  rowContainer: {
    flexDirection: 'row',
    height: 70,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  imageStyle: {
    width: wp( '8%' ),
    height: wp( '8%' ),
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    marginHorizontal: hp( '1.2%' ),
  },
  infoTextContainer: {
    marginTop: 20,
    marginHorizontal: hp( '1.5%' ),
  },
  titleTextStyle: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },
} )

export default DonationAccountWebViewSettingsScreen
