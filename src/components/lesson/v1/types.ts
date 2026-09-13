/**
 * V1 renderer prop contract — deliberately small and decoupled from Layer 1's
 * `ActivityRendererProps<T>` (which is generic over Layer 1's exact
 * `CanonicalActivity` discriminated union). V1-native renderers
 * (PredictionRenderer, InvestigationDebugRenderer, GenericDemoPanel) work
 * directly against the original `ActivityV1` content, not an adapted Layer 1
 * shape, so they need their own minimal contract rather than fighting
 * Layer 1's type parameter.
 *
 * Layer-1-reused activities (interactive-code, and interactive-demo when it
 * resolves to the account-settings visual) go through the *actual*
 * `ActivityRendererProps`/`renderActivity` unchanged — this file only covers
 * the activities that don't.
 */
import type { ActivityInteractionStatus } from "@/components/lesson/canonical/types";

export interface V1ActivityRuntimeState<TResponse = unknown> {
  status: ActivityInteractionStatus;
  response: TResponse | undefined;
}

export interface V1ActivityRendererProps<TResponse = unknown> {
  state: V1ActivityRuntimeState<TResponse>;
  onResponse: (response: TResponse) => void;
  readOnly?: boolean;
}
