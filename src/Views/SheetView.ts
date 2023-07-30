import { MarkdownView, Notice } from 'obsidian';
/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from "react";
// import { createRoot } from "react-dom/client";
import {
    MarkdownPostProcessorContext,
    MarkdownView,
    debounce,
    parseYaml,
    stringifyYaml,
} from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";
// import * as fs from "fs/promises"
// import * as path from "path"

import * as XLSX from "xlsx";
import { stox, xtos } from "../utils/xlsxpread";

const saveIcon =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBzdGFuZGFsb25lPSJubyI/PjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+PHN2ZyB0PSIxNTc3MTc3MDkyOTg4IiBjbGFzcz0iaWNvbiIgdmlld0JveD0iMCAwIDEwMjQgMTAyNCIgdmVyc2lvbj0iMS4xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHAtaWQ9IjI2NzgiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPjxkZWZzPjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+PC9zdHlsZT48L2RlZnM+PHBhdGggZD0iTTIxMy4zMzMzMzMgMTI4aDU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMgODUuMzMzMzMzdjU5Ny4zMzMzMzRhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMgODUuMzMzMzMzSDIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMS04NS4zMzMzMzMtODUuMzMzMzMzVjIxMy4zMzMzMzNhODUuMzMzMzMzIDg1LjMzMzMzMyAwIDAgMSA4NS4zMzMzMzMtODUuMzMzMzMzeiBtMzY2LjkzMzMzNCAxMjhoMzQuMTMzMzMzYTI1LjYgMjUuNiAwIDAgMSAyNS42IDI1LjZ2MTE5LjQ2NjY2N2EyNS42IDI1LjYgMCAwIDEtMjUuNiAyNS42aC0zNC4xMzMzMzNhMjUuNiAyNS42IDAgMCAxLTI1LjYtMjUuNlYyODEuNmEyNS42IDI1LjYgMCAwIDEgMjUuNi0yNS42ek0yMTMuMzMzMzMzIDIxMy4zMzMzMzN2NTk3LjMzMzMzNGg1OTcuMzMzMzM0VjIxMy4zMzMzMzNIMjEzLjMzMzMzM3ogbTEyOCAwdjI1NmgzNDEuMzMzMzM0VjIxMy4zMzMzMzNoODUuMzMzMzMzdjI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjcgNDIuNjY2NjY3SDI5OC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMS00Mi42NjY2NjctNDIuNjY2NjY3VjIxMy4zMzMzMzNoODUuMzMzMzMzek0yNTYgMjEzLjMzMzMzM2g4NS4zMzMzMzMtODUuMzMzMzMzeiBtNDI2LjY2NjY2NyAwaDg1LjMzMzMzMy04NS4zMzMzMzN6IG0wIDU5Ny4zMzMzMzR2LTEyOEgzNDEuMzMzMzMzdjEyOEgyNTZ2LTE3MC42NjY2NjdhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjctNDIuNjY2NjY3aDQyNi42NjY2NjZhNDIuNjY2NjY3IDQyLjY2NjY2NyAwIDAgMSA0Mi42NjY2NjcgNDIuNjY2NjY3djE3MC42NjY2NjdoLTg1LjMzMzMzM3ogbTg1LjMzMzMzMyAwaC04NS4zMzMzMzMgODUuMzMzMzMzek0zNDEuMzMzMzMzIDgxMC42NjY2NjdIMjU2aDg1LjMzMzMzM3oiIHAtaWQ9IjI2NzkiIGZpbGw9IiMyYzJjMmMiPjwvcGF0aD48L3N2Zz4=";

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

const DEFAULT_OPTIONS = {
    height: 400,
    width: "auto",
    rows: 100,
    cols: 26, 
    fontSize: 10,
    cellHeight: 25,
    cellWidth: 100
}

interface SheetOptions {
    filename?: string;
    data?: any;
}

