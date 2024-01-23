/* eslint-disable react/jsx-key */
import { inject, observer } from 'mobx-react'
import React from 'react'
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native'
import { CheckBox, Input } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import LinearGradient from 'react-native-linear-gradient'
import { RFValue } from 'react-native-responsive-fontsize'
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { connect } from 'react-redux'
import { AccountType } from '../../bitcoin/utilities/Interface'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import FormStyles from '../../common/Styles/FormStyles'
import CommonStyles from '../../common/Styles/Styles'
import { translations } from '../../common/content/LocContext'
import HeaderTitle from '../../components/HeaderTitle'
import Toast from '../../components/Toast'
import SettingsStore from '../../mobxstore/SettingsStore'
import { goHomeAction } from '../../navigation/actions/NavigationActions'
import { addNewAccountShells } from '../../store/actions/accounts'
import { newAccountsInfo } from '../../store/sagas/accounts'
import { DEFAULT_LNDHUB } from '../../utils/ln/AddressUtils'
import RESTUtils from '../../utils/ln/RESTUtils'

const styles = StyleSheet.create( {
  viewContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },
  selectedContactsView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.lightBlue,
    borderRadius: wp( 2 ),
    height: hp( 3.6 ),
    paddingHorizontal: wp( 2 ),
    marginTop: wp( 2.7 ),
    alignSelf: 'flex-start'
  },
  contactText: {
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Regular,
    color: Colors.white,
  },
  textSubtitle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 12 ),
    color: Colors.textColorGrey,
  },
  row: {
    flexDirection: 'row',
    marginBottom: wp( '2%' ),
    marginTop: wp( '8%' ),
  },
  containerItem: {
    marginHorizontal: wp( '5%' ),
  },
  btn:{
    flexDirection: 'row',
    height: wp( '13%' ),
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    marginBottom: 20
  },
  textTitle: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 15 ),
    color: Colors.blue,
  },
  textCurrency: {
    fontFamily: Fonts.Medium,
    fontSize: RFValue( 15 ),
    color: Colors.textColorGrey,
  },
  icArrow: {
    marginLeft: wp( '3%' ),
    marginRight: wp( '3%' ),
    alignSelf: 'center',
  },
  textValue: {
    fontFamily: Fonts.Regular,
    fontSize: RFValue( 15 ),
    color: Colors.textColorGrey,
    marginLeft: wp( '3%' ),
  },
  Input: {
    marginVertical: 2,
    backgroundColor: 'white',
    height: wp( '13%' ),
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium,
  },
  buttonView: {
    height: wp( '12%' ),
    width: wp( '40%' ),
    paddingHorizontal: wp( 2 ),
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: Colors.blue,
    marginHorizontal: wp( 4 ),
    marginVertical: hp( '2%' ),
  },
  imageView: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOpacity: 0.1,
    shadowOffset: {
      width: 1, height: 1
    },
  },
} )

interface EnterNodeConfigProps {
  navigation: any;
  SettingsStore: SettingsStore;
  addNewAccountShells: any
}

const nodeTypes = [
  {
    name: 'LND',
    value: 'lnd'
  },
  {
    name: 'c-lightning-REST',
    value: 'c-lightning-REST'
  },
  {
    name: 'Spark (c-lightning)',
    value: 'spark'
  },
  {
    name: 'LNDHub',
    value: 'lndhub'
  },
  {
    name: 'Eclair',
    value: 'eclair'
  }
]

interface EnterNodeConfigState {
  host: string; // lnd
  port: string | number; // lnd
  macaroonHex: string; // lnd
  url: string; // spark, eclair
  accessKey: string; // spark
  lndhubUrl: string; // lndhub
  username: string | undefined; // lndhub
  password: string | undefined; // lndhub, eclair
  existingAccount: boolean; // lndhub
  implementation: string;
  certVerification: boolean;
  saved: boolean;
  active: boolean;
  index: number;
  newEntry: boolean;
  suggestImport: string;
  showLndHubModal: boolean;
  showCertModal: boolean;
  enableTor: boolean;
  showNodeTypePicker: boolean;
}


