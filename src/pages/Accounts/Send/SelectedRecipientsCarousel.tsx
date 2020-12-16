import React from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { RecipientDescribing } from '../../../common/data/models/interfaces/RecipientDescribing'
import SelectedRecipientCarouselItem from '../../../components/send/SelectedRecipientCarouselItem'

export type Props = {
  recipients: RecipientDescribing[];
  onRemoveSelected: ( recipient: RecipientDescribing ) => void;
};


const SelectedRecipientsCarousel: React.FC<Props> = ( {
  recipients,
  onRemoveSelected,
}: Props ) => {
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
            // currencyCode={
            //   prefersBitcoin
            //     ? serviceType == TEST_ACCOUNT
            //       ? ' t-sats'
            //       : ' sats'
            //     : ''
            // }
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