export function processCodeBlock(
    source: string,
    el: HTMLElement,
    settings: SheetjsSettings,
    ctx: MarkdownPostProcessorContext
) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    
    // const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 800);
    // TODO: check this actually exists
    let bgColor = "#ffffff";
    let fgColor = "#000"//"#a0a0a0";
    const cel = document.getElementsByClassName("view-content")[0];
    if (cel) {
        const styles = getComputedStyle(cel);
        bgColor = bgColor || styles.getPropertyValue("background");
        fgColor = fgColor || styles.getPropertyValue("color");
    }

   
    const options = {...DEFAULT_OPTIONS, ...parseYaml(source)};

    const { filename, height, width,rows, cols, fontSize, cellHeight, cellWidth } = options;
    const containerWidth = () => width === "auto" ? (ctx as any).containerEl.offsetWidth || 1024 : width
    

    const container = el//.createDiv();
    container.style.width = containerWidth() + "px";
    if(container.parentElement){
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
        view: {
            height: () => height,
            width: () => {
                const w  = containerWidth();
                console.log(`cotainer width: ${w}`)
                return w;
            },
        },
        row: {
            len: rows,
            height: cellHeight
        },
        col: {
            len: cols,
            width: cellWidth
        },
        style: {
            bgcolor: bgColor,
            align: "left",
            valign: "middle",
            textwrap: false,
            strike: false,
            underline: false,
            color: fgColor,
            font: {
                // name: font,
                size: fontSize,
                bold: false,
                italic: false,
            } as any,
        },
    };

    if (!filename) {
        spreadsheet_options.extendToolbar = {
            left: [
                {
                    tip: "Save",
                    icon: saveIcon,
                    onClick: saveDataIntoBlock,
                },
            ],
        };
    }

    if (filename) {
        (async () => {
            const fileContent = await app.vault.adapter.readBinary(filename);
            const data = stox(XLSX.read(fileContent,{
                cellStyles: true
            }));
            (ctx as any).spreadsheet = createSpreadSheet(
                container,
                spreadsheet_options,
                { ...options, data }
            );
            // .loadData();
        })();
    } else {
        (ctx as any).spreadsheet = createSpreadSheet(
            container,
            spreadsheet_options,
            {...options}
        ); 
    }

    // (ctx as any).spreadsheet = s;

    function saveDataIntoBlock(data: any, sheet: any) {
        const s = (ctx as any).spreadsheet;
        const dts = s.getData();
        
        const view: MarkdownView = 
            app.workspace.getActiveViewOfType(MarkdownView);
        if(view.getMode() === "source") {
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
        } else { // preview
            new Notice("Sheet not saved while in read mode");
        } 
        
    }
    // see https://docs.sheetjs.com/docs/demos/grid/xs
    // https://docs.sheetjs.com/xspreadsheet/
    // https://github.com/myliang/x-spreadsheet
    // https://forum.obsidian.md/t/saving-changes-in-codeblock-post-processor/47393
    // https://codesandbox.io/s/x-spreadsheet-react-3v1bw?file=/src/Spreadsheet.js:527-774
    // https://github.com/wolf-table/table
}

function createSpreadSheet(
    container: HTMLElement,
    spreadsheet_options: any,
    options: SheetOptions
) {
    const spreadSheet =
     new Spreadsheet(container, spreadsheet_options)
        .loadData(options.data || {});
        spreadSheet.change(
            debounce((data) => {
                // save data
                // console.log(data)
                if (options.filename) {
                    const wb = xtos(spreadSheet.getData() as any[]) as XLSX.WorkBook;
                    const bookType = resolve_book_type(options.filename);
                    const bytes = XLSX.write(wb, {
                        bookType: bookType,
                        type: "buffer",
                        compression: true,
                        bookSST: true
                    });
                    // fs.writeFile(filename,bytes);
                    app.vault.adapter.writeBinary(options.filename, bytes);
                    console.log(`data saved tp ${options.filename}`)
                } 

                // XLSX.writeFile(xtos(s.getData(data)) as any, filename);
            }, 1000)
        );

    return spreadSheet;
}
