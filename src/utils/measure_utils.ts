import {Cell} from "../pages/gallery/gallery";
export class MeasureUtils {

  public static setupGrid1(root: HTMLElement, cell: Cell) {
    let rootWidth = root.getBoundingClientRect().width;
    let rootHeight = root.getBoundingClientRect().height;
    let targetRatio = 8.5 / 11;
    let rootRatio = rootWidth / rootHeight;
    if (rootRatio >= targetRatio) {
      let cellHeight = rootHeight;
      let cellWidth = cellHeight * 8.5 / 11;
      cell.height = cellHeight;
      cell.width = cellWidth;
      cell.left = (rootWidth - cellWidth) / 2;
      cell.top = 0;
    } else {
      let cellWidth = rootWidth;
      let cellHeight = cellWidth * 11 / 8.5;
      cell.height = cellHeight;
      cell.width = cellWidth;
      cell.top = (rootHeight - cellHeight) / 2;
    }
  }


  public static setupGrid6(root: HTMLElement, cells: Array<Cell>) {
    let rootWidth = root.getBoundingClientRect().width;
    let rootHeight = root.getBoundingClientRect().height;
    let targetRatio = (8.5 * 2) / (11 * 3);
    let rootRatio = rootWidth / rootHeight;
    if (rootRatio >= targetRatio) {
      let cellHeight = rootHeight / 3;
      let cellWidth = cellHeight / 11 * 8.5;
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        cell.width = cellWidth;
        cell.height = cellHeight;
        if (i % 2 != 0) {
          cell.left = rootWidth / 2;
        } else {
          cell.left = rootWidth / 2 - cellWidth;
        }
        let shift = Math.floor(i / 2);
        cell.top = cellHeight * shift;
      }
    } else {
      let cellWidth = rootWidth / 2;
      let cellHeight = cellWidth * 11 / 8.5;
      for (let i = 0; i < cells.length; i++) {
        let cell = cells[i];
        cell.width = cellWidth;
        cell.height = cellHeight;
        if (i % 2 != 0) {
          cell.left = rootWidth / 2;
        } else {
          cell.left = rootWidth / 2 - cellWidth;
        }
        let shift = Math.floor(i / 2);
        cell.top = cellHeight * shift;
      }
    }
  }

}
