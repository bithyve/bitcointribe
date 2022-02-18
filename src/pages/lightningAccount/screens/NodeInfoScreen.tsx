/* eslint-disable react/jsx-key */
import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Clipboard,
  TouchableOpacity
} from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import HeaderTitle from '../../../components/HeaderTitle'
import { inject, observer } from 'mobx-react'
import Toast from '../../../components/Toast'

@inject(
  'NodeInfoStore',
)
@observer
export default class NodeInfoScreen extends Component {

  componentDidMount() {
    this.props.NodeInfoStore.reset()
    this.props.NodeInfoStore.getNodeInfo()
  }

  writeToClipboard  ( text: string ) {
    Clipboard.setString( text )
    Toast( 'Text Copied' )
  }

  render() {
    const { NodeInfoStore } = this.props
    const {  alias, version, synced_to_chain, block_height, block_hash, uris } = NodeInfoStore.nodeInfo
    if( NodeInfoStore.loading ){
      return(
        <ActivityIndicator
          color={Colors.blue}
          size="large"
          style={{
            height: '90%'
          }}
        />
      )
    }
    return (
      <ScrollView
        contentContainerStyle={styles.rootContainer}
        overScrollMode="never"
        bounces={false}
      >
        <HeaderTitle
          firstLineTitle={'Node Information'}
          secondLineTitle={''}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />

        <View style={styles.bodySection}>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Alias</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.getFee} */}
              {alias}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Implementation Version
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.payment_hash} */}
              {version}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Synced To Chain
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.payment_preimage } */}
              {synced_to_chain ? 'Yes' : 'No'}
            </Text>
          </View>

          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>Block Height</Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {moment( parseInt( this.state.payment.creation_date ) ).format( 'DD/MM/YY • hh:MMa' )} */}
              {block_height}
            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              Block Hash
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.enhancedPath[0].join('\n\n')} */}
              {block_hash}

            </Text>
          </View>
          {
            uris.length > 0 && (
              uris.map( uri => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  onPress={()=>this.writeToClipboard( uri )}
                  style={styles.lineItem}>
                  <Text style={ListStyles.listItemTitleTransaction}>
                  URI
                  </Text>
                  <Text
                    style={{
                      ...ListStyles.listItemSubtitle,
                      marginBottom: 3,
                    }}
                  >
                    {uri}
                  </Text>
                </TouchableOpacity>
              ) )
            )
          }

        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginBottom: RFValue( 16 ),
    backgroundColor: 'white',
    padding: 10,
    paddingHorizontal: 10,
    elevation: 4,
    borderRadius: 8,
  },

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
} )
