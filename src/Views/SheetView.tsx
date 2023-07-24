// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext, debounce } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";
import * as fs from "fs/promises"
import * as path from "path"

import * as XLSX from "xlsx"
import { stox, xtos } from "../utils/xlsxpread"

function resolve_book_type(fileName: string):XLSX.BookType {
	const _BT:any = {
		"xls": "biff8",
		"htm": "html",
		"slk": "sylk",
		"socialcalc": "eth",
		"Sh33tJS": "WTF"
	};
    let bookType = "xlsx";
	const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
	if(ext.match(/^\.[a-z]+$/)) {
        bookType = ext.slice(1) 
    }
	bookType = _BT[bookType] || bookType;
    return bookType as XLSX.BookType;
}



export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth = Math.clamp((ctx as any).containerEl.offsetWidth, 200, 1400);
    const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 800);
    const cel = document.getElementsByClassName("view-content")[0]
    const styles = getComputedStyle(cel);
    const bgColor = "#ffffff" || styles.getPropertyValue('background');
    const fgColor = "#0a0a0a" || styles.getPropertyValue("color")
    const font = "Sans Serifs" || styles.getPropertyValue('font');


    // const s = new Spreadsheet("#x-spreadsheet-demo")
    // .loadData({}) // load data
    // .change(data => {
    //   // save data to db
    // });

    // data validation

    // const filename = `/Users/gcannata/Documents/Obsidian Vault/Dev Vault/Dev/.obsidian/plugins/obsidian-sheetjs/SampleData.xlsx`;

    const filename = `/stuff/Book2.xls`;
    // const filename = `/stuff/Items.csv`;
    // const filename = `/stuff/Book1.xlsx`;

    const container = el.createDiv()
    // container.style.width = "100%";
    // container.style.height = "800px";
    // container.style.position="relative";
    // const root = createRoot(el);
    const s = new Spreadsheet(container, {
        mode: 'edit', // edit | read
        showToolbar: true,
        showGrid: true,
        showContextmenu: true,
        view: {
            height: () => containerHeight,
            width: () => containerWidth
        },

        row: {
            len: 30,
            height: 25,
        },
        col: {
            len: 16,
            width: 100,
            indexWidth: 60,
            minWidth: 60,
        },
        style: {
            bgcolor: bgColor,
            align: 'left',
            valign: 'middle',
            textwrap: false,
            strike: false,
            underline: false,
            color: fgColor,
            font: {
                // name: font,
                size: 10,
                bold: false,
                italic: false,
            } as any,
        },
    })
        .loadData({

        })
        .change(debounce(data => {
            // save data 
            console.log(data)
            const wb = xtos(s.getData() as any[]) as XLSX.WorkBook;
            const bookType = resolve_book_type(filename);
            const bytes = XLSX.write(wb,{
                bookType: bookType,
                type: "buffer"
            });
            // fs.writeFile(filename,bytes);
            app.vault.adapter.writeBinary(filename,bytes)
            // XLSX.writeFile(xtos(s.getData(data)) as any, filename);
        },1000));

    (async () => {
        
        const data = await app.vault.adapter.readBinary(filename)
        s.loadData(stox(XLSX.read(data)));
    })();

    // see https://docs.sheetjs.com/docs/demos/grid/xs
    // https://docs.sheetjs.com/xspreadsheet/
    // https://github.com/myliang/x-spreadsheet
    // https://forum.obsidian.md/t/saving-changes-in-codeblock-post-processor/47393
    // https://codesandbox.io/s/x-spreadsheet-react-3v1bw?file=/src/Spreadsheet.js:527-774
    // https://github.com/wolf-table/table
    // TODO: support other formats, not only binary
    // TODO: save into code block?
    // TODO: support $A$2
}
