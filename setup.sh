rn-nodeify --install buffer,events,process,stream,inherits,path,assert,crypto --hack --yarn
cd ios && RCT_NEW_ARCH_ENABLED=0 pod install
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" > local.properties
