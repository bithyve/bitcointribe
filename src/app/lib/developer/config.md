//

## Plugins Add then files change

```
1.react-native-share:- https://github.com/react-native-community/react-native-share
2.react-native-sqlite-storage:- https://github.com/andpor/react-native-sqlite-storage
3.react-native-splash-screen:- https://github.com/crazycodeboy/react-native-splash-screen
```

//Android  
============>For sqlite <===================

```
1)settings.gradle (04/12/2018)
include ':react-native-sqlite-storage'
project(':react-native-sqlite-storage').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sqlite-storage/src/android')
include ':app'

2)android/app/build.gradle (04/12/2018)
dependencies {
compile project(':react-native-sqlite-storage')
}

3)android/app/src/main/java/com/bithyve/hexa/MainApplicaiton.java
import org.pgsqlite.SQLitePluginPackage;
new SQLitePluginPackage(),
```

## Bundle id (ios and android)

1.ios:com.bithyve.hexa
2.android:com.bithyve.hexa

## Sqlite Database file check (ios and android)

1.ios(using objective-c):

```
NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
NSString *documentsDirectory = [paths objectAtIndex:0];
NSLog(@"path is %@",documentsDirectory);


##   Android sdk path set (local.properties)
sdk.dir = /Users/developer/Library/Android/sdk
```

## Fabric to Android

```
//build.gradle
buildscript {
  repositories {
    maven { url 'https://maven.fabric.io/public' }
  }
  dependencies {
    classpath 'io.fabric.tools:gradle:1.+'
  }
}

//app/build.gradel

apply plugin: 'io.fabric'
dependencies {
compile('com.crashlytics.sdk.android:crashlytics:2.9.9@aar') {
transitive = true;
}
}

//AndroidManifest.xml
<meta-data
    android:name="io.fabric.ApiKey"
    android:value="2d0b58f102661fcabd3be54e6516854e2b0983f6"
/>
    </application>

//MainApplication.java
import com.crashlytics.android.Crashlytics;
import io.fabric.sdk.android.Fabric;


protected void onCreate(Bundle savedInstanceState) {
      super.onCreate(savedInstanceState);
+      Fabric.with(this, new Crashlytics());
      setContentView(R.layout.activity_main);
    }

```

## add bundle change

react-native-rename "Hexa" -b "com.bithyve.hexa"
