export default class Singleton {
  //In future use redux (singleton same redux but redux adv.)
  static myInstance = null;
  public passcode: string = "";
  public rootViewController: string = "TabbarBottom";
  public deepLinkingUrl: string = "";
  public deepLinkingType: string = "";





  //Wallet Details
  public walletJsonDetails: any;

  //Setup your wallet screen
  public setupWallet = {};

  //SSS Details
  public sssJsonDetails: any;
  public sssDetailsRecordIDWise: any;

  //App Health Status  
  public appHealthStatus: any;





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
    return this.walletJsonDetails;
  }

  setWalletDetails( url: string ) {
    this.walletJsonDetails = url;
  }

  //Setup your wallet
  getSetupWallet() {
    return this.setupWallet;
  }
  setSetupWallet( url: string ) {
    this.setupWallet = url;
  }

  //sss details   
  getSSSDetails() {
    return this.sssJsonDetails;
  }
  setSSSDetails( value: any ) {
    this.sssJsonDetails = value;
  }
  getSSSDetailsRecordIDWise() {
    return this.sssDetailsRecordIDWise;
  }
  setSSSDetailsRecordIDWise( value: any ) {
    this.sssDetailsRecordIDWise = value;
  }

  //App Health Status

  getAppHealthStatus() {
    return this.appHealthStatus;
  }
  setAppHealthStatus( value: any ) {
    this.appHealthStatus = value;
  }


}
