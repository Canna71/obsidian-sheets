/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    BorderStyle,
    Borders,
    CellFormulaValue,
    Column,
    Workbook,
} from "exceljs";
import { convertThemeColorToRGB, rgbToHex } from "./excelColors";
import { CellData, CellStyle, RowData, SheetData } from "x-data-spreadsheet";
// import { SpreadsheetData } from "x-data-spreadsheet";

declare module "x-data-spreadsheet" {
    interface RowData {
        height?: number;
    }
}

type borderDir = "top" | "bottom" | "left" | "right";

export function toSpreadsheet(wb: Workbook) {
    function mapColor(
        oStyle: CellStyle,
        border: Partial<Borders>,
        what: borderDir
    ) {
        if (border[what] && border[what]?.style && oStyle.border) {
            oStyle.border[what] = [
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                border[what]!.style!.toString(),
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                "#" + getColor(border[what]!.color),
            ];
        }
    }


    const out = wb.worksheets.map((ws) => {
        const ows: SheetData = {
            name: ws.name,
            rows: {},
            cols: {},
            merges: [],

            // freezes:
        };

        ows.styles = [];

        if (ws.columns) {
            for (const col of ws.columns) {
                if (col.width && ows.cols && col.number) {
                    ows.cols[col.number - 1] = { width: width2px(col.width) };
                }
            }
        }
        // TODO: use options
        ows.cols!.len = Math.max(25, ws.actualColumnCount);

        ws.eachRow((row, rowNumber) => {
            const rowId = row.number - 1;
            const rowob: RowData = {
                cells: {},
            };

            if (ows.rows) {
                ows.rows[rowId] = rowob;
            }
            if (row.height) {
                // px = pt * ( 72pt / 96 )

                rowob.height = pt2px(row.height);
            }
            if (row.hidden) {
                rowob.hidden = true;
                // TODO: implementit!
            }

            row.eachCell((cell, cellNumber) => {
                const cellOb: CellData = {
                    text: cell.text,
                };
                if (cell.formula) cellOb.text = "=" + cell.formula;

                // style
                const oStyle: CellStyle = {};
                if (cell.style.fill) {
                    if (cell.style.fill.type === "pattern") {
                        const fgColor = cell.style.fill.fgColor;
                        if (fgColor) {
                            const hexColor = getColor(fgColor);
                            if (hexColor) {
                                oStyle.bgcolor = "#" + hexColor;
                            }
                        }
                    }
                }

                if (cell.style.border) {
                    const border = cell.style.border;
                    oStyle.border = {};
                    ["top", "bottom", "left", "right"].forEach((what) => {
                        mapColor(oStyle, border, what as borderDir);
                    });
                }
                if (cell.style.font) {
                    const font = cell.style.font;

                    if (font.bold) {
                        oStyle.font = oStyle.font || {};
                        oStyle.font.bold = true;
                    }
                    if (font.color) {
                        const hexColor = getColor(font.color);
                        if (hexColor) {
                            oStyle.color = "#" + hexColor;
                        }
                    }
                    if (font.italic) {
                        oStyle.font = oStyle.font || {};
                        // oStyle.font
                        oStyle.font.italic = true;
                    }
                    if (font.strike) {
                        oStyle.strike = true;
                    }
                    if (font.underline) {
                        oStyle.underline = true;
                    }
                    if (font.name) {
                        oStyle.font = oStyle.font || {};
                        oStyle.font.name = font.name;
                    }
                    if (font.family) {
                        oStyle.font = oStyle.font || {};
                        oStyle.font.family = font.family;
                    }
                    if (font.size) {
                        oStyle.font = oStyle.font || {};
                        oStyle.font.size = font.size;
                    }
                    // if(font.vertAlign) {
                    //     console.log("here");
                    // }
                }
                if (cell.style.alignment) {
                    //
                    const alig = cell.style.alignment;
                    if (alig.vertical) {
                        (oStyle as any).valign = alig.vertical;
                    }
                    if (alig.horizontal) {
                        (oStyle as any).align = alig.horizontal;
                    }
                    if (cell.style.alignment.wrapText) {
                        oStyle.textwrap = true;
                    }
                }
                if (cell.style.numFmt) {
                    const numFmt = cell.style.numFmt;
                    oStyle.format = numFmt;
                    // if (numFmt.endsWith("%")) {
                    //     (oStyle).format = "percent";
                    //     // TODO: 0.00%
                    // } else if (numFmt.contains("€")) {
                    //     (oStyle).format = "eur";
                    // } else if (numFmt.contains("$")) {
                    //     (oStyle).format = "usd";
                    // } else if (numFmt === "@") {
                    //     (oStyle).format = "text";
                    // }
                    // console.log(numFmt);
                } 
                if (cell.style.protection) {
                    //TODO:
                }

                if (Object.keys(oStyle).length > 0 && ows.styles) {
                    const j = JSON.stringify(oStyle);
                    let styleIndex = ows.styles.findIndex(
                        (s) => JSON.stringify(s) == j
                    );
                    if (styleIndex < 0) {
                        ows.styles?.push(oStyle);
                        styleIndex = ows.styles.length - 1;
                    }
                    cellOb.style = styleIndex;
                }

                if (!cell.isMerged || !cell.model.master) {
                    rowob.cells[Number(cell.col) - 1] = cellOb;
                    if (cell.isMerged) {
                        const merge = (ws as any)._merges[cell.address];
                        cellOb.merge = [
                            (merge.bottom - merge.top) as number,
                            (merge.right - merge.left) as number,
                        ];
                    }
                } else {
                    //
                }
            });


        });

        // TODO: use options    
        ows.rows!.len = Math.max(100, ws.actualRowCount);
        // merges
        const merges = [];
        for (const m in (ws as any)._merges) {
            const merge = (ws as any)._merges[m];
            const range = merge.range;
            merges.push(range);
        }
        ows.merges = merges;
        return ows;
    });
    console.log(out);
    return out;
}
function pt2px(pt: number) {
    return Math.round(pt * 1.3333333);
}

