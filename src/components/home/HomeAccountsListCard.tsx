import React, { useMemo } from 'react'
import { View, Text, StyleSheet, Image, ImageSourcePropType } from 'react-native'
import { heightPercentageToDP, widthPercentageToDP } from 'react-native-responsive-screen'
import Colors from '../../common/Colors'
import Fonts from '../../common/Fonts'
import { RFValue } from 'react-native-responsive-fontsize'
import LabeledBalanceDisplay from '../LabeledBalanceDisplay'
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState'
import AccountShell from '../../common/data/models/AccountShell'
import usePrimarySubAccountForShell from '../../utils/hooks/account-utils/UsePrimarySubAccountForShell'
import useSecondarySubAccountsForShell from '../../utils/hooks/account-utils/UseSecondarySubAccountForShell'
import useTotalBalanceForAccountShell from '../../utils/hooks/state-selectors/accounts/UseTotalBalanceForAccountShell'
import SubAccountKind from '../../common/data/enums/SubAccountKind'
import getAvatarForSubAccount from '../../utils/accounts/GetAvatarForSubAccountKind'
import getAccountSyncIcon from '../../utils/accounts/GetAccountSyncIcon'
import AccountVisibility from '../../common/data/enums/AccountVisibility'
import { useDispatch, useSelector } from 'react-redux'
import { AccountType } from '../../bitcoin/utilities/Interface'
import { translations } from '../../common/content/LocContext'
import { Shadow } from 'react-native-shadow-2'

export type Props = {
  accountShell: AccountShell;
  cardDisabled: boolean;
};

type HeaderProps = Props;
type BodyProps = Props;


const HeaderSection: React.FC<HeaderProps> = ( { accountShell, cardDisabled }: HeaderProps ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const secondarySubAccounts = useSecondarySubAccountsForShell( accountShell )
  const isVisited = useSelector( ( state ) => state.swanIntegration.isVisited )
  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount,
  )

  const secondarySubAccountBadgeIcons: ImageSourcePropType[] = useMemo( () => {
    return secondarySubAccounts
      .map( subAccount => getAvatarForSubAccount( subAccount, false ) )
  }, [ secondarySubAccounts ] )

  return (
    <View style={styles.headerSectionContainer}>
      <Image
        style={styles.headerAccountSync}
        source={getAccountSyncIcon( accountShell.syncStatus )}
      />
      <View style={styles.headerAccountImage} >
        {getAvatarForSubAccount( primarySubAccount, false, true )}
      </View>
      {
        accountShell.primarySubAccount.hasNewTxn || ( primarySubAccount.type === AccountType.SWAN_ACCOUNT && !isVisited && !primarySubAccount.isUsable )  && (
          <View style={styles.dot}/>
        )
      }
      {/* {( primarySubAccount.type == AccountType.SAVINGS_ACCOUNT && AllowSecureAccount ) &&
      <View style={styles.dot}/>
      } */}
      <View style={styles.headerBadgeContainer}>

        {/*
          📝 Disabling secondary sub-account icons for now until a design is finalized.
          (See: https://github.com/bithyve/hexa/issues/2312)
        */}
        {/* {secondarySubAccountBadgeIcons.map( iconSource => {
          return (
            <Image style={styles.headerBadgeIcon} source={iconSource} />
          )
        } )} */}

        {primarySubAccount.isTFAEnabled && (
          <Text style={styles.tfaIndicatorText}>2FA</Text>
        )}
      </View>
    </View>
  )
}

