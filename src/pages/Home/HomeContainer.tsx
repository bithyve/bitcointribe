import React, { createRef, PureComponent } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ViewStyle,
  StyleProp,
  Image,
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

export enum BottomSheetKind {
  SWAN_STATUS_INFO,
  WYRE_STATUS_INFO,
  RAMP_STATUS_INFO,
}
interface HomeStateTypes {
  currencyCode: string;
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

  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.props.setShowAllAccount( false )
  }

  navigateToAddNewAccountScreen = () => {
    this.props.navigation.navigate( 'AddNewAccount' )
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
    this.props.navigation.navigate( 'AccountDetails', {
      accountShellID: selectedAccount.id,
      swanDeepLinkContent: this.props.swanDeepLinkContent
    } )
    // }
  };

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
          marginHorizontal: wp( 4 ),
          // alignItems: 'center',
          // backgroundColor: 'red'
        }}>
          <Text style={{
            color: Colors.blue,
            fontSize: RFValue( 16 ),
            marginTop: hp( 1 ),
            fontFamily: Fonts.FiraSansMedium,

          }}>
              My Accounts
          </Text>
          <ToggleContainer />
        </View>
        <ScrollView style={{
          paddingBottom: 10
        }}>
          {/* <View style={{
            backgroundColor: 'white',
            marginHorizontal: wp( 4 ),
            height: hp( '15%' ),
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: hp( 1 ),
            borderRadius: wp( 2 ),
            padding: hp( '1.5%' )
          }}>
            <Image source={require( '../../assets/images/HomePageIcons/graph.png' )} style={{
              marginBottom: 'auto',
              width: '100%', height: '100%', flex: 1, resizeMode: 'contain'
            }} />
          </View> */}
          <HomeAccountCardsList
            // containerStyle={containerView}
            contentContainerStyle={{
              // paddingTop: 4,
              paddingLeft: 14,
              // backgroundColor: 'red'
            }}
            currentLevel={currentLevel}
            onAddNewSelected={this.navigateToAddNewAccountScreen}
            onCardSelected={this.handleAccountCardSelection}
          />
          <HomeBuyCard
            cardContainer={{
              backgroundColor: 'white',
              marginHorizontal: wp( 4 ),
              height: hp( '11%' ),
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: hp( 5 ),
              borderRadius: wp( 2 ),
              padding: hp( '1.4%' ),
              flexDirection: 'row',
            }}
            amount={exchangeRates ? exchangeRates[ currencyCode ]?.last.toFixed( 2 ) : ''}
            incramount={''}
            percentIncr={'5%'}
            asset={'../../assets/images/HomePageIcons/graph.png'}
            openBottomSheet={( type ) => this.props.openBottomSheet( type )}
            currencyCode={currencyCode}
          />
        </ScrollView>
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
