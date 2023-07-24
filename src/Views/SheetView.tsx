// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";
import * as fs from "fs/promises"
import * as XLSX from "xlsx"
import { stox, xtos } from "../utils/xlsxpread"

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
        .change(data => {
            // save data 
            console.log(data)
            XLSX.writeFile(xtos(data) as any, `C:\\Users\\hh7gabcannat\\Projects\\Personal\\obsidian-dev\\DEV\\.obsidian\\plugins\\obsidian-sheetjs\\SampleData.xlsx`);
        });

    (async () => {
        // const ab = await (await fetch("https://sheetjs.com/pres.numbers")).arrayBuffer();
        //ctx.sourcePath
        // TODO: take relative path
        const data = await fs.readFile(`C:\\Users\\hh7gabcannat\\Projects\\Personal\\obsidian-dev\\DEV\\.obsidian\\plugins\\obsidian-sheetjs\\SampleData.xlsx`)
        s.loadData(stox(XLSX.read(data)));
    })();

    // see https://docs.sheetjs.com/docs/demos/grid/xs
    // https://docs.sheetjs.com/xspreadsheet/
    // https://github.com/myliang/x-spreadsheet
    
    console.log(`spreadsheet`, s)
}