function px2pt(px: number) {
    return Math.round(px * 0.75);
}

function width2px(w: number) {
    // TODO: get actual character width
    // 10 units = 64px
    return Math.round(w * 6.4);
}

function px2width(px: number) {
    return Math.round(px * 0.15625);
}

function getColor(fgColor: any) {
    if (fgColor.argb) {
        const hex = fgColor.argb.substring(2);
        return hex;
    } else if (fgColor.theme !== undefined) {
        const theme = fgColor?.theme;
        const tint = (fgColor as any).tint || 0;
        const rgb = convertThemeColorToRGB(theme, tint);
        const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
        return hex;
    }
}

function toColor(hex: string) {
    return {
        argb: "FF" + hex.replace("#", ""),
    };
}

export function toExcelJS(data: SheetData[]): Workbook {
    function mapBorderColor(
        borders: Partial<Borders>,
        cellstyle: CellStyle,
        what: borderDir
    ) {
        if (cellstyle.border) {
            const brd = cellstyle.border[what];
            if (brd) {
                const [style, color] = brd;
                borders[what] = {
                    style: style as BorderStyle,
                    color: toColor(color),
                };
            }
        }
    }

    const workbook = new Workbook();
    for (const ssheet of data) {
        const wsheet = workbook.addWorksheet(ssheet.name);

        if (ssheet.cols !== undefined) {
            const colIds = Object.keys(ssheet.cols)
                .filter((key) => !isNaN(Number(key)))
                .map((key) => Number(key));

            const maxColid = Math.max(...colIds);

            const wscols: Partial<Column>[] = [];
            for (let colid = 0; colid <= maxColid; colid++) {
                const num = colid + 1;
                const col: Partial<Column> = {
                    number: num,
                    key: num.toString(),
                };
                const scol = ssheet.cols[colid];

                if (scol?.width) {
                    col.width = px2width(scol.width);
                }
                wscols.push(col);
            }

            wsheet.columns = wscols;
        }

        if (ssheet.rows !== undefined) {
            for (const rowId in ssheet.rows) {
                if (!isNaN(Number(rowId))) {
                    const rowNum = Number(rowId);
                    const rowdata = ssheet.rows[rowNum];

                    const row = wsheet.getRow(rowNum + 1);
                    // cells, height, hidden
                    if (rowdata.hidden) {
                        row.hidden = true;
                    }
                    if(rowdata.height !== undefined) {
                        row.height = px2pt( rowdata.height);
                    }
                    for (const cellId in rowdata.cells) {
                        const cellNum = Number(cellId);
                        const celldata = rowdata.cells[cellNum];
                        const cell = row.getCell(cellNum + 1);

                        if (celldata.text?.startsWith("=")) {
                            cell.value = {
                                formula: celldata.text.substring(1),
                            } as CellFormulaValue;
                        }  else if(!isNaN(Number(celldata.text))){
                            cell.value = Number(celldata.text)
                        } else if (!isNaN(Date.parse(celldata.text))){
                            cell.value = new Date(celldata.text)
                        } else {
                            cell.value = celldata.text
                        }
 



                        // style
                        if (celldata.style !== undefined) {
                            const cellstyle = ssheet.styles![celldata.style];
                            if (cellstyle.bgcolor) {
                                cell.style.fill = {
                                    type: "pattern",
                                    pattern: "solid",
                                    fgColor: toColor(cellstyle.bgcolor),
                                };
                            }

                            if (cellstyle.border) {
                                const borders: Partial<Borders> = {};

                                ["top","bottom","right","left"].forEach(what =>{
                                    mapBorderColor(borders, cellstyle,what as borderDir)
                                })
                                cell.style.border = borders;
                                
                            }

                            if(cellstyle.font) {
                                cell.style.font = cell.style.font || {}
                                if(cellstyle.font.bold) cell.style.font.bold = true;
                                if(cellstyle.font.family !== undefined) cell.style.font.family = cellstyle.font.family;
                                if(cellstyle.font.italic) cell.style.font.italic = true;
                                if(cellstyle.font.name) cell.style.font.name = cellstyle.font.name;
                                if(cellstyle.font.size !== undefined) cell.style.font.size =  cellstyle.font.size;

                            }
                            if(cellstyle.color !== undefined) {
                                cell.style.font = cell.style.font || {}
                                cell.style.font.color = getColor(cellstyle.color);
                            }
                            if(cellstyle.strike){
                                cell.style.font = cell.style.font || {}
                                cell.style.font.strike = true;
                            }
                            if(cellstyle.underline){
                                cell.style.font = cell.style.font || {}
                                cell.style.font.underline = true;
                            }
                            if(cellstyle.textwrap){
                                cell.style.alignment = cell.style.alignment || {}
                                cell.style.alignment.wrapText = true
                            }

                            if(cellstyle.align !== undefined) {
                                cell.style.alignment = cell.style.alignment || {}
                                cell.style.alignment.horizontal = cellstyle.align;
                            }

                            if (cellstyle.valign !== undefined) {
                                cell.style.alignment = cell.style.alignment || {}
                                cell.style.alignment.vertical = cellstyle.valign;
                            }

                            if(cellstyle.format  !== undefined && cellstyle.format !== "") {
                                cell.style.numFmt = cellstyle.format;
                                // if(cellstyle.format === "percent") {
                                //     cell.style.numFmt = "0.00%"
                                // } else if (cellstyle.format === "eur") {
                                //     cell.style.numFmt = `#,##0.00 "€"`
                                // } else if (cellstyle.format === "usd") {
                                //     cell.style.numFmt = `#,##0.00 "$"`
                                // } else if (cellstyle.format === "date") {
                                //     cell.style.numFmt === "mm-dd-yy"
                                // } else if (cellstyle.format === "time") {
                                //     cell.style.numFmt === "[$-F400]h:mm:ss AM/PM"
                                // }
                            } 
                    
                        }

                        
                        

                        // cell.numFmt = "00.00"
                    }
                }
            }
        }

        const merges = ssheet.merges;
        if(merges){
            merges.forEach(merge => {
                wsheet.mergeCells(merge);
            })
        }
    }

    // workbook.creator
    // workbook.category
    // workbook.company
    // workbook.created // Date
    // workbook.creator
    // workbook.keywords
    // workbook.lastModifiedBy
    // workbook.manager
    // workbook.modified // Date
    // workbook.subject
    // workbook.title

    return workbook;
}