const Menu = ( { label, value, onPress, arrow } ) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.btn}
      disabled
    >
      <View
        style={{
          height: wp( '13%' ),
          width: wp( '15%' ),
          backgroundColor: Colors.borderColor,
          borderTopLeftRadius: 10,
          borderBottomLeftRadius: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={styles.textCurrency}
        >
          {label}
        </Text>
      </View>
      <View
        style={{
          flex: 1, justifyContent: 'center', height: wp( '13%' ),
          backgroundColor: 'white'
        }}
      >
        <Text
          style={styles.textValue}
        >
          {value}
        </Text>
      </View>
      <View
        style={{
          marginLeft: 'auto',
          height: wp( '13%' ),
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={arrow ? 'chevron-up' : 'chevron-down'}
          color={Colors.textColorGrey}
          size={18}
          style={styles.icArrow}
        />
      </View>
    </TouchableOpacity>
  )
}

@inject( 'SettingsStore' )
@observer
class EnterNodeConfigScreen extends React.Component<
EnterNodeConfigProps,
EnterNodeConfigState
> {


  state = {
    host: '',
    port: '',
    macaroonHex: '',
    saved: false,
    index: 0,
    active: false,
    newEntry: false,
    implementation: 'lnd',
    certVerification: false,
    enableTor: false,
    existingAccount: false,
    suggestImport: '',
    url: '',
    lndhubUrl: DEFAULT_LNDHUB,
    showLndHubModal: false,
    showCertModal: false,
    username: '',
    password: '',
    accessKey: '',
    showNodeTypePicker: false
  };

  async componentDidMount() {
    this.initFromProps( this.props )
  }

  UNSAFE_componentWillReceiveProps( nextProps: any ) {
    this.initFromProps( nextProps )
  }

  initFromProps( props: any ) {
    const { navigation } = props

    const node = props.route.params.node ? props.route.params.node : null
    const index = props.route.params.index ? props.route.params.index : null
    const active = props.route.params.active ? props.route.params.active:null
    const saved = props.route.params.saved? props.route.params.saved:null
    const newEntry = props.route.params.newEntry ? props.route.params.newEntry :null

    if ( node ) {
      const {
        host,
        port,
        macaroonHex,
        url,
        lndhubUrl,
        existingAccount,
        accessKey,
        username,
        password,
        implementation,
        certVerification,
        enableTor
      } = node

      this.setState( {
        host,
        port,
        macaroonHex,
        url,
        lndhubUrl,
        existingAccount,
        accessKey,
        username,
        password,
        implementation: implementation || 'lnd',
        certVerification,
        index,
        active,
        saved,
        newEntry,
        enableTor
      } )
    } else {
      this.setState( {
        index,
        active,
        newEntry
      } )
    }
  }

  saveNodeConfiguration = () => {
    const { SettingsStore, navigation } = this.props
    const {
      host,
      port,
      url,
      enableTor,
      lndhubUrl,
      existingAccount,
      macaroonHex,
      accessKey,
      username,
      password,
      implementation,
      certVerification,
      index
    } = this.state
    const { setSettings, settings } = SettingsStore
    const { lurkerMode, passphrase, fiat, locale } = settings

    /*if (
      implementation === 'lndhub' &&
        ( !lndhubUrl || !username || !password )
    ) {
      throw new Error( 'lndhub settings missing.' )
    }*/

    const node = {
      host,
      port,
      url,
      lndhubUrl,
      existingAccount,
      macaroonHex,
      accessKey,
      username,
      password,
      implementation,
      certVerification,
      enableTor
    }

    let nodes: any
    if ( settings.nodes ) {
      nodes = settings.nodes
      nodes[ index ] = node
    } else {
      nodes = [ node ]
    }
    RESTUtils.checkNodeInfo( node )
      .then( res => {
        console.log( res )
        setSettings(
          JSON.stringify( {
            nodes,
            selectedNode: settings.selectedNode,
            onChainAddress: settings.onChainAddress,
            fiat,
            locale,
            lurkerMode,
            passphrase
          } )
        ).then( () => {
          const accountsInfo: newAccountsInfo = {
            accountType: AccountType.LIGHTNING_ACCOUNT,
            accountDetails: {
              name: 'Lightning Account',
              description: `Connected to ${implementation} node`,
              node,
            }
          }
          this.props.addNewAccountShells( [ accountsInfo ] )
          this.setState( {
            saved: true
          } )
          navigation.dispatch( goHomeAction() )
          Toast( 'Lightning account created' )
        } )
      } )
      .catch( e=> {
        Toast( 'Failed to connect to the node' )
      } )

  };

deleteNodeConfig = () => {
  const { SettingsStore, navigation } = this.props
  const { setSettings, settings } = SettingsStore
  const { index } = this.state
  const { nodes, lurkerMode, passphrase, fiat, locale } = settings

  const newNodes: any = []
  for ( let i = 0; nodes && i < nodes.length; i++ ) {
    if ( index !== i ) {
      newNodes.push( nodes[ i ] )
    }
  }

  setSettings(
    JSON.stringify( {
      nodes: newNodes,
      theme: settings.theme,
      selectedNode:
                index === settings.selectedNode ? 0 : settings.selectedNode,
      onChainAddress: settings.onChainAddress,
      fiat,
      locale,
      lurkerMode,
      passphrase
    } )
  ).then( () => {
    navigation.navigate( 'Wallet', {
      refresh: true
    } )
  } )
};

setNodeConfigurationAsActive = () => {
  const { SettingsStore, navigation } = this.props
  const { setSettings, settings } = SettingsStore
  const { index } = this.state
  const { nodes, lurkerMode, passphrase, fiat, locale } = settings

  setSettings(
    JSON.stringify( {
      nodes,
      theme: settings.theme,
      selectedNode: index,
      onChainAddress: settings.onChainAddress,
      fiat,
      locale,
      lurkerMode,
      passphrase
    } )
  )

  this.setState( {
    active: true
  } )

  navigation.navigate( 'Wallet', {
    refresh: true
  } )
};


render() {
  const common = translations[ 'common' ]
  const strings = translations[ 'lightningAccount' ]
  const { navigation, SettingsStore } = this.props
  const {
    host,
    port,
    url,
    lndhubUrl,
    macaroonHex,
    accessKey,
    username,
    password,
    saved,
    active,
    index,
    newEntry,
    implementation,
    certVerification,
    enableTor,
    existingAccount,
    suggestImport,
    showLndHubModal,
    showCertModal
  } = this.state
  const {
    loading,
    createAccountError,
    createAccountSuccess,
    settings,
    createAccount
  } = SettingsStore

  function localeString ( msg: string ) {
    return msg
  }

  const NodeInterface = () => (

    <View style={{
      marginHorizontal: 10
    }}>
      <Menu
        onPress={()=> {
          this.setState( prevState =>{
            return{
              ...prevState,
              showNodeTypePicker : !prevState.showNodeTypePicker
            }
          } )

        }}
        arrow={this.state.showNodeTypePicker}
        label={'Type'}
        value={nodeTypes.find( node => node.value === implementation ).name}
      />
      <View style={{
        position: 'relative', marginBottom: 20
      }}>
        {this.state.showNodeTypePicker && (
          <View
            style={{
              marginTop: wp( '1%' ),
              borderRadius: 10,
              borderWidth: 1,
              borderColor: Colors.borderColor,
              overflow: 'hidden',
            }}
          >
            <ScrollView>
              {nodeTypes.map( ( item, index ) => {
                return (
                  <TouchableOpacity
                    key={`${JSON.stringify( item )}_${index}`}
                    disabled
                    onPress={() => {
                      this.setState( {
                        showNodeTypePicker: false
                      } )
                      if ( item.value === 'lndhub' ) {
                        this.setState( {
                          implementation: item.value,
                          saved: false,
                          certVerification: true
                        } )
                      } else {
                        this.setState( {
                          implementation: item.value,
                          saved: false,
                          certVerification: false
                        } )
                      }
                    }}
                    style={{
                      flexDirection: 'row', height: wp( '13%' )
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        justifyContent: 'center',
                        height: wp( '13%' ),
                        borderBottomWidth: 1,
                        borderBottomColor: Colors.borderColor,
                        backgroundColor: Colors.white,

                      }}
                    >
                      <Text
                        style={{
                          fontFamily: Fonts.Regular,
                          fontSize: RFValue( 13 ),
                          color: Colors.textColorGrey,
                          marginLeft: wp( '3%' ),
                        }}
                      >
                        {item.name}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )
              } )}
            </ScrollView>
          </View>
        )}
      </View>
    </View>

  )


  return (
    <SafeAreaView style={styles.viewContainer}>
      <StatusBar backgroundColor={Colors.backgroundColor} barStyle="dark-content" />
      <View style={[ CommonStyles.headerContainer, {
        backgroundColor: Colors.backgroundColor,
        marginRight: wp( 4 )
      } ]}>
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            this.props.navigation.goBack()
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome
              name="long-arrow-left"
              color={Colors.homepageButtonColor}
              size={17}
            />
          </View>
        </TouchableOpacity>
        <View style={{
          flex: 1
        }}/>
        {/* <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {}}
          style={{
            ...styles.selectedContactsView,
          }}
        >
          <Text style={styles.contactText}>{common[ 'knowMore' ]}</Text>
        </TouchableOpacity> */}
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          padding: 10,
          backgroundColor: Colors.backgroundColor
        }}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        bounces={false}
        keyboardShouldPersistTaps='handled'>

        <HeaderTitle
          firstLineTitle={strings.Connectyournode}
          secondLineTitle={strings.Enternode}
          infoTextNormal={''}
          infoTextBold={''}
          infoTextNormal1={''}
          step={''}
        />

        <View style={{
          marginTop: 20
        }}>
          {!!createAccountError &&
                        implementation === 'lndhub' &&
                        !loading && (
            <Text style={{
              color: 'red', marginBottom: 5
            }}>
              {createAccountError}
            </Text>
          )}

          {!!createAccountSuccess &&
                        implementation === 'lndhub' &&
                        !loading && (
            <Text style={{
              color: 'green', marginBottom: 5
            }}>
              {createAccountSuccess}
            </Text>
          )}

          <NodeInterface />

          {( implementation === 'spark' ||
                        implementation == 'eclair' ) && (
            <>
              <Text style={{
                color: 'black'
              }}>
                {localeString(
                  'views.Settings.AddEditNode.host'
                )}
              </Text>
              <Input
                placeholder={'http://192.168.1.2:9737'}
                value={url}

                onChangeText={( text: string ) =>
                  this.setState( {
                    url: text.trim(),
                    saved: false
                  } )
                }
                numberOfLines={1}
                style={{
                  ...styles.Input,
                  color: 'black'
                }}
                editable={!loading}
                placeholderTextColor="gray"
              />

              {implementation === 'spark' && (
                <>
                  <Text style={{
                    color: 'black'
                  }}>
                    {localeString(
                      'views.Settings.AddEditNode.accessKey'
                    )}
                  </Text>
                  <Input
                    placeholder={'...'}
                    value={accessKey}
                    onChangeText={( text: string ) => {
                      this.setState( {
                        accessKey: text.trim(),
                        saved: false
                      } )
                    }}
                    numberOfLines={1}
                    style={{
                      ...styles.Input,
                      color: 'black'
                    }}
                    editable={!loading}
                    placeholderTextColor="gray"
                  />
                </>
              )}
              {implementation === 'eclair' && (
                <>
                  <Text style={{
                    color: 'black'
                  }}>
                    {localeString(
                      'views.Settings.AddEditNode.password'
                    )}
                  </Text>
                  <Input
                    placeholder={'...'}
                    value={password}
                    onChangeText={( text: string ) => {
                      this.setState( {
                        password: text.trim(),
                        saved: false
                      } )
                    }}
                    numberOfLines={1}
                    style={{
                      ...styles.Input,
                      color: 'black'
                    }}
                    editable={!loading}
                    placeholderTextColor="gray"
                  />
                </>
              )}
            </>
          )}
          {implementation === 'lndhub' && (
            <>
              <Text style={{
                color: 'black'
              }}>
                {localeString(
                  'views.Settings.AddEditNode.host'
                )}
              </Text>
              <Input
                placeholder={DEFAULT_LNDHUB}
                value={lndhubUrl}
                onChangeText={( text: string ) =>
                  this.setState( {
                    lndhubUrl: text.trim(),
                    saved: false
                  } )
                }
                inputContainerStyle={[ FormStyles.textInputContainer ]}
                inputStyle={FormStyles.inputText}
                placeholderTextColor={FormStyles.placeholderText.color}
                numberOfLines={1}
                style={{
                  ...styles.Input,
                  color: 'black'
                }}
                editable={!loading}
                placeholderTextColor="gray"
              />

              <View
                style={{
                  marginTop: 5
                }}
              >
                <CheckBox
                  title={localeString(
                    'views.Settings.AddEditNode.existingAccount'
                  )}
                  checked={existingAccount}
                  onPress={() =>
                    this.setState( {
                      existingAccount: !existingAccount
                    } )
                  }
                />
              </View>

              {existingAccount && (
                <>
                  <Text style={{
                    color: 'black'
                  }}>
                    {localeString(
                      'views.Settings.AddEditNode.username'
                    )}
                  </Text>
                  <Input
                    placeholder={'...'}
                    value={username}
                    onChangeText={( text: string ) =>
                      this.setState( {
                        username: text.trim(),
                        saved: false
                      } )
                    }
                    numberOfLines={1}
                    style={{
                      ...styles.Input,
                      color: 'black'
                    }}
                    editable={!loading}
                    placeholderTextColor="gray"
                  />

                  <Text style={{
                    color: 'black'
                  }}>
                    {localeString(
                      'views.Settings.AddEditNode.password'
                    )}
                  </Text>
                  <Input
                    placeholder={'...'}
                    value={password}
                    onChangeText={( text: string ) =>
                      this.setState( {
                        password: text.trim(),
                        saved: false
                      } )
                    }
                    numberOfLines={1}
                    style={{
                      ...styles.Input,
                      color: 'black'
                    }}
                    editable={!loading}
                    secureTextEntry={saved}
                    placeholderTextColor="gray"
                  />
                  {/* {saved && (
                    <CollapsedQR
                      showText={localeString(
                        'views.Settings.AddEditNode.showAccountQR'
                      )}
                      collapseText={localeString(
                        'views.Settings.AddEditNode.hideAccountQR'
                      )}
                      value={
                        `lndhub://${username}:${password}` +
                                                ( lndhubUrl === DEFAULT_LNDHUB
                                                  ? ''
                                                  : `@${lndhubUrl}` )
                      }
                      hideText
                    />
                  )} */}
                </>
              )}
            </>
          )}
          {( implementation === 'lnd' ||
                        implementation === 'c-lightning-REST' ) && (
            <>
              <Input
                placeholder={'Enter host'}
                value={host}
                onChangeText={( text: string ) =>
                  this.setState( {
                    host: text.trim(),
                    saved: false
                  } )
                }
                inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
                inputStyle={FormStyles.inputText}
                placeholderTextColor={FormStyles.placeholderText.color}
                numberOfLines={1}
                editable={!loading}
              />


              <Input
                keyboardType="numeric"
                placeholder={'Port'}
                value={port}
                onChangeText={( text: string ) =>
                  this.setState( {
                    port: text.trim(),
                    saved: false
                  } )
                }
                inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
                inputStyle={FormStyles.inputText}
                placeholderTextColor={FormStyles.placeholderText.color}
                numberOfLines={1}
                editable={!loading}
              />
              <Input
                placeholder={'Macaroon Hex'}
                value={macaroonHex}
                onChangeText={( text: string ) =>
                  this.setState( {
                    macaroonHex: text.trim(),
                    saved: false
                  } )
                }
                numberOfLines={1}
                inputContainerStyle={[ FormStyles.textInputContainer, styles.Input ]}
                inputStyle={FormStyles.inputText}
                placeholderTextColor={FormStyles.placeholderText.color}
                editable={!loading}
              />
            </>
          )}

          {/* <View style={{
            marginBottom: hp( 2 ),
            marginHorizontal: wp( 3 ),
            flexDirection: 'row'
          }}>
            <TouchableOpacity
              disabled
              onPress={() =>
                this.setState( {
                  enableTor: !enableTor,
                  saved: false
                } )}
              style={{
                flexDirection: 'row'
              }}
            >
              <View style={styles.imageView}>
                {enableTor &&
                  <CheckMark style={{
                    marginLeft: 6,
                    marginTop: 6
                  }}/>
                }
              </View>
              <Text style={{
                color: Colors.textColorGrey,
                fontSize: RFValue( 14 ),
                fontFamily: Fonts.Regular,
                marginHorizontal: wp( 3 )
              }}>
              Connect via Tor
              </Text>
            </TouchableOpacity>
          </View> */}
          {/* {!enableTor && (
            <View
              style={{
                marginTop: 5
              }}
            >
              <CheckBox
                title={localeString(
                  'views.Settings.AddEditNode.certificateVerification'
                )}
                checked={certVerification}
                onPress={() =>
                  this.setState( {
                    certVerification: !certVerification,
                    saved: false
                  } )
                }
              />
            </View>
          )} */}
        </View>

        <TouchableOpacity
          activeOpacity={0.6}
          onPress={() => {
            this.saveNodeConfiguration()
          }}
        >
          <LinearGradient
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            colors={[ Colors.skyBlue, Colors.darkBlue ]}
            style={styles.buttonView}
          >
            <Text style={styles.buttonText}>Connect</Text>
          </LinearGradient>
        </TouchableOpacity>

      </KeyboardAwareScrollView>

    </SafeAreaView>
  )
}
}

const mapDispatchToProps = ( dispatch ) => ( {
  addNewAccountShells: data => {
    dispatch( addNewAccountShells( data ) )
  },
} )

const mapStateToProps = ( state ) => {
  return {
    accounts: state.accounts || [],
  }
}

export default connect( mapStateToProps, mapDispatchToProps )( EnterNodeConfigScreen )
