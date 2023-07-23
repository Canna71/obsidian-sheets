// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";

export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {
    

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth =   Math.clamp((ctx as any).containerEl.offsetWidth, 200,700) ;

    // const s = new Spreadsheet("#x-spreadsheet-demo")
    // .loadData({}) // load data
    // .change(data => {
    //   // save data to db
    // });
  
      // data validation


    // const root = createRoot(el);
    const s = new Spreadsheet(el);
    console.log(`spreadsheet`, s)
}
