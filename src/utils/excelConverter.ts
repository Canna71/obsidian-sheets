/* eslint-disable @typescript-eslint/no-explicit-any */
import {  Borders, Workbook } from "exceljs";
import { convertThemeColorToRGB, rgbToHex } from "./excelColors";
import { CellData, CellStyle, RowData, SheetData } from "x-data-spreadsheet";

declare module "x-data-spreadsheet" {
    interface RowData {
        height?: number;
    }

   
}

type borderDir = "top"|"bottom"|"left"|"right";

export function toSpreadsheet(wb: Workbook) {

    function mapColor(oStyle: CellStyle,border: Partial<Borders>, what: borderDir){
        if(border[what] && border[what].style && oStyle.border){
            oStyle.border[what] = [
                border[what].style?.toString(),
                "#" + getColor(border[what].color)
            ]
        }
    }

    console.log(wb);

    const out = wb.worksheets.map((ws) => {
        const ows : SheetData = {
            name: ws.name,
            rows: {},
            cols: {},
            merges: [] ,
            
            // freezes:
        };

        ows.styles = [];

        for(const col of ws.columns){
            if(col.width && ows.cols && col.number) {
                ows.cols[col.number-1] = {width: width2px(col.width)}
            }
        } 

        ws.eachRow((row, rowNumber) => {
            const rowId = (row.number - 1);
            const rowob: RowData = {
                cells: {}
            };
           
            if(ows.rows){
                ows.rows[rowId] = rowob;
            }
            if(row.height){
                // px = pt * ( 72pt / 96 )

                rowob.height = pt2px(row.height);
            }
            if(row.hidden) {
                rowob.hidden = true;
                // TODO: implementit!
            }

            row.eachCell((cell, cellNumber) => {
                const cellOb : CellData = {
                    text: cell.text
                } ;
                if (cell.formula) cellOb.text = "=" + cell.formula;

                // style
                const oStyle: CellStyle = {};
                if (cell.style.fill) {
                    if (cell.style.fill.type === "pattern") {
                        const fgColor = cell.style.fill.fgColor;
                        if (fgColor) {
                            const hexColor = getColor(fgColor);
                            if(hexColor) {
                                oStyle.bgcolor = "#" + hexColor;
                            }
                        }
                    }
                    
                }

                if (cell.style.border) {



                    const border = cell.style.border;
                    console.log(border)
                    oStyle.border = {};
                    ["top","bottom","left","right"].forEach(what=>{
                        mapColor(oStyle,border,what as borderDir);
                    })
                    // if(border.bottom && border.bottom.style){
                    //     oStyle.border.bottom = [
                    //         border.bottom.style?.toString(),
                    //         "#" + getColor(border.bottom.color)
                    //     ]
                    // }
                }
                if (cell.style.font) {
                    const font = cell.style.font;
                    
                    if(font.bold) {
                        oStyle.font = oStyle.font || {}
                        oStyle.font.bold = true;
                    }
                    if(font.color) {
                        const hexColor = getColor(font.color);
                        if(hexColor) {
                            oStyle.color = "#" + hexColor;
                        }
                    }
                    if(font.italic) {
                        oStyle.font = oStyle.font || {};
                        // oStyle.font
                        (oStyle.font).italic = true;
                    }
                    if(font.strike) {
                        (oStyle).strike = true;
                    }
                    if(font.underline) {
                        (oStyle).underline = true;
                    }
                    if(font.name) {
                        oStyle.font = oStyle.font || {};
                        (oStyle.font).name = font.name;
                    }
                    if(font.family){
                        oStyle.font = oStyle.font || {};
                        oStyle.font.family = font.family;
                    }
                    if(font.size) {
                        oStyle.font = oStyle.font || {};
                        (oStyle.font).size = font.size;
                    }
                    // if(font.vertAlign) {
                    //     console.log("here");
                    // }
                }
                if (cell.style.alignment) {
                    //
                    const alig = cell.style.alignment
                    if(alig.vertical){
                        (oStyle as any).valign = alig.vertical;
                    }
                    if(alig.horizontal){
                        (oStyle as any).align = alig.horizontal;
                    }
                    if(cell.style.alignment.wrapText) {
                        oStyle.textwrap = true;
                    }

                }
                if (cell.style.numFmt) {
                    const numFmt = cell.style.numFmt;
                    if(numFmt.endsWith('%')){
                        (oStyle as any).format = 'percent';
                        // TODO: 0.00%
                    } else if (numFmt.contains('€')) {
                        (oStyle as any).format = 'eur';
                    } else if (numFmt.contains('$')) {
                        (oStyle as any).format = 'usd';
                    } else if (numFmt === "@") {
                        (oStyle as any).format = 'text';
                    }
                    // TODO: dates mm-dd-yy
                    // TODO: [$-F800]dddd, mmmm dd, yyyy
                    // TODO: 0.00
                    // TODO: [$-F400]h:mm:ss AM/PM
                    // TODO: 0.00E+00
                    console.log(numFmt)
                }
                if (cell.style.protection) {
                    //TODO:
                }

                if(Object.keys(oStyle).length>0 && ows.styles){
                    const j = JSON.stringify(oStyle)
                    let styleIndex = ows.styles.findIndex(s =>
                        JSON.stringify(s) == j
                    )
                    if(styleIndex<0) {
                        ows.styles?.push(oStyle);
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
    console.log(out);
    return out;
}
function pt2px(pt: number) {
    return Math.round(pt * 1.33333);
}

function width2px(w: number) {
    // TODO: get actual character width
    // 10 units = 64px
    return Math.round(w * 6.4);
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

