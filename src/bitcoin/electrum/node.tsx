import ElectrumClient from './client'
import { NodeDetail } from './interface'
import PersonalNode from '../../common/data/models/PersonalNode'

export default class Node {
  public static async save( nodeDetail: PersonalNode, nodeList: PersonalNode[] ) {
    if (
      nodeDetail.host === null ||
        nodeDetail.host.length === 0 ||
        nodeDetail.port === null ||
        nodeDetail.port.length === 0
    )
      return {
        saved: false
      }

    // test connection before saving
    const isConnectable = await ElectrumClient.testConnection( nodeDetail )
    if ( !isConnectable ) return {
      saved: false
    }

    const nodes = [ ...nodeList ]
    const node = {
      ...nodeDetail
    }
    if ( node.id === null ) {
      // case: save new node
      node.id = nodeList.length + 1
      nodes.push( node )
    } else {
      // case: update existing node
      const index = nodes.findIndex( ( item ) => item.id === node.id )
      nodes[ index ] = node
    }

    return {
      saved: true, nodes, node
    }
  }

  public static update( selectedNode: NodeDetail, nodeList: NodeDetail[] ) {
    if ( !selectedNode ) return null

    const updatedNodes = nodeList.map( ( item ) => {
      const node = {
        ...item
      }
      node.isConnected = item.id === selectedNode?.id ? selectedNode.isConnected : false
      return node
    } )

    return updatedNodes
  }


  public static delete( selectedNode: NodeDetail, nodeList: NodeDetail[] ) {
    if ( !selectedNode ) return null
    return nodeList?.filter( ( item ) => item.id !== selectedNode.id )
  }


  public static async connectToSelectedNode( selectedNode: NodeDetail ) {
    // connects to the selected node(in case of failure, won't have default/private nodes as fallback)
    ElectrumClient.setActivePeer( [], [], selectedNode )
    const { connected, connectedTo, error } = await ElectrumClient.connect()
    return {
      connected, connectedTo, error
    }
  }

  public static async disconnect( selectedNode: NodeDetail ) {
    const activePeer = ElectrumClient.getActivePeer()
    if ( selectedNode.host === activePeer?.host && selectedNode.port === activePeer?.port )
      ElectrumClient.forceDisconnect()
  }

    public static nodeConnectionStatus = ( node: NodeDetail ) => {
      const activePeer = ElectrumClient.getActivePeer()

      if ( activePeer?.host === node.host && activePeer?.port === node.port && activePeer?.isConnected )
        return true

      return false
    };

    public static getModalParams( selectedNodeItem ) {
      return {
        id: selectedNodeItem?.id || null,
        host: selectedNodeItem?.host || null,
        port: selectedNodeItem?.port || null,
        useKeeperNode: selectedNodeItem?.useKeeperNode || false,
        isConnected: selectedNodeItem?.isConnected || false,
        useSSL: selectedNodeItem?.useSSL || false,
      }
    }
}
