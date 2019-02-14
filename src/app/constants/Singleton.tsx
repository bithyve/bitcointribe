export default class Singleton {
  static myInstance = null;
  public passcode: string = "";
  public rootViewController: string = "TabbarBottom";
  public deepLinkingUrl: string = "";

  /**
   * @returns {Singleton}
   */
  static getInstance() {
    if (Singleton.myInstance == null) {
      Singleton.myInstance = new Singleton();
    }
    return this.myInstance;
  }

  //TODO: passcode
  getPasscode() {
    return this.passcode;
  }
  setPasscode(code: string) {
    this.passcode = code;
  }
  //TODO: rootViewController
  getRootViewController() {
    return this.rootViewController;
  }
  setRootViewController(controller: string) {
    this.rootViewController = controller;
  }
  //TODO: deepLinkingUrl
  getDeepLinkingUrl() {
    return this.deepLinkingUrl;
  }
  setDeepLinkingUrl(url: string) {
    this.deepLinkingUrl = url;
  }
}
