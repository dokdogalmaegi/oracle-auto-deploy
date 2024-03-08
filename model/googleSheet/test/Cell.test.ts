import { HeaderColumn } from "../HeaderColumn";
import { Cell } from "../Cell";

describe("Create Cell", () => {
  const label = "label";
  const colSpan = 1;
  const column = "A";
  const header = new HeaderColumn(label, colSpan, column);

  it("should create a cell", () => {
    let cell;
    expect(() => (cell = new Cell(header, 1, "value"))).not.toThrow();
  });

  it("should retrieve the header value correctly", () => {
    const cell = new Cell(header, 1, "value");
    expect(cell.header).toBe(header);
  });

  it("should retrieve the row number correctly", () => {
    const cell = new Cell(header, 1, "value");
    expect(cell.rowNumber).toBe(1);
  });

  it("should retrieve the value correctly", () => {
    const cell = new Cell(header, 1, "value");
    expect(cell.value).toBe("value");
  });
});
