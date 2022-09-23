import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

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
  const getSherpaDependent: (id: string) => null | SherpaDetails = (id: string) => {
    // a function to return the contact details of Sherpa Dependent using the ID.

    if (!id) {
      return null;
    }

    return {
      name: "Pam",
      profile: "",
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
      lastBackup: new Date(Date.UTC(2022, 7, 20, 16, 0)),
    };
  };

  const [data, setData] = useState<SherpaDetails | null>(null);

  useEffect(() => {
    setData(getSherpaDependent(navigation.state.params.id));
  }, [navigation.state.params.id]);

  return <View></View>;
};

export default SherpaHome;

const styles = StyleSheet.create({
  wrapper: {
    
  }
});
