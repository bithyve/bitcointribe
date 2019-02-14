//yarn install then 
rn-nodeify --install --hack

//  
//Plugins Add then files change 
1.react-native-share:- https://github.com/react-native-community/react-native-share
2.react-native-sqlite-storage:- https://github.com/andpor/react-native-sqlite-storage
3.react-native-splash-screen:- https://github.com/crazycodeboy/react-native-splash-screen
    

//Android  
============>For  sqlite  <===================
1)settings.gradle (04/12/2018)  
include ':react-native-sqlite-storage'
project(':react-native-sqlite-storage').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-sqlite-storage/src/android')
include ':app'    
  
2)android/app/build.gradle (04/12/2018)
dependencies {
   compile project(':react-native-sqlite-storage')   
}

3)android/app/src/main/java/mymoney/MainApplicaiton.java
import org.pgsqlite.SQLitePluginPackage;
 new SQLitePluginPackage(), 



## Bundle id (ios and android)
1.ios:com.bithyve.mymoney.staging
2.android:com.bithyve.mymoney.staging 


## Sqlite Database file check (ios and android)
1.ios(using objective-c):
NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
NSString *documentsDirectory = [paths objectAtIndex:0];
NSLog(@"path is %@",documentsDirectory);
  

##   Android sdk path set (local.properties) 
sdk.dir = /Users/developer/Library/Android/sdk