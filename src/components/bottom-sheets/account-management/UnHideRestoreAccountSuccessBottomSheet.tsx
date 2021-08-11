import React, {  } from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import Colors from '../../../common/Colors'
import BottomSheetStyles from '../../../common/Styles/BottomSheetStyles'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import { TouchableOpacity } from '@gorhom/bottom-sheet'
import { ListItem } from 'react-native-elements'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import { RFValue } from 'react-native-responsive-fontsize'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import AccountVisibility from '../../../common/data/enums/AccountVisibility'

export type Props = {
  onProceed: () => void;
  accountInfo: any;
  accountVisibility: String;
};

const renderAccount = ( accountInfo, accountVisibility ) => {
  return (
    <View style={{
      flexDirection: 'row',
      borderRadius: 8,
      marginBottom: wp( 5 ),
      padding: 10,
      backgroundColor: Colors.backgroundColor1,
    }}>
      <View style={styles.avatarImage}>
        <Image
          source={getAvatarForSubAccount( accountInfo )}
          style={{
            width: 45,
            height: 45,
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
          {accountVisibility === AccountVisibility.HIDDEN ? 'Unhide Account' : 'Restore Account'}
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

const UnHideRestoreAccountSuccessBottomSheet: React.FC<Props> = ( {
  onProceed,
  accountInfo,
  accountVisibility
}: Props ) => {
  return (
    <View style={styles.rootContainer}>

      <View style={styles.mainContentContainer}>
        <Text style={BottomSheetStyles.confirmationMessageHeading}>
          {accountVisibility === AccountVisibility.HIDDEN ? 'Account Successfully Unhidden' : 'Account Successfully Restored'}
        </Text>
        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {'You can now find this account in My Accounts'}
        </Text>
        {renderAccount( accountInfo, accountVisibility )}

        <Text style={{
          ...ListStyles.infoHeaderSubtitleText, marginBottom: 18
        }}>
          {accountVisibility === AccountVisibility.HIDDEN ? 'The account can be seen under My Accounts and the balance of this account will be added to the overall account value' : 'You can now use this account to send and receive sats like a normal account'}
        </Text>
      </View>
      <View style={styles.footerSectionContainer}>
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            onPress={onProceed}
            style={ButtonStyles.primaryActionButton}
          >
            <Text style={ButtonStyles.actionButtonText}>{'View Account'}</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={require( '../../../assets/images/icons/success.png' )
          }
          style={styles.successImage}
        />
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  mainContentContainer: {
    padding: 30,
    paddingBottom: 20,
    flex: 1,
  },

  footerSectionContainer: {
    marginTop: 'auto',
    flexDirection: 'row',
  },

  actionButtonContainer: {
    marginLeft: 30,
    justifyContent: 'center'
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
  successImage: {
    width: wp( '25%' ),
    height: hp( '18%' ),
    marginLeft: 'auto',
    resizeMode: 'stretch',
  },
} )

export default UnHideRestoreAccountSuccessBottomSheet
