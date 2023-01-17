import ElectrumClient from "../../../bitcoin/electrum/client";
import PersonalNode from "../../../common/data/models/PersonalNode";

export default class Node {
    public static async connect(selectedNode, nodeList) {
        const node = { ...selectedNode };
        let isElectrumClientConnected = false;
        let activePeer = null;

        const isValidNode = await ElectrumClient.testConnection(node.host, node.port, node.port);
        if (isValidNode) {
            node.isConnected = true;
            ElectrumClient.setActivePeer(nodeList, node);
            await ElectrumClient.connect();
            isElectrumClientConnected = await ElectrumClient.ping();
        } else {
            ElectrumClient.setActivePeer([]);
            await ElectrumClient.connect();
        }

        activePeer = ElectrumClient.getActivePeer();
        if (
            isElectrumClientConnected &&
            node.host === activePeer?.host &&
            (node.port === activePeer?.ssl || node.port === activePeer?.tcp)
        ) {
            node.isConnected = true;
        } else {
            node.isConnected = false;
        }
        return node;
    }

    public static async connectToDefaultNode() {
        ElectrumClient.setActivePeer([]);
        await ElectrumClient.connect();
    }

    public static async save(nodeDetail: PersonalNode, nodeList: PersonalNode[]) {
        if (
            nodeDetail.host === null ||
            nodeDetail.host.length === 0 ||
            nodeDetail.port === null ||
            nodeDetail.port.length === 0
        )
            return null;

        const nodes = [...nodeList];
        let node = { ...nodeDetail };
        if (node.id === null) {
            node.id = nodeList.length + 1;
            nodes.push(node);
        } else {
            const index = nodes.findIndex((item) => item.id === node.id);
            if (node.isConnected)
                node = await Node.connect(node, nodes);
            nodes[index] = node;
        }

        return { nodes, node };
    }

    public static getModalParams(selectedNodeItem) {
        return {
            id: selectedNodeItem?.id || null,
            host: selectedNodeItem?.host || null,
            port: selectedNodeItem?.port || null,
            useKeeperNode: selectedNodeItem?.useKeeperNode || false,
            isConnected: selectedNodeItem?.isConnected || false,
            useSSL: selectedNodeItem?.useSSL || false
        }
    }

    public static nodeConnectionStatus = (node: any) => {
        const activePeer = ElectrumClient.getActivePeer();
        if (
            activePeer?.host === node.host &&
            (activePeer?.ssl === node.port || activePeer?.tcp === node.port)
            && node.isConnected
        ) {
            return true;
        }
        return false;
    };

}