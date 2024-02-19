import React, { useState } from 'react'
import { FlatList, ScrollView } from 'react-native'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import AccountShell from '../../common/data/models/AccountShell'
import AccountCardColumn from './AccountCardColumn'

export type Props = {
  accountShells: AccountShell[];
  onCardLongPressed: ( accountShell: AccountShell ) => void;
  onAccountSelected: ( accountShell: AccountShell ) => void;
  onAddNewSelected: () => void;
  currentLevel: number;
  contentContainerStyle?: Record<string, unknown>;
  showAllAccount: boolean;
};

type RenderItemProps = {
  item: AccountShell[];
  index: number;
};


function keyExtractor( item: ( AccountShell | string )[] ): string {
  return typeof item[ 0 ] === 'string' ? item[ 0 ] : item[ 0 ].id
}

const HomeAccountCardsGrid: React.FC<Props> = ( {
  accountShells,
  onCardLongPressed,
  onAccountSelected,
  onAddNewSelected,
  currentLevel,
  contentContainerStyle = {
  },
  showAllAccount,
}: Props ) => {
  const getcolumnData = () => {
    if ( accountShells.length == 0 ) {
      return []
    }

    const oddIndexedShells = Array.from( accountShells ).reduce( ( accumulated, current, index ) => {
      if ( index % 2 == 0 && ( current.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true && current.primarySubAccount.visibility !== AccountVisibility.ARCHIVED ) ) {
        accumulated.push( current )
      }

      return accumulated
    }, [] )
    const evenIndexedShells = Array.from( accountShells ).reduce( ( accumulated, current, index ) => {
      if ( index % 2 == 1 && ( current.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true && current.primarySubAccount.visibility !== AccountVisibility.ARCHIVED ) ) {
        accumulated.push( current )
      }

      return accumulated
    }, [] )
    const sortedShells: AccountShell[] = []
    let isChoosingEvenIndexedShells = true
    let isFirstShell = true

    while ( evenIndexedShells.length > 0 || oddIndexedShells.length > 0 ) {
      if ( isFirstShell ) {
        sortedShells.push( ...oddIndexedShells.splice( 0, 1 ) )
        isFirstShell = false
      } else {
        if ( isChoosingEvenIndexedShells ) {
          sortedShells.push( ...evenIndexedShells.splice( 0, 2 ) )
        } else {
          sortedShells.push( ...oddIndexedShells.splice( 0, 2 ) )
        }
        isChoosingEvenIndexedShells = !isChoosingEvenIndexedShells
      }
    }

    const shellCount = sortedShells.length
    const columns = []
    let currentColumn = []
    sortedShells.forEach( ( accountShell, index ) => {
    // if( accountShell.primarySubAccount.visibility === AccountVisibility.DEFAULT || showAllAccount === true ){
      currentColumn.push( accountShell )

      // Make a new column after adding two items -- or after adding the
      // very first item. This is because the first column
      // will only contain one item, since the "Add new" button will be placed
      // in front of everything.
      if ( currentColumn.length == 2 ) {
        columns.push( currentColumn )
        currentColumn = []
      }

      // If we're at the end and a partially filled column still exists,
      // push it.
      if ( index == shellCount - 1 && currentColumn.length > 0 ) {
        columns.push( currentColumn )
      }
      // }
    } )
    if( columns[ columns.length - 1 ]?.length === 1 && columns.length !== 1 ) {
      columns[ columns.length - 1 ].push( 'add new' )
    } else {
      columns.push( [ 'add new' ] )
    }

    return columns
  }

  const columnData = getcolumnData()

  const [ scrollEnabled, setScrollEnabled ]=useState( true )
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <FlatList
        horizontal
        scrollEnabled={scrollEnabled}
        onTouchStart={event=> {
          if ( event.nativeEvent.locationY < 600 )setScrollEnabled( false )
        }}
        onTouchEnd={event=>setScrollEnabled( true )}
        contentContainerStyle={contentContainerStyle}
        showsHorizontalScrollIndicator={false}
        data={columnData}
        keyExtractor={keyExtractor}
        renderItem={( { item, index }: RenderItemProps ) => {
          return <AccountCardColumn
            key={index}
            index={index}
            cardData={item}
            currentLevel={currentLevel}
            // prependsAddButton={typeof item === 'string'}
            onAccountCardSelected={onAccountSelected}
            onAddNewAccountPressed={onAddNewSelected}
            onCardLongPressed={onCardLongPressed}
          />


        }}
      />
    </ScrollView>
  )
}


export default HomeAccountCardsGrid
