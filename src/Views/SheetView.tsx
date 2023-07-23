// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";

export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth = Math.clamp((ctx as any).containerEl.offsetWidth, 200, 700);
    const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 700);


    // const s = new Spreadsheet("#x-spreadsheet-demo")
    // .loadData({}) // load data
    // .change(data => {
    //   // save data to db
    // });

    // data validation

    const container = el.createDiv()
    container.style.width = "100%";
    container.style.height = "800px";
    // container.style.position="relative";
    // const root = createRoot(el);
    const s = new Spreadsheet(container, {
        mode: 'edit', // edit | read
        showToolbar: true,
        showGrid: true,
        showContextmenu: true,
        view: {
            height: () => containerHeight,
            width: () =>  containerWidth
        },

        row: {
            len: 100,
            height: 25,
        },
        col: {
            len: 26,
            width: 100,
            indexWidth: 60,
            minWidth: 60,
        },
        style: {
            bgcolor: '#ffffff',
            align: 'left',
            valign: 'middle',
            textwrap: false,
            strike: false,
            underline: false,
            color: '#0a0a0a',
            font: {
                name: 'Helvetica',
                size: 10,
                bold: false,
                italic: false,
            },
        },
    })
    .loadData({

    })
    .change(data => {
        // save data 
        console.log(data)
      });
    
    console.log(`spreadsheet`, s)
}
