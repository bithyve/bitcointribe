import React from 'react'
import { Image, View, } from 'react-native'
import AccountShell from '../../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import { ListItem } from 'react-native-elements'
import Colors from '../../../common/Colors'
import ListStyles from '../../../common/Styles/ListStyles'
import ImageStyles from '../../../common/Styles/ImageStyles'
import getAvatarForSubAccount from '../../../utils/accounts/GetAvatarForSubAccountKind'
import { RFValue } from 'react-native-responsive-fontsize'
import { AccountType } from '../../../bitcoin/utilities/Interface'
export type Props = {
  accountShell: AccountShell;
  isActive: boolean;
  onLongPress?: () => void;
  containerStyle?: Record<string, unknown>;
  setNumberOfTabs
};
const ReorderAccountShellsDraggableListItem: React.FC<Props> = ( {
  accountShell,
  isActive,
  onLongPress = () => {},
  containerStyle = {
  },
  setNumberOfTabs
}: Props ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  console.log( 'primarySubAccount.type0', primarySubAccount.type==AccountType.BORDER_WALLET )
  const isBorderWallet = primarySubAccount.type === AccountType.BORDER_WALLET
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
        {getAvatarForSubAccount( primarySubAccount, false, true, false, isBorderWallet )}
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

    </ListItem>
  )
}
export default ReorderAccountShellsDraggableListItem
