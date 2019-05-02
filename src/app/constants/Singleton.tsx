export default class Singleton {
  //In future use redux (singleton same redux but redux adv.)
  static myInstance = null;
  public passcode: string = "";
  public rootViewController: string = "TabbarBottom";
  public deepLinkingUrl: string = "";
  public deepLinkingType: string = "";

  //Class Object 
  public S3Service: any;



  //Wallet Details
  public walletDetails: any;

  //Setup your wallet screen
  public setupWallet = {};


  /**
   * @returns {Singleton}
   */
  static getInstance() {
    if ( Singleton.myInstance == null ) {
      Singleton.myInstance = new Singleton();
    }
    return this.myInstance;
  }

  //TODO: passcode
  getPasscode() {
    return this.passcode;
  }
  setPasscode( code: string ) {
    this.passcode = code;
  }
  //TODO: rootViewController
  getRootViewController() {
    return this.rootViewController;
  }
  setRootViewController( controller: string ) {
    this.rootViewController = controller;
  }
  //TODO: deepLinkingUrl
  getDeepLinkingUrl() {
    return this.deepLinkingUrl;
  }
  setDeepLinkingUrl( url: string ) {
    this.deepLinkingUrl = url;
  }


  //TODO: deepLinkingType
  getDeepLinkingType() {
    return this.deepLinkingType;
  }
  setDeepLinkingType( type: string ) {
    this.deepLinkingType = type;
  }

  //Wallet Details
  getWalletDetails() {
    return this.walletDetails;
  }

  setWalletDetails( url: string ) {
    this.walletDetails = url;
  }

  getSetupWallet() {
    return this.setupWallet;
  }
  setSetupWallet( url: string ) {
    this.setupWallet = url;
  }
}
