import { FC } from "react";
import { View } from "react-native";
import { SvgProps } from "react-native-svg";

// Jest doesn't run the Metro svg transformer, so `.svg` imports resolve here.
const SvgMock: FC<SvgProps> = (props) => <View {...(props as object)} />;

export default SvgMock;
