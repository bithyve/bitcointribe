import React, { useMemo, useState, useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Switch } from 'react-native'
import ListStyles from '../../../common/Styles/ListStyles'
import FormStyles from '../../../common/Styles/FormStyles'
import { Button, Input } from 'react-native-elements'
import useActivePersonalNode from '../../../utils/hooks/state-selectors/nodeSettings/UseActivePersonalNode'
import ButtonBlue from '../../../components/ButtonBlue'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { RFValue } from 'react-native-responsive-fontsize'
import Colors from '../../../common/Colors'
import Entypo from 'react-native-vector-icons/Entypo'
import {
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen'
import Fonts from '../../../common/Fonts'
import { translations } from '../../../common/content/LocContext'
import ButtonStyles from '../../../common/Styles/ButtonStyles'
import PersonalNode from '../../../common/data/models/PersonalNode'
import LinearGradient from 'react-native-linear-gradient'

export type PersonalNodeFormData = {
  ipAddress: string;
  portNumber: number;
  useKeeperNode: boolean;
}

export type Props = {
  params: PersonalNode;
  onSubmit: ( formData: PersonalNode ) => void;
  onCloseClick: () => void;
};


const PersonalNodeConnectionForm: React.FC<Props> = ( { params, onSubmit, onCloseClick }: Props ) => {
  const activePersonalNode = useActivePersonalNode()
  const strings  = translations[ 'settings' ]
  const common  = translations[ 'common' ]

  const [ useKeeperNode, setuseKeeperNode ] = useState( params?.useKeeperNode )
  const [ useSSL, setUseSSL ] = useState( params?.useSSL )
  const [ host, setHost ] = useState( params?.host || '' )
  const [ port, setPort ] = useState( params?.port || '' )
  const [ isHostValid, setIsHostValid ] = useState( true )
  const [ isPortValid, setIsPortValid ] = useState( true )

  const ipAddressInputRef = useRef<Input>( null )

  const canProceed = useMemo( () => {
    return (
      host.length != 0 &&
      Boolean( Number( port ) )
    )
  }, [ host, port ] )

  function handleProceedButtonPress() {
    if ( host === null || host.length === 0 ) {
      setIsHostValid( false )
    }

    if ( port === null || port.length === 0 ) {
      setIsPortValid( false )
    }
    if ( host !== null && host.length !== 0 && port !== null && port.length !== 0 ) {
      const nodeDetails: PersonalNode = {
        id: params.id,
        host,
        port,
        useKeeperNode,
        isConnected: params.isConnected,
        useSSL,
      }
      onSubmit( nodeDetails )
    }
  }

  useEffect( () => {
    ipAddressInputRef.current?.focus()
  }, [] )

  function onToggle() {
    setUseSSL( !useSSL )
  }

  return (
    <View style={styles.rootContainer}>

      <View style={ListStyles.infoHeaderSection}>
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Text style={ListStyles.infoHeaderTitleText}>{strings.SetupPersonal}</Text>

          <TouchableOpacity onPress={onCloseClick}>
            <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
              start={{
                x: 0, y: 0
              }} end={{
                x: 1, y: 0
              }}
              locations={[ 0.2, 1 ]}
              style={ButtonStyles.miniNavButton}
            >
              <Text style={ButtonStyles.miniNavButtonText}>{'Close'}</Text>
            </LinearGradient>
          </TouchableOpacity>
          {/* <Button
            raised
            buttonStyle={ButtonStyles.miniNavButton}
            title="Close"
            titleStyle={ButtonStyles.miniNavButtonText}
            onPress={onCloseClick}
          /> */}
        </View>
      </View>

      <View style={styles.bodySection}>
        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Your Node Address ex: http://11.22.33.44'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={host}
          onChangeText={( text ) => {
            setIsHostValid( !( text === null || text.length === 0 ) )
            setHost( text )
          }}
          keyboardType="numbers-and-punctuation"
          numberOfLines={1}
          ref={ipAddressInputRef}
        />

        <Input
          inputContainerStyle={[
            FormStyles.textInputContainer,
            styles.textInputContainer,
          ]}
          inputStyle={FormStyles.inputText}
          placeholder={'Port Number ex: 8003'}
          placeholderTextColor={FormStyles.placeholderText.color}
          underlineColorAndroid={'transparent'}
          value={port}
          onChangeText={( text ) => {
            setIsPortValid( !( text === null || text.length === 0 ) )
            setPort( text )
          }}
          keyboardType="number-pad"
          numberOfLines={1}
        />
      </View>

      <View
        style={[ styles.useFallbackTouchable, {
          justifyContent:'space-between'
        } ]}
      >
        <Text style={styles.useFallbackText}>
          {'Use SSL for this node '}
        </Text>
        <Switch
          value={useSSL}
          onValueChange={onToggle}
          thumbColor={useSSL ? Colors.white : Colors.white}
          trackColor={{
            false: Colors.borderColor, true: Colors.THEAM_TEXT_COLOR
          }}
          onTintColor={Colors.blue}
        />
      </View>


      <View style={styles.footerSection}>
        <TouchableOpacity disabled={canProceed === false} onPress={handleProceedButtonPress}>
          <LinearGradient colors={[ Colors.blue, Colors.darkBlue ]}
            start={{
              x: 0, y: 0
            }} end={{
              x: 1, y: 0
            }}
            locations={[ 0.2, 1 ]}
            style={styles.proceedBtnWrapper}
          >
            <Text style={styles.proceedBtnText}>{common.proceed}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {

  },

  bodySection: {
    paddingHorizontal: 16,
    flex: 1,
  },

  textInputContainer: {
  },

  footerSection: {
    marginTop: 12,
    paddingHorizontal: 26,
    alignItems: 'flex-start',
  },
  useFallbackTouchable: {
    flexDirection: 'row',
    borderRadius: 8,
    backgroundColor: Colors.backgroundColor1,
    alignItems: 'center',
    paddingLeft: 35,
    paddingRight: 35,
    marginTop: 10,
    marginBottom: 10,
    height: wp( '13%' ),
  },
  useFallbackText: {
    color: Colors.textColorGrey,
    fontSize: RFValue( 12 ),
    fontFamily: Fonts.Regular,
  },
  useFallbackCheckView: {
    width: wp( '7%' ),
    height: wp( '7%' ),
    borderRadius: 7,
    backgroundColor: Colors.white,
    borderColor: Colors.borderColor,
    borderWidth: 1,
    marginLeft: 'auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  proceedBtnWrapper: {
    height: wp( '13%' ),
    width: wp( '35%' ),
    justifyContent: 'center',
    borderRadius: 8,
    alignItems: 'center',
  },
  proceedBtnText: {
    color: Colors.white,
    fontSize: RFValue( 13 ),
    fontFamily: Fonts.Medium
  }
} )

export default PersonalNodeConnectionForm
