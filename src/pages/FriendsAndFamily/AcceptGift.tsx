import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import BottomInfoBox from '../../components/BottomInfoBox'
import {  useSelector } from 'react-redux'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import { AccountType, NetworkType, ScannedAddressKind } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CheckingAccount from '../../assets/images/accIcons/icon_checking.svg'
import GiftCard from '../../assets/images/svgs/icon_gift.svg'
import DashedContainer from '../FriendsAndFamily/DashedContainer'
import Illustration from '../../assets/images/svgs/illustration.svg'
import idx from 'idx'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSpendableBalanceForAccountShell from '../../utils/hooks/account-utils/UseSpendableBalanceForAccountShell'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import AccountShell from '../../common/data/models/AccountShell'
import BitcoinUnit from '../../common/data/enums/BitcoinUnit'

export type Props = {
  navigation: any;
  closeModal: () => void;
  onGiftRequestAccepted: () => void;
  walletName: string;
  giftAmount: string;
};


const AcceptGift: React.FC<Props> = ( { navigation, closeModal, onGiftRequestAccepted, walletName, giftAmount }: Props ) => {
  const [ acceptGift, setAcceptGiftModal ] = useState( true )
  const [ giftAccepted, setGiftAcceptedModel ] = useState( false )
  const accountShells: AccountShell[] = useSelector( ( state ) => idx( state, ( _ ) => _.accounts.accountShells ) )
  const sendingAccount = accountShells.find( shell => shell.primarySubAccount.type == AccountType.CHECKING_ACCOUNT && shell.primarySubAccount.instanceNumber === 0 )

  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sendingAccount )
  const spendableBalance = useSpendableBalanceForAccountShell( sendingAccount )

  const formattedUnitText = useFormattedUnitText( {
    bitcoinUnit: BitcoinUnit.SATS,
  } )

  const sourceAccountHeadlineText = useMemo( () => {
    const title = sourcePrimarySubAccount.customDisplayName || sourcePrimarySubAccount.defaultTitle

    return `${title}`
    // return `${title} (${strings.availableToSpend}: ${formattedAvailableBalanceAmountText} ${formattedUnitText})`

  }, [ sourcePrimarySubAccount ] )

  const renderButton = ( text ) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if ( text === 'View Account' ) {
            setGiftAcceptedModel( false )
            navigation.navigate( 'AccountDetails', {
              accountShellID: sourcePrimarySubAccount.accountShellID,
            } )
          } else if( text === 'Accept Gift' ) {
            onGiftRequestAccepted()
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
      <>
        <View style={{
          marginTop: 'auto', right: 0, bottom: 0, position: 'absolute', marginLeft: 'auto'
        }}>
          <Illustration/>
        </View>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {
            setGiftAcceptedModel( false )
            closeModal()}}
          style={{
            width: widthPercentageToDP( 7 ), height: widthPercentageToDP( 7 ), borderRadius: widthPercentageToDP( 7 / 2 ),
            alignSelf: 'flex-end',
            backgroundColor: Colors.lightBlue, alignItems: 'center', justifyContent: 'center',
            marginTop: widthPercentageToDP( 3 ), marginRight: widthPercentageToDP( 3 )
          }}
        >
          <FontAwesome name="close" color={Colors.white} size={19}/>
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
          amt={numberWithCommas( giftAmount )}
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
      </>
    )
  }
  const renderAcceptModal = () => {
    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => { setAcceptGiftModal( false ); closeModal()}}
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
                  }}>{walletName}</Text>
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
                  {numberWithCommas( giftAmount )}
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
                {sourceAccountHeadlineText}
              </Text>
              <Text style={styles.availableToSpendText}>
                Available to spend
                <Text style={styles.balanceText}> {spendableBalance} {formattedUnitText}</Text>
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
      </>
    )
  }
  return (
    <View style={styles.modalContentContainer}>
      {acceptGift &&
          renderAcceptModal()
      }
      {giftAccepted &&
            renderGiftAcceptedtModal()
      }
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
    backgroundColor: Colors.white,
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

export default AcceptGift


