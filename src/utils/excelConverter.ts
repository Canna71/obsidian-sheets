/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Workbook } from "exceljs";
import { convertThemeColorToRGB, rgbToHex } from "./excelColors";



export function toSpreadsheet(wb: Workbook) {



    const out = wb.worksheets.map((ws) => {
        const ows = {
            name: ws.name,
            rows: {} as any,
            merges: [] as string[],
            styles: [] as any[],
            // freezes:
        };
        ws.eachRow((row, rowNumber) => {
            const rowId = String(row.number - 1);
            const rowob: any = {
                cells: {},
            };
            ows.rows[rowId] = rowob;
            row.eachCell((cell, cellNumber) => {
                const cellOb = {
                    text: cell.text
                } as any;
                if (cell.formula) cellOb.text = "=" + cell.formula;

                // style
                const oStyle: any = {};
                if (cell.style.fill) {
                    //
                    // console.log(cell.style.fill);
                    if (cell.style.fill.type === "pattern") {
                        const fgColor = cell.style.fill.fgColor;
                        if (fgColor) {
                            if (fgColor.argb) {
                                //
                            } else if (fgColor.theme !== undefined) {
                                const theme = fgColor?.theme;
                                const tint = (fgColor as any).tint || 0;
                                const rgb = convertThemeColorToRGB(theme, tint);
                                const hex = rgbToHex(rgb[0],rgb[1],rgb[2]);
                                oStyle.bgcolor = "#" + hex;
                                
                            }
                        }
                    }
                    
                }

                if (cell.style.border) {
                    //
                }
                if (cell.style.font) {
                    //
                }
                if (cell.style.alignment) {
                    //
                }
                if (cell.style.numFmt) {
                    //
                }
                if (cell.style.protection) {
                    //
                }

                if(Object.keys(oStyle).length>0){
                    console.log(oStyle);
                    // TODO: index it and put index in cell
                    const j = JSON.stringify(oStyle)
                    let styleIndex = ows.styles.findIndex(s =>
                        JSON.stringify(s) == j
                    )
                    if(styleIndex<0) {
                        ows.styles.push(oStyle);
                        styleIndex = ows.styles.length-1;
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

    return out;
}
