export class HeaderColumn {
  label: string;
  colSpan: number;
  column: string;

  constructor(label: string, colSpan: number, column: string) {
    this.label = label;
    this.colSpan = colSpan;
    this.column = column;
  }
}
