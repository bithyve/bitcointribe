import React, { useEffect, useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  InteractionManager,
  ActivityIndicator,
} from 'react-native'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CommonStyles from '../../common/Styles/Styles'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import * as bip39 from 'bip39'
import uheprng from '../../utils/uheprng'
import { RFValue } from 'react-native-responsive-fontsize'
import IconRight from '../../assets/images/svgs/icon_right.svg'

const wordlists = bip39.wordlists.english
const columns = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
]

const rows = Array.from( Array( 128 ).keys() )

const styles = StyleSheet.create( {
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.LIGHT_BACKGROUND,
  },
  container: {
    flex: 1,
    padding: 10,
    flexDirection: 'column',
  },
  row: {
    flexDirection: 'row',
    overflow: 'hidden',
  },
  column: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cell: {
    padding: 10,
    width: 70,
    height: 35,
    backgroundColor: '#E5E5E5',
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    padding: 10,
    width: 70,
    height: 35,
    backgroundColor: '#69A2B0',
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 12,
    color: '#BEBBBB'
  },
  textSeq: {
    textAlign: 'left',
    fontSize: 9,
    color: '#F8F8F8',
    top: -6,
    left: -10
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText:{
    color: Colors.blue,
    fontSize: RFValue( 17 )
  },
  selectedPatternText: {
    fontSize: 12,
    color: '#F8F8F8'
  },
  selectionNextBtn:{
    padding: 20,
    backgroundColor: '#69A2B0',
    position: 'absolute',
    bottom: 35,
    right: 35,
    zIndex: 10,
    borderRadius: 10,
    flexDirection: 'row'
  },
  nextBtnWrapper: {
    marginLeft: 30,
    flexDirection: 'row'
  },
  iconRightWrapper: {
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
    height: 15,
    width: 15,
    borderRadius: 15,
    marginLeft: 5
  },
  ceilText: {
    color: '#BEBBBB'
  }
} )

const Ceil = ( { onPress, text, index, selected } ) => {
  const isSelected = selected.includes( index )
  const sequence = isSelected ? selected.findIndex( ( i ) => i === index ) + 1 : -1
  return (
    <TouchableOpacity
      onPress={() => onPress( index )}
      style={isSelected ? styles.cellSelected : styles.cell}
    >
      {isSelected && <Text style={styles.textSeq}>{sequence} &nbsp;</Text>}
      <Text style={[ styles.text, {
        color: isSelected ? '#F8F8F8' : '#BEBBBB'
      } ]}>{text}</Text>
    </TouchableOpacity>
  )
}

