import { Linking } from "react-native";

export default async function openLink(urlPath: string) {
  const isSupported = await Linking.canOpenURL(urlPath);

  if (isSupported) {
    await Linking.openURL(urlPath);
  } else {
    throw Error(`Unable to open URL at path: ${urlPath}`);
  }
};
