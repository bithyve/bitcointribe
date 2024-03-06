import idx from 'idx'
import React, { Component } from 'react'
import {
  Image,
  ImageBackground,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import DeviceInfo from 'react-native-device-info'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import BottomSheet from 'reanimated-bottom-sheet'
import Colors from '../../common/Colors'
import { REGULAR_ACCOUNT, SECURE_ACCOUNT } from '../../common/constants/wallet-service-types'
import Fonts from '../../common/Fonts'
import LoaderModal from '../../components/LoaderModal'
import ModalHeader from '../../components/ModalHeader'
import CoveredQRCodeScanner from '../../components/qr-code-scanning/CoveredQRCodeScanner'
import { clearTransfer, generateSecondaryXpriv, secondaryXprivGenerated } from '../../store/actions/accounts'
import { recoverMmnemonic, removeSecondaryMnemonic } from '../../store/actions/BHR'
import ResetTwoFASuccess from '../Accounts/ResetTwoFASuccess'
import ConfirmSweepFunds from './ConfirmSweepFunds'

interface SweepFundUseExitKeyStateTypes {
  listData: any[];
  selectedIds: any[];
  openCameraFlag: boolean;
  accountData: any;
  SuccessMessageHeader: string;
  SuccessMessage: string;
  barcodeData: any;
}

interface SweepFundUseExitKeyPropsTypes {
  navigation: any;
  keeper:any;
  decentralizedBackup: any;
  secondaryShareDownloaded: any;
  recoverMmnemonic: any;
  security:any;
  mnemonic: any;
  generateSecondaryXpriv:any;
  twoFAHelpFlags: any;
  clearTransfer: any;
  service: any;
  secondaryXprivGenerated: any;
  removeSecondaryMnemonic: any;
  levelHealth: any;
  currentLevel: any;
}

class SweepFundUseExitKey extends Component<
SweepFundUseExitKeyPropsTypes,
  SweepFundUseExitKeyStateTypes
> {
  constructor( props ) {
    super( props )
    this.state = {
      selectedIds: [],
      listData: [],
      // [
      //   {
      //     type: 'device',
      //     title: 'Harvey’s iMac',
      //     deviceName: 'iMac Pro',
      //     info: 'Last backup 2 weeks ago',
      //     id: 1,
      //     image: require('../../assets/images/icons/icon_iMac.png'),
      //   },
      //   {
      //     type: 'device',
      //     title: 'Louis’ iPad',
      //     deviceName: 'iMac Pro',
      //     info: 'Last backup 2 weeks ago',
      //     id: 2,
      //     image: require('../../assets/images/icons/icon_ipad.png'),
      //   },
      //   {
      //     type: 'device',
      //     title: 'Kate’s S2',
      //     deviceName: 'Samsung S2',
      //     info: 'Last backup 2 weeks ago',
      //     id: 3,
      //     image: require('../../assets/images/icons/icon_phone.png'),
      //   },
      // ],
      accountData: [
        {
          id: 1,
          account_name: 'Checking Account',
          balance: 2000,
          type: REGULAR_ACCOUNT,
          checked: false,
          image: require( '../../assets/images/icons/icon_regular_account.png' ),
        },
        {
          id: 2,
          account_name: 'Savings Account',
          balance: 3000,
          type: SECURE_ACCOUNT,
          checked: false,
          image: require( '../../assets/images/icons/icon_secureaccount_white.png' ),
        },
      ],
      openCameraFlag: false,
      SuccessMessageHeader: '',
      SuccessMessage: '',
      barcodeData:null
    }
  }

  componentDidMount(){
    // this.props.removeSecondaryMnemonic();
    // this.props.secondaryXprivGenerated(null);

    this.setList()
  }

  setList = () =>{
    const { keeper, decentralizedBackup, levelHealth, currentLevel } = this.props
    const metaShares = []
    const listDataArray = []
    let obj
    metaShares.push( decentralizedBackup.PK_SHARE )
    if( keeper && keeper.keeper && Object.keys( keeper.keeper.keepers ).length ){
      const keepers = keeper.keeper.keepers
      for ( const key in keepers ) {
        obj = {
          type:  keepers[ key ].shareType,
          title: keepers[ key ].walletName,
          info: '',
          //time: timeFormatter(moment(new Date()), moment(selectedBackup.dateTime).valueOf()),
          status: 'waiting',
          image: null,
          //shareId: KeeperData[i].shareId
        }
        listDataArray.push( obj )
      }
      this.setState( {
        listData: listDataArray, selectedIds: metaShares
      } )
    }
  }

  componentDidUpdate( prevProps ){
    let secondaryArray =[]
    const listDataArray = [ ...this.state.listData ]
    if( prevProps.secondaryShareDownloaded != this.props.secondaryShareDownloaded ){
      for( let i = 0 ; i < Object.keys( listDataArray ).length; i++ ){
        if( this.state.barcodeData.name == listDataArray[ i ].title )
          listDataArray[ i ].status = 'received'
      }
      this.setState( {
        listData: listDataArray
      } )
      secondaryArray = [ ...this.state.selectedIds ]
      secondaryArray.push( this.props.secondaryShareDownloaded )
      if( secondaryArray.length == 2 ) {
        this.recoverMnemonics( secondaryArray )
      }
      this.setState( {
        selectedIds: secondaryArray
      } )
    }


    if( prevProps.mnemonic != this.props.mnemonic ){
      if( this.props.mnemonic ) this.props.generateSecondaryXpriv( this.props.mnemonic.split( '_' )[ 0 ] )
    }

    if( this.props.twoFAHelpFlags && prevProps.twoFAHelpFlags.xprivGenerated != this.props.twoFAHelpFlags.xprivGenerated ){
      if ( this.props.twoFAHelpFlags.xprivGenerated ) {
        this.props.removeSecondaryMnemonic()
        this.props.clearTransfer( SECURE_ACCOUNT );
        ( this.refs.loaderBottomSheet as any ).snapTo( 0 )
        this.props.navigation.navigate( 'Send', {
          serviceType: SECURE_ACCOUNT,
          sweepSecure: true,
          netBalance:
                this.props.service.secureHDWallet.balances.balance +
                this.props.service.secureHDWallet.balances.unconfirmedBalance,
        } )
        this.props.secondaryXprivGenerated( null )
      } else if ( this.props.twoFAHelpFlags.xprivGenerated === false ) {
        ( this.refs.loaderBottomSheet as any ).snapTo( 0 )
        this.setState( {
          SuccessMessage: 'Invalid Exit Key, please try again',
          SuccessMessageHeader: 'Invalid Exit Key'
        } );
        ( this.refs.ResetTwoFASuccessBottomSheet as any ).current.snapTo( 1 )
        this.props.secondaryXprivGenerated( null )
        this.props.removeSecondaryMnemonic()
        this.setState( {
          selectedIds: [], listData: []
        } )
        this.setList()
      }
    }
  }

  recoverMnemonics = ( secondaryArray ) => {
    const { security, recoverMmnemonic } = this.props
    recoverMmnemonic( secondaryArray, security.answer )
  }

  barcodeRecognized = async ( barcodeData ) => {
    // const { downloadSMShard } = this.props
    if ( barcodeData ) {
      ( this.refs.loaderBottomSheet as any ).snapTo( 1 )
      // downloadSMShard( barcodeData.key )
      this.setState( {
        barcodeData: barcodeData
      } )
    }
  }


  render() {
    const { listData, SuccessMessage, SuccessMessageHeader, accountData } = this.state
    const { navigation } = this.props
    return (
      <View style={{
        flex: 1, backgroundColor: Colors.backgroundColor1
      }}>
        <SafeAreaView style={{
          flex: 0
        }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{
            flex: 1, flexDirection: 'row'
          }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.homepageButtonColor}
                size={17}
              />
            </TouchableOpacity>
            <View style={{
              justifyContent: 'center', width: wp( '80%' )
            }}>
              <Text numberOfLines={2} style={styles.modalHeaderTitleText}>
                {'Use Exit Key'}
              </Text>
              <Text numberOfLines={2} style={styles.modalHeaderInfoText}>
                Lorem ipsum dolor sit amet, consetetur Lorem ipsum dolor sit
                amet, consetetur Lorem ipsum dolor sit amet, consetetur
              </Text>
            </View>
          </View>
        </View>
        <ScrollView style={{
          flex: 1
        }}>
          <CoveredQRCodeScanner onCodeScanned={this.barcodeRecognized} />


          {listData.map( ( item, index ) => {
            if( item.type == 'device' || item.type == 'primaryKeeper' )
              return (
                <TouchableOpacity
                  key={`${JSON.stringify( item )}_${index}`}
                  style={{
                    ...styles.cardsView,
                    borderBottomWidth: index == 2 ? 0 : 4,
                  }}
                  onPress={() => {
                    ( this.refs.ConfirmSweepFunds as any ).snapTo( 1 )
                  }}
                >
                  <ImageBackground
                    source={require( '../../assets/images/icons/Ellipse.png' )}
                    style={styles.cardsImageView}
                  >
                    <Image
                      source={require( '../../assets/images/icons/icon_secondarydevice.png' )
                      }
                      style={styles.cardImage}
                    />
                  </ImageBackground>
                  <View style={{
                    marginLeft: 10
                  }}>
                    <Text
                      style={{
                        ...styles.cardsInfoText,
                        fontSize: RFValue( 18 ),
                      }}
                    >
                      {item.title}
                    </Text>
                    <Text style={styles.cardsInfoText}>{item.type}</Text>
                    <Text style={styles.cardsInfoText}>{item.info}</Text>
                  </View>
                  {item.status == 'received' ? (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginLeft: 'auto',
                      }}
                    >
                      <View
                        style={{
                          ...styles.statusTextView,
                          backgroundColor: Colors.lightGreen,
                        }}
                      >
                        <Text style={styles.statusText}>Key Received</Text>
                      </View>
                      <View
                        style={{
                          backgroundColor: Colors.lightGreen,
                          width: wp( '5%' ),
                          height: wp( '5%' ),
                          borderRadius: wp( '5%' ) / 2,
                          justifyContent: 'center',
                          alignItems: 'center',
                          marginLeft: 5,
                        }}
                      >
                        <AntDesign
                          name={'check'}
                          size={RFValue( 10 )}
                          color={Colors.darkGreen}
                        />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.statusTextView}>
                      <Text style={styles.statusText}>Waiting for Key</Text>
                    </View>
                  )}
                  {/* <View style={styles.statusTextView}>
                  <Text style={styles.statusText}>Waiting for Key</Text>
                </View> */}
                </TouchableOpacity>
              )
          } )}
        </ScrollView>
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'ConfirmSweepFunds'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '80%' )
              : hp( '80%' ),
          ]}
          renderContent={() => {
            return (
              <ConfirmSweepFunds
                selectedAccount={accountData}
                onPressBack={() => {
                  if ( this.refs.ConfirmSweepFunds )
                    ( this.refs.ConfirmSweepFunds as any ).snapTo( 0 )
                }}
                onPressDone={() => {
                  ( this.refs.ConfirmSweepFunds as any ).snapTo( 0 )
                  navigation.navigate( 'SweepConfirmation', {
                    accountData
                  } )
                }}
              />
            )
          }}
          renderHeader={() => {
            return (
              <ModalHeader
                onPressHeader={() => {
                  if ( this.refs.RemoveBottomSheet )
                    ( this.refs.RemoveBottomSheet as any ).snapTo( 0 )
                }}
              />
            )
          }
          }
        />
        <BottomSheet
          enabledInnerScrolling={true}
          enabledGestureInteraction={false}
          ref={'ResetTwoFASuccessBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch() ? hp( '35%' ) : hp( '40%' ),
          ]}
          renderContent={()=>{
            return (
              <ResetTwoFASuccess
                modalRef={'ResetTwoFASuccessBottomSheet'}
                title={SuccessMessageHeader}
                note={''
                // 'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt ut labore et dolore'
                }
                info={SuccessMessage}
                proceedButtonText={'Proceed'}
                onPressProceed={() => {
                  ( this.refs.ResetTwoFASuccessBottomSheet as any ).current.snapTo( 0 )
                }}
                isBottomImage={true}
                bottomImage={require( '../../assets/images/icons/icon_twoFASuccess.png' )}
              />
            )
          }}
          renderHeader={()=>{
            return (
              <ModalHeader
                onPressHeader={() => {
                  if ( this.refs.ResetTwoFASuccessBottomSheet )
                    ( this.refs.ResetTwoFASuccessBottomSheet as any ).current.snapTo( 0 )
                }}
              />
            )
          }}
        />
        <BottomSheet
          enabledGestureInteraction={false}
          enabledInnerScrolling={true}
          ref={'loaderBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp( '100%' )
              : hp( '100%' ),
          ]}
          renderContent={() => (
            <LoaderModal
              headerText={'Creating your wallet'}
              messageText={
                'This may take some time while Bitcoin Tribe is using the Recovery Keys to recreate your wallet'
              }
            />
          )}
          renderHeader={() => (
            <View
              style={{
                marginTop: 'auto',
                flex: 1,
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                height: hp( '75%' ),
                zIndex: 9999,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            />
          )}
        />
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    keeper: idx( state, ( _ ) => _.keeper.service ),
    decentralizedBackup: idx( state, ( _ ) => _.storage.database.DECENTRALIZED_BACKUP ),
    secondaryShareDownloaded: idx( state, ( _ ) => _.bhr.secondaryShareDownloaded ),
    security: idx( state, ( _ ) => _.storage.wallet.security ) || '',
    mnemonic: idx( state, ( _ ) => _.bhr.mnemonic ),
    twoFAHelpFlags: idx( state, ( _ ) => _.accounts.twoFAHelpFlags ),
    service: idx( state, ( _ ) => _.accounts[ SECURE_ACCOUNT ].service ),
    levelHealth: idx( state, ( _ ) => _.bhr.levelHealth ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
  }
}

export default
connect( mapStateToProps, {
  recoverMmnemonic,
  generateSecondaryXpriv,
  clearTransfer,
  secondaryXprivGenerated,
  removeSecondaryMnemonic
} )( SweepFundUseExitKey )

const styles = StyleSheet.create( {
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue( 18 ),
    fontFamily: Fonts.Regular,
  },
  modalHeaderInfoText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.Regular,
    marginTop: hp( '0.7%' ),
    marginBottom: hp( '1.5%' ),
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp( '30%' ),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
    tintColor: Colors.white,
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
    marginLeft: 10,
  },
  cardsInfoText: {
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },
  cardsView: {
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: Colors.backgroundColor,
  },
  cardsImageView: {
    width: wp( '20%' ),
    height: wp( '20%' ),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardImage: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    resizeMode: 'contain',
    marginBottom: wp( '1%' ),
  },
  statusTextView: {
    padding: 5,
    backgroundColor: Colors.backgroundColor,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    marginLeft: 'auto',
    paddingLeft: 10,
    paddingRight: 10
  },
  statusText: {
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
    color: Colors.textColorGrey,
  },
} )
