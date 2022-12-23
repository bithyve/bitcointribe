const ElectrumCli = require("electrum-client");
import config from "../HexaConfig";
const reverse = require("buffer-reverse");
import * as bitcoinJS from "bitcoinjs-lib";

const defaultPeer = {
  host: "",
  ssl: "",
};
const predefinedPeers = [
  // peers for production server goes here.
];

const predefinedTestnetPeers = [
  {
    host: "35.177.46.45",
    ssl: "50002",
  },
];

let electrumClient;
let isClientConnected = false;
let currentPeerIndex = Math.floor(Math.random() * predefinedPeers.length);
let connectionAttempt = 0;

export async function connect() {
  const peer = await getNextPeer();
  try {
    console.log(peer);
    console.log("Create electrum instance");

    electrumClient = new ElectrumCli(
      global.net,
      global.tls,
      peer.ssl || peer.tcp,
      peer.host,
      peer.ssl ? "tls" : "tcp"
    ); // tcp or tls
    console.log("Instance created");

    electrumClient.onError = (e) => {
      console.log("Electrum mainClient.onError():", e.message);

      if (isClientConnected) {
        electrumClient.close && electrumClient.close();
        isClientConnected = false;
        console.log("Error: Close the connection");
        setTimeout(connect, 500);
      }
    };
    console.log("Initiate electrum server");
    const ver = await electrumClient.initElectrum({
      client: "nguwallet",
      version: "1.4",
    });
    console.log("Connection to electrum server is established");
    if (ver && ver[0]) {
      console.log(`ver : ${ver}`);
      isClientConnected = true;
    }
  } catch (e) {
    isClientConnected = false;
    console.log("Bad connection:", JSON.stringify(peer), e);
  }

  if (!isClientConnected) {
    console.log("Attempt to retry");
    connectionAttempt = connectionAttempt + 1;
    console.log("Close the connection before attempting again");
    electrumClient.close && electrumClient.close();
    if (connectionAttempt >= 5) {
      console.log(
        "Could not find the working electrum server. Please try again later."
      );
    } else {
      console.log(`Reconnection attempt #${connectionAttempt}`);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return connect();
    }
  }
}

async function getCurrentPeer() {
  const isTestnet = config.NETWORK == bitcoinJS.networks.testnet;
  return isTestnet
    ? predefinedTestnetPeers[currentPeerIndex]
    : predefinedPeers[currentPeerIndex];
}

async function getNextPeer() {
  const isTestnet = config.NETWORK == bitcoinJS.networks.testnet;
  currentPeerIndex++;
  if (
    currentPeerIndex + 1 >
    (isTestnet ? predefinedTestnetPeers.length : predefinedPeers.length)
  ) {
    currentPeerIndex = 0;
  }
  const peer = getCurrentPeer();
  return peer;
}

export async function ping() {
  if (electrumClient) {
    try {
      await electrumClient.server_ping();
    } catch (ex) {
      isClientConnected = false;
      return false;
    }
    return true;
  }
  return false;
}
