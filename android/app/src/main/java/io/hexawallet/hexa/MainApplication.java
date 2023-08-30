package io.hexawallet.hexa;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.th3rdwave.safeareacontext.SafeAreaContextPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.rpt.reactnativecheckpackageinstallation.CheckPackageInstallationPackage;
import com.reactcommunity.rnlocalize.RNLocalizePackage;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.gantix.JailMonkey.JailMonkeyPackage;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.chirag.RNMail.*;
import com.christopherdro.RNPrint.RNPrintPackage;
import cl.json.RNSharePackage;
import cl.json.ShareApplication;
import org.reactnative.camera.RNCameraPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.tradle.react.UdpSocketsModule;
//import com.peel.react.TcpSocketsModule;
import com.peel.react.rnos.RNOSModule;
import com.reactnativecommunity.netinfo.NetInfoPackage;
import com.horcrux.svg.SvgPackage;
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

// unimodule changes
import io.hexawallet.hexa.generated.BasePackageList;
import java.util.Arrays;
import org.unimodules.adapters.react.ModuleRegistryAdapter;
import org.unimodules.adapters.react.ReactModuleRegistryProvider;
import org.unimodules.core.interfaces.SingletonModule;

import java.util.List;

import io.hexawallet.hexa.PdfPasswordPackage;
import io.hexawallet.hexa.GoogleDrivePackage; 

import android.content.Context;
import com.facebook.react.PackageList;
import com.facebook.react.ReactInstanceManager;
import java.lang.reflect.InvocationTargetException;




public class MainApplication extends Application implements ShareApplication, ReactApplication {
//    private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(
//            new BasePackageList().getPackageList(), Arrays.<SingletonModule>asList());

    private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

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
            // Packages that cannot be autolinked yet can be added manually here, for example:
            // packages.add(new MyReactNativePackage());

            packages.add(new PdfPasswordPackage());
            packages.add(new GoogleDrivePackage());
            packages.add(new PDFPackage());
            // Add unimodules
            List<ReactPackage> unimodules = Arrays.<ReactPackage>asList(
                    new ModuleRegistryAdapter(mModuleRegistryProvider)
            );
            packages.addAll(unimodules);
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
        SoLoader.init(this, /* native exopackage */ false);
        initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    }

    /**
    * Loads Flipper in React Native templates. Call this in the onCreate method with something like
    * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
    *
    * @param context
    * @param reactInstanceManager
    */
    private static void initializeFlipper(
        Context context, ReactInstanceManager reactInstanceManager) {
        if (BuildConfig.DEBUG) {
        try {
            /*
            We use reflection here to pick up the class that initializes Flipper,
            since Flipper library is not available in release mode
            */
            Class<?> aClass = Class.forName("io.hexawallet.hexa.ReactNativeFlipper");
            aClass
                .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
                .invoke(null, context, reactInstanceManager);
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        } catch (NoSuchMethodException e) {
            e.printStackTrace();
        } catch (IllegalAccessException e) {
            e.printStackTrace();
        } catch (InvocationTargetException e) {
            e.printStackTrace();
        }
        }
    }
}
