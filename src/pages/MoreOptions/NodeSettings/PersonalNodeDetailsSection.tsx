import React from 'react'
import { FlatList, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  widthPercentageToDP as wp
} from 'react-native-responsive-screen'
import ConnectIcon from '../../../assets/images/icons/connect.svg'
import DeleteIcon from '../../../assets/images/icons/delete_orange.svg'
import DisconnectIcon from '../../../assets/images/icons/disconnect.svg'
import Node from '../../../bitcoin/electrum/node'
import Colors from '../../../common/Colors'
import { translations } from '../../../common/content/LocContext'
import PersonalNode from '../../../common/data/models/PersonalNode'
import Fonts from '../../../common/Fonts'
import ListStyles from '../../../common/Styles/ListStyles'

export type Props = {
  // personalNode: PersonalNode | null;
  onAddButtonPressed: () => void;
  nodeList: PersonalNode[];
  onDelete: ( selectedItem: PersonalNode ) => void;
  onConnectNode: ( selectedItem: PersonalNode ) => void;
  onDisconnectNode: ( selectedItem: PersonalNode ) => void;
  onSelectedNodeitem: ( selectedItem: PersonalNode ) => void;
  selectedNodeItem: PersonalNode | null
};

const PersonalNodeDetailsSection: React.FC<Props> = ( {
  // personalNode,
  onAddButtonPressed,
  nodeList,
  onDelete,
  onConnectNode,
  onDisconnectNode,
  onSelectedNodeitem,
  selectedNodeItem
}: Props ) => {
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]

  return (
    <View style={styles.rootContainer}>

      <View style={[ ListStyles.infoHeaderSection, {
        paddingVertical: 24
      } ]}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={{
            ...ListStyles.infoHeaderTitleText, flex: 1
          }}>
            {strings.PersonalNodeDetails}
          </Text>
          <TouchableOpacity onPress={onAddButtonPressed}>
            <View
              style={styles.proceedBtnWrapper}
            >
              <Text style={styles.proceedBtnText}>Add</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={{
          backgroundColor:Colors.gray9, height:1, marginVertical:20
        }}/>
        <View>
          <Text style={{
            ...ListStyles.infoHeaderTitleText
          }}>
            {'Node connected previously'}
          </Text>
        </View>
      </View>

      {
        ( nodeList.length > 0 )&&
      <View style={styles.bodySection}>
        <FlatList
          data={nodeList}
          showsVerticalScrollIndicator={false}
          renderItem={( { item } ) => {
            const isConnected = Node.nodeConnectionStatus( item )
            return ( <TouchableOpacity
              onPress={() => onSelectedNodeitem( item )}
              style={[
                styles.nodeContainer,
                item.id === selectedNodeItem?.id
                  ? [ styles.selectedItem, {
                    borderColor: Colors.blue
                  } ]
                  : null,
                {
                  backgroundColor: isConnected ? Colors.gray9 : Colors.gray9
                },
              ]}
              activeOpacity={isConnected ? 1 : 0.50}
            >
              <View style={styles.nodeDetail}>
                <Text
                  style={[ styles.nodeTextHeader ]}>
                  {'Host'}
                </Text>
                <Text style={styles.nodeTextValue}>{item.host}</Text>
                <Text style={[ styles.nodeTextHeader, {
                  marginTop:4
                } ]}>
                  {'Port Number'}
                </Text>
                <Text style={styles.nodeTextValue}>{item.port}</Text>
              </View>

              <View style={styles.verticleSplitter} />

              <TouchableOpacity onPress={() => {
                if ( !isConnected ) onConnectNode( item )
                else onDisconnectNode( item )
              }}>
                <View style={[ styles.actionArea, {
                  paddingLeft: 15, paddingRight: 15
                } ]}>
                  {Node.nodeConnectionStatus( item ) ? <DisconnectIcon /> : <ConnectIcon />}
                  <Text style={[ styles.actionText ]}>
                    {Node.nodeConnectionStatus( item ) ? 'Disconnect' : 'Connect'}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.verticleSplitter} />

              <TouchableOpacity onPress={() => onDelete( item )}>
                <View style={[ styles.actionArea, {
                  paddingLeft: 15, paddingRight: 15
                } ]}>
                  <DeleteIcon />
                  <Text
                    style={[ styles.actionText ]}>{'Delete'}</Text>
                </View>
              </TouchableOpacity>
            </TouchableOpacity> )
          }}
        />
      </View>
      }
    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
  },

  bodySection: {
    paddingHorizontal: 24,
    flex: 1,
  },

  textInputContainer: {
  },

  footerSection: {
    marginTop: 12,
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },

  useFallbackTouchable: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor1,
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 10,
    marginTop: 10,
    marginBottom: 10,
    height: wp( '13%' ),
  },
  useFallbackText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  useFallbackCheckView: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedItem: {
    borderWidth: 1,
  },
  nodeContainer:{
    borderRadius: 5,
    flexDirection: 'row',
    // width: '99%',
    marginBottom: 4,
    alignItems: 'center',
  },
  nodeDetail: {
    flex: 1,
    padding: 5,
  },
  nodeTextHeader: {
    marginHorizontal: 5,
    fontSize: 11,
    letterSpacing: 0.6,
    color:'rgba(95,105,101,1)'
  },
  nodeTextValue: {
    fontSize: 12,
    letterSpacing: 1.56,
    marginHorizontal: 5,
    paddingBottom: 2,
    color:'rgba(95,105,101,1)'
  },
  verticleSplitter: {
    opacity: 0.40,
    borderWidth: 0.4,
    height: 45,
    borderColor:'rgba(79,89,85,1)'
  },
  actionText: {
    fontSize: 11,
    letterSpacing: 0.36,
    fontWeight: '600',
    paddingTop: 4
  },
  actionArea: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnWrapper: {
    height: wp( '8%' ),
    width: wp( '15%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: Colors.blue,
  },
  proceedBtnText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
  }
} )

export default PersonalNodeDetailsSection
