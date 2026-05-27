import * as ImagePicker from "expo-image-picker";
import { Platform } from "react-native";

export type PickedImage = {
  uri: string;
  fileName: string | null;
  mimeType: string | null;
  file: File | null;
};

const pickViaInput = (): Promise<PickedImage | null> =>
  new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.onchange = () => {
      const file = input.files && input.files[0] ? input.files[0] : null;
      document.body.removeChild(input);
      if (file === null) {
        resolve(null);
        return;
      }
      resolve({
        uri: URL.createObjectURL(file),
        fileName: file.name,
        mimeType: file.type,
        file
      });
    };
    input.oncancel = () => {
      document.body.removeChild(input);
      resolve(null);
    };
    document.body.appendChild(input);
    input.click();
  });

export const pickImage = async (): Promise<PickedImage | null> => {
  if (Platform.OS === "web") {
    return pickViaInput();
  }
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    throw new Error("permission_denied");
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8
  });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return {
    uri: asset.uri,
    fileName: asset.fileName ?? null,
    mimeType: asset.mimeType ?? null,
    file: asset.file ?? null
  };
};
