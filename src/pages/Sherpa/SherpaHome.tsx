import React, { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text } from "react-native";
import { Avatar } from "react-native-elements";
import { RFValue } from "react-native-responsive-fontsize";
import { widthPercentageToDP as wp, heightPercentageToDP as hp} from "react-native-responsive-screen";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Colors from '../../common/Colors';
import CommonStyles from "../../common/Styles/Styles";

export type ISherpaHomeProps = {
  navigation: any;
};

export type SherpaDetails = {
  name: string;
  profile: string;
  txns: Array<{ outgoing: boolean; time: Date; amount: number }>;
  lastBackup: Date;
};

const SherpaHome: React.FC<ISherpaHomeProps> = ({ navigation }) => {
  useEffect(() => {
    setData(getSherpaDependent(navigation.state.params.id));
  }, [navigation.state.params.id]);

  const getSherpaDependent: (id: string) => null | SherpaDetails = (id: string) => {
    // a function to return the contact details of Sherpa Dependent using the ID.

    if (!id) {
      return null;
    }

    return {
      name: "Pam",
      profile: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mnx8cmFuZG9tJTIwcGVvcGxlfGVufDB8fDB8fA%3D%3D&w=1000&q=80",
      lastBackup: new Date(Date.UTC(2022, 7, 20, 16, 0)),
      txns: [
        {
          outgoing: true,
          time: new Date(Date.UTC(2022, 2, 1, 10, 51)),
          amount: 2000,
        },
        {
          outgoing: false,
          time: new Date(Date.UTC(2021, 12, 21, 12, 0)),
          amount: 2000,
        },
        {
          outgoing: true,
          time: new Date(Date.UTC(2021, 10, 21, 14, 0)),
          amount: 2000,
        },
        {
          outgoing: false,
          time: new Date(Date.UTC(2021, 8, 29, 16, 0)),
          amount: 140000,
        },
      ],
    };
  };

  const [data, setData] = useState<SherpaDetails | null>(null);

  const Header: React.FC<{}> = () => {
    return (
      <View style={styles.headerWrapper}>
        <Avatar
          title="P"
          titleStyle={{ fontSize: RFValue(25) }}
          imageProps={styles.dpCircle}
          containerStyle={styles.dpCircle}
          source={data !== null ? {uri: data.profile} : {}}
        />

        <View>
          <View style={{flexDirection: 'row'}}>
            <Text>Last Backup </Text>
            <Text>2 months ago</Text>
          </View>

          <Text>Pam's Wallet</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          CommonStyles.headerContainer,
          {
            backgroundColor: Colors.backgroundColor,
          },
        ]}
      >
        <TouchableOpacity
          style={CommonStyles.headerLeftIconContainer}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <View style={CommonStyles.headerLeftIconInnerContainer}>
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </View>
        </TouchableOpacity>
      </View>

      <Header />
    </View>
  );
};

export default SherpaHome;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    borderWidth: 2,
    backgroundColor: Colors.backgroundColor,
    borderColor: 'black'
  },
  headerWrapper: {
    flexDirection: 'row',
    marginHorizontal: Math.min(wp(10), 40),
  },
  dpCircle: {
    height: wp(20),
    width: wp(20),
    borderRadius: wp(10),
    backgroundColor: Colors.blue,
    elevation: 5,
    zIndex: 1,
  },
});
