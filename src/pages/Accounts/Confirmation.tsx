import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Button,
} from 'react-native';
import {
  clearTransfer,
  transferST2,
  fetchTransactions,
  fetchBalance,
} from '../../store/actions/accounts';
import { useDispatch, useSelector } from 'react-redux';
import SendStatusModalContents from '../../components/SendStatusModalContents';

const Confirmation = props => {
  const serviceType = props.navigation.getParam('serviceType');
  const recipientAddress = props.navigation.getParam('recipientAddress');
  const amount = props.navigation.getParam('amount');

  const { transfer, loading } = useSelector(
    state => state.accounts[serviceType],
  );

  const dispatch = useDispatch();

  const [SendSuccessBottomSheet, setSendSuccessBottomSheet] = useState(
    React.createRef(),
  );
  const renderSuccessStatusContents = () => (
    <SendStatusModalContents
      title1stLine={'Sent Successfully'}
      title2ndLine={''}
      info1stLine={'Bitcoins successfully sent to'}
      info2ndLine={''}
      userName={recipientAddress}
      modalRef={SendSuccessBottomSheet}
      isSuccess={true}
      onPressViewAccount={() => {
        dispatch(clearTransfer(serviceType));
        dispatch(fetchBalance(serviceType));
        dispatch(fetchTransactions(serviceType));
        props.navigation.navigate('Accounts');
      }}
      transactionId={transfer.txid}
      transactionDateTime={Date()}
    />
  );

  useEffect(() => {
    if (!transfer.txid && transfer.executed === 'ST2')
      props.navigation.navigate('TwoFAToken', {
        serviceType,
        recipientAddress,
      });
  }, [transfer]);

  if (transfer.txid) return renderSuccessStatusContents();

  return (
    <View style={style.screen}>
      <Text>Sending to: {recipientAddress}</Text>
      <Text>Amount: {amount}</Text>
      <Text style={{ marginVertical: 10 }}>
        Transaction Fee: {transfer.stage1.fee}
      </Text>
      <Text style={{ marginVertical: 10 }}>Estimated Blocks: 1-2</Text>
      {loading.transfer ? (
        <ActivityIndicator size="small" style={{ marginVertical: 5 }} />
      ) : (
        <View>
          <Button
            title="Send"
            onPress={() => {
              dispatch(transferST2(serviceType));
            }}
          />
          <Button
            title="Cancel"
            onPress={() => {
              dispatch(clearTransfer(serviceType));
              props.navigation.goBack();
            }}
          />
        </View>
      )}
    </View>
  );
};

const style = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Confirmation;
