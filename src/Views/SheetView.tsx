/* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from "react";
// import { createRoot } from "react-dom/client";
import { MarkdownPostProcessorContext, MarkdownView, debounce, parseYaml, stringifyYaml } from "obsidian";
import { SheetjsSettings } from "src/Settings";
import Spreadsheet from "x-data-spreadsheet";
// import "x-data-spreadsheet/dist/xspreadsheet.css";
// import * as fs from "fs/promises"
// import * as path from "path"

import * as XLSX from "xlsx"
import { stox, xtos } from "../utils/xlsxpread"

function resolve_book_type(fileName: string): XLSX.BookType {
    const _BT: any = {
        "xls": "biff8",
        "htm": "html",
        "slk": "sylk",
        "socialcalc": "eth",
        "Sh33tJS": "WTF"
    };
    let bookType = "xlsx";
    const ext = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
    if (ext.match(/^\.[a-z]+$/)) {
        bookType = ext.slice(1)
    }
    bookType = _BT[bookType] || bookType;
    return bookType as XLSX.BookType;
}



export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth = Math.clamp((ctx as any).containerEl.offsetWidth, 200, 1400);
    const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 800);
    // TODO: check this actually exists
    let bgColor = "#ffffff" ;
    let fgColor = "#0a0a0a" ;
    const cel = document.getElementsByClassName("view-content")[0]
    if(cel){
        const styles = getComputedStyle(cel);
        bgColor = "#ffffff" || styles.getPropertyValue('background');
        fgColor = "#0a0a0a" || styles.getPropertyValue("color")
    }
    
   
    // const font = "Sans Serifs" || styles.getPropertyValue('font');

    // if((ctx as any).containerEl.getElementsByClassName("x-spreadsheet").length){
    //     return;
    // }

    // const s = new Spreadsheet("#x-spreadsheet-demo")
    // .loadData({}) // load data
    // .change(data => {
    //   // save data to db
    // });

    // data validation

    // const filename = `/Users/gcannata/Documents/Obsidian Vault/Dev Vault/Dev/.obsidian/plugins/obsidian-sheetjs/SampleData.xlsx`;


    const options = parseYaml(source) || {}

    const { filename, data } = options;
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
            // console.log(data)
            const wb = xtos(s.getData() as any[]) as XLSX.WorkBook;
            if (filename) {
                const bookType = resolve_book_type(filename);
                const bytes = XLSX.write(wb, {
                    bookType: bookType,
                    type: "buffer"
                });
                // fs.writeFile(filename,bytes);
                app.vault.adapter.writeBinary(filename, bytes)
            } else {
             //                
            }
 
            // XLSX.writeFile(xtos(s.getData(data)) as any, filename);
        }, 1000));
        
        if(!filename){
            el.onblur =  (e)=>{
                const wb = xtos(s.getData() as any[]) as XLSX.WorkBook;
                const data = XLSX.write(wb, {
                    bookType: "xlsx",
                    type: "base64"
                }); 
                // view contains the editor to change the markdown
                const view : MarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
                // the context contains the begin and end of the block in the markdown file
                const sec = ctx.getSectionInfo((ctx as any).el as HTMLElement);
                // const lineno = sec?.lineStart + (i + 1);
                // let line = view?.editor.getLine(lineno).split(",");
                // line[j] = ev.currentTarget.value;
                if(sec){
                    const obj = {data}
                    const yaml = stringifyYaml(obj)+"\n"
                    view?.editor.replaceRange(yaml,{line:sec?.lineStart+1,ch:0},{line: sec?.lineEnd,ch: 0},"*")
                    console.log("Data saved on code block")
                }
                }

        } 

    // TODO: wait for data to be loaded before creating the spreadsheet
    if (filename) {
        (async () => {
            if(filename){
                const data = await app.vault.adapter.readBinary(filename)
                s.loadData(stox(XLSX.read(data)));
            } 

        })();
    }else {
        if(data){
            s.loadData(stox(XLSX.read(data)))
        }
    }

    (ctx as any).spreadsheet = s;

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
