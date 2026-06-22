// src/types/process-step.ts
import type { ReactNode } from 'react';

export interface ProcessStep {
  id: number;
  icon: ReactNode;
  title: string;
  description: string;
}
