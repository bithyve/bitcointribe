import { action, observable, reaction } from 'mobx'
import { randomBytes } from 'react-native-randombytes'
import Channel from './../models/Channel'
import ChannelInfo from './../models/ChannelInfo'
import CloseChannelRequest from './../models/CloseChannelRequest'
import OpenChannelRequest from './../models/OpenChannelRequest'
import SettingsStore from './SettingsStore'

import Base64Utils from '../utils/ln/Base64Utils'
import RESTUtils from '../utils/ln/RESTUtils'

interface ChannelInfoIndex {
    [key: string]: ChannelInfo;
}

export default class ChannelsStore {
    @observable public loading = false;
    @observable public error = false;
    @observable public errorPeerConnect = false;
    @observable public errorMsgChannel: string | null;
    @observable public errorMsgPeer: string | null;
    @observable public nodes: any = {
    };
    @observable public aliasesById: any = {
    };
    @observable public channels: Array<Channel> = [];
    @observable public output_index: number | null;
    @observable public funding_txid_str: string | null;
    @observable public openingChannel = false;
    @observable public connectingToPeer = false;
    @observable public errorOpenChannel = false;
    @observable public peerSuccess = false;
    @observable public channelSuccess = false;
    @observable channelRequest: any;
    closeChannelSuccess: boolean;
    // redesign
    @observable public largestChannelSats = 0;
    @observable public totalOutbound = 0;
    @observable public totalInbound = 0;
    @observable public totalOffline = 0;
    @observable public chanInfo: ChannelInfoIndex = {
    };

    settingsStore: SettingsStore;

    constructor( settingsStore: SettingsStore ) {
      this.settingsStore = settingsStore

      reaction(
        () => this.settingsStore.settings,
        () => {
          if ( this.settingsStore.hasCredentials() ) {
            this.getChannels()
          }
        }
      )

      reaction(
        () => this.channelRequest,
        () => {
          if ( this.channelRequest ) {
            const chanReq = new OpenChannelRequest( this.channelRequest )
            this.openChannel( chanReq )
            // this.OpenChannel(chanReq)
          }
        }
      )
    }

    @action
    reset = () => {
      this.loading = false
      this.error = false
      this.errorPeerConnect = false
      this.errorMsgChannel = null
      this.errorMsgPeer = null
      this.nodes = {
      }
      this.channels = []
      this.output_index = null
      this.funding_txid_str = null
      this.openingChannel = false
      this.connectingToPeer = false
      this.errorOpenChannel = false
      this.peerSuccess = false
      this.channelSuccess = false
      this.channelRequest = null
      this.largestChannelSats = 0
      this.totalOutbound = 0
      this.totalInbound = 0
      this.totalOffline = 0
    };

    @action
    getNodeInfo = ( pubkey: string ) => {
      this.loading = true
      return RESTUtils.getNodeInfo( [ pubkey ] ).then( ( data: any ) => {
        return data.node
      } )
    };

    getChannelsError = () => {
      this.channels = []
      this.error = true
      this.loading = false
    };

    @action
    public getChannels = () => {
      this.channels = []
      this.largestChannelSats = 0
      this.totalOutbound = 0
      this.totalInbound = 0
      this.totalOffline = 0
      this.loading = true
      RESTUtils.getChannels()
        .then( ( data: any ) => {
          const channels = data.channels.map(
            ( channel: any ) => new Channel( channel )
          )
          channels.forEach( ( channel: Channel ) => {
            const channelRemoteBalance = Number( channel.remoteBalance )
            const channelLocalBalance = Number( channel.localBalance )
            const channelTotal =
                        channelRemoteBalance + channelLocalBalance
            if ( channelTotal > this.largestChannelSats )
              this.largestChannelSats = channelTotal
            if ( !channel.isActive ) {
              this.totalOffline += channelTotal
            } else {
              this.totalInbound += channelRemoteBalance
              this.totalOutbound += channelLocalBalance
            }
            if (
              this.settingsStore.implementation !==
                            'c-lightning-REST' &&
                        !this.nodes[ channel.remote_pubkey ]
            ) {
              this.getNodeInfo( channel.remote_pubkey ).then(
                ( nodeInfo: any ) => {
                  if ( !nodeInfo ) return

                  this.nodes[ channel.remote_pubkey ] = nodeInfo
                  this.aliasesById[ channel.chan_id ] =
                                    nodeInfo.alias
                }
              )
            }
          } )
          this.channels = channels
          this.error = false
          this.loading = false
        } )
        .catch( () => {
          this.getChannelsError()
        } )
    };

    // used it while debugging
    @action
    public OpenChannel = async ( request: any ) => {
      const req = {
        local_funding_amount: request.local_funding_amount,
        min_confs: request.min_confs,
        node_pubkey_string: request.node_pubkey_string,
        private: request.private,
        sat_per_byte: request.sat_per_byte
      }
      await RESTUtils.openChannel( req )
        .then( ( resp: any ) => {
        } )
    }

    @action
    public closeChannel = (
      request?: CloseChannelRequest | null,
      channelId?: string | null,
      satPerByte?: string | null,
      forceClose?: boolean | string | null
    ) => {

      let urlParams: Array<any> = []
      if ( channelId ) {
        // c-lightning, eclair
        urlParams = [ channelId, forceClose ]
      } else if ( request ) {
        // lnd
        const { funding_txid_str, output_index } = request

        urlParams = [ funding_txid_str, output_index, forceClose ]

        if ( satPerByte ) {
          urlParams = [
            funding_txid_str,
            output_index,
            forceClose,
            satPerByte
          ]
        }
      }

      RESTUtils.closeChannel( urlParams )
        .then( ( data: any ) => {
          const { chan_close } = data
          this.closeChannelSuccess = chan_close.success
          this.error = false
        } )
        .catch( () => {
          this.getChannelsError()
        } )
    };

