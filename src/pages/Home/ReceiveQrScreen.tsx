import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { StyleSheet, Modal, View, Image, Text, Platform, TextInput, TouchableOpacity } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import QRCode from '../../components/QRCode'
import Fonts from '../../common/Fonts'
import Colors from '../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import { UsNumberFormat } from '../../common/utilities'
import CopyThisText from '../../components/CopyThisText'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import Ionicons from 'react-native-vector-icons/Ionicons'
import BottomInfoBox from '../../components/BottomInfoBox'
import { ScrollView } from 'react-native-gesture-handler'
import { getAllAccountsData } from '../../store/actions/accounts'
import { SATOSHIS_IN_BTC } from '../../common/constants/Bitcoin'
import { AccountsState } from '../../store/reducers/accounts'
import ReceiveAmountContent from '../../components/home/ReceiveAmountContent'
import { useBottomSheetModal } from '@gorhom/bottom-sheet'
import defaultBottomSheetConfigs from '../../common/configs/BottomSheetConfigs'
import ModalContainer from '../../components/home/ModalContainer'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import { translations } from '../../common/content/LocContext'

export type Props = {
  navigation: any;
};

const ReceiveQrScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const [ hideShow, setHideShow ] = useState( false )
  const [ receiveModal, setReceiveModal ] = useState( false )
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]

  const [ amount, setAmount ] = useState( '' )
  const allAccounts = useSelector(
    ( state ) => state.accounts.accounts,
  )
  const [ selectedAccount, setSelectedAccount ] = useState( null )
  const [ receivingAddress, setReceivingAddress ] = useState( null )

  const {
    present: presentBottomSheet,
    dismiss: dismissBottomSheet,
  } = useBottomSheetModal()

  const [ accounts, setAccounts ] = useState( [] )
  const accountState: AccountsState = useSelector(
    ( state ) => state.accounts,
  )
  useEffect( () => {
    dispatch( getAllAccountsData() )
  }, [] )

  useEffect( () => {
    if ( allAccounts ) {
      const acc = []
      for ( const [ key, value ] of Object.entries( allAccounts ) ) {
        if( value.isUsable ) acc.push( value )
      }
      setAccounts( acc )
      setSelectedAccount( acc[ 0 ] )
    }
  }, [ allAccounts ] )

  useEffect( () => {
    return () => {
      dismissBottomSheet()
    }
  }, [ navigation ] )

  useEffect( () => {
    let receiveAt = selectedAccount && selectedAccount.receivingAddress ? selectedAccount.receivingAddress : ''
    if ( amount ) {
      receiveAt = AccountUtilities.generatePaymentURI( receiveAt, {
        amount: parseInt( amount ) / SATOSHIS_IN_BTC,
      } ).paymentURI
    }
    console.log( receiveAt )
    setReceivingAddress( receiveAt )
  }, [ amount, selectedAccount ] )

  const showReceiveAmountBottomSheet = useCallback( () => {
    return(
      <ReceiveAmountContent
        title={strings.Receivesats}
        message={strings.Receivesatsinto}
        onPressConfirm={( amount ) => {
          setAmount( amount )
          setReceiveModal( false )
        }}
        selectedAmount={amount}
        onPressBack={() => {
          setReceiveModal( false )
        }
        }
      />
    )
  }, [ amount ] )

  return (
    <View style={styles.rootContainer}>
      <ScrollView>
        <View style={styles.QRView}>
          <QRCode title="Bitcoin address" value={receivingAddress ? receivingAddress : 'eert'} size={hp( '27%' )} />
        </View>

        <CopyThisText
          backgroundColor={Colors.white}
          text={receivingAddress}
        />

        <AppBottomSheetTouchableWrapper
          onPress={() => { setReceiveModal( true ) }}
          style={styles.selectedView}
        >
          <View
            style={styles.text}
          >
            <Text style={styles.titleText}>{amount ? amount : strings.Enteramount}</Text>
          </View>

          <View style={{
            marginLeft: 'auto'
          }}>
            <Ionicons
              name="chevron-forward"
              color={Colors.textColorGrey}
              size={15}
              style={styles.forwardIcon}
            />
          </View>
        </AppBottomSheetTouchableWrapper>

        {hideShow ? (
          <Modal
            animationType='fade'
            transparent={true}
            visible={hideShow}
            onRequestClose={() => { setHideShow( false ) }}>
            <TouchableOpacity style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }} onPress={() => { setHideShow( false ) }}>

              <View style={styles.dropDownView}>
                <ScrollView>
                  {accounts.map( ( value, index ) => {
                    return (
                      <TouchableOpacity
                        key={index}
                        activeOpacity={0.65} onPress={() => {
                          setHideShow( false )
                          setSelectedAccount( value )
                        }}
                        style={{
                          ...styles.dropDownElement,
                        }}>
                        {/* <View style={styles.imageView}>
                          <Image source={value.accountImage} style={{
                            width: wp( '8%' ), height: wp( '8%' )
                          }} />

                        </View> */}
                        <View style={{
                          marginLeft: wp( '2%' ), alignSelf: 'center',
                        }}>
                          <Text style={styles.accountName}>{value.accountName}</Text>
                          <Text style={styles.balanceText}>{strings.Balance} {UsNumberFormat( value.balance )} sats</Text>
                        </View>
                      </TouchableOpacity>
                    )
                  } )}
                </ScrollView>
              </View>
            </TouchableOpacity>
          </Modal>
        ) : null}

        <View style={styles.text1}>
          <Text style={styles.titleText}>{strings.ReceivingTo}</Text>
        </View>
        {selectedAccount && <View
          style={{
            marginBottom: hp( '2%' ),
          }}
        >
          <AppBottomSheetTouchableWrapper activeOpacity={10} onPress={() => setHideShow( !hideShow )}
            style={{
              ...styles.dropDownElement,
              borderRadius: 10,
              borderColor: Colors.borderColor,
              borderWidth: 1,
              marginLeft: 20,
              marginRight: 20,
              marginBottom: 20,
            }}>
            {/* <View style={styles.imageView}>
              <Image source={selectedAccount && selectedAccount.accountImage} style={{
                width: wp( '9%' ), height: wp( '9%' )
              }} />
            </View> */}
            <View style={{
              marginLeft: wp( '2%' ), alignSelf: 'center',
            }}>
              <Text style={styles.accountName}>{selectedAccount && selectedAccount.accountName
                ? selectedAccount.accountName
                : ''}</Text>
              <Text style={styles.balanceText}>{strings.Balance} {selectedAccount ? selectedAccount.balance : ''} sats</Text>
            </View>
            <View style={{
              marginLeft: 'auto'
            }}>
              <Ionicons
                name="chevron-down-sharp"
                color={Colors.textColorGrey}
                size={15}
                style={styles.forwardIcon}
              />
            </View>
          </AppBottomSheetTouchableWrapper>

        </View>}
        <ModalContainer visible={receiveModal} closeBottomSheet={() => {} } >
          {showReceiveAmountBottomSheet()}
        </ModalContainer>
        <BottomInfoBox
          title={common.note}
          infoText={strings.Itwouldtake}
        />
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor1
  },
  text: {
    justifyContent: 'center', marginRight: 10, marginLeft: 10, flex: 1
  },
  text1: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: wp( '5%' )
  },
  forwardIcon: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  QRView: {
    height: hp( '30%' ),
    justifyContent: 'center',
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
    marginTop: hp( '3%' )
  },
  dropDownElement: {
    backgroundColor: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: wp( '2%' ),
    paddingBottom: wp( '2%' ),
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    width: wp( '90%' ),
  },
  dropDownView: {
    flex: 1,
    marginBottom: hp( '4%' ), marginTop: hp( '60%' ),
    backgroundColor: Colors.white,
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },
  titleText: {
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
  },
  imageView: {
    width: wp( '15%' ), height: wp( '15%' ), backgroundColor: Colors.backgroundColor, borderRadius: wp( '15%' ) / 2, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.white,
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.7,
    shadowColor: Colors.borderColor,
    shadowRadius: 5,
    elevation: 10
  },
  accountName: {
    color: Colors.black, fontFamily: Fonts.FiraSansRegular, fontSize: RFValue( 16 )
  },
  balanceText: {
    color: Colors.blue, fontFamily: Fonts.FiraSansMediumItalic, fontSize: RFValue( 10 ), marginTop: 5
  },

  selectedView: {
    marginLeft: wp( '5%' ),
    marginRight: wp( '5%' ),
    marginBottom: hp( 4 ),
    marginTop: hp( 2 ),
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomColor: Colors.borderColor,
    borderBottomWidth: 1,
  },
} )


export default ReceiveQrScreen