const BorderWalletGridScreen = ( { navigation } ) => {
  const mnemonic = navigation.getParam( 'mnemonic' )
  const [ grid, setGrid ] = useState( [] )
  const [ selected, setSelected ] = useState( [] )
  const columnHeaderRef = useRef()
  const rowHeaderRef = useRef()
  const [ loading, setLoading ] = useState( true )

  const rnd11Bit = ( limit = 2048 ) => {
    let small = limit
    while ( small >= limit ) {
      const big = crypto.getRandomValues( new Uint16Array( 1 ) )[ 0 ]
      const bigString = big.toString( 2 ).padStart( 16, '0' )
      const smallString = bigString.slice( 5 )
      small = parseInt( smallString, 2 )
    }
    return small
  }

  const shuffle = ( array, seed ) => {
    const prng = uheprng()
    let getRandom = rnd11Bit
    if ( seed ) {
      prng.initState()
      prng.hashString( seed )
      getRandom = prng
    }
    for ( let i = array.length - 1; i > 0; i-- ) {
      const j = getRandom( i + 1 );
      [ array[ i ], array[ j ] ] = [ array[ j ], array[ i ] ]
    }
    prng.done()
  }

  const getCellValue = ( word ) => word.slice( 0, 4 )

  useEffect( () => {
    let listener
    InteractionManager.runAfterInteractions( () => {
      listener = setTimeout( () => {
        const words = [ ...wordlists ]
        shuffle( words, mnemonic )
        const cells = words.map( ( word ) => getCellValue( word ) )
        const g = []
        Array.from( {
          length: 128
        }, ( _, rowIndex ) => {
          g.push( cells.slice( rowIndex * 16, ( rowIndex + 1 ) * 16 ) )
        } )
        setGrid( g )
        setLoading( false )
      }, 500 )
    } )
    return () => clearTimeout( listener )
  }, [] )

  const onCeilPress = ( index ) => {
    const isSelected = selected.includes( index )
    if ( isSelected ) {
      const i = selected.findIndex( ( i ) => i === index )
      selected.splice( i, 1 )
      setSelected( [ ...selected ] )
    } else if ( selected.length < 11 ) {
      selected.push( index )
      setSelected( [ ...selected ] )
    }
  }

  const onPressNext = () => {
    const words = [ ...wordlists ]
    shuffle( words, mnemonic )
    const selectedWords = []
    selected.forEach( s => {
      selectedWords.push( words[ s ] )
    } )
    navigation.navigate( 'SelectChecksumWord', {
      words: selectedWords.toString().replace( /,/g, ' ' )
    } )
  }

  return (
    <SafeAreaView style={styles.viewContainer}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <TouchableOpacity
        disabled={selected.length !== 11}
        style={styles.selectionNextBtn}
        onPress={()=> navigation.navigate( 'SelectChecksumWord' )}
      >
        <Text style={styles.selectedPatternText}>{`${selected.length} of 11`}</Text>
        {selected.length=== 11 && <View style={styles.nextBtnWrapper}>
          <Text style={styles.selectedPatternText}>Next</Text>
          <View style={styles.iconRightWrapper}>
            <IconRight/>
          </View>
        </View>}
      </TouchableOpacity>
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: Colors.backgroundColor,
            marginRight: wp( 4 ),
          },
        ]}
      >
        <TouchableOpacity
          style={[ CommonStyles.headerLeftIconContainer, styles.headerWrapper ]}
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
          <View>
            <Text style={styles.headerText}>Step 2: Create a Pattern</Text>
          </View>
        </TouchableOpacity>
      </View>
      {!loading && (
        <View style={{
          marginLeft: 82
        }}>
          <FlatList
            data={columns}
            ref={columnHeaderRef}
            horizontal
            overScrollMode="never"
            bounces={false}
            snapToInterval={74}
            snapToAlignment="start"
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            renderItem={( { item } ) => (
              <View style={styles.cell}>
                <Text style={styles.ceilText}>{item}</Text>
              </View>
            )}
            keyExtractor={( item ) => item}
          />
        </View>
      )}
      {loading ? (
        <ActivityIndicator size="large" style={{
          height: '80%'
        }} />
      ) : (
        <View style={{
          flex: 1, marginHorizontal: 10, flexDirection: 'row'
        }}>
          <View>
            <FlatList
              data={rows}
              ref={rowHeaderRef}
              contentContainerStyle={{
                paddingBottom: 100 + 36
              }}
              overScrollMode="never"
              bounces={false}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              renderItem={( { item } ) => (
                <View style={styles.cell}>
                  <Text style={styles.ceilText}>{( '000' + ( item + 1 ) ).substr( -3 )}</Text>
                </View>
              )}
              keyExtractor={( item ) => item.toString()}
            />
          </View>

          <View style={{
            flex: 1
          }}>
            <ScrollView
              horizontal
              overScrollMode="never"
              bounces={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={10}
              snapToInterval={74}
              snapToAlignment="start"
              onScroll={( e ) => {
                columnHeaderRef.current?.scrollToIndex( {
                  index: e.nativeEvent.contentOffset.x / 74,
                  animated: false,
                } )
              }}
            >
              <ScrollView
                overScrollMode="never"
                bounces={false}
                contentContainerStyle={{
                  paddingBottom: 100
                }}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={10}
                onScroll={( e ) => {
                  rowHeaderRef.current?.scrollToIndex( {
                    index: e.nativeEvent.contentOffset.y / 39,
                    animated: false,
                  } )
                }}
              >
                {grid.map( ( rowData, index ) => (
                  <FlatList
                    data={rowData}
                    horizontal
                    overScrollMode="never"
                    bounces={false}
                    scrollEnabled={false}
                    showsHorizontalScrollIndicator={false}
                    renderItem={( { item, index: i } ) => (
                      <Ceil
                        onPress={( i ) => onCeilPress( i )}
                        text={item}
                        index={index * 16 + i}
                        selected={selected}
                      />
                    )}
                    keyExtractor={( item ) => item}
                  />
                ) )}
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
export default BorderWalletGridScreen
