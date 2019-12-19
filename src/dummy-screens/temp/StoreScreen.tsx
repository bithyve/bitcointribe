import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  Button
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { fetchFromDB, insertIntoDB } from "../../store/actions/storage";

const StoreScreen = props => {
  const dispatch = useDispatch();
  const isDBInitialized = useSelector(
    state => state.storage.databaseInitialized
  );
  const titles = useSelector(state => state.storage.database.titles);
  const [text, setText] = useState("");

  useEffect(() => {
    dispatch(fetchFromDB());
  }, [dispatch]);

  if (!isDBInitialized) {
    return <Text>DB Initialization Failed!</Text>;
  }

  return (
    <View style={styles.screen}>
      <Text>Write to database:</Text>
      <TextInput
        placeholder="Title"
        value={text}
        onChangeText={setText}
        style={{
          borderBottomWidth: 0.5,
          width: 150,
          textAlign: "center"
        }}
      />
      <Button
        title="Store"
        onPress={() => {
          dispatch(insertIntoDB(text));
        }}
      />
      <Text>Data from DB:</Text>
      {titles.length ? (
        <FlatList
          data={titles}
          keyExtractor={item => (1000 * Math.random()).toString()}
          renderItem={itemData => (
            <Text style={{ marginVertical: 10 }}>{itemData.item}</Text>
          )}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});

export default StoreScreen;
