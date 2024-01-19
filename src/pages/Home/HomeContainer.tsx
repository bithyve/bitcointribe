import AsyncStorage from '@react-native-async-storage/async-storage'
import idx from 'idx'
import React, { PureComponent } from 'react'
import {
  Platform,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { connect } from 'react-redux'
import BWIcon from '../../assets/images/svgs/bw.svg'
import IconRight from '../../assets/images/svgs/icon_arrow_right.svg'
import LNIcon from '../../assets/images/svgs/lightningWhiteWithBack.svg'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import { LocalizationContext } from '../../common/content/LocContext'
import AccountShell from '../../common/data/models/AccountShell'
import { AppBottomSheetTouchableWrapper } from '../../components/AppBottomSheetTouchableWrapper'
import BorderWalletSuccessModal from '../../components/border-wallet/BorderWalletSuccessModal'
import ModalContainer from '../../components/home/ModalContainer'
import dbManager from '../../storage/realm/dbManager'
import { markAccountChecked, setShowAllAccount, updateAccountSettings } from '../../store/actions/accounts'
import Fonts from './../../common/Fonts'
import HomeAccountCardsList from './HomeAccountCardsList'
import HomeBuyCard from './HomeBuyCard'
import ToggleContainer from './ToggleContainer'

export enum BottomSheetKind {
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
  ADD_A_WALLET_INFO
}
interface HomeStateTypes {
  currencyCode?: string;
  strings: object;
  visibleModal: boolean;
  visibleWalletModal:boolean;
  // walletType: string;
}

interface HomePropsTypes {
  currencyCode: string;
  navigation: any;
  containerView: StyleProp<ViewStyle>;
  currentLevel: number;
  startRegistration: boolean;
  isFocused: boolean;
  setShowAllAccount: any;
  openBottomSheet: any;
  swanDeepLinkContent: string | null;
  markAccountChecked: any;
  updateAccountSettings: any,
  exchangeRates?: any[];
  lnAcc?: AccountShell[],
  accountShells?:any
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  static contextType = LocalizationContext
  static whyDidYouRender = true;

  constructor( props, context ) {
    super( props, context )
    this.props.setShowAllAccount( false )
    this.state = {
      strings: this.context.translations [ 'home' ],
      visibleModal: false,
      visibleWalletModal: false,
      // walletType: props.navigation.getParam( 'walletType' ),
    }
  }
  componentDidMount() {
    setTimeout( () => {
      const dbWallet =  dbManager.getWallet()
      if( dbWallet!=undefined && dbWallet!=null ){
        const walletObj = JSON.parse( JSON.stringify( dbWallet ) )
        const primaryMnemonic = walletObj.primaryMnemonic
        const seed = primaryMnemonic.split( ' ' )
        const seedData = seed.map( ( word, index ) => {
          return {
            name: word, id: ( index+1 )
          }
        } )
        const i = 12
        let ranNums = 1
        const tempNumber = ( Math.floor( Math.random() * ( i ) ) )
        if( tempNumber == undefined || tempNumber == 0 )
          ranNums = 1
        else ranNums = tempNumber
        const asyncSeedData=seedData[ ranNums ]
        AsyncStorage.setItem( 'randomSeedWord', JSON.stringify( asyncSeedData ) )
      }
    }, 2000 )
  }
  navigateToAddNewAccountScreen = () => {
    //BW-TO-DO
    this.setState( {
      visibleModal: true,
    } )
  };

  handleAccountCardSelection =async ( selectedAccount: AccountShell ) => {
    if( selectedAccount.primarySubAccount.hasNewTxn ) {
      this.props.markAccountChecked( selectedAccount.id )
    }
    if( selectedAccount.primarySubAccount.type === AccountType.LIGHTNING_ACCOUNT ) {
      this.props.navigation.navigate( 'LNAccountDetails', {
        accountShellID: selectedAccount.id,
        swanDeepLinkContent: this.props.swanDeepLinkContent,
        node: selectedAccount.primarySubAccount.node
      } )
    }
    else {
      this.props.navigation.navigate( 'AccountDetails', {
        accountShellID: selectedAccount.id,
        swanDeepLinkContent: this.props.swanDeepLinkContent
      }
      )
    }

    // }
  };
  numberWithCommas = ( x ) => {
    return x ? x.toString().replace( /\B(?=(\d{3})+(?!\d))/g, ',' ) : ''
  }

  render() {
    const {
      currentLevel,
      containerView,
      exchangeRates,
      currencyCode
    } = this.props

    return (
      <View style={containerView}>

        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: hp( 3 ),
          marginLeft: wp( 4 ),
          marginRight: wp( 6 ),
        }}>
          <Text style={{
            color: Colors.THEAM_TEXT_COLOR,
            fontSize: RFValue( 16 ),
            marginTop: hp( 1 ),
            marginLeft:wp( 1 ),
            fontFamily: Fonts.SemiBold,
            letterSpacing: 0.54
          }}>
            {this.state.strings.myaccounts}
          </Text>
          <ToggleContainer />
        </View>

        <View style={{
          marginBottom: 0, flex:1,
        }}>
          <HomeAccountCardsList
            contentContainerStyle={{
              paddingLeft: 14,
            }}
            currentLevel={currentLevel}
            onAddNewSelected={this.navigateToAddNewAccountScreen}
            onCardSelected={this.handleAccountCardSelection}
          />
          <View style={{
            justifyContent:'center',
            flexDirection:'row'
          }}>
            <HomeBuyCard
              cardContainer={{
                backgroundColor: Colors.white,
                marginRight: wp( 2 ),
                height: hp( Platform.OS == 'ios' ? '13%' : '15%' ),
                width:wp( '91%' ),
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: hp( 3 ),
                marginBottom: hp( Platform.OS == 'ios' ? 4 : 2 ),
                borderRadius: wp( 2 ),
                padding: hp( '1.4%' ),
                flexDirection: 'row',
              }}
              amount={exchangeRates ? this.numberWithCommas( exchangeRates[ currencyCode ]?.last.toFixed( 2 ) ) : ''}
              incramount={''}
              percentIncr={'5%'}
              asset={'../../assets/images/HomePageIcons/graph.png'}
              openBottomSheet={( type ) => this.props.openBottomSheet( type )}
              currencyCode={currencyCode}
            />
          </View>
        </View>
        <ModalContainer
          onBackground={()=>this.setState( {
            visibleModal:false
          } )}
          visible={this.state.visibleModal }
          closeBottomSheet={() => {}}
        >
          <View style={styles.modalContainer}>
            <AppBottomSheetTouchableWrapper
              onPress={() => this.setState( {
                visibleModal:false
              } )}
              style={{
                width: wp( 7 ), height: wp( 7 ), borderRadius: wp( 7/2 ),
                alignSelf: 'flex-end',
                backgroundColor: Colors.CLOSE_ICON_COLOR, alignItems: 'center', justifyContent: 'center',
                marginTop: wp( 3 ), marginRight: wp( 3 )
              }}
            >
              <FontAwesome name="close" color={Colors.white} size={19} style={{
                // marginTop: hp( 0.5 )
              }} />
            </AppBottomSheetTouchableWrapper>
            <View style={styles.modalTitleWrapper}>
              <Text style={styles.modalTitleText}>Add or Import Account / Wallet</Text>
              <Text style={styles.titleText}>Adding or Importing a wallet will appear on the Home Screen as a separate tile</Text>
            </View>
            <AppBottomSheetTouchableWrapper style={styles.menuWrapper} onPress={()=> {
              this.setState( {
                visibleModal: false
              } )
              // this.props.navigation.navigate( 'CreateWithBorderWalletAccount', {
              //   isAccountCreation: true
              // })
              this.props.navigation.navigate( 'ImportBorderWallet' )
            }}
            >
              <View style={styles.iconWrapper}>
                <BWIcon/>
              </View>
              <View style={styles.titleWrapper}>
                <Text style={styles.titleText}>Add or Import a Border Wallet</Text>
                <Text style={styles.subTitleText}>Add or Import a Border Wallet as an account in Tribe </Text>
              </View>
              <View style={styles.iconRightWrapper}>
                <IconRight/>
              </View>
            </AppBottomSheetTouchableWrapper>

            <AppBottomSheetTouchableWrapper
              disabled={this.props.lnAcc.length !== 0}
              style={styles.menuWrapper} onPress={()=>
              {
                this.setState( {
                  visibleModal: false
                } )
                this.props.navigation.navigate( 'ScanNodeConfig', {
                  currentSubAccount: null,
                } )}}>
              <View style={styles.iconWrapper}>
                <LNIcon/>
              </View>
              <View style={styles.titleWrapper}>
                <Text style={styles.titleText}>Add a Lightning Wallet</Text>
                <Text style={styles.subTitleText}>Add a Lightning node to enable a separate account on Tribe </Text>
              </View>
              <View style={styles.iconRightWrapper}>
                <IconRight/>
              </View>
            </AppBottomSheetTouchableWrapper>

            {/* <AppBottomSheetTouchableWrapper
              style={[ styles.menuWrapper, {
                marginBottom: hp( 5 )
              } ]} onPress={()=>{
                this.setState( {
                  visibleModal:false
                } )
                const accountShell = this.props.accountShells.filter( shell => shell?.primarySubAccount.type === AccountType.TEST_ACCOUNT )
                this.props.updateAccountSettings(
                  {
                    accountShell: accountShell[ 0 ],
                    settings: {
                      accountName: accountShell[ 0 ].primarySubAccount.customDisplayName,
                      accountDescription: accountShell[ 0 ].primarySubAccount.customDescription,
                      visibility: AccountVisibility.DEFAULT,
                    },
                  }
                )
                this.props.navigation.navigate( 'AccountDetails', {
                  accountShellID: accountShell[ 0 ].primarySubAccount.accountShellID,
                } )
              }}>
              <View style={styles.iconWrapper}>
                <TestIcon/>
              </View>
              <View style={styles.titleWrapper}>
                <Text style={styles.titleText}>Add a Test Account</Text>
                <Text style={styles.subTitleText}>Add a test account on Tribe </Text>
              </View>
              <View style={styles.iconRightWrapper}>
                <IconRight/>
              </View>
            </AppBottomSheetTouchableWrapper> */}
          </View>
        </ModalContainer>
        <ModalContainer
          onBackground={()=> this.setState( {
            visibleWalletModal: false
          } )}
          visible={this.state.visibleWalletModal}
          closeBottomSheet={()=> this.setState( {
            visibleWalletModal: false
          } )}
        >
          <BorderWalletSuccessModal
            title={'Border wallet created successfully.'}
            info={'Lorem ipsum dolor sit amet, consectetur adipiscing elit,'}
            otherText={'Your Border Wallet has been added and is now ready for you to start using.'}
            proceedButtonText={'Continue'}
            isIgnoreButton={false}
            closeModal={()=> this.setState( {
              visibleWalletModal: false
            } )}
            onPressProceed={() => {
              this.setState( {
                visibleWalletModal: false
              } )
            }}
            onPressIgnore={() => {
              this.setState( {
                visibleWalletModal: false
              } )
            }}
            isBottomImage={true}
            bottomImage={require( '../../assets/images/icons/contactPermission.png' )}
          />
        </ModalContainer>
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.bhr.currentLevel ),
    startRegistration: idx( state, ( _ ) => _.swanIntegration.startRegistration ),
    exchangeRates: idx( state, ( _ ) => _.accounts.exchangeRates ),
    accountShells: idx( state, ( _ )=>_.accounts.accountShells )
  }
}
const styles = StyleSheet.create( {
  modalContainer: {
    backgroundColor: Colors.white,
    padding: 15,
  },
  menuWrapper:{
    flexDirection: 'row',
    width: '90%',
    paddingHorizontal: 10,
    paddingVertical: 15,
    margin: 15,
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 10
  },
  iconWrapper: {
    width: '15%'
  },
  titleWrapper: {
    width: '75%'
  },
  iconRightWrapper: {
    width: '8%',
    alignItems: 'center'
  },
  titleText: {
    fontSize: 14,
    color: Colors.homepageButtonColor,
    fontFamily: Fonts.Regular,
  },
  subTitleText: {
    fontSize: 11,
    color: Colors.THEAM_INFO_LIGHT_TEXT_COLOR,
    fontFamily: Fonts.Regular,
  },
  modalTitleWrapper: {
    margin: 15
  },
  modalTitleText: {
    fontSize: 18,
    color: Colors.checkBlue,
    fontFamily: Fonts.Medium,
  }
} )
export default (
  connect( mapStateToProps, {
    setShowAllAccount,
    markAccountChecked,
    updateAccountSettings
  } )( Home )
)
