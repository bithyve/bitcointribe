# ===========> for Generating Signed APK <===============

### android/app

sudo keytool -genkey -v -keystore mymoney.keystore -alias mymoney -keyalg RSA -keysize 2048 -validity 10000

### android/gradle.properties

MYAPP_RELEASE_STORE_FILE=mymoney.keystore
MYAPP_RELEASE_KEY_ALIAS=mymoney
MYAPP_RELEASE_STORE_PASSWORD=developer
MYAPP_RELEASE_KEY_PASSWORD=develoepr

### android/app/build.gradle

...
android {
...
defaultConfig { ... }

  signingConfigs {
release {
storeFile file("mymoney.keystore")  
 storePassword "developer"
keyAlias "mymoney"  
 keyPassword "developer"  
 }     
 }

===========> OR <<===============

signingConfigs {
release {
if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
storeFile file(MYAPP_RELEASE_STORE_FILE)
storePassword MYAPP_RELEASE_STORE_PASSWORD
keyAlias MYAPP_RELEASE_KEY_ALIAS
keyPassword MYAPP_RELEASE_KEY_PASSWORD
}
}
}
buildTypes {
release {
aaptOptions.cruncherEnabled=false // here
minifyEnabled enableProguardInReleaseBuilds
proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
signingConfig signingConfigs.release
}
}
}
...

###

==> mkdir -p android/app/src/main/assets
===> react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/

Custom node_modules/react-native/react.gradle to solve the Duplicate file error perfectly. Add following code into currentBundleTask's creation block (after doFirst block)

         doLast {
    def moveFunc = { resSuffix ->
        File originalDir = file("${resourcesDir}/drawable-${resSuffix}")
        if (originalDir.exists()) {
            File destDir = file("${resourcesDir}/drawable-${resSuffix}-v4")
            ant.move(file: originalDir, tofile: destDir)
        }
    }
    moveFunc.curry("ldpi").call()
    moveFunc.curry("mdpi").call()
    moveFunc.curry("hdpi").call()
    moveFunc.curry("xhdpi").call()
    moveFunc.curry("xxhdpi").call()
    moveFunc.curry("xxxhdpi").call()
}  
  
cd android && ./gradlew clean
cd android
./gradlew assembleRelease

#============>For sqlite <===================
1)settings.gradle (04/12/2018)
include ':react-native-sqlite-storage'
project(':react-native-sqlite-storage').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sqlite-storage/src/android')
  
2)android/app/build.gradle (04/12/2018)

dependencies {
compile project(':react-native-sqlite-storage')  
}

3)android/app/src/main/java/mymoney/MainApplicaiton.java
import org.pgsqlite.SQLitePluginPackage;
new SQLitePluginPackage(),

#==============> for BASE_MAP.Fill not a funcation <===============
1)package.json<br>
dependencies {

- "jsc-android": "236355.x.x",<br>

  2)android/build.gradle<br>
  allprojects {
  repositories {
  mavenLocal()
  jcenter()
  maven {
  // All of React Native (JS, Obj-C sources, Android binaries) is installed from npm
  url "\$rootDir/../node_modules/react-native/android"
  }

-       maven {
-           // Local Maven repo containing AARs with JSC library built for Android
-           url "$rootDir/../node_modules/jsc-android/dist"
-       }
      }

  }<br>

  3)android/app/build.gradle
  }

+configurations.all {

- resolutionStrategy {
-        force 'org.webkit:android-jsc:r236355'
- }
  +}

dependencies {
compile fileTree(dir: "libs", include: ["*.jar"])<br>

4)app/build.gradle, under android:<br>  
packagingOptions {
pickFirst '\*\*/libgnustl_shared.so'
}

#===============> Swipe on drawer does not work in Android <==================

### MainActivity.java in

import com.facebook.react.ReactActivity;

- import com.facebook.react.ReactActivityDelegate;
- import com.facebook.react.ReactRootView;
- import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {

@Override
protected String getMainComponentName() {
return "Example";
}

- @Override
- protected ReactActivityDelegate createReactActivityDelegate() {
- return new ReactActivityDelegate(this, getMainComponentName()) {
-      @Override
-      protected ReactRootView createRootView() {
-       return new RNGestureHandlerEnabledRootView(MainActivity.this);
-      }
- };
- }
  }
