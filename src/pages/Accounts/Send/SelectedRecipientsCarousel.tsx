import React, { useMemo } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { TEST_ACCOUNT } from '../../../common/constants/wallet-service-types'
import CurrencyKind from '../../../common/data/enums/CurrencyKind'
import SubAccountKind from '../../../common/data/enums/SubAccountKind'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import SelectedRecipientCarouselItem from '../../../components/send/SelectedRecipientCarouselItem'
import useCurrencyKind from '../../../utils/hooks/state-selectors/UseCurrencyKind'

export type Props = {
  recipients: RecipientDescribing[];
  subAccountKind: SubAccountKind;
  onRemoveSelected?: ( recipient: RecipientDescribing ) => void;
};


const SelectedRecipientsCarousel: React.FC<Props> = ( {
  recipients,
  subAccountKind,
  onRemoveSelected = () => {},
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
          />
        )
      }}
    />
  )
}

const styles = StyleSheet.create( {
  listContentContainer: {
    paddingVertical: 24,
  }
} )

export default SelectedRecipientsCarousel
