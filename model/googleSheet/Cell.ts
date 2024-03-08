import { HeaderColumn } from "./HeaderColumn";

export class Cell {
  header: HeaderColumn;
  rowNumber: number;
  value: string;

  constructor(header: HeaderColumn, rowNumber: number, value: string) {
    this.header = header;
    this.rowNumber = rowNumber;
    this.value = value;
  }
}
