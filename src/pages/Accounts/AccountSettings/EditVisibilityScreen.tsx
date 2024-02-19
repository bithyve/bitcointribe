import { CommonActions } from '@react-navigation/native'
import React, { useState } from 'react'
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import { useDispatch } from 'react-redux'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import ListStyles from '../../../common/Styles/ListStyles'
import VisibilityOptionsList from '../../../components/account-settings/visibility/VisibilityOptionsList'
import BottomInfoBox from '../../../components/BottomInfoBox'
import HeaderTitle from '../../../components/HeaderTitle'
import { recomputeNetBalance, updateAccountSettings } from '../../../store/actions/accounts'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useAccountShellFromRoute from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'


const SELECTABLE_VISIBILITY_OPTIONS = [
  AccountVisibility.DEFAULT,
  AccountVisibility.HIDDEN,
  // AccountVisibility.DURESS,   // Disabled until duress mode is implemented later
]

export type Props = {
  route: any;
  navigation: any;
};

const HeaderSection: React.FC = ( { title } ) => {
  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>{title}</Text>
    </View>
  )
}

const AccountSettingsEditVisibilityScreen: React.FC<Props> = ( { route, navigation }: Props ) => {
  const dispatch = useDispatch()
  const accountShell = useAccountShellFromRoute( route )
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ selectedVisibility, setSelectedVisibility ] = useState( primarySubAccount.visibility )
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]
  function handleSelection( visibilityOption: AccountVisibility ) {
    setSelectedVisibility( visibilityOption )
  }

  function handleSaveButtonPress() {
    const settings = {
      visibility: selectedVisibility
    }
    dispatch( updateAccountSettings( {
      accountShell, settings
    } ) )
    dispatch( recomputeNetBalance() )
    // navigation.navigate( 'Home' )
    const resetAction = CommonActions.reset( {
      index: 0,
      routes: [
        {
          name: 'Home'
        }
      ],
    } )
    navigation.dispatch( resetAction )
  }

  function onDismiss() {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <HeaderTitle
        navigation={navigation}
        backButton={true}
        firstLineTitle={'Account Visibility'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
      <HeaderSection title={strings.Choosewhen}/>

      <View style={{
        backgroundColor: Colors.backgroundColor1
      }}>
        <VisibilityOptionsList
          selectableOptions={SELECTABLE_VISIBILITY_OPTIONS}
          selectedOption={selectedVisibility}
          onOptionSelected={handleSelection}
        />
      </View>


      <View style={styles.proceedButtonContainer}>
        <BottomInfoBox
          backgroundColor={Colors.backgroundColor}
          title={common.note}
          infoText={
            strings.AHidden
          }
        />
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity onPress={handleSaveButtonPress}>
            <View
              style={styles.confirmButtonView}
            >
              <Text style={styles.confirmButtonText}>{common.confirm}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDismiss}
            style={{
              ...ButtonStyles.primaryActionButton,
              marginRight: 8,
              backgroundColor: 'transparent',
            }}
          >
            <Text style={{
              ...ButtonStyles.actionButtonText,
              color: Colors.blue,
            }}>
              {common.back}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
  },
  proceedButtonContainer: {
    zIndex: 2,
    elevation: 2,
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
  },
  actionButtonContainer: {
    marginTop: 24,
    marginLeft: 30,
    marginRight: 30,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  confirmButtonView: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    alignSelf: 'center',
    marginLeft: 15,
    padding: 15,
    backgroundColor: Colors.blue
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )

export default AccountSettingsEditVisibilityScreen
