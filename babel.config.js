module.exports = function( api ) {
  api.cache( true )
  return {
    presets: [ 'module:metro-react-native-babel-preset' ],
    'plugins': [
      [ '@babel/plugin-proposal-decorators', {
        'legacy': true
      } ]
    ]
  }
}