    @action
    public connectPeer = ( request: OpenChannelRequest ) => {
      this.connectingToPeer = true
      this.error = false
      this.errorPeerConnect = false
      this.errorMsgChannel = null
      this.errorMsgPeer = null
      RESTUtils.connectPeer( {
        addr: {
          pubkey: request.node_pubkey_string,
          host: request.host
        }
      } )
        .then( ( data: any ) => {
          this.errorPeerConnect = false
          this.connectingToPeer = false
          this.errorMsgPeer = null
          this.channelRequest = request
          this.peerSuccess = true
        } )
        .catch( ( error: any ) => {
          // handle error
          this.errorMsgPeer = error.toString()
          this.errorPeerConnect = true
          this.connectingToPeer = false
          this.peerSuccess = false
          this.channelSuccess = false

          if (
            this.errorMsgPeer &&
                    this.errorMsgPeer.includes( 'already' )
          ) {
            this.channelRequest = request
          }
        } )
    };

    openChannelLNDCoinControl = ( request: OpenChannelRequest ) => {
      const { utxos } = request
      const inputs: any = []
      const outputs: any = {
      }
      const sat_per_byte = request.sat_per_byte

      if ( utxos ) {
        utxos.forEach( input => {
          const [ txid_str, output_index ] = input.split( ':' )
          inputs.push( {
            txid_str, output_index: Number( output_index )
          } )
        } )
      }

      delete request.utxos

      const node_pubkey = Base64Utils.hexToBase64( request.node_pubkey_string )

      delete request.node_pubkey_string
      delete request.sat_per_byte

      const pending_chan_id = randomBytes( 32 ).toString( 'base64' )

      const openChanRequest = {
        funding_shim: {
          psbt_shim: {
            no_publish: true,
            pending_chan_id
          }
        },
        node_pubkey,
        ...request
      }

      RESTUtils.openChannelStream( openChanRequest )
        .then( ( data: any ) => {
          const psbt_fund = data.psbt_fund
          const { funding_address, funding_amount } = psbt_fund

          if ( funding_address ) {
            outputs[ funding_address ] = Number( funding_amount )
          }

          const fundPsbtRequest = {
            raw: {
              inputs,
              outputs
            },
            sat_per_vbyte: Number( sat_per_byte )
          }

          RESTUtils.fundPsbt( fundPsbtRequest )
            .then( ( data: any ) => {
              const funded_psbt = data.funded_psbt

              const openChanRequest = {
                funding_shim: {
                  psbt_shim: {
                    base_psbt: funded_psbt
                  }
                },
                ...request
              }

              RESTUtils.openChannel( openChanRequest )
                .then( ( data: any ) => {} )
                .catch( ( error: any ) => {
                  this.errorMsgChannel = error.toString()
                  this.output_index = null
                  this.funding_txid_str = null
                  this.errorOpenChannel = true
                  this.openingChannel = false
                  this.channelRequest = null
                  this.peerSuccess = false
                  this.channelSuccess = false
                } )
            } )
            .catch( ( error: any ) => {
              this.errorMsgChannel = error.toString()
              this.output_index = null
              this.funding_txid_str = null
              this.errorOpenChannel = true
              this.openingChannel = false
              this.channelRequest = null
              this.peerSuccess = false
              this.channelSuccess = false
            } )
        } )
        .catch( ( error: any ) => {
          this.errorMsgChannel = error.toString()
          this.output_index = null
          this.funding_txid_str = null
          this.errorOpenChannel = true
          this.openingChannel = false
          this.channelRequest = null
          this.peerSuccess = false
          this.channelSuccess = false
        } )
    };

    openChannel = ( request: OpenChannelRequest ) => {
      delete request.host

      this.peerSuccess = false
      this.channelSuccess = false
      this.openingChannel = true
      if (
        this.settingsStore.implementation === 'lnd' &&
            request.utxos &&
            request.utxos.length > 0
      ) {
        return this.openChannelLNDCoinControl( request )
      }

      // opening channel request data had unrecognised fields (id) because of OpenChannelRequest class..
      // so lnd was throwing error, hence created a separate request and added only required fields.
      const req = {
        local_funding_amount: request.local_funding_amount,
        min_confs: request.min_confs,
        node_pubkey_string: request.node_pubkey_string,
        private: request.private,
        sat_per_byte: request.sat_per_byte
      }
      RESTUtils.openChannel( req )
        .then( ( data: any ) => {
          this.output_index = data.output_index
          this.funding_txid_str = data.funding_txid_str
          this.errorOpenChannel = false
          this.openingChannel = false
          this.errorMsgChannel = null
          this.channelRequest = null
          this.channelSuccess = true
        } )
        .catch( ( error: any ) => {
          this.errorMsgChannel = error.toString()
          this.output_index = null
          this.funding_txid_str = null
          this.errorOpenChannel = true
          this.openingChannel = false
          this.channelRequest = null
          this.peerSuccess = false
          this.channelSuccess = false
        } )
    };

    @action
    public getChannelInfo = ( chanId: string ) => {
      this.loading = true
      if ( this.chanInfo[ chanId ] ) delete this.chanInfo[ chanId ]
      RESTUtils.getChannelInfo( chanId )
        .then( ( data: any ) => {
          this.chanInfo[ chanId ] = new ChannelInfo( data )
          this.loading = false
        } )
        .catch( ( error: any ) => {
          // handle error
          this.errorMsgPeer = error.toString()
          if ( this.chanInfo[ chanId ] ) delete this.chanInfo[ chanId ]
          this.loading = false
        } )
    };
}
