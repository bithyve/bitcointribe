import React, { useEffect, useState, useRef, useMemo } from 'react'
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
import ModalContainer from '../../components/home/ModalContainer'
import CreateMemorablePattern from '../../components/border-wallet/CreateMemorablePattern'
import Toast from '../../components/Toast'
import StartAgain from '../../assets/images/svgs/startagain.svg'
import dbManager from '../../storage/realm/dbManager'
import { GridType, Wallet } from '../../bitcoin/utilities/Interface'
import { generateBorderWalletGrid } from '../../utils/generateBorderWalletGrid'

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
const cellHeight = 25
const cellWidth = 60

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
    padding: 5,
    width: cellWidth,
    height: cellHeight,
    margin: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    padding: 5,
    width: cellWidth,
    height: cellHeight,
    backgroundColor: '#69A2B0',
    margin: 1,
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
    top: -5,
    left: -7
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
  },
  statusIndicatorView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: wp( 10 )
  },
  statusIndicatorActiveView: {
    height: 10,
    width: 10,
    backgroundColor: Colors.CLOSE_ICON_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
  statusIndicatorInactiveView: {
    height: 7,
    width: 7,
    backgroundColor: Colors.THEAM_TEXT_COLOR,
    borderRadius: 10,
    marginLeft: 5,
  },
  bottomViewWrapper: {
    width: '100%',
    backgroundColor: 'rgba(242, 242, 242,0.6)',
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingVertical: 10,
    zIndex: 10
  },
  startAgainBtnWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10
  },
  startAgainBtnText: {
    fontSize: RFValue( 13 ),
    color: Colors.CLOSE_ICON_COLOR,
    fontWeight: 'bold'
  }
} )

export const Ceil = ( { onPress, text, index, selected } ) => {
  const isSelected = selected.includes( index )
  const sequence = isSelected ? selected.findIndex( ( i ) => i === index ) + 1 : -1
  return (
    <TouchableOpacity
      activeOpacity={0.6}
      onPress={() => onPress( index )}
      style={isSelected ? styles.cellSelected : [ styles.cell, {
        backgroundColor: '#E5E5E5'
      } ]}
    >
      {isSelected && <Text style={styles.textSeq}>{sequence} &nbsp;</Text>}
      <Text style={[ styles.text, {
        color: isSelected ? '#F8F8F8' : '#BEBBBB',
        fontWeight: isSelected ? 'bold' : '500'
      } ]}>{text}</Text>
    </TouchableOpacity>
  )
}

