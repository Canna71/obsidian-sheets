/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkdownPostProcessorContext, debounce } from "obsidian";
import Spreadsheet from "x-data-spreadsheet";
import * as XLSX from "xlsx";
import { xtos } from "../utils/xlsxpread";
import { toExcelJS } from "src/utils/excelConverter";
import { SheetData } from "x-data-spreadsheet";


function resolve_book_type(fileName: string): XLSX.BookType {
    const _BT: any = {
        xls: "biff8",
        htm: "html",
        slk: "sylk",
        socialcalc: "eth",
        Sh33tJS: "WTF",
    };
    let bookType = "xlsx";
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    if (ext.match(/^\.[a-z]+$/)) {
        bookType = ext.slice(1);
    }
    bookType = _BT[bookType] || bookType;
    return bookType as XLSX.BookType;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function applyStyles(ssdata: any, wb: XLSX.WorkBook) {
    console.log(ssdata, wb);
    for (const sheet of ssdata) {
        const { name, styles, rows } = sheet;
        for (const rowId in rows) {
            const cells = rows[rowId]["cells"];
            for (const cellId in cells) {
                const cell = cells[cellId];
                if (cell.style !== undefined) {
                    const wbStyle = styleSS2WB(styles[cell.style]);
                    //TODO: apply to the right WB cell
                    const cellRef = XLSX.utils.encode_cell({
                        r: Number(rowId),
                        c: Number(cellId),
                    });
                    wb.Sheets[name][cellRef].s = wbStyle;
                }
            }
        }
    }
}




export interface SheetOptions {
    filename?: string;
    data?: any;
}

export function createSpreadSheet(
    container: HTMLElement,
    spreadsheet_options: any,
    options: SheetOptions,
    ctx: MarkdownPostProcessorContext
) {
    const spreadSheet = new Spreadsheet(
        container,
        spreadsheet_options
    ).loadData(options.data || {});
    spreadSheet.change(
        debounce((_data) => {
            // save data
            // console.log(data)
            if (options.filename) {
                saveToFile(spreadSheet, options.filename);
            } else {
                // at the moment we avoid since this would cause re-rendering
                // saveDataIntoBlock(null,null,ctx)
            }

            // XLSX.writeFile(xtos(s.getData(data)) as any, filename);
        }, 1000)
    );

    return spreadSheet;
}

export async function saveToFile(spreadSheet: Spreadsheet, filename: string) {

    const spreadsheetData = spreadSheet.getData() as any[];
    const bookType = resolve_book_type(filename);
    if(bookType === 'xlsx' || bookType === 'csv'){
        const workbook = toExcelJS(spreadsheetData);
        const buffer = await workbook.xlsx.writeBuffer();
        app.vault.adapter.writeBinary(filename, buffer);
        console.log(`data saved tp ${filename}`);
    } else {
        const wb = xtos(spreadsheetData) as XLSX.WorkBook;
        // applyStyles(spreadsheetData, wb);
        const bytes = XLSX.write(wb, {
            bookType: bookType,
            type: "buffer",
            compression: true,
            bookSST: true,
            cellStyles: true,
        });
        app.vault.adapter.writeBinary(filename, bytes);
        console.log(`data saved tp ${filename}`);
    }


    
    
    
    
    // fs.writeFile(filename,bytes);
    
}

function styleSS2WB(ssstyle: any) {
    const style: any = { patternType: "solid" };
    if (ssstyle.bgcolor) {
        style.bgColor = {
            rgb: ssstyle.bgcolor.substring(1),
        };
    }

    if (ssstyle.color) {
        style.fgColor = {
            rgb: ssstyle.color.substring(1),
        };
    }
    return style;
}


export function prepareDataForSaving(data: SheetData[]): SheetData[] {

    for(const sheet of data){
        const actualStyles = [];
        const usedStyles = new Map<number, number>();
        if(sheet.styles !== undefined) {
            for(const rowId in sheet.rows) {
                const rowNum = Number(rowId)
                if(!isNaN(rowNum)) {
                    const row = sheet.rows[rowNum];
                    for(const cellId in row.cells) {
                        const cellNum = Number(cellId);
                        const cell = row.cells[cellNum];
                        if(cell.style !== undefined){
                            if(usedStyles.has(cell.style)){
                                cell.style = usedStyles.get(cell.style)
                            } else {
                                actualStyles.push(sheet.styles[cell.style])
                                const index = actualStyles.length-1;
                                usedStyles.set(cell.style, index)
                                cell.style = index;
                            }
                        }
                    }
                }
            }
        }
        sheet.styles = actualStyles;
    }
    return data;
}
