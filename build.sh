#!/bin/bash
BUILDER_IMAGE="reactnativecommunity/react-native-android:5.4"
CONTAINER_NAME="hexa_builder_container"
HEXA_PATH="/hexa"

docker run --rm --name $CONTAINER_NAME -v `pwd`:$HEXA_PATH $BUILDER_IMAGE bash -c \
     'echo -e "\n************************************\n*** Building Hexa (yarn install)...\n************************************\n" && \
      cd /hexa ; npm install -g rn-nodeify ; yarn install && \
      echo -e "\n\n********************************************\n*** Building Hexa (yarn android-release)...\n********************************************\n" && \
      sdkmanager --install "ndk;21.0.6113669" && \
      yarn android-release && \
      echo -e "\n\n******************************\n**** APK and SHA256 checksum\n******************************\n" && \
      for f in android/app/build/outputs/apk/production/release/*.apk;
      do
	      RENAMED_FILENAME=$(echo $f | sed -e "s/app-/hexa-/" | sed -e "s/-release-unsigned//")
	      mv $f $RENAMED_FILENAME
	      sha256sum $RENAMED_FILENAME
      done && \
      echo -e "" ';

