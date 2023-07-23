// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";

export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {
    

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth =   Math.clamp((ctx as any).containerEl.offsetWidth, 200,700) ;

    // const s = new Spreadsheet("#x-spreadsheet-demo")
    // .loadData({}) // load data
    // .change(data => {
    //   // save data to db
    // });
  
      // data validation

    const container = el.createDiv()  
    container.style.width="100%";
    container.style.height="800px";
    // container.style.position="relative";
    // const root = createRoot(el);
    const s = new Spreadsheet(container);
    console.log(`spreadsheet`, s)
}
