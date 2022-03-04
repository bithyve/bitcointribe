import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import ImageStyles from '../../common/Styles/ImageStyles'
import HeadingStyles from '../../common/Styles/HeadingStyles'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RecipientDescribing, ContactRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import LastSeenActiveIndicator from '../LastSeenActiveIndicator'
import RecipientKind from '../../common/data/enums/RecipientKind'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { widthPercentageToDP } from 'react-native-responsive-screen'
import RecipientAvatar from '../RecipientAvatar'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import { Satoshis } from '../../common/data/typealiases/UnitAliases'
import useAmountBeingSentToRecipient from '../../utils/hooks/state-selectors/sending/UseAmountBeingSentToRecipient'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'

export type Props = {
  recipient: RecipientDescribing;
  onRemove: () => void;
  currencyCode?: string;
  containerStyle?: Record<string, unknown>;
};

const SelectedRecipientCarouselItem: React.FC<Props> = ( {
  recipient,
  onRemove,
  currencyCode = '',
  containerStyle = {
  },
}: Props ) => {
  const sourceAccountShell = useSourceAccountShellForSending()
  const sourcePrimarySubAccount = usePrimarySubAccountForShell( sourceAccountShell )
  const designatedAmount = useFormattedAmountText( useAmountBeingSentToRecipient( recipient ) )

  const unitText = !currencyCode ? useFormattedUnitText( {
    currencyKind: CurrencyKind.FIAT
  } ) : currencyCode

  return (
    <View style={{
      ...styles.rootContainer, ...containerStyle
    }}>
      <View style={styles.contentContainer}>

        <View style={styles.circledAvatarContainer}>

          <RecipientAvatar
            recipient={recipient}
            contentContainerStyle={styles.avatarImage}
          />

          {recipient.kind == RecipientKind.CONTACT && (
            <LastSeenActiveIndicator
              style={{
                position: 'absolute', top: -4, right: -4
              }}
              timeSinceActive={( recipient as ContactRecipientDescribing ).lastSeenActive}
            />
          )}
        </View>

        <View style={styles.textContentContainer}>
          <Text
            style={styles.titleText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {sourcePrimarySubAccount && sourcePrimarySubAccount.customDescription}
            {/* {recipient.displayedName} */}
          </Text>

          <Text
            style={styles.amountText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {designatedAmount} {unitText}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onRemove}
      >
        <AntDesign
          size={16}
          color={Colors.blue}
          name={'closecircle'}
        />
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create( {

  rootContainer: {
    width: widthPercentageToDP( 40 ),
    padding: 10,
    backgroundColor: Colors.white,
    borderRadius: 10,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 10,
    shadowOpacity: 0.12,
    shadowColor: Colors.gray5,
    elevation: 10,
  },

  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },

  circledAvatarContainer: {
    ...ImageStyles.thumbnailImageMedium,
    ...ImageStyles.circledAvatarContainer,
    borderRadius: wp( 12 )/2,
    marginRight: 8,
  },

  avatarImage: {
    // ...ImageStyles.circledAvatarContainer,
    ...ImageStyles.thumbnailImageMedium,
    borderRadius: wp ( 12 )/2,
  },

  textContentContainer: {
    flex: 1,
    overflow: 'hidden',
  },

  titleText: {
    ...HeadingStyles.captionText,
    color: Colors.gray4,
    marginBottom: 5,
  },

  amountText: {
    ...HeadingStyles.captionText,
    fontFamily: Fonts.FiraSansMediumItalic,
    color: Colors.blue,
  },

  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
} )

export default SelectedRecipientCarouselItem
