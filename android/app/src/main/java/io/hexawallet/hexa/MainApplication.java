package io.hexawallet.hexa;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.gantix.JailMonkey.JailMonkeyPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.chirag.RNMail.*;
import com.christopherdro.RNPrint.RNPrintPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.tradle.react.UdpSocketsModule;
import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.horcrux.svg.SvgPackage;
import com.christopherdro.htmltopdf.RNHTMLtoPDFPackage;
import com.kishanjvaghela.cardview.RNCardViewPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.bitgo.randombytes.RandomBytesPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import io.hexawallet.hexa.generated.BasePackageList;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.swmansion.reanimated.ReanimatedPackage;
import com.swmansion.rnscreens.RNScreensPackage;

import org.unimodules.adapters.react.ReactAdapterPackage;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.Package;
import org.unimodules.core.interfaces.SingletonModule;
import expo.modules.constants.ConstantsPackage;
import expo.modules.permissions.PermissionsPackage;
import expo.modules.filesystem.FileSystemPackage;

import java.util.Arrays;
import java.util.List;
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;

import io.hexawallet.hexa.PdfPasswordPackage;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

public class MainApplication extends Application implements ShareApplication, ReactApplication {
  private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
      new BasePackageList().getPackageList(), Arrays.<SingletonModule>asList());

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
      return Arrays.<ReactPackage>asList(new MainReactPackage(),
            new JailMonkeyPackage(), new ReactNativeContacts(), new RNMail(),
            new RNFirebasePackage(), new RNFirebaseMessagingPackage(),
          new RNFirebaseNotificationsPackage(), new ReactNativeContacts(), new RNMail(),
          new RNPrintPackage(), new RNSharePackage(), new RNCameraPackage(), new VectorIconsPackage(),
          new UdpSocketsModule(), new TcpSocketsModule(), new RNOSModule(), new NetInfoPackage(), new SvgPackage(),
          new RNHTMLtoPDFPackage(), new RNCardViewPackage(), new ReactVideoPackage(), new RNDeviceInfo(),
          new RandomBytesPackage(), new ReanimatedPackage(), new RNGestureHandlerPackage(), new RNScreensPackage(),
          new PdfPasswordPackage(), new ModuleRegistryAdapter(mModuleRegistryProvider));
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
