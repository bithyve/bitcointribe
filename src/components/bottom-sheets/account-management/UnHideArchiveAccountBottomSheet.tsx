import React, {  } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native'
import Colors from '../../../common/Colors'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { ListItem } from 'react-native-elements'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'
import useAccountShell from '../../../utils/hooks/state-selectors/accounts/UseAccountShell'
import { translations } from '../../../common/content/LocContext'

export type Props = {
  onProceed: ( accountShell ) => void;
  onBack: () => void;
  accountInfo: any;
};

const renderAccount = ( accountInfo ) => {
  const strings  = translations[ 'accounts' ]
  return (
    <View style={{
      flexDirection: 'row',
      borderRadius: 8,
      marginBottom: wp( 5 ),
      padding: 10,
      backgroundColor: Colors.backgroundColor1,
    }}>
      <View>
        <Image
          source={getAvatarForSubAccount( accountInfo, false, true )}
          style={{
            width: 54,
            height: 54,
          }}
          resizeMode="contain"
        />
      </View>

      <View style={{
        marginLeft: 14
      }}>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText,
        }}>
          {accountInfo.visibility === AccountVisibility.HIDDEN ? strings.UnhideAccount : strings.RestoreAccount}
        </Text>

        <ListItem.Content style={{
          flex: 1,
        }}>
          <ListItem.Title
            style={styles.destinationTitleText}
            numberOfLines={1}
          >
            {accountInfo.customDisplayName ? accountInfo.customDisplayName : accountInfo.defaultTitle}
          </ListItem.Title>
          <ListItem.Subtitle
            style={{
              ...ListStyles.infoHeaderSubtitleText,
              fontSize: RFValue( 10 ),
              color: Colors.blue,
            }}
            numberOfLines={1}
          >
            {accountInfo.customDescription ? accountInfo.customDescription : accountInfo.defaultDescription}
          </ListItem.Subtitle>
        </ListItem.Content>
      </View>
    </View>
  )
}

const UnHideArchiveAccountBottomSheet: React.FC<Props> = ( {
  onProceed,
  onBack,
  accountInfo
}: Props ) => {
  const accountShell = useAccountShell( accountInfo.accountShellID )
  const common  = translations[ 'common' ]
  const strings  = translations[ 'accounts' ]
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          {accountInfo.visibility === AccountVisibility.HIDDEN ? strings.UnhideAccount : 'Restore Archived Account'}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {accountInfo.visibility === AccountVisibility.HIDDEN ? strings.Startshowing : strings.RestoretoHomescreen}
        </Text>
        {renderAccount( accountInfo )}

        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {accountInfo.visibility === AccountVisibility.HIDDEN ? strings.Youcanhide : strings.Onceconfirmed}
        </Text>
        <View style={styles.footerSectionContainer}>
          <View style={styles.actionButtonContainer}>
            <TouchableOpacity
              onPress={( ) => onProceed( accountShell )}
              style={ButtonStyles.primaryActionButton}
            >
              <Text style={ButtonStyles.actionButtonText}>{accountInfo.visibility === AccountVisibility.HIDDEN ? 'Unhide' : 'Restore'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onBack}
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
      </View>
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    // flex: 1,
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 20,
    // flex: 1,
  },

  footerSectionContainer: {
    marginTop: 'auto',
  },

  actionButtonContainer: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  avatarImage: {
    ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageLarge,
    borderRadius: wp( 14 )/2,
  },
  destinationTitleText: {
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue( 20 ),
    color: Colors.black,
  },
} )

export default UnHideArchiveAccountBottomSheet