const ValidateBorderWalletPattern = ( { navigation } ) => {
  const wallet: Wallet =  dbManager.getWallet()
  const mnemonic = wallet.borderWalletMnemonic
  const gridType = wallet.borderWalletGridType || GridType.WORDS
  const [ grid, setGrid ] = useState( [] )
  const [ selected, setSelected ] = useState( [] )
  const columnHeaderRef = useRef()
  const rowHeaderRef = useRef()
  const [ loading, setLoading ] = useState( true )
  const [ attempts, setAttempts ] = useState( 0 )

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

  useEffect( () => {
    let listener
    InteractionManager.runAfterInteractions( () => {
      listener = setTimeout( () => {
        generateGrid()
      }, 500 )
    } )
    return () => clearTimeout( listener )
  }, [ gridType ] )

  const isNext = useMemo( () => {
    return selected.length === 11 || selected.length === 23
  }, [ selected ] )

  const generateGrid = ()=>{
    const words = [ ...wordlists ]
    shuffle( words, mnemonic )
    const cells = words.map( ( word ) => {
      switch ( gridType ) {
          case GridType.WORDS:
            return word.slice( 0, 4 )
          case GridType.HEXADECIMAL:
            return ' ' + ( wordlists.indexOf( word ) + 1 ).toString( 16 ).padStart( 3, '0' )
          case GridType.NUMBERS:
            return ( wordlists.indexOf( word ) + 1 ).toString().padStart( 4, '0' )
          default:
            return ' '
      }
    } )
    const g = []
    Array.from( {
      length: 128
    }, ( _, rowIndex ) => {
      g.push( cells.slice( rowIndex * 16, ( rowIndex + 1 ) * 16 ) )
    } )
    setGrid( g )
    setLoading( false )
  }

  const onCeilPress = ( index ) => {
    const isSelected = selected.includes( index )
    if ( isSelected ) {
      const i = selected.findIndex( ( i ) => i === index )
      selected.splice( i, 1 )
      setSelected( [ ...selected ] )
    } else if ( selected.length < 23 ) {
      selected.push( index )
      setSelected( [ ...selected ] )
    }else{
      Toast( 'Pattern selection limit reached. You have selected 23 words' )
    }
  }
  const onPressForgot = () => {
    const selected = []
    const words = wallet.primaryMnemonic.split( ' ' )
    words.pop()
    const wordsGrid = generateBorderWalletGrid( mnemonic, gridType )
    words.forEach( word => {
      const index = wordsGrid.findIndex( g => {
        return g === word.slice( 0, 4 )
      } )
      selected.push( index )
    } )
    navigation.navigate( 'PreviewPattern', {
      pattern: selected,
      isValidate: true
    } )
    clearSelection()
  }
  const onPressVerify = () => {
    const words = [ ...wordlists ]
    shuffle( words, mnemonic )
    const selectedWords = []
    selected.forEach( s => {
      selectedWords.push( words[ s ] )
    } )
    const selectedPattern =  selectedWords.toString().replace( /,/g, ' ' )
    if( selectedPattern === wallet.primaryMnemonic.split( ' ' ).splice( 0, 11 ).toString().replace( /,/g, ' ' ) ) {
      Toast( 'Pattern matched' )
      navigation.replace( 'ValidateBorderWalletChecksum', {
        words: selectedPattern,
        selected,
        initialMnemonic: mnemonic
      } )
    } else {
      Toast( 'Pattern does not match' )
      setAttempts( attempts + 1 )
    }
  }

  const clearSelection = () => {
    setSelected( [] )
    setAttempts( 0 )
  }

  return (
    <SafeAreaView style={styles.viewContainer}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <View style={styles.bottomViewWrapper}>
        {isNext &&<TouchableOpacity
          disabled={!isNext}
          style={styles.startAgainBtnWrapper}
          onPress={clearSelection}
        >
          <StartAgain/>
          <Text style={styles.startAgainBtnText}>&nbsp;Start Again</Text>
        </TouchableOpacity>}
        <TouchableOpacity
          disabled={!isNext}
          style={styles.selectionNextBtn}
          onPress={attempts===3 ? onPressForgot : onPressVerify}
        >
          <Text style={styles.selectedPatternText}>{`${selected.length} of ${selected.length <= 11 ? '11' : '23'}`}</Text>
          {isNext && <View style={styles.nextBtnWrapper}>
            {attempts===3?
              <Text style={styles.selectedPatternText}>Forgot</Text>
              :
              <>
                <Text style={styles.selectedPatternText}>Verify</Text>
                <View style={styles.iconRightWrapper}>
                  <IconRight/>
                </View>
              </>}
          </View>}
        </TouchableOpacity>
      </View>
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
          style={[ CommonStyles.headerLeftIconContainer, styles.headerWrapper, {

          } ]}
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
            <Text style={styles.headerText}>Select your pattern</Text>
          </View>
        </TouchableOpacity>
      </View>
      {!loading && (
        <View style={{
          marginLeft: cellWidth + 4
        }}>
          <FlatList
            data={columns}
            ref={columnHeaderRef}
            horizontal
            overScrollMode="never"
            bounces={false}
            snapToInterval={cellWidth + 2}
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
          flex: 1, marginHorizontal: 2, flexDirection: 'row',
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
            flex: 1,
          }}>
            <ScrollView
              horizontal
              overScrollMode="never"
              bounces={false}
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={10}
              snapToInterval={cellWidth+2}
              snapToAlignment="start"
              onScroll={( e ) => {
                columnHeaderRef.current?.scrollToIndex( {
                  index: e.nativeEvent.contentOffset.x / ( cellWidth+2 ),
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
                    index: e.nativeEvent.contentOffset.y / ( cellHeight+2 ),
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
export default ValidateBorderWalletPattern
