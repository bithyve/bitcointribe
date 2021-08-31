import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StyleSheet,
} from 'react-native'
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import { ScrollView } from 'react-native-gesture-handler'
import { useSelector } from 'react-redux'
import idx from 'idx'
import { getVersions } from '../common/utilities'


export default function VersionHistoryScreen( props ) {
  const versionHistory = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.versions ) )
  const restoreVersions = useSelector( ( state ) => idx( state, ( _ ) => _.versionHistory.restoreVersions ) )

  const [ SelectedOption, setSelectedOption ] = useState( 0 )
  const [ isDataSet, setIsDataSet ] = useState( false )


  const SelectOption = ( Id ) => {
    if ( Id == SelectedOption ) {
      setSelectedOption( 0 )
    } else {
      setSelectedOption( Id )
    }
  }
  const [ data, setData ] = useState( [] )

  useEffect( () => {
    // eslint-disable-next-line prefer-const
    let versions = getVersions( versionHistory, restoreVersions )
    if( versions.length ){
      setData( versions )
      setIsDataSet( !isDataSet )
      SelectOption( versions.length )}
  }, [] )


  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <View style={styles.rootContainer}>
        {data && data.length ? (
          <View style={{
            flex: 1
          }}>
            <ScrollView style={{
            }}>
              {data.map( value => {
                if ( value && SelectedOption == parseInt( value.id ) ) {
                  return (
                    <TouchableOpacity
                      key={value.id}
                      // onPress={() => SelectOption( value.id )}
                      style={styles.selection}
                    >
                      <Text style={styles.versionText}>
                        {value.versionName ? value.versionName : ''}
                      </Text>
                      <Text style={{
                        ...styles.text, fontSize: RFValue( 9 ),
                      }}>
                        {value.date ? value.date : ''}
                      </Text>
                    </TouchableOpacity>
                  )
                }
                return (
                  <TouchableOpacity
                    key={value.id}
                    // onPress={() => SelectOption( value.id )}
                    style={{
                      ...styles.selection, height: wp( '15%' ),
                      width: wp( '85%' ),
                    }}>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center'
                    }}>
                      <Text style={{
                        ...styles.versionText, color: Colors.textColorGrey,
                        fontSize: RFValue( 10 ),
                      }}>
                        {value.versionName ? value.versionName : ''}
                      </Text>
                      <Text
                        style={styles.date}
                      >
                        {value.date ? value.date : ''}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              } )}
            </ScrollView>
          </View> ) : null}
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create( {
  rootContainer: {
    flex: 1, backgroundColor: Colors.backgroundColor1
  },
  selection: {
    margin: wp( '3%' ),
    backgroundColor: Colors.white,
    borderRadius: 10,
    height: wp( '20%' ),
    width: wp( '90%' ),
    justifyContent: 'center',
    paddingLeft: wp( '3%' ),
    paddingRight: wp( '3%' ),
    alignSelf: 'center',
  },
  versionText: {
    color: Colors.blue,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.FiraSansRegular,
  },
  text: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.FiraSansRegular,
    marginTop: hp( '0.4%' ),
  },
  date: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 'auto',
  }
} )

