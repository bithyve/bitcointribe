package io.hexawallet.hexa;

import android.app.Application;

import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import io.hexawallet.hexa.generated.BasePackageList;

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

public class MainApplication extends Application implements ReactApplication {

    private final ReactModuleRegistryProvider mModuleRegistryProvider = new ReactModuleRegistryProvider(new BasePackageList().getPackageList(), null);

    // @Override
    // public String getFileProviderAuthority() {
    //     return BuildConfig.APPLICATION_ID + ".provider";
    // }

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
