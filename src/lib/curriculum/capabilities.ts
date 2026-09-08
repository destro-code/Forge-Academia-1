/**
 * Canonical Capabilities Catalog & Engine
 * Provides lookup, validation, depth tracking, and evidence mapping for Capabilities.
 */

import capabilitiesData from "@/data/canonical/capabilities.json";
import type { EvidenceType } from "./types-v1";

export type CapabilityDepthLevel =
  | "recognition"
  | "understanding"
  | "prediction"
  | "manipulation"
  | "application"
  | "debugging"
  | "explanation"
  | "transfer"
  | "judgment";

export interface CapabilityEntity {
  id: string;
  phaseId: string;
  moduleId: string;
  title: string;
  statement: string;
  depth: CapabilityDepthLevel[];
  conceptIds: string[];
  skillIds: string[];
  evidenceTypes: EvidenceType[];
  misconceptionIds?: string[];
}

export class CapabilityCatalog {
  private capabilities: Map<string, CapabilityEntity> = new Map();

  constructor(initialData: CapabilityEntity[] = capabilitiesData as CapabilityEntity[]) {
    initialData.forEach((cap) => {
      this.capabilities.set(cap.id, cap);
    });
  }

  public getAll(): CapabilityEntity[] {
    return Array.from(this.capabilities.values());
  }

  public getById(id: string): CapabilityEntity | undefined {
    return this.capabilities.get(id);
  }

  public getByPhase(phaseId: string): CapabilityEntity[] {
    return this.getAll().filter((c) => c.phaseId === phaseId);
  }

  public getByModule(moduleId: string): CapabilityEntity[] {
    return this.getAll().filter((c) => c.moduleId === moduleId);
  }

  public hasCapability(id: string): boolean {
    return this.capabilities.has(id);
  }

  public validateCapabilityReferences(capabilityIds: string[]): {
    valid: boolean;
    missingIds: string[];
  } {
    const missingIds = capabilityIds.filter((id) => !this.hasCapability(id));
    return {
      valid: missingIds.length === 0,
      missingIds,
    };
  }
}

export const capabilityCatalog = new CapabilityCatalog();
