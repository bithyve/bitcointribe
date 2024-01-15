import idx from 'idx'
import React, { useEffect, useState } from 'react'
import {
  SafeAreaView,
  StyleSheet, Text,
  TouchableOpacity, View
} from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp, widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import { useSelector } from 'react-redux'
import Colors from '../common/Colors'
import Fonts from '../common/Fonts'
import { getVersions } from '../common/utilities'
import HeaderTitle from '../components/HeaderTitle'


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
    let versions = getVersions( versionHistory.length < 50 ? versionHistory : JSON.parse( versionHistory ), restoreVersions )
    if( versions.length ){
      setData( versions )
      setIsDataSet( !isDataSet )
      SelectOption( versions.length )}
  }, [] )


  return (
    <SafeAreaView style={{
      flex: 1
    }}>
      <HeaderTitle
        navigation={props.navigation}
        backButton={true}
        firstLineTitle={'Version History'}
        secondLineTitle={''}
        infoTextNormal={''}
        infoTextBold={''}
        infoTextNormal1={''}
        step={''}
      />
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
    flex: 1,
    backgroundColor: Colors.backgroundColor
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
    fontFamily: Fonts.Regular,
  },
  text: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
    fontFamily: Fonts.Regular,
    marginTop: hp( '0.4%' ),
  },
  date: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 9 ),
    fontFamily: Fonts.Regular,
    marginLeft: 'auto',
  }
} )

