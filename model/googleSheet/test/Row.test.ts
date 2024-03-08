import { HeaderColumn } from "../HeaderColumn";
import { Cell } from "../Cell";
import { Row } from "../Row";

describe("Row", () => {
  const label = "label";
  const colSpan = 1;
  const column = "A";
  const header = new HeaderColumn(label, colSpan, column);

  it("should create a row", () => {
    const cell = new Cell(header, 1, "value");
    expect(() => new Row([cell], 1)).not.toThrow();
  });

  it("should retrieve the cells correctly", () => {
    const cell = new Cell(header, 1, "value");
    const row = new Row([cell], 1);
    expect(row.cells).toStrictEqual([cell]);
  });

  it("should retrieve the row number correctly", () => {
    const cell = new Cell(header, 1, "value");
    const row = new Row([cell], 1);
    expect(row.rowNumber).toBe(1);
  });

  it("should throw an error if the cell row number is not equal to row number", () => {
    const cell = new Cell(header, 2, "value");
    expect(() => new Row([cell], 1)).toThrow("Cell row number is not equal to row number");
  });

  it("should retrieve the cell by header column correctly", () => {
    const cell = new Cell(header, 1, "value");
    const row = new Row([cell], 1);
    expect(row.getCellByHeaderColumn(header)).toBe(cell);
  });

  it("should retrieve the cell filtered by header label correctly", () => {
    const cell = new Cell(header, 1, "value");
    const row = new Row([cell], 1);
    expect(row.getCellFilteredByHeaderLabel("label")).toBe(cell);
  });
});
