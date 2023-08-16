/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from "react";
// import { createRoot } from "react-dom/client";
// https://github.com/exceljs/exceljs#reading-xlsx
import {
    MarkdownPostProcessorContext,
    parseYaml
} from "obsidian";
import { SheetsSettings } from "src/Settings";
// import "x-data-spreadsheet/dist/xspreadsheet.css";
// import * as fs from "fs/promises"
// import * as path from "path"

import * as XLSX from "xlsx";
import * as ExcelJS from "exceljs";
import { stox } from "../utils/xlsxpread";
import { toSpreadsheet } from "src/utils/excelConverter";
import {
    createSpreadSheet,
    
    saveDataIntoBlock,
    
    saveToFile,
} from "./spreadSheetWrapper";
import {  Readable } from "stream";
import moment from "moment";

import saveIcon from "./save.svg";

const DEFAULT_OPTIONS = {
    height: 540,
    width: "auto",
    rows: 100,
    cols: 26,
    fontSize: 10,
    cellHeight: 25,
    cellWidth: 100,
};

const MINHEIGHT = 400;

// const saveIcon =
//     "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTc3MTc3MDkyOTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2NzgiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTIxMy4zMzMzMzMgMTI4aDU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMgODUuMzMzMzMzdjU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMgODUuMzMzMzMzSDIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMtODUuMzMzMzMzVjIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMtODUuMzMzMzMzeiBtMzY2LjkzMzMzNCAxMjhoMzQuMTMzMzMzYTI1LjYgMjUuNiAwIDAgMSAyNS42IDI1LjZ2MTE5LjQ2NjY2N2EyNS42IDI1LjYgMCAwIDEtMjUuNiAyNS42aC0zNC4xMzMzMzNhMjUuNiAyNS42IDAgMCAxLTI1LjYtMjUuNlYyODEuNmEyNS42IDI1LjYgMCAwIDEgMjUuNi0yNS42ek0yMTMuMzMzMzMzIDIxMy4zMzMzMzN2NTk3LjMzMzMzNGg1OTcuMzMzMzM0VjIxMy4zMzMzMzNIMjEzLjMzMzMzM3ogbTEyOCAwdjI1NmgzNDEuMzMzMzM0VjIxMy4zMzMzMzNoODUuMzMzMzMzdjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjcgNDIuNjY2NjY3SDI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjIxMy4zMzMzMzNoODUuMzMzMzMzek0yNTYgMjEzLjMzMzMzM2g4NS4zMzMzMzMtODUuMzMzMzMzeiBtNDI2LjY2NjY2NyAwaDg1LjMzMzMzMy04NS4zMzMzMzN6IG0wIDU5Ny4zMzMzMzR2LTEyOEgzNDEuMzMzMzMzdjEyOEgyNTZ2LTE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDQyNi42NjY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djE3MC42NjY2NjdoLTg1LjMzMzMzM3ogbTg1LjMzMzMzMyAwaC04NS4zMzMzMzMgODUuMzMzMzMzek0zNDEuMzMzMzMzIDgxMC42NjY2NjdIMjU2aDg1LjMzMzMzM3oiIHAtaWQ9IjI2NzkiIGZpbGw9IiMyYzJjMmMiPjwvcGF0aD48L3N2Zz4=";

