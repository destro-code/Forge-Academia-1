import type { ComponentType } from "react";
import { LayerStack } from "./layer-stack";
import { RequestFlow } from "./request-flow";
import { AccountSettingsSystem } from "./account-settings-system";
import { ComputerPipeline } from "./computer-pipeline";
import { BoxModelStudio } from "./box-model-studio";
import { FlexGridStudio } from "./flex-grid-studio";
import { TypographyContrastStudio } from "./typography-contrast-studio";
import { ResponsiveStateStudio } from "./responsive-state-studio";

export const INTERACTIVE_VISUALS: Record<string, ComponentType<any>> = {
  "layer-stack": LayerStack,
  "request-flow": RequestFlow,
  "browser-interface": AccountSettingsSystem,
  "account-settings": AccountSettingsSystem,
  "computer-pipeline": ComputerPipeline,
  "box-model-studio": BoxModelStudio,
  "flex-grid-studio": FlexGridStudio,
  "typography-contrast-studio": TypographyContrastStudio,
  "responsive-state-studio": ResponsiveStateStudio,
};

export {
  AccountSettingsSystem,
  ComputerPipeline,
  BoxModelStudio,
  FlexGridStudio,
  TypographyContrastStudio,
  ResponsiveStateStudio,
};

export function getInteractiveVisual(kind: string | undefined) {
  if (!kind) return null;
  return INTERACTIVE_VISUALS[kind] ?? null;
}

