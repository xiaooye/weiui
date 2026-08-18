"use client";
import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Heading,
  Stack,
  Text,
} from "civaria";
import { Header } from "../../components/chrome/Header";
import { generateTheme } from "./lib/theme-generator";
import { ColorPicker } from "./components/ColorPicker";
import { ThemePreview } from "./components/ThemePreview";
import { ThemeExport } from "./components/ThemeExport";

export default function ThemesPage() {
  const [hue, setHue] = useState(263);
  const [saturation, setSaturation] = useState(0.245);

  const theme = useMemo(() => generateTheme(hue, saturation), [hue, saturation]);

  return (
    <>
      <Header />
      <Container maxWidth="80rem" className="civ-tool-shell">
        <Stack direction="column" gap={6}>
          <Stack direction="column" gap={2} className="civ-tool-shell__header">
            <Heading level={1} className="civ-tool-shell__title">
              Theme Builder
            </Heading>
            <Text size="base" color="muted" className="civ-tool-shell__sub">
              Pick a primary color and preview how every component looks with your custom theme.
              Export as CSS variables or JSON tokens.
            </Text>
          </Stack>
          <Grid
            columns="300px minmax(0, 1fr)"
            gap={6}
            className="civ-tool-shell__layout civ-tool-shell__layout--themes"
          >
            <Stack direction="column" gap={4}>
              <ColorPicker
                hue={hue}
                saturation={saturation}
                onHueChange={setHue}
                onSaturationChange={setSaturation}
              />
              <Card>
                <CardHeader>
                  <Text as="span" size="sm" weight="semibold">
                    Contrast Check
                  </Text>
                </CardHeader>
                <CardContent>
                  <Stack direction="column" gap={2}>
                    {theme.contrastResults.map((r) => (
                      <Stack key={r.pair} direction="row" gap={3} className="civ-contrast-row">
                        <Text as="span" size="sm" className="civ-contrast-row__pair">
                          {r.pair}
                        </Text>
                        <Badge
                          variant="soft"
                          color={r.passes ? "success" : "destructive"}
                          size="sm"
                        >
                          {r.ratio}:1 {r.passes ? "PASS" : "FAIL"}
                        </Badge>
                      </Stack>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
              <ThemeExport theme={theme} />
            </Stack>
            <ThemePreview theme={theme} />
          </Grid>
        </Stack>
      </Container>
    </>
  );
}
