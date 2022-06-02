import { LineIncrement } from "./LineIncrement.model";

export interface LineStorage {
    [lineStorage: string]: {
      [lineType: string]: {
        lineList: any[];
      };
    }
  }