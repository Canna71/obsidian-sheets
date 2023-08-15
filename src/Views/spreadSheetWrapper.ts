// import { Spreadsheet } from 'x-data-spreadsheet';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkdownPostProcessorContext, MarkdownView, Notice, debounce, stringifyYaml } from "obsidian";
import * as XLSX from "xlsx";
import { xtos } from "../utils/xlsxpread";
import { toExcelJS } from "src/utils/excelConverter";
import { SheetData, SpreadsheetData } from "x-data-spreadsheet";
// HACK
import  Spreadsheet from "x-data-spreadsheet";
import { getSheetjsSettings } from "src/main";
// import * as Spreadsheet from "x-data-spreadsheet";
// const { Spreadsheet } = require("x-data-spreadsheet");


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

    // const data: SheetData[] = prepareDataForLoading(options.data as SpreadsheetData)

    const spreadSheet = new Spreadsheet(
        container,
        spreadsheet_options
    )
    // .loadData(options.data || {});

    const settings = getSheetjsSettings()

    prepareDataForLoading(spreadSheet, options.data as SpreadsheetData)


    if(settings.autoSave) {
        spreadSheet.change(
            debounce((_data) => {
                // save data
                if (options.filename && settings.enableSaveToFile) {
                    saveToFile(spreadSheet, options.filename);
                } else {
                    // at the moment we avoid since this would cause re-rendering
                    // saveDataIntoBlock(null,null,ctx)
                }

                // XLSX.writeFile(xtos(s.getData(data)) as any, filename);
            }, 1000)
        );


    }

    return spreadSheet;
}


export function saveDataIntoBlock(
    data: any,
    sheet: any,
    ctx: MarkdownPostProcessorContext
) {
    const s = (ctx as any).spreadsheet as Spreadsheet;
    const dts = prepareDataForSaving( s );

    const view = app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) return;
    if (view.getMode() === "source") {
        const sec = ctx.getSectionInfo((ctx as any).el as HTMLElement);
        if (sec) {
            const obj = { data: dts };
            const yaml = stringifyYaml(obj) + "\n";
            view?.editor.replaceRange(
                yaml,
                { line: sec?.lineStart + 1, ch: 0 },
                { line: sec?.lineEnd, ch: 0 },
                "*"
            );
            console.info("Data saved on code block");
        }
    } else {
        // preview
        new Notice("Sheet not saved while in reading mode");
    }
}


export async function saveToFile(spreadSheet: Spreadsheet, filename: string) {

    const spreadsheetData = spreadSheet.getData() as any[];
    const bookType = resolve_book_type(filename);
    if(bookType === 'xlsx' || bookType === 'csv'){
        const workbook = toExcelJS(spreadsheetData);
        if(bookType === 'xlsx'){
            const buffer = await workbook.xlsx.writeBuffer();
            app.vault.adapter.writeBinary(filename, buffer);
        } else {
            const buffer = await workbook.csv.writeBuffer();
            app.vault.adapter.writeBinary(filename, buffer);
        }

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


export function prepareDataForSaving(spreadSheet: Spreadsheet): SpreadsheetData {
    const data = spreadSheet.getData() as SheetData[];
    
    // get some info
    const selector = (spreadSheet as any).sheet.data.selector;
    const sheetName = (spreadSheet as any).sheet.data.name;
    
    

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

    const spreadSheetData : SpreadsheetData = {...data}

    spreadSheetData.state = {
        sheetName,
        selector
    }

    return spreadSheetData;
}

function prepareDataForLoading(spreadsheet:Spreadsheet, spreadSheetData: SpreadsheetData): Spreadsheet {
    if(spreadSheetData === undefined){
        return spreadsheet.loadData({});
    } else {
        const sheets = []
        for(const sheetId in spreadSheetData){
            const sheetNum = Number(sheetId)
            if(!isNaN(sheetNum)){
                sheets[sheetNum] = spreadSheetData[sheetId]
            }
        }
        spreadsheet.loadData(sheets);
        if(spreadSheetData.state?.sheetName){
            // const d = this.datas[index];
            // this.sheet.resetData(d);
            const s = (spreadsheet as any);
            // const d = s.datas.find(d => d.name === spreadSheetData.state?.sheetName)
            const i = s.datas.findIndex((d:any) => d.name === spreadSheetData.state?.sheetName)
            
            const d = s.datas[i];
            const selector = spreadSheetData.state?.selector
            if(selector){
                // d.selector = spreadSheetData.state?.selector; 
                d.selector.setIndexes(selector.ri, selector.ci);
                d.selector.range.sci = selector.range.sci;
                d.selector.range.sri = selector.range.sri;
                d.selector.range.eci = selector.range.eci;
                d.selector.range.eri = selector.range.eri;
                d.selector.range.h = selector.range.h;
                d.selector.range.w = selector.range.w;

            }
            if(i>=0){
                // TODO: provide an ad hoc method in x-spreadsheet
                s.bottombar.clickSwap2(s.bottombar.items[i]); 
            }
            
        }
        return spreadsheet;
    }
}
