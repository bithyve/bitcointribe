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

=============> For Indicotro index file <===================

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  DeviceEventEmitter,
  ActivityIndicator
} from 'react-native';

import PropTypes from 'prop-types';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1
  },

  progressBar: {
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10
  },

  nocontainer: {
    position: 'absolute',    
    top: 0,    
    left: 0,        
    width: 0.001,
    height: 0.001
  },

  overlay: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    padding: 10
  },

  text: {
    marginTop: 8
  }
});

class BusyIndicator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isVisible: props.startVisible
    };
  }

  componentDidMount () {
    this.emitter = DeviceEventEmitter.addListener('changeLoadingEffect', this.changeLoadingEffect.bind(this));
  }

  componentWillUnmount() {
    this.emitter.remove();
  }

  changeLoadingEffect(state) {
    this.setState({
      isVisible: state.isVisible,
      text: state.title ? state.title : this.props.text
    });
  }

  render() {
    if (!this.state.isVisible) {
      return (<View style={styles.nocontainer} />);
    }

    const customStyles = StyleSheet.create({
      overlay: {
        backgroundColor: this.props.overlayColor,
        width: this.props.overlayWidth,
        height: this.props.overlayHeight
      },
      
      text: {
        color: this.props.textColor,
        fontSize: this.props.textFontSize
      }
    });

    return (
      <View style={styles.container}>
        <View style={[styles.overlay, customStyles.overlay]}>
          <ActivityIndicator
            color={this.props.color}
            size={this.props.size}
            style={styles.progressBar} />

          <Text
            numberOfLines={this.props.textNumberOfLines}
            style={[styles.text, customStyles.text]}>
            {this.state.text}
          </Text>
        </View>
      </View>
    );
  }
}

BusyIndicator.propTypes = {
  color: PropTypes.string,
  overlayColor: PropTypes.string,
  overlayHeight: PropTypes.number,
  overlayWidth: PropTypes.number,
  size: PropTypes.oneOf(['small', 'large']),
  startVisible: PropTypes.bool,
  text: PropTypes.string,
  textColor: PropTypes.string,
  textFontSize: PropTypes.number,
  textNumberOfLines: PropTypes.number
};

BusyIndicator.defaultProps = {
  isDismissible: false,
  overlayWidth: 120,
  overlayHeight: 100,
  overlayColor: '#333333',
  color: '#f5f5f5',
  size: 'small',
  startVisible: false,
  text: 'Please wait...',
  textColor: '#f5f5f5',
  textFontSize: 14,
  textNumberOfLines: 1
};

module.exports = BusyIndicator;

## Bundle id (ios and android)
1.ios:com.bithyve.mymoney.staging
2.android:com.bithyve.mymoney.staging 


## Sqlite Database file check (ios and android)
1.ios(using objective-c):
NSArray *paths = NSSearchPathForDirectoriesInDomains(NSDocumentDirectory, NSUserDomainMask, YES);
NSString *documentsDirectory = [paths objectAtIndex:0];
NSLog(@"path is %@",documentsDirectory);
  