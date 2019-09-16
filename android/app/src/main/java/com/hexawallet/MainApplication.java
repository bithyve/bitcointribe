package com.hexawallet;

import android.app.Application;
import android.util.Log;

import com.facebook.react.PackageList;
import com.facebook.hermes.reactexecutor.HermesExecutorFactory;
import com.facebook.react.bridge.JavaScriptExecutorFactory;
import com.facebook.react.ReactApplication;
import com.proyecto26.inappbrowser.RNInAppBrowserPackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.hopding.pdflib.PDFLibPackage;
import org.pgsqlite.SQLitePluginPackage;
import com.rnfs.RNFSPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.imagepicker.ImagePickerPackage;
import com.oblador.keychain.KeychainPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.chirag.RNMail.RNMail;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import com.tkporter.sendsms.SendSMSPackage;
import com.horcrux.svg.SvgPackage;
import com.tradle.react.UdpSocketsModule;
import com.bitgo.randombytes.RandomBytesPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import org.reactnative.camera.RNCameraPackage;
import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;

import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

import com.hexawallet.PdfPasswordPackage;
import com.hexawallet.UtilsPackage;

import java.util.List;

public class MainApplication extends Application implements ShareApplication, ReactApplication {

  @Override
  public String getFileProviderAuthority() {
    return BuildConfig.APPLICATION_ID + ".provider";
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      @SuppressWarnings("UnnecessaryLocalVariable")
      List<ReactPackage> packages = new PackageList(this).getPackages();
      // Packages that cannot be autolinked yet can be added manually here, for
      // example:
      packages.add(new PdfPasswordPackage());
      packages.add(new UtilsPackage());
      return packages;
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
