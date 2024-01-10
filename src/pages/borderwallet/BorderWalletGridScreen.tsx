import * as bip39 from 'bip39'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  InteractionManager,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import IconRight from '../../assets/images/svgs/icon_right.svg'
import StartAgain from '../../assets/images/svgs/startagain.svg'
import { GridType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import CommonStyles from '../../common/Styles/Styles'
import CreateMemorablePattern from '../../components/border-wallet/CreateMemorablePattern'
import ModalContainer from '../../components/home/ModalContainer'
import Toast from '../../components/Toast'
import uheprng from '../../utils/uheprng'

const wordlists = bip39.wordlists.english
export const columns = [
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
    position: 'relative'
  },
  text: {
    fontSize: 12,
    color: '#BEBBBB',
    fontFamily: Fonts.Light,
  },
  textSeq: {
    position: 'absolute',
    fontSize: 9,
    fontFamily: Fonts.Medium,
    color: '#F8F8F8',
    top: 1,
    left: 3
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerText:{
    color: Colors.blue,
    fontSize: RFValue( 14 ),
    fontFamily: Fonts.Light,
  },
  selectedPatternText: {
    fontSize: 12,
    color: '#F8F8F8',
    fontFamily: Fonts.Medium,
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
    marginLeft: wp( 2 )
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

const Cell = React.memo<any>( ( { onPress, text, index, isSelected, sequence } ) => {
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
}, ( prevProps, nextProps ) => {
  return prevProps.isSelected === nextProps.isSelected && prevProps.sequence === nextProps.sequence
} )

const BorderWalletGridScreen = ( { route, navigation } ) => {
  const mnemonic =  route.params?.mnemonic
  const isNewWallet = route.params?.isNewWallet
  const isAccountCreation =  route.params?.isAccountCreation
  const isImportAccount = route.params?.isImportAccount
  const gridType =  route.params?.gridType || GridType.WORDS
  const [ grid, setGrid ] = useState( [] )
  const [ selected, setSelected ] = useState( [] )
  const columnHeaderRef = useRef()
  const rowHeaderRef = useRef()
  const [ loading, setLoading ] = useState( true )
  const [ createMemorablePattern, setCreateMemorablePattern ]  = useState( false )

  useEffect( ()=> {
    if( isNewWallet ) setCreateMemorablePattern( true )
  }, [] )

  const isNext = useMemo( () => {
    return selected.length === 11 || selected.length === 23
  }, [ selected ] )

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
    setGrid( cells )
    setLoading( false )
  }

  const onCellPress = useCallback( ( index ) => {
    const isSelected = selected.includes( index )
    if ( isSelected ) {
      setSelected( prevSelected => ( prevSelected.filter( i => i !== index ) ) )
    } else if ( selected.length < 23 ) {
      setSelected( prevSelected => ( [ ...prevSelected, index ] ) )
    }else{
      Toast( 'Pattern selection limit reached. You have selected 23 words' )
    }
  }, [ selected, setSelected ] )

  const onPressNext = () => {
    const words = [ ...wordlists ]
    shuffle( words, mnemonic )
    const selectedWords = []
    selected.forEach( s => {
      selectedWords.push( words[ s ] )
    } )

    isAccountCreation ?  navigation.navigate( 'SelectChecksumWordAccount', {
      words: selectedWords.toString().replace( /,/g, ' ' ),
      selected,
      initialMnemonic: mnemonic,
      isNewWallet,
      gridType,
      isAccountCreation,
    } ):
      navigation.navigate( 'SelectChecksumWord', {
        words: selectedWords.toString().replace( /,/g, ' ' ),
        selected,
        initialMnemonic: mnemonic,
        isNewWallet,
        gridType,
        isImportAccount,
      } )
  }

  const renderCell = useCallback( ( { item, index } ) => {
    const isSelected = selected.includes( index )
    return (
      <Cell
        key={index}
        onPress={onCellPress}
        text={item}
        index={index}
        isSelected={isSelected}
        sequence={isSelected ? selected.findIndex( ( i ) => i === index ) + 1 : -1}
      />
    )}, [ selected, onCellPress ] )

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
          onPress={()=> setSelected( [] )}
        >
          <StartAgain/>
          <Text style={styles.startAgainBtnText}>&nbsp;Start Again</Text>
        </TouchableOpacity>}
        <TouchableOpacity
          disabled={!isNext}
          style={styles.selectionNextBtn}
          onPress={onPressNext}
        >
          <Text style={styles.selectedPatternText}>{`${selected.length} of ${selected.length <= 11 ? '11' : '23'}`}</Text>
          {isNext && <View style={styles.nextBtnWrapper}>
            <Text style={styles.selectedPatternText}>Next</Text>
            <View style={styles.iconRightWrapper}>
              <IconRight/>
            </View>
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
            <Text style={styles.headerText}>{isNewWallet ? 'Step 4: Create a Pattern' : 'Select your Pattern'}</Text>
          </View>
          {
            isNewWallet && (
              <View style={styles.statusIndicatorView}>
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorActiveView} />
                <View style={styles.statusIndicatorInactiveView} />
                <View style={styles.statusIndicatorInactiveView} />
              </View>
            )
          }
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
            // keyExtractor={( item ) => item}
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
              showsVerticalScrollIndicator={false}
              renderItem={( { item } ) => (
                <View style={styles.cell}>
                  <Text style={styles.ceilText}>{( '000' + ( item + 1 ) ).substr( -3 )}</Text>
                </View>
              )}
              // keyExtractor={( item ) => item.toString()}
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
                <FlatList
                  data={grid}
                  overScrollMode="never"
                  bounces={false}
                  scrollEnabled={false}
                  showsHorizontalScrollIndicator={false}
                  numColumns={16}
                  renderItem={renderCell}
                />
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      )}
      <ModalContainer onBackground={() =>{setCreateMemorablePattern( false )}}
        visible={createMemorablePattern}
        closeBottomSheet={() => { }}>
        <CreateMemorablePattern closeModal={() => {setCreateMemorablePattern( false )}}/>
      </ModalContainer>
    </SafeAreaView>
  )
}
export default BorderWalletGridScreen
