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
import { setShowAllAccount } from '../../store/actions/accounts'
import Fonts from './../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { ScrollView } from 'react-native-gesture-handler'
import ToggleContainer from './ToggleContainer'
import AccountUtilities from '../../bitcoin/utilities/accounts/AccountUtilities'

interface HomeStateTypes {
  currencyCode: string;
}

interface HomePropsTypes {
  navigation: any;
  containerView: StyleProp<ViewStyle>;
  currentLevel: number;
  isFocused: boolean;
  currencyCode: any;
  setShowAllAccount: any;
}

class Home extends PureComponent<HomePropsTypes, HomeStateTypes> {

  static whyDidYouRender = true;

  constructor( props ) {
    super( props )
    this.props.setShowAllAccount( false )

    this.state = {
      // notificationData: [],
      currencyCode: 'USD',
    }
  }

  navigateToAddNewAccountScreen = () => {
    this.props.navigation.navigate( 'AddNewAccount' )
  };

  handleAccountCardSelection = ( selectedAccount: AccountShell ) => {
    this.props.navigation.navigate( 'AccountDetails', {
      accountShellID: selectedAccount.id,
    } )
  };

  render() {
    const { currencyCode } = this.state
    const {
      currentLevel,
      containerView
    } = this.props

    return (
      <View style={containerView}>
        <ScrollView style={{
          flex: 1
        }}>
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingVertical: wp( 4 ),
            paddingHorizontal: wp( 4 ),
            alignItems: 'center'
          }}>
            <Text style={{
              color: Colors.blue,
              fontSize: RFValue( 16 ),
              marginLeft: 2,
              fontFamily: Fonts.FiraSansMedium,

            }}>
              My Portfolio
            </Text>
            <ToggleContainer />
          </View>

          <View style={{
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
          </View>
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
        </ScrollView>
      </View>
    )
  }
}

const mapStateToProps = ( state ) => {
  return {
    currencyCode: idx( state, ( _ ) => _.preferences.currencyCode ),
    currentLevel: idx( state, ( _ ) => _.health.currentLevel ),
  }
}

export default withNavigationFocus(
  connect( mapStateToProps, {
    setShowAllAccount,
  } )( Home )
)
