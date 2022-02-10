import React, { useState, useEffect } from 'react'
import { Image, View, Text, ScrollView, StyleSheet } from 'react-native'
import AccountShell from '../../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { ListItem } from 'react-native-elements'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import { RFValue } from 'react-native-responsive-fontsize'
import ModalContainer from '../../home/ModalContainerScroll'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Fonts from '../../../common/Fonts'

export type Props = {
  accountShell: AccountShell;
  isActive: boolean;
  onLongPress?: () => void;
  containerStyle?: Record<string, unknown>;
};

const ReorderAccountShellsDraggableListItem: React.FC<Props> = ( {
  accountShell,
  isActive,
  onLongPress = () => {},
  containerStyle = {
  },
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const [ numberOfTabs, setNumberOfTabs ] = useState( 0 )
  const [ modalVisible, setModalVisible ] = useState( false )

  useEffect( () => {
    if( numberOfTabs!=0 ){
      setTimeout( () => {
        setNumberOfTabs( 0 )
      }, 1000 )
    }
    if( numberOfTabs >= 3 ){
      setModalVisible( true )
    }
  }, [ numberOfTabs ] )

  const closeBottomSheet = () => {
    setModalVisible( false )
  }

  const KeyValueData = () => {
    return (
      <View style={styles.lineItem}>
        <Text style={ListStyles.listItemTitleTransaction}>
              Title
        </Text>
        <Text
          style={{
            ...ListStyles.listItemSubtitle,
            marginBottom: 3,
          }}
        >
              data
        </Text>
      </View>
    )
  }
  const RenderModal = () => {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.crossIconContainer}>
          <FontAwesome name="close" color={Colors.blue} size={24} onPress = {closeBottomSheet}/>
        </View>
        <ScrollView>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
          <KeyValueData/>
        </ScrollView>
      </View>
    )
  }
  return (
    <ListItem
      activeOpacity={1}
      onLongPress={onLongPress}
      onPress = {()=> setNumberOfTabs( prev => prev+1 )}
      containerStyle={{
        opacity: isActive ? 0.6 : 1,
        backgroundColor: Colors.backgroundColor,
        borderBottomWidth: isActive ? 10 : 0,
        borderTopWidth: isActive ? 10 : 0,
        borderRightWidth: isActive ? 0 : 0,
        borderColor: '#f8f8f8',
        width: isActive ? '105%' : '100%',
      }}
    >
      <View style={ImageStyles.thumbnailImageLarge} >
        {getAvatarForSubAccount( primarySubAccount, false, true )}
      </View>


      <ListItem.Content>
        <ListItem.Title
          style={[ ListStyles.listItemTitle, {
            fontSize: RFValue( 12 )
          } ]}
          numberOfLines={1}
        >
          {primarySubAccount.customDisplayName || primarySubAccount.defaultTitle}
        </ListItem.Title>

        <ListItem.Subtitle
          style={[ ListStyles.listItemSubtitle, {
            fontSize: RFValue( 10 ),
          } ]}
          numberOfLines={2}
        >
          {primarySubAccount.customDescription || primarySubAccount.defaultDescription}
        </ListItem.Subtitle>
      </ListItem.Content>

      <Image
        source={require( '../../../assets/images/icons/icon_rearrange_new.png' )}
        style={ImageStyles.reorderItemIconImage}
        resizeMode='contain'
      />
      <ModalContainer onBackground={closeBottomSheet} visible={modalVisible} closeBottomSheet = {closeBottomSheet}>
        <View style={styles.modalContainer}>
          <RenderModal/>
        </View>
      </ModalContainer>
    </ListItem>
  )
}

const styles = StyleSheet.create( {
  rootContainer: {
    flexGrow: 1,
    backgroundColor: Colors.backgroundColor,
  },
  textHeader: {
    fontSize: 24,
    color: Colors.blue,
    marginHorizontal: 20,
    marginVertical: 20,
    fontFamily: Fonts.FiraSansRegular,
  },

  bodySection: {
    marginTop: 24,
    paddingHorizontal: 10,
  },

  lineItem: {
    marginVertical: hp( 0.9 ),
    backgroundColor:Colors.white,
    padding: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 1,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 1.84,

    elevation: 2,
  },

  containerRec: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crossIconContainer:{
    justifyContent:'flex-end',
    flexDirection:'row',
    marginBottom:hp( 2 ),
  },
  modalContainer:{
    backgroundColor:Colors.backgroundColor,
    padding:5,
    height:hp( '85%' )
  }
} )

export default ReorderAccountShellsDraggableListItem
