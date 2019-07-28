package com.hexawallet;

import android.app.Application;

import com.facebook.react.ReactApplication;

//import com.transistorsoft.rnbackgroundfetch.RNBackgroundFetchPackage;

import com.bitgo.randombytes.RandomBytesPackage;

import com.learnium.RNDeviceInfo.RNDeviceInfo;

import com.tradle.react.UdpSocketsModule;
import com.peel.react.TcpSocketsModule;

import com.oblador.vectoricons.VectorIconsPackage;
import com.horcrux.svg.SvgPackage;
import com.react.rnspinkit.RNSpinkitPackage;
import com.tkporter.sendsms.SendSMSPackage;

import cl.json.RNSharePackage;
import com.hopding.pdflib.PDFLibPackage;
import com.peel.react.rnos.RNOSModule;
import com.chirag.RNMail.RNMail;
import com.BV.LinearGradient.LinearGradientPackage;
import com.lewin.qrcode.QRScanReaderPackage;
import com.oblador.keychain.KeychainPackage;

import com.imagepicker.ImagePickerPackage;
import com.AlexanderZaytsev.RNI18n.RNI18nPackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.rnfs.RNFSPackage;

import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import org.reactnative.camera.RNCameraPackage;
import org.pgsqlite.SQLitePluginPackage;

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

import com.hexawallet.PdfPasswordPackage;

import java.util.Arrays;
import java.util.List;

import cl.json.ShareApplication;

public class MainApplication extends Application implements ShareApplication, ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(new MainReactPackage(),  
      // new RNBackgroundFetchPackage(),
          new PdfPasswordPackage(), new RandomBytesPackage(), new UdpSocketsModule(), new RNDeviceInfo(),
          new TcpSocketsModule(), new SvgPackage(), new RNSpinkitPackage(), new VectorIconsPackage(),
          SendSMSPackage.getInstance(), new RNSharePackage(), new PDFLibPackage(), new RNOSModule(), new RNMail(),
          new LinearGradientPackage(), new QRScanReaderPackage(), new KeychainPackage(), new ImagePickerPackage(),
          new RNI18nPackage(), new RNGestureHandlerPackage(), new RNFSPackage(), new ReactNativeContacts(),
          new ReactNativeConfigPackage(), new RNCameraPackage(), new SQLitePluginPackage());
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
  public String getFileProviderAuthority() {
    return BuildConfig.APPLICATION_ID + ".provider";
  }

  @Override
  public void onCreate() {
    super.onCreate();
    Fabric.with(this, new Crashlytics());
    SoLoader.init(this, /* native exopackage */ false);
  }
}
