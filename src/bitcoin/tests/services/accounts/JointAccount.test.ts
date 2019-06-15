import JointAccount from "../../../services/accounts/JointAccount";

describe("Joint Account", () => {
  let jointAccount: JointAccount;
  let initDetails: string;
  let mergeDetails: string;
  let ackDetails: string;
  let jointMultiSig: { scripts: any; address: string };
  let creationDetails: string;
  let creatorMnemonic: string;
  let mergerMnemonic: string;
  let creatorPriv: string;
  let mergerPriv: string;
  let txHex: string;
  beforeAll(async () => {
    jest.setTimeout(50000);
    jointAccount = new JointAccount();
    creatorMnemonic =
      "image shell scatter purchase health bridge verify mirror abstract rhythm list bid";
    mergerMnemonic =
      "physical shallow pave space climb reason refuse burst city suspect buyer swing";

    const cRes = await jointAccount.bitcoin.generateHDWallet(creatorMnemonic);
    creatorPriv = cRes.privateKey;

    const mRes = await jointAccount.bitcoin.generateHDWallet(mergerMnemonic);
    mergerPriv = mRes.privateKey;
  });

  test("inititates the creation of joint account (cretor's end)", async () => {
    const details = {
      creator: "Matt",
      walletName: "ST. Funding"
    };

    initDetails = jointAccount.initiateJointAccount(creatorMnemonic, details);

    const initiationDetails = JSON.parse(initDetails);
    const { cpk, typ, wn, cn } = initiationDetails;
    expect(cpk).toBeDefined();
    expect(typ).toEqual("conf");
    expect(wn).toEqual(details.walletName);
    expect(cn).toEqual(details.creator);
  });

  test("merges an initiated joint account (merger's end)", async () => {
    const details = {
      jointDetails: initDetails,
      merger: "Ken"
    };

    const { multiSig, mergeJSON } = jointAccount.mergeJointAccount(
      mergerMnemonic,
      details
    );
    mergeDetails = mergeJSON;
    const { scripts, address } = multiSig;
    jointMultiSig = multiSig;
    expect(scripts).toBeDefined();
    expect(address).toBeDefined();
    const { typ, mpk, mn } = JSON.parse(mergeDetails);
    expect(mpk).toBeDefined();
    expect(typ).toEqual("imp");
    expect(mn).toEqual(details.merger);
  });

  test("provide details for acknowledgement", () => {
    ackDetails = jointAccount.ackDetails(mergeDetails);
    const acknowledgementDetails = JSON.parse(ackDetails);
    expect(acknowledgementDetails.cpk).toBeUndefined();
    expect(acknowledgementDetails.typ).toEqual("ack");
    const { mpk, mn, cn } = JSON.parse(mergeDetails);
    expect(acknowledgementDetails.mpk).toEqual(mpk);
    expect(acknowledgementDetails.mn).toEqual(mn);
    expect(acknowledgementDetails.cn).toEqual(cn);
  });

  test("completes an initiated joint account (creator's end)", () => {
    const details = {
      jointDetails: ackDetails
    };
    const { multiSig, creationJSON } = jointAccount.createInitiatedJointAccount(
      creatorMnemonic,
      details
    );
    creationDetails = creationJSON;

    expect(multiSig.address).toEqual(jointMultiSig.address);
    expect(multiSig.scripts).toBeDefined();

    const { add, typ, cpk } = JSON.parse(creationDetails);
    const initiationDetails = JSON.parse(initDetails);
    expect(add).toEqual(jointMultiSig.address);
    expect(typ).toEqual("imp");
    expect(cpk).toEqual(initiationDetails.cpk);
    console.log({ address: jointMultiSig.address });
  });

  test("inititates a transaction from a (pre-funded) joint account (txn construction and signing)", async () => {
    const res = await jointAccount.initJointTxn({
      senderAddress: jointMultiSig.address,
      recipientAddress: "2N4qBb5f1KyfbpHxtLM86QgbZ7qcxsFf9AL",
      amount: 4500,
      privateKey: creatorPriv,
      scripts: jointMultiSig.scripts
    });

    if (res.status === 200) {
      txHex = res.data;
      expect(txHex).toBeDefined();
    } else {
      throw new Error("joint transaction initiation failed");
    }
  });

  test("finalizes an initiated transaction from the joint account (2nd signature provisioning and broadcasting)", async () => {
    const res = await jointAccount.authorizeJointTxn(txHex, mergerPriv);
    if (res.status !== 200) {
      throw new Error("finalization of the joint transaction failed");
    } else {
      const { txid } = res.data;
      console.log({ txid });
      expect(txid).toBeDefined();
    }
  });
});
