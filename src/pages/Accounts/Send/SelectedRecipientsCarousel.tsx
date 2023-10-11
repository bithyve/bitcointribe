import React, { useMemo } from 'react'
import { Dimensions, FlatList, StyleSheet } from 'react-native'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import SelectedRecipientCarouselItem from '../../../components/send/SelectedRecipientCarouselItem'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'

const { height } = Dimensions.get( 'window' )

export type Props = {
  recipients: RecipientDescribing[];
  subAccountKind: SubAccountKind;
  onRemoveSelected?: ( recipient: RecipientDescribing ) => void;
  showRemoveButton?: boolean;
};


const SelectedRecipientsCarousel: React.FC<Props> = ( {
  recipients,
  subAccountKind,
  onRemoveSelected = () => {},
  showRemoveButton
}: Props ) => {
  const currencyKind = useCurrencyKind()

  const prefersBitcoin: boolean = useMemo( () => {
    return currencyKind === CurrencyKind.BITCOIN
  }, [ currencyKind ] )

  return (
    <FlatList
      horizontal
      contentContainerStyle={
        styles.listContentContainer
      }
      data={recipients}
      keyExtractor={( recipient ) => recipient.id}
      showsHorizontalScrollIndicator={false}
      contentOffset={{
        x: -24, y: 0
      }}
      renderItem={( { item: recipient }: { item: RecipientDescribing; index: number } ) => {
        return (
          <SelectedRecipientCarouselItem
            containerStyle={{
              marginHorizontal: 12
            }}
            recipient={recipient}
            currencyCode={
              prefersBitcoin
                ? subAccountKind == SubAccountKind.TEST_ACCOUNT
                  ? ' t-sats'
                  : ' sats'
                : ''
            }
            onRemove={() => onRemoveSelected( recipient )}
            showRemoveButton={showRemoveButton}
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create( {
  listContentContainer: {
    paddingVertical: height > 720 ? 24 : 5,
  }
} )

export default SelectedRecipientsCarousel
