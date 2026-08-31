import { ComponentProps, FC } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { SvgProps } from "react-native-svg";

export type SvgIconComponent = FC<SvgProps>;

type IconProps = Omit<SvgProps, "height" | "width"> & {
  color?: string;
  size?: number;
  source: SvgIconComponent;
  style?: StyleProp<ViewStyle>;
  tintable?: boolean;
};

/**
 * Renders an imported `.svg` (via react-native-svg-transformer) at a fixed
 * square size. Icons ship with `currentColor` strokes/fills, so passing
 * `color` tints the whole glyph. Set `tintable={false}` for multi-tone marks.
 */
export function Icon({
  color,
  size = 24,
  source: Source,
  style,
  tintable = true,
  ...props
}: IconProps) {
  const colorProps = tintable && color ? { color } : {};

  return (
    <View style={[{ height: size, width: size }, style]}>
      <Source height={size} width={size} {...colorProps} {...props} />
    </View>
  );
}

export type IconComponentProps = ComponentProps<typeof Icon>;
