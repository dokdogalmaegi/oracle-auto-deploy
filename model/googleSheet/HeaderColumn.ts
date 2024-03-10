export class HeaderColumn {
  label: string;
  colSpan: number;
  column: string;

  constructor(label: string, colSpan: number, column: string) {
    this.label = label.replace("\n", "").replace("-", "_");
    this.colSpan = colSpan;
    this.column = column;
  }

  equals(other: HeaderColumn): boolean {
    return this.label === other.label && this.colSpan === other.colSpan && this.column === other.column;
  }
}
