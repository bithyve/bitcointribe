import React, { useState, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native'
import Colors from '../../common/Colors'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import CommonStyles from '../../common/Styles/Styles'
import { RFValue } from 'react-native-responsive-fontsize'

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
const grid = Array( 2048 ).fill( 0 )
const pattern = [ 11, 12, 3, 5, 8, 9, 2047, 6, 7, 4, 7 ]

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
    paddingHorizontal: 10,
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    height: 15,
    width: 15,
    margin: 1,
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
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText:{
    color: Colors.blue,
    fontSize: RFValue( 17 )
  },
  ceilText: {
    color: '#BEBBBB'
  },
  doneBtnWrapper: {
    backgroundColor: Colors.blue,
    paddingVertical: 5,
    paddingHorizontal: 10,
    alignItems:'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginRight: 15
  },
  doneBtnText: {
    color: Colors.white
  },
  previewStyle:{
    height: 45,
    width: 15,
    backgroundColor: '#B5B5B5',
    margin: 1,
  },
  patternPreviewStyle: {
    height: 45,
    width: 15,
    backgroundColor: '#304E55',
    margin: 1,
  }
} )

const PreviewPattern = ( { navigation } ) => {
  const columnHeaderRef = useRef()
  const rowHeaderRef = useRef()
  const [ loading, setLoading ] = useState( false )

  return (
    <SafeAreaView style={styles.viewContainer}>
      <StatusBar
        backgroundColor={Colors.backgroundColor}
        barStyle="dark-content"
      />
      <View style={CommonStyles.headerContainer}>
        <TouchableOpacity
          style={[ CommonStyles.headerLeftIconContainer, styles.headerWrapper, {
          } ]}
          onPress={() => {
            navigation.goBack()
          }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={CommonStyles.headerLeftIconInnerContainer}>
              <FontAwesome
                name="long-arrow-left"
                color={Colors.homepageButtonColor}
                size={17}
              />
            </View>
            <View>
              <Text style={styles.headerText}>Preview Pattern</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.doneBtnWrapper}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
      {!loading && (
        <View style={{
          marginLeft: '15%'
        }}>
          <FlatList
            data={columns}
            horizontal
            bounces={false}
            scrollEnabled={false}
            showsHorizontalScrollIndicator={false}
            renderItem={( { item } ) => (
              <View style={styles.headerCell}>
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
              //   contentContainerStyle={{
              //     paddingBottom: 100 + 36
              //   }}
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
                <FlatList
                  scrollEnabled={false}
                  bounces={false}
                  data={grid}
                  renderItem={( { item, index } )=>(
                    <View style={pattern.includes( index ) ?  styles.patternPreviewStyle : styles.previewStyle}/>
                  )}
                  numColumns={16}
                  keyExtractor={item => item.id}
                />
              </ScrollView>
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  )
}
export default PreviewPattern