export function processCodeBlock(
    source: string,
    el: HTMLElement,
    settings: SheetsSettings,
    ctx: MarkdownPostProcessorContext
) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars

    // const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 800);
    // TODO: check this actually exists
    // let bgColor = "#ffffff";
    // let fgColor = "#000"; //"#a0a0a0";
    // const cel = document.getElementsByClassName("view-content")[0];
    // if (cel) {
    //     const styles = getComputedStyle(cel);
    //     bgColor = bgColor || styles.getPropertyValue("background");
    //     fgColor = fgColor || styles.getPropertyValue("color");
    // }

    if ((ctx as any).spreadsheet) return;

    const options = { ...DEFAULT_OPTIONS, enableSave: settings.enableSaveToFile, autoSave: settings.autoSave, ...parseYaml(source) };

    options.height = Math.max(options.height, MINHEIGHT);

    const {
        filename,
        height,
        width,
        rows,
        cols,
        fontSize,
        cellHeight,
        cellWidth,
    } = options;
    const containerWidth = () =>
        width === "auto" ? (ctx as any).containerEl.offsetWidth || 1024 : width;

    const container = el; //.createDiv();
    container.style.width = containerWidth() + "px";
    container.tabIndex = -1;
    if (container.parentElement) {
        container.parentElement.style.overflow = "hidden";
    }

    // @ts-ignore
    const view = app.workspace.getActiveFileView();
    const mode = view?.getMode() === "source" ? "edit" : "read";

    const spreadsheet_options: any = {
        mode, // edit | read
        showToolbar: true,
        showGrid: true,
        showContextmenu: true,
        showValidation: false,
        view: {
            height: () => height,
            width: () => {
                const w = containerWidth();
                return w;
            },
        },
        row: {
            len: rows,
            height: cellHeight,
        },
        col: {
            len: cols,
            width: cellWidth,
        },
        style: {
            // bgcolor: "#fff",
            align: "left",
            valign: "middle",
            textwrap: false,
            strike: false,
            underline: false,
            // color: "#000",
            font: {
                // name: font,
                size: fontSize,
                bold: false,
                italic: false,
            } as any,
        },
        formats: [
            {
              key: 'date',
              numfmt: moment.localeData().longDateFormat('L').toLowerCase() ,
              label: moment().format("L"),
              title: 'Short Date'
            },
            {
              key: 'longdate',
              numfmt: moment.localeData().longDateFormat('LL').toLowerCase(),
              label: moment().format("LL"),
              title: 'Long Date'
            },
          ]
        // onKeyDown: (evt) => {
        // }
    };

    if (!filename || options.enableSave) {
        const el = document.createElement("div");
        el.innerHTML = saveIcon;
        spreadsheet_options.extendToolbar = {
            left: [
                {
                    tip: "Save",
                    el: el.firstChild,
                    shortcut: "Ctrl+S",
                    onClick: (s: any, d: any) => {
                        if (!filename) saveDataIntoBlock(s, d, ctx);
                        else {
                            saveToFile((ctx as any).spreadsheet, filename);
                        }
                    },
                },
            ],
        };
    }

    // setTimeout(() => {
        if (filename !== undefined) {
            (async () => {
                let data = undefined;
                try {
                    const fileContent = await app.vault.adapter.readBinary(
                        filename
                    );

                    data = await parseFileContent(filename, fileContent);
                } catch (e) {
                    console.warn(e);
                }

                (ctx as any).spreadsheet = createSpreadSheet(
                    container,
                    spreadsheet_options,
                    { ...options, data: data },
                    ctx
                );
                // .loadData();
            })();
        } else {

            let wait = 0;
            if(!(ctx as any).containerEl.offsetWidth) {
                wait = 500; // hack for first opening
            }
            setTimeout(()=>{
                (ctx as any).spreadsheet = createSpreadSheet(
                    container,
                    spreadsheet_options,
                    { ...options },
                    ctx
                );
            },wait);
            
        }
    // }, 0);

    // (ctx as any).spreadsheet = s;

    // see https://docs.sheetjs.com/docs/demos/grid/xs
    // https://docs.sheetjs.com/xspreadsheet/
    // https://github.com/myliang/x-spreadsheet
    // https://forum.obsidian.md/t/saving-changes-in-codeblock-post-processor/47393
    // https://codesandbox.io/s/x-spreadsheet-react-3v1bw?file=/src/Spreadsheet.js:527-774
    // https://github.com/wolf-table/table
}

async function parseFileContent(filename: string, fileContent: ArrayBuffer) {
    const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
    if (ext === ".xlsx" || ext === ".csv") {
        const workbook = new ExcelJS.Workbook();

        // let excelWorkbook : ExcelJS.Workbook | undefined = undefined;
        if(ext === ".csv") {
            
            await workbook.csv.read(new Readable({
                read() {
                  this.push(Buffer.from(fileContent));
                  this.push(null);
                }
              }));
            
        } else {
             await workbook.xlsx.load(fileContent);
        }
        
        const data2 = toSpreadsheet(workbook);
        return data2;
    } else {
        const xlsx = XLSX.read(fileContent, {
            cellStyles: true,
            sheetStubs: true, // >
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const data = stox(xlsx);
        return data;
    }
}
