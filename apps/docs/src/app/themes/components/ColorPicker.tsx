"use client";
import {
  Card,
  CardContent,
  CardHeader,
  Field,
  Label,
  Slider,
  Stack,
  Text,
} from "@weiui/react";

interface Props {
  hue: number;
  saturation: number;
  onHueChange: (hue: number) => void;
  onSaturationChange: (sat: number) => void;
}

export function ColorPicker({ hue, saturation, onHueChange, onSaturationChange }: Props) {
  const color = `oklch(0.546 ${saturation.toFixed(3)} ${hue})`;

  return (
    <Card>
      <CardHeader>
        <Text as="span" size="sm" weight="semibold">
          Primary Color
        </Text>
      </CardHeader>
      <CardContent>
        <Stack direction="column" gap={4}>
          <div
            className="wui-theme-swatch"
            role="img"
            aria-label={`Preview color ${color}`}
            style={{ backgroundColor: color }}
          />
          <Field>
            <Label htmlFor="theme-hue">Hue: {Math.round(hue)}</Label>
            <Slider
              id="theme-hue"
              min={0}
              max={360}
              step={1}
              value={hue}
              onChange={(value) => onHueChange(value)}
              aria-label="Hue"
            />
          </Field>
          <Field>
            <Label htmlFor="theme-chroma">Chroma: {saturation.toFixed(3)}</Label>
            <Slider
              id="theme-chroma"
              min={0}
              max={0.4}
              step={0.005}
              value={saturation}
              onChange={(value) => onSaturationChange(value)}
              aria-label="Chroma"
            />
          </Field>
        </Stack>
      </CardContent>
    </Card>
  );
}
