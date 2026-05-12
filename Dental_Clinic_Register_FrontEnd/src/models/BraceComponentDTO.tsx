export interface BraceComponentDTO {
  id?: number;
  treatmentPlanId: number;
  type: 'BRACE' | 'RUBBER_BAND';
  positionX?: number | null;
  positionY?: number | null;
  positionZ?: number | null;
  startPositionX?: number | null;
  startPositionY?: number | null;
  startPositionZ?: number | null;
  endPositionX?: number | null;
  endPositionY?: number | null;
  endPositionZ?: number | null;
  colour?: string | null;
}