const BodySection: React.FC<BodyProps> = ( { accountShell, cardDisabled }: BodyProps ) => {
  const primarySubAccount = usePrimarySubAccountForShell( accountShell )
  const AllowSecureAccount = useSelector(
    ( state ) => state.bhr.AllowSecureAccount,
  )
  const accountsState = useAccountsState()
  const strings  = translations[ 'accounts' ]
  const common  = translations[ 'common' ]
  const totalBalance = AccountShell.getTotalBalance( accountShell )
  // const startRegistration = useSelector( ( state ) => state.swanIntegration.startRegistration )
  const balanceTextStyle = useMemo( () => {
    return {
      color: accountsState.accountsSynched ? Colors.black : Colors.textColorGrey,
    }
  }, [ accountsState.accountsSynched ] )

  const isTestAccount = useMemo( () => {
    return accountShell.primarySubAccount.kind == SubAccountKind.TEST_ACCOUNT
  }, [ accountShell.primarySubAccount.kind ] )

  const getText = ( text ) => {
    if ( text.includes( 'Register' ) ) {
      return(
        <Text style={styles.subtitleText} numberOfLines={3}>
          <Text style={styles.boldItalicText}>
            {`${strings.Register}`}
          </Text>
          {strings.andclaim}
        </Text>
      )
    }
    if ( !AllowSecureAccount && text.includes( 'MultiSig Wallet' ) ) {
      return(
        <Text style={styles.subtitleText} numberOfLines={3}>
          {`${strings.Availableafter}\n`}
          <Text style={styles.boldItalicText}>
          Level 2
          </Text>
          {` ${common.backup}`}
        </Text>
      )
    }
    return (
      <Text style={styles.subtitleText} numberOfLines={3}>
        {text}
      </Text>
    )
  }
  return (
    <View style={styles.bodyContainer}>
      <Text style={styles.titleText} numberOfLines={2}>
        {primarySubAccount.customDisplayName ?? primarySubAccount.defaultTitle}
      </Text>


      {getText( primarySubAccount.customDescription ?? primarySubAccount.defaultDescription )}
      {
        ( primarySubAccount.type == AccountType.SWAN_ACCOUNT
        ||
        primarySubAccount.type == AccountType.SAVINGS_ACCOUNT ) && !primarySubAccount.isUsable
          ?
          <View style={{
            height: heightPercentageToDP( 2 )
          }} />
          :
          <LabeledBalanceDisplay
            balance={totalBalance}
            bitcoinUnit={accountShell.unit}
            containerStyle={styles.balanceRow}
            amountTextStyle={balanceTextStyle}
            isTestAccount={isTestAccount}
          />
      }

    </View>
  )
}


const HomeAccountsListCard: React.FC<Props> = ( { accountShell, cardDisabled }: Props ) => {
  const showAllAccount = useSelector( ( state ) => state.accounts.showAllAccount )
  const opacityChange = cardDisabled || ( accountShell.primarySubAccount.visibility !== AccountVisibility.DEFAULT && showAllAccount === true )  ? true : false

  return (
    <Shadow  distance={10} startColor={Colors.shadowColor}  offset={[ 7, 7 ]}>
      <View style={opacityChange ? {
        ...styles.rootContainer, opacity:0.3
      } : styles.rootContainer}>
        <HeaderSection accountShell={accountShell} cardDisabled={cardDisabled}/>
        <BodySection accountShell={accountShell} cardDisabled={cardDisabled}/>
      </View>
    </Shadow>
  )
}

const styles = StyleSheet.create( {
  boldItalicText: {
    fontFamily: Fonts.FiraSansMediumItalic,
    fontWeight: 'bold',
    fontStyle: 'italic',
    fontSize: RFValue( 11 ),
  },
  rootContainer: {
    borderRadius: 10,
    width: widthPercentageToDP( 43 ),
    height: heightPercentageToDP( 20 ),
    // borderColor: Colors.borderColor,
    // borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: widthPercentageToDP( 4.5 ),
    backgroundColor: Colors.white,
    justifyContent: 'space-between',
    // shadowColor: 'red',
    // shadowOpacity: 1,
    // shadowOffset: {
    //   width: 10, height: 10
    // },
    // elevation: 6,
  },

  headerSectionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom:0,
  },

  headerAccountSync: {
    width: widthPercentageToDP( 4 ),
    height: widthPercentageToDP( 4 ),
    marginRight: widthPercentageToDP( -2 ),
    marginBottom: widthPercentageToDP( -2 ),
    marginLeft: widthPercentageToDP( -2 ),
    marginTop: widthPercentageToDP( -1.7 )
  },

  dot: {
    height: 8,
    width: 8,
    borderRadius: 8/2,
    backgroundColor: 'tomato',
    position: 'absolute',
    left: widthPercentageToDP( 9 ),
    top: heightPercentageToDP( 0.9 ),
  },

  headerAccountImage: {
    width: widthPercentageToDP( 13 ),
    height: widthPercentageToDP( 13 ),
    // marginLeft: heightPercentageToDP( 0.5 ),
    marginTop:heightPercentageToDP( 0.5 ),
    resizeMode: 'contain'
  },

  headerBadgeContainer: {
    flexDirection: 'row',
    marginLeft: 'auto',
    justifyContent: 'flex-end',
  },

  headerBadgeIcon: {
    width: 16,
    height: 16,
  },

  tfaIndicatorText: {
    marginLeft: 'auto',
    color: Colors.blue,
    fontSize: RFValue( 11 ),
    fontFamily: Fonts.FiraSansRegular,
  },

  bodyContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  titleText: {
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.blue,
    fontSize: RFValue( 10 ),
  },

  subtitleText: {
    marginTop: widthPercentageToDP( 1 ),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.textColorGrey,
    fontSize: RFValue( 10 ),
  },

  balanceRow: {
    marginTop: widthPercentageToDP( 1 ),
  },
} )

export default HomeAccountsListCard
