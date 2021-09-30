import React, { useState } from 'react'
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native'
import BottomInfoBox from '../../components/BottomInfoBox'
import getFormattedStringFromQRString from '../../utils/qr-codes/GetFormattedStringFromQRData'
import ListStyles from '../../common/Styles/ListStyles'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import RecipientAddressTextInputSection from '../../components/send/RecipientAddressTextInputSection'
import { REGULAR_ACCOUNT, TEST_ACCOUNT } from '../../common/constants/wallet-service-types'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import { useDispatch, useSelector } from 'react-redux'
import { clearTransfer } from '../../store/actions/accounts'
import { resetStackToSend } from '../../navigation/actions/NavigationActions'
import { Button } from 'react-native-elements'
import ButtonStyles from '../../common/Styles/ButtonStyles'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { makeAddressRecipientDescription } from '../../utils/sending/RecipientFactories'
import { addRecipientForSending, amountForRecipientUpdated, recipientSelectedForAmountSetting, sourceAccountSelectedForSending } from '../../store/actions/sending'
import { Satoshis } from '../../common/data/enums/UnitAliases'
import { AccountType, DeepLinkEncryptionType, NetworkType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { AccountsState } from '../../store/reducers/accounts'
import { translations } from '../../common/content/LocContext'
import ModalContainer from '../../components/home/ModalContainer'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CheckingAccount from '../../assets/images/accIcons/icon_checking.svg'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import DashedContainer from '../FriendsAndFamily/DashedContainer'
import Illustration from '../../assets/images/svgs/illustration.svg'
import { NavigationActions, StackActions } from 'react-navigation'
import AcceptGift from '../FriendsAndFamily/AcceptGift'

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = ( { title } ) => {
  return (
    <View style={styles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>
        {title}
      </Text>
    </View>
  )
}

const HomeQRScannerScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const accountsState: AccountsState = useSelector( ( state ) => state.accounts, )
  const [ acceptGift, setAcceptGiftModal ] = useState( false )
  const [ giftAccepted, setGiftAcceptedModel ] = useState( false )
  const defaultSourceAccount = accountsState.accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && !shell.primarySubAccount.instanceNumber )
  const common = translations[ 'common' ]
  const strings = translations[ 'accounts' ]
  function handleBarcodeRecognized( { data: scannedData }: { data: string } ) {
    console.log( 'scannedData', scannedData )
    const networkType: NetworkType = AccountUtilities.networkType( scannedData )
    if ( networkType ) {
      const network = AccountUtilities.getNetworkByType( networkType )
      const { type } = AccountUtilities.addressDiff( scannedData, network )
      if ( type === ScannedAddressKind.ADDRESS ) {
        onSend( scannedData, 0 )
      } else if ( type === ScannedAddressKind.PAYMENT_URI ) {
        const res = AccountUtilities.decodePaymentURI( scannedData )
        const address = res.address
        const options = res.options

        onSend( address, options.amount )
      }
      return
    }

    const onCodeScanned = navigation.getParam( 'onCodeScanned' )
    if ( typeof onCodeScanned === 'function' ) onCodeScanned( getFormattedStringFromQRString( scannedData ) )
    navigation.goBack( null )
  }

  function onSend( address: string, amount: Satoshis ) {
    const recipient = makeAddressRecipientDescription( {
      address
    } )

    dispatch( sourceAccountSelectedForSending(
      defaultSourceAccount
    ) )
    dispatch( addRecipientForSending( recipient ) )
    dispatch( recipientSelectedForAmountSetting( recipient ) )
    dispatch( amountForRecipientUpdated( {
      recipient,
      amount: amount < 1 ? amount * SATOSHIS_IN_BTC : amount
    } ) )

    navigation.dispatch(
      resetStackToSend( {
        selectedRecipientID: recipient.id,
      } )
    )
  }

  const renderButton = ( text ) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if ( text === 'View Account' ) {
            setGiftAcceptedModel( true )
            const resetAction = StackActions.reset( {
              index: 0,
              actions: [
                NavigationActions.navigate( {
                  routeName: 'Landing'
                } )
              ],
            } )

            navigation.dispatch( resetAction )
            // navigation.navigate( 'AccountDetails', {
            //   accountShellID: primarySubAccount.accountShellID,
            // } )
          } else {
            setAcceptGiftModal( false )
            setGiftAcceptedModel( true )
          }
        }}
        style={{
          ...styles.buttonView
        }}
      >
        <Text style={styles.buttonText}>{text}</Text>
      </TouchableOpacity>
    )
  }

  const numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  const renderGiftAcceptedtModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <View style={{
          marginTop: 'auto', right: 0, bottom: 0, position: 'absolute', marginLeft: 'auto'
        }}>
          <Illustration/>
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { setGiftAcceptedModel( false )}}
          style={{
            width: widthPercentageToDP( 7 ), height: widthPercentageToDP( 7 ), borderRadius: widthPercentageToDP( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: widthPercentageToDP( 3 ), marginRight: widthPercentageToDP( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <View style={{
          marginLeft: widthPercentageToDP( 6 ),
        }}>
          <Text style={styles.modalTitleText}>Gift Sats Accepted</Text>
          <Text style={{
            ...styles.modalInfoText,
          }}>Lorem ipsum dolor Lorem dolor sit amet, consectetur dolor sit</Text>
        </View>
        <DashedContainer
          titleText={'Gift Accepted'}
          subText={'Lorem ipsum dolor sit amet'}
          amt={numberWithCommas( 50000 )}
          image={<GiftCard width={63} height={63} />}
        />
        <BottomInfoBox
          containerStyle={{
            paddingRight: widthPercentageToDP( 15 ),
            backgroundColor: 'transparent'
          }}
          infoText={'Lorem ipsum dolor sit amet, consectetur adipiscing elit'}
        />
        <View style={{
          marginLeft: widthPercentageToDP( 6 ),
        }}>
          {renderButton( 'View Account' )}
        </View>
      </View>
    )
  }
  const renderAcceptModal = () => {
    return (
      <View style={styles.modalContentContainer}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { setAcceptGiftModal( false )}}
          style={{
            width: widthPercentageToDP( 7 ), height: widthPercentageToDP( 7 ), borderRadius: widthPercentageToDP( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: widthPercentageToDP( 3 ), marginRight: widthPercentageToDP( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19} style={{
            // marginTop: hp( 0.5 )
          }} />
        </TouchableOpacity>
        <View>
          <View style={{
            marginLeft: widthPercentageToDP( 6 ),
          }}>
            <Text style={styles.modalTitleText}>Accept Gift</Text>
            <Text style={{
              ...styles.modalInfoText,
            }}>You have received a gift. Accept it to add to your selected account balance</Text>
          </View>
          <View
            style={{
              width: '95%',
              backgroundColor: Colors.gray7,
              alignSelf: 'center',
              borderRadius: widthPercentageToDP( 2 ),
              marginVertical: heightPercentageToDP( 3 ),
              paddingVertical: widthPercentageToDP( 1 ),
              paddingHorizontal: widthPercentageToDP( 1 ),
              borderColor: Colors.lightBlue,
              borderWidth: 1,
            }}>
            <View style={{
              backgroundColor: Colors.gray7,
              borderRadius: widthPercentageToDP( 2 ),
              // paddingVertical: hp( 0.3 ),
              // paddingHorizontal: widthPercentageToDP( 0.3 ),
              borderColor: Colors.lightBlue,
              borderWidth: 1,
              borderStyle: 'dashed',
              padding: widthPercentageToDP( 3 )
            }}>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', padding: widthPercentageToDP( 2 )
              }}>
                <View style={{
                  flex: 1
                }}>
                  <Text style={{
                    color: Colors.textColorGrey,
                    fontSize: RFValue( 13 ),
                    // fontFamily: Fonts.FiraSansRegular,
                  }}>{'WalletName'}</Text>
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 12 ),
                    fontFamily: Fonts.FiraSansRegular,
                    letterSpacing: 0.6,
                    marginTop: heightPercentageToDP( 1 )
                  }}>
                    This is to get you started! Welcome to the world of Bitcoin
                  </Text>
                </View>

                <GiftCard width={63} height={63} />
              </View>
              <View style={{
                flexDirection: 'row', justifyContent: 'space-between', padding: widthPercentageToDP( 2 ),
                alignItems: 'center'
              }}>
                <Text style={{
                  color: Colors.blue,
                  fontSize: RFValue( 18 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}>Gift Sats</Text>
                <Text style={{
                  color: Colors.black,
                  fontSize: RFValue( 24 ),
                  fontFamily: Fonts.FiraSansRegular,
                }}>
                  {numberWithCommas( 50000 )}
                  <Text style={{
                    color: Colors.lightTextColor,
                    fontSize: RFValue( 10 ),
                    fontFamily: Fonts.FiraSansRegular,
                  }}>
                    {' sats'}
                  </Text>
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity
            style={{
              width: '95%',
              // height: '54%',
              backgroundColor: Colors.backgroundColor1,
              // shadowOpacity: 0.06,
              // shadowOffset: {
              //   width: 10, height: 10
              // },
              // shadowRadius: 10,
              // elevation: 2,
              alignSelf: 'center',
              borderRadius: widthPercentageToDP( 2 ),
              marginVertical: heightPercentageToDP( 2 ),
              paddingVertical: heightPercentageToDP( 2 ),
              paddingHorizontal: widthPercentageToDP( 2 ),
              flexDirection: 'row',
              alignItems: 'center'
            }}>
            <CheckingAccount width={54} height={54} />
            <View style={{
              marginHorizontal: widthPercentageToDP( 3 )
            }}>
              {/* <View style={styles.accImage} >
            {getAvatarForSubAccount( usePrimarySubAccountForShell( accountInfo ) )}
          </View> */}

              <Text style={{
                color: Colors.gray4,
                fontSize: RFValue( 10 ),
                fontFamily: Fonts.FiraSansRegular,
              }}>
                Bitcoin will be transferred to
              </Text>
              <Text
                style={{
                  color: Colors.black,
                  fontSize: RFValue( 14 ),
                  fontFamily: Fonts.FiraSansRegular,
                  marginVertical: heightPercentageToDP( 0.3 )
                }}
              >
                Checking Account
              </Text>
              <Text style={styles.availableToSpendText}>
                Available to spend
                <Text style={styles.balanceText}> 23000</Text>
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        <View style={{
          flexDirection: 'row', alignItems: 'center', marginHorizontal: widthPercentageToDP( 6 ),
          marginTop: heightPercentageToDP( 5 )
        }}>
          {renderButton( 'Accept Gift' )}
          <TouchableOpacity
            onPress={() => { }}
            style={{
              height: widthPercentageToDP( '12%' ),
              width: widthPercentageToDP( '27%' ),
              justifyContent: 'center',
              alignItems: 'center',
              paddingLeft: widthPercentageToDP( '8%' ),
            }}
          >
            <Text
              style={{
                fontFamily: Fonts.FiraSansMedium,
                color: Colors.blue
              }}
            >
              {'Deny Gift'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  return (
    <View style={styles.rootContainer}>
      {/* {acceptGift &&
        <ModalContainer visible={acceptGift} closeBottomSheet={() => { }} >
          {renderAcceptModal()}
        </ModalContainer>
      }
      {giftAccepted &&
        <ModalContainer visible={giftAccepted} closeBottomSheet={() => { }} >
          {renderGiftAcceptedtModal()}
        </ModalContainer>
      } */}
      <ModalContainer visible={acceptGift} closeBottomSheet={() => { }} >
        <AcceptGift
          navigation={navigation}
          closeModal={() => setAcceptGiftModal( false )}
          walletName={'ASDF'}
          giftAmount={'100'}
          inputType={DeepLinkEncryptionType.OTP}
          hint={'@HEXA'}
        />
      </ModalContainer>

      <ScrollView>
        <KeyboardAwareScrollView
          resetScrollToCoords={{
            x: 0, y: 0
          }}
          scrollEnabled={false}
          style={styles.rootContainer}
        >
          <HeaderSection title={strings.ScanaBitcoinaddress} />

          <CoveredQRCodeScanner
            onCodeScanned={handleBarcodeRecognized}
            containerStyle={{
              marginBottom: 16
            }}
          />

          <View style={styles.viewSectionContainer}>
            <RecipientAddressTextInputSection
              containerStyle={{
                margin: 0, padding: 0
              }}
              placeholder={strings.Enteraddressmanually}
              accountShell={defaultSourceAccount}
              onAddressEntered={( address ) => {
                onSend( address, 0 )
              }}
              onPaymentURIEntered={( uri ) => {
                const decodingResult = AccountUtilities.decodePaymentURI( uri )

                const address = decodingResult.address
                const options = decodingResult.options

                let amount = 0
                if ( options?.amount )
                  amount = options.amount

                onSend( address, amount )
              }}
            />
          </View>

          <View
            style={styles.floatingActionButtonContainer}
          >
            <Button
              raised
              title={strings.Receivebitcoin}
              icon={
                <Image
                  source={require( '../../assets/images/icons/icon_bitcoin_light.png' )}
                  style={{
                    width: widthPercentageToDP( 4 ),
                    height: widthPercentageToDP( 4 ),
                    resizeMode: 'contain',
                  }}
                />
              }
              buttonStyle={{
                ...ButtonStyles.floatingActionButton,
                borderRadius: 9999,
                paddingHorizontal: widthPercentageToDP( 5 )
              }}
              titleStyle={{
                ...ButtonStyles.floatingActionButtonText,
                marginLeft: 8,
              }}
              onPress={() => { navigation.navigate( 'ReceiveQR' ) }}
            />
          </View>
          {
            __DEV__ && (
              <TouchableOpacity onPress={() => {
                const qrScannedData = {
                  data: '{"type":"KEEPER_REQUEST","channelKey":"nBeLSFNLxhRmuq4JWNQTBWgv","walletName":"Scas","secondaryChannelKey":"HcB1rVJrYMss0QjlyDD1KRPA","version":"1.9.0"}'
                }
                handleBarcodeRecognized( qrScannedData )
              }} >
                <Text>Continue</Text>
              </TouchableOpacity>
            )
          }

          <View style={{
            marginTop: 'auto'
          }}>
            <BottomInfoBox
              style
              title={strings.Whatcanyouscan}
              infoText={strings.scan}
            />
          </View>
        </KeyboardAwareScrollView>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create( {
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansMedium,
  },
  buttonView: {
    height: widthPercentageToDP( '12%' ),
    width: widthPercentageToDP( '35%' ),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    shadowColor: Colors.shadowBlue,
    shadowOpacity: 1,
    shadowOffset: {
      width: 15, height: 15
    },
    backgroundColor: Colors.blue,
  },
  availableToSpendText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
    lineHeight: 15,
  },
  balanceText: {
    color: Colors.blue,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansItalic,
  },
  modalTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalInfoText: {
    // marginTop: hp( '3%' ),
    marginTop: heightPercentageToDP( 0.5 ),
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    marginRight: widthPercentageToDP( 12 ),
    letterSpacing: 0.6
  },
  modalContentContainer: {
    // height: '100%',
    backgroundColor: Colors.backgroundColor,
    paddingBottom: heightPercentageToDP( 4 ),
  },
  rootContainer: {
    flex: 1
  },
  viewSectionContainer: {
    marginBottom: 16,
  },
  infoHeaderSection: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  floatingActionButtonContainer: {
    bottom: heightPercentageToDP( 1.5 ),
    right: 0,
    marginLeft: 'auto',
    padding: heightPercentageToDP( 1.5 ),
  },
} )

export default HomeQRScannerScreen


