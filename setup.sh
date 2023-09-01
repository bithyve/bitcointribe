rn-nodeify --install buffer,events,process,stream,util,inherits,fs,path,assert,crypto --hack --yarn
cd ios && pod install
cd ../android && touch local.properties && echo "sdk.dir = /Users/$(whoami)/Library/Android/sdk" > local.properties
