import { Cell } from "./Cell";
import { HeaderColumn } from "./HeaderColumn";

export class Row {
  cells: Cell[];
  rowNumber: number;

  constructor(cells: Cell[], rowNumber: number) {
    const isValidCell = cells.find((cell) => cell.rowNumber !== rowNumber);
    if (isValidCell) {
      throw new Error("Cell row number is not equal to row number");
    }

    this.cells = cells;
    this.rowNumber = rowNumber;
  }

  getCellByHeaderColumn(headerColumn: HeaderColumn): Cell | undefined {
    return this.cells.find((cell) => cell.header.equals(headerColumn));
  }

  getCellFilteredByHeaderLabel(headerLabel: string): Cell | undefined {
    return this.cells.find((cell) => cell.header.label.toLowerCase().trim() === headerLabel.toLowerCase().trim());
  }

  existsCellValueByHeaderLabel(headerLabel: string): boolean {
    const headerLabelCell = this.getCellFilteredByHeaderLabel(headerLabel);

    return headerLabelCell && headerLabelCell.value.length > 0 ? true : false;
  }
}
