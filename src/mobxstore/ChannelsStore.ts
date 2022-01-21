import { observable, action, makeObservable, runInAction } from 'mobx'
import RESTUtils from '../utils/ln/RESTUtils'
import Channel from '../models/Channel'
import OpenChannelRequest from '../models/OpenChannelRequest'
import CloseChannelRequest from '../models/CloseChannelRequest'

interface RecentChannelOpened {
    funding_txid_bytes: any;
    funding_txid_str?: string;
    output: number;
}

export default class ChannelsStore {

    channels: Array<Channel> = [];
    recentlyOpenedChannel: RecentChannelOpened = null;
    recentlyClosedChannel: any = null;

    constructor() {
        makeObservable(this, {
            channels: observable,
            recentlyOpenedChannel: observable,
            recentlyClosedChannel: observable,
            channelList: action,
            connectPeer: action,
            closeChannel: action
        })
    }

    public channelList = async (node: any) => {
        try {
            await RESTUtils.getChannels(node).then((resp: any) => {
                runInAction(() => {
                    this.channels = resp.channels
                })
            })
        } catch (err: any) {
            console.log(err)
        }
    }

    public connectPeer = async (node: any, request: OpenChannelRequest) => {
        await RESTUtils.connectPeer(node, {
            addr: {
                pubkey: request.node_pubkey_string,
                host: request.host
            }
        }).then(async (resp: any) => {
            await RESTUtils.openChannel(node, request)
                .then((resp: any) => {
                    runInAction(() => {
                        this.recentlyOpenedChannel = resp;
                    })
                })
        })
    }

    public closeChannel = async (node: any, closeChannelReq: CloseChannelRequest) => {
        let { funding_txid_str, output_index } = closeChannelReq;
        let closeChannelArgs = [
            funding_txid_str,
            output_index,
            true
        ]
        await RESTUtils.closeChannel(node, closeChannelArgs)
            .then((resp: any) => {
                runInAction(() => {
                    this.recentlyClosedChannel = resp
                })
            })
    }
}