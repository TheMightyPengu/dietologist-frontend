import type {
  WebsiteThemeGetDto,
  WebsiteThemeUpdateDto,
} from "@/api/WebsiteThemeController";

export type MainThemeColors = {
  primary: string;
  accent: string;
  background: string;
  text: string;
};

export const DEFAULT_MAIN_THEME: MainThemeColors = {
  primary: "#698556",
  accent: "#c68b5c",
  background: "#fbf7ef",
  text: "#233123",
};

type RgbColor = {
  red: number;
  green: number;
  blue: number;
};

function clamp(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

function normalizeHex(value: string): string {
  const trimmed = value.trim();

  return trimmed.startsWith("#")
    ? trimmed.toUpperCase()
    : `#${trimmed.toUpperCase()}`;
}

function safeHex(value: string, fallback: string): string {
  return isValidHexColor(value)
    ? normalizeHex(value)
    : normalizeHex(fallback);
}

function hexToRgb(hex: string): RgbColor {
  const normalized = normalizeHex(hex).replace("#", "");

  return {
    red: parseInt(normalized.substring(0, 2), 16),
    green: parseInt(normalized.substring(2, 4), 16),
    blue: parseInt(normalized.substring(4, 6), 16),
  };
}

function rgbToHex(
  red: number,
  green: number,
  blue: number
): string {
  return `#${[red, green, blue]
    .map((value) =>
      clamp(value).toString(16).padStart(2, "0")
    )
    .join("")
    .toUpperCase()}`;
}

/**
 * amount = 0 returns colorA.
 * amount = 1 returns colorB.
 */
function mixColors(
  colorA: string,
  colorB: string,
  amount: number
): string {
  const first = hexToRgb(colorA);
  const second = hexToRgb(colorB);

  const safeAmount = Math.max(0, Math.min(1, amount));

  return rgbToHex(
    first.red + (second.red - first.red) * safeAmount,
    first.green + (second.green - first.green) * safeAmount,
    first.blue + (second.blue - first.blue) * safeAmount
  );
}

function channelToLinear(channel: number): number {
  const value = channel / 255;

  return value <= 0.03928
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function getRelativeLuminance(hex: string): number {
  const color = hexToRgb(hex);

  return (
    0.2126 * channelToLinear(color.red) +
    0.7152 * channelToLinear(color.green) +
    0.0722 * channelToLinear(color.blue)
  );
}

function getContrastRatio(
  firstColor: string,
  secondColor: string
): number {
  const firstLuminance = getRelativeLuminance(firstColor);
  const secondLuminance = getRelativeLuminance(secondColor);

  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + 0.05) / (darker + 0.05);
}

function getReadableTextColor(background: string): string {
  const white = "#FFFFFF";
  const dark = "#182018";

  const whiteContrast = getContrastRatio(background, white);
  const darkContrast = getContrastRatio(background, dark);

  return whiteContrast >= darkContrast ? white : dark;
}

export function generateWebsiteTheme(
  mainColors: MainThemeColors
): WebsiteThemeUpdateDto {
  const primary = safeHex(
    mainColors.primary,
    DEFAULT_MAIN_THEME.primary
  );

  const accent = safeHex(
    mainColors.accent,
    DEFAULT_MAIN_THEME.accent
  );

  const background = safeHex(
    mainColors.background,
    DEFAULT_MAIN_THEME.background
  );

  const text = safeHex(
    mainColors.text,
    DEFAULT_MAIN_THEME.text
  );

  return {
    primary,

    // Darker version used for hover states.
    primaryDark: mixColors(primary, "#000000", 0.25),

    accent,

    // Soft callouts derived from the accent and background.
    accentSoft: mixColors(accent, background, 0.78),
    warm: mixColors(accent, background, 0.58),

    background,

    // Cards and menus become lighter variations of the background.
    surface: mixColors(background, "#FFFFFF", 0.82),
    surfaceSoft: mixColors(background, "#FFFFFF", 0.48),

    ink: text,

    // Secondary text is a softer mixture of text and background.
    muted: mixColors(text, background, 0.4),

    // Borders remain visible without becoming too strong.
    border: mixColors(background, text, 0.14),

    // Automatically picks light or dark text.
    buttonText: getReadableTextColor(primary),

    // Subtle body background decorations.
    backgroundGradientOne: mixColors(
      background,
      primary,
      0.12
    ),

    backgroundGradientTwo: mixColors(
      background,
      primary,
      0.2
    ),

    backgroundGradientThree: mixColors(
      background,
      accent,
      0.16
    ),
  };
}

export function getMainThemeColors(
  theme: WebsiteThemeGetDto | WebsiteThemeUpdateDto
): MainThemeColors {
  return {
    primary: safeHex(
      theme.primary,
      DEFAULT_MAIN_THEME.primary
    ),

    accent: safeHex(
      theme.accent,
      DEFAULT_MAIN_THEME.accent
    ),

    background: safeHex(
      theme.background,
      DEFAULT_MAIN_THEME.background
    ),

    text: safeHex(
      theme.ink,
      DEFAULT_MAIN_THEME.text
    ),
  };
}

export const DEFAULT_THEME: WebsiteThemeUpdateDto =
  generateWebsiteTheme(DEFAULT_MAIN_THEME);

function hexToRgbValues(
  hex: string | null | undefined
): string | null {
  if (!hex || !isValidHexColor(hex)) {
    return null;
  }

  const color = hexToRgb(hex);

  return `${color.red} ${color.green} ${color.blue}`;
}

function setColorVariable(
  variableName: string,
  hexColor: string | null | undefined
): void {
  if (typeof document === "undefined") {
    return;
  }

  const rgbValues = hexToRgbValues(hexColor);

  if (!rgbValues) {
    console.warn(
      `Invalid theme color for ${variableName}: ${hexColor}`
    );
    return;
  }

  document.documentElement.style.setProperty(
    variableName,
    rgbValues
  );
}

export function applyTheme(
  theme: WebsiteThemeGetDto | WebsiteThemeUpdateDto
): void {
  setColorVariable("--primary", theme.primary);
  setColorVariable("--primary-dark", theme.primaryDark);

  setColorVariable("--accent", theme.accent);
  setColorVariable("--accent-soft", theme.accentSoft);
  setColorVariable("--warm", theme.warm);

  setColorVariable("--bg", theme.background);
  setColorVariable("--surface", theme.surface);
  setColorVariable("--surface-soft", theme.surfaceSoft);

  setColorVariable("--ink", theme.ink);
  setColorVariable("--muted", theme.muted);
  setColorVariable("--border", theme.border);

  setColorVariable("--button-text", theme.buttonText);

  setColorVariable(
    "--background-gradient-one",
    theme.backgroundGradientOne
  );

  setColorVariable(
    "--background-gradient-two",
    theme.backgroundGradientTwo
  );

  setColorVariable(
    "--background-gradient-three",
    theme.backgroundGradientThree
  );
}