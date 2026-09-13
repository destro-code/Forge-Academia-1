import { describe, it, expect } from "vitest";
import { movementForV1Role } from "./movement-v1";
import { MOVEMENTS } from "@/components/lesson/canonical/lesson-movements";

describe("movementForV1Role", () => {
  it("maps every golden-lesson role to the intended movement", () => {
    expect(movementForV1Role("encounter", "visual").id).toBe("see");
    expect(movementForV1Role("prediction", "multiple-choice").id).toBe("predict");
    expect(movementForV1Role("investigation", "debug").id).toBe("forge");
    expect(movementForV1Role("manipulation", "interactive-code").id).toBe("forge");
    expect(movementForV1Role("verification", "visual").id).toBe("prove");
    expect(movementForV1Role("reflection", "reflection").id).toBe("reflect");
    expect(movementForV1Role("transfer", "reflection").id).toBe("prove");
    expect(movementForV1Role("completion", "completion").id).toBe("temper");
  });

  it("falls back to the existing Layer 1 activity-type mapping when role is unrecognized", () => {
    const movement = movementForV1Role(undefined, "explanation");
    expect(movement).toBe(MOVEMENTS.grasp);
  });
});
