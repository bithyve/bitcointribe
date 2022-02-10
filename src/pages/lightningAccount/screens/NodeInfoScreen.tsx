import React, { Component } from 'react'
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
} from 'react-native'
import openLink from '../../../utils/OpenLink'
import ListStyles from '../../../common/Styles/ListStyles'
import LabeledBalanceDisplay from '../../../components/LabeledBalanceDisplay'
import Colors from '../../../common/Colors'
import { RFValue } from 'react-native-responsive-fontsize'
import Fonts from '../../../common/Fonts'
import moment from 'moment'
import HeaderTitle from '../../../components/HeaderTitle'
import { inject, observer } from 'mobx-react'
@inject(
  'NodeInfoStore',
  'SettingsStore'
)
@observer
export default class NodeInfoScreen extends Component {
  constructor( props ) {
    super( props )
    this.state = {
      nodeInfo: this.props.NodeInfoStore.nodeInfo,
    }
  }

  render() {
    console.log( this.props.NodeInfoStore.nodeInfo, '+++' )
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
              {this.state.nodeInfo.alias}
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
              {this.state.nodeInfo.version}
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
              {this.state.nodeInfo.synced_to_chain ? 'Yes' : 'No'}
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
              {this.state.nodeInfo.block_height}
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
              {this.state.nodeInfo.block_hash}

            </Text>
          </View>
          <View style={styles.lineItem}>
            <Text style={ListStyles.listItemTitleTransaction}>
              URIs
            </Text>
            <Text
              style={{
                ...ListStyles.listItemSubtitle,
                marginBottom: 3,
              }}
            >
              {/* {this.state.payment.enhancedPath[0].join('\n\n')} */}
              {this.state.nodeInfo.uris.join( '\n\n' )}

            </Text>
          </View>
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
