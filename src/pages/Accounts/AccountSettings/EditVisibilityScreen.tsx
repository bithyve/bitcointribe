import React, { useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import useAccountShellFromNavigation from '../../../utils/hooks/state-selectors/accounts/UseAccountShellFromNavigation'
import { useDispatch } from 'react-redux'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import ListStyles from '../../../common/Styles/ListStyles'

import VisibilityOptionsList from '../../../components/account-settings/visibility/VisibilityOptionsList'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import { updateAccountSettings } from '../../../store/actions/accounts'
import Fonts from '../../../common/Fonts'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import Colors from '../../../common/Colors'
import BottomInfoBox from '../../../components/BottomInfoBox'
import { translations } from '../../../common/content/LocContext'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import HeaderTitle from '../../../components/HeaderTitle'
import CommonStyles from '../../../common/Styles/Styles'

const SELECTABLE_VISIBILITY_OPTIONS = [
  AccountVisibility.DEFAULT,
  AccountVisibility.HIDDEN,
  // AccountVisibility.DURESS,   // Disabled until duress mode is implemented later
]

export type Props = {
  navigation: any;
};

const HeaderSection: React.FC = ( { title } ) => {
  return (
    <View style={ListStyles.infoHeaderSection}>
      <Text style={ListStyles.infoHeaderSubtitleText}>{title}</Text>
    </View>
  )
}

const AccountSettingsEditVisibilityScreen: React.FC<Props> = ( { navigation, }: Props ) => {
  const dispatch = useDispatch()
  const accountShell = useAccountShellFromNavigation( navigation )
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
    navigation.navigate( 'Home' )
  }

  function onDismiss() {
    navigation.goBack()
  }

  return (
    <SafeAreaView style={styles.rootContainer}>
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
      </View>
      <HeaderTitle
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
            <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={styles.confirmButtonView}
            >
              <Text style={styles.confirmButtonText}>{common.confirm}</Text>
            </LinearGradient>
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
    elevation: 10,
    alignSelf: 'center',
    marginLeft: 15,
    padding: 15
  },
  confirmButtonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
} )

export default AccountSettingsEditVisibilityScreen
