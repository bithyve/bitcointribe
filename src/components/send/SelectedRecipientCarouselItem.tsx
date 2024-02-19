import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { widthPercentageToDP, widthPercentageToDP as wp } from 'react-native-responsive-screen'
import AntDesign from 'react-native-vector-icons/AntDesign'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import HeadingStyles from '../../common/Styles/HeadingStyles'
import ImageStyles from '../../common/Styles/ImageStyles'
import CurrencyKind from '../../common/data/enums/CurrencyKind'
import RecipientKind from '../../common/data/enums/RecipientKind'
import { ContactRecipientDescribing, RecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useFormattedAmountText from '../../utils/hooks/formatting/UseFormattedAmountText'
import useFormattedUnitText from '../../utils/hooks/formatting/UseFormattedUnitText'
import useAmountBeingSentToRecipient from '../../utils/hooks/state-selectors/sending/UseAmountBeingSentToRecipient'
import useSourceAccountShellForSending from '../../utils/hooks/state-selectors/sending/UseSourceAccountShellForSending'
import LastSeenActiveIndicator from '../LastSeenActiveIndicator'
import RecipientAvatar from '../RecipientAvatar'

export type Props = {
  recipient: RecipientDescribing;
  onRemove: () => void;
  showRemoveButton?: boolean;
  currencyCode?: string;
  containerStyle?: Record<string, unknown>;
};

const SelectedRecipientCarouselItem: React.FC<Props> = ( {
  recipient,
  onRemove,
  showRemoveButton = true,
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

      {showRemoveButton ? ( <TouchableOpacity
        style={styles.closeButton}
        onPress={onRemove}
      >
        <AntDesign
          size={16}
          color={Colors.blue}
          name={'closecircle'}
        />
      </TouchableOpacity> ) : null}

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
    fontFamily: Fonts.MediumItalic,
    color: Colors.blue,
  },

  closeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
  },
} )

export default SelectedRecipientCarouselItem
