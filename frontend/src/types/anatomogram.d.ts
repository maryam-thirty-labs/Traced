declare module "anatomogram" {
  import { ComponentType } from "react";

  interface AnatomogramProps {
    species: string;
    showIds?: string[];
    highlightIds?: string[];
    selectIds?: string[];
    showColour?: string;
    highlightColour?: string;
    selectColour?: string;
    showOpacity?: number;
    highlightOpacity?: number;
    selectOpacity?: number;
    onClick?: (ids: string[]) => void;
  }

  const Anatomogram: ComponentType<AnatomogramProps>;
  export default Anatomogram;
}
