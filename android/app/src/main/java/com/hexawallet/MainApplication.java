package com.hexawallet;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.oblador.keychain.KeychainPackage;
import com.oblador.keychain.KeychainPackage;
import com.oblador.keychain.KeychainPackage;
import com.oblador.keychain.KeychainPackage;
import com.hopding.pdflib.PDFLibPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.chirag.RNMail.RNMail;
import com.tkporter.sendsms.SendSMSPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import fr.greweb.reactnativeviewshot.RNViewShotPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.tradle.react.UdpSocketsModule;
import com.peel.react.TcpSocketsModule;
import com.horcrux.svg.SvgPackage;
import org.devio.rn.splashscreen.SplashScreenReactPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import cl.json.RNSharePackage;
import com.bitgo.randombytes.RandomBytesPackage;
import com.peel.react.rnos.RNOSModule;
import com.BV.LinearGradient.LinearGradientPackage;
import com.lewin.qrcode.QRScanReaderPackage;
import com.oblador.keychain.KeychainPackage;
import com.proyecto26.inappbrowser.RNInAppBrowserPackage;
import com.imagepicker.ImagePickerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import org.reactnative.camera.RNCameraPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import org.pgsqlite.SQLitePluginPackage;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new SQLitePluginPackage(), new MainReactPackage(),
            new KeychainPackage(),
            new KeychainPackage(),
            new KeychainPackage(),
            new KeychainPackage(), new PDFLibPackage(),
          new RNFetchBlobPackage(), new RNMail(), SendSMSPackage.getInstance(), new ReactNativeContacts(),
          new RNCWebViewPackage(), new RNViewShotPackage(), new VectorIconsPackage(), new UdpSocketsModule(),
          new TcpSocketsModule(), new SvgPackage(), new SplashScreenReactPackage(), new RNSpinkitPackage(),
          new RNSharePackage(), new RandomBytesPackage(), new RNOSModule(), new LinearGradientPackage(),
          new QRScanReaderPackage(), new KeychainPackage(), new RNInAppBrowserPackage(), new ImagePickerPackage(),
          new RNI18nPackage(), new RNGestureHandlerPackage(), new RNFSPackage(), new RNDeviceInfo(),
          new ReactNativeConfigPackage(), new RNCameraPackage());
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
  }
}