import React, { createRef, PureComponent } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Image,
  Platform
} from 'react-native'
import {
  heightPercentageToDP,
  widthPercentageToDP,
} from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import { connect } from 'react-redux'
//import HomeHeader from '../../components/home/home-header'
import idx from 'idx'
import { withNavigationFocus } from 'react-navigation'
import HomeAccountCardsList from './HomeAccountCardsList'
import AccountShell from '../../common/data/models/AccountShell'
import { setShowAllAccount, markAccountChecked } from '../../store/actions/accounts'
import { SwanIntegrationState } from '../../store/reducers/SwanIntegration'
import Fonts from './../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { ScrollView } from 'react-native-gesture-handler'
import ToggleContainer from './ToggleContainer'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import ServiceAccountKind from '../../common/data/enums/ServiceAccountKind'
import ExternalServiceSubAccountInfo from '../../common/data/models/SubAccountInfo/ExternalServiceSubAccountInfo'
import HomeBuyCard from './HomeBuyCard'
import { LocalizationContext } from '../../common/content/LocContext'
import { AccountType } from '../../bitcoin/utilities/Interface'
import dbManager from '../../storage/realm/dbManager'
import AsyncStorage from '@react-native-async-storage/async-storage'

export enum BottomSheetKind {
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
}
interface HomeStateTypes {
  currencyCode?: string;
  strings: object;
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
  exchangeRates?: any[];
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {
  static contextType = LocalizationContext
  static whyDidYouRender = true;

  constructor( props, context ) {
    super( props, context )
    this.props.setShowAllAccount( false )
    this.state = {
      strings: this.context.translations [ 'home' ],
    }
  }
  componentDidMount() {
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
  }
  navigateToAddNewAccountScreen = () => {
    // this.props.navigation.navigate( 'AddNewAccount' )
    this.props.navigation.navigate( 'ScanNodeConfig', {
      currentSubAccount: null,
    } )
  };

  handleAccountCardSelection = ( selectedAccount: AccountShell ) => {
    // if (
    //   this.props.startRegistration &&
    //   selectedAccount.primarySubAccount.kind === SubAccountKind.SERVICE &&
    // ( selectedAccount.primarySubAccount as ExternalServiceSubAccountInfo ).serviceAccountKind === ServiceAccountKind.SWAN
    // ) {
    //   this.props.openBottomSheet( 6, null, true )

    // } else {
    if( selectedAccount.primarySubAccount.hasNewTxn ) {
      this.props.markAccountChecked( selectedAccount.id )
    }
    if( selectedAccount.primarySubAccount.type === AccountType.LIGHTNING_ACCOUNT ) {
      this.props.navigation.navigate( 'LNAccountDetails', {
        accountShellID: selectedAccount.id,
        swanDeepLinkContent: this.props.swanDeepLinkContent,
        node: selectedAccount.primarySubAccount.node
      } )
    } else {
      this.props.navigation.navigate( 'AccountDetails', {
        accountShellID: selectedAccount.id,
        swanDeepLinkContent: this.props.swanDeepLinkContent
      } )
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
          // alignItems: 'center',
          // backgroundColor: 'red'
        }}>
          <Text style={{
            color: Colors.blue,
            fontSize: RFValue( 19 ),
            marginTop: hp( 1 ),
            marginLeft:wp( 1 ),
            fontFamily: Fonts.FiraSansMedium,
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
            justifyContent:'center', flexDirection:'row'
          }}>
            <HomeBuyCard
              cardContainer={{
                backgroundColor: 'white',
                // marginLeft: wp( 4 ),
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
              // shadowColor: Colors.shadowColor,
              // shadowOpacity: 1,
              // shadowOffset: {
              //   width: 10, height: 10
              // },
              // elevation: 6
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
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    setShowAllAccount,
    markAccountChecked
  } )( Home )
)
