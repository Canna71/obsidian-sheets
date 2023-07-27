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

function onElementRemoved(element, callback) {
    new MutationObserver(function (mutations) {
        if (!document.body.contains(element)) {
            callback();
            this.disconnect();
        }
    }).observe(element.parentElement, { childList: true });
}

export function processCodeBlock(source: string, el: HTMLElement, settings: SheetjsSettings, ctx: MarkdownPostProcessorContext) {


    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const containerWidth = Math.clamp((ctx as any).containerEl.offsetWidth, 200, 1400);
    const containerHeight = Math.clamp((ctx as any).containerEl.offsetHeight, 200, 800);
    // TODO: check this actually exists
    let bgColor = "#ffffff";
    let fgColor = "#0a0a0a";
    const cel = document.getElementsByClassName("view-content")[0]
    if (cel) {
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

    if (!filename) {
        // body > div.app-container > div.horizontal-main-container > div > div.workspace-split.mod-vertical.mod-root > div > div.workspace-tab-container > div.workspace-leaf.mod-active > div > div.view-content > div.markdown-source-view.cm-s-obsidian.mod-cm6.is-folding.is-live-preview.node-insert-event > div > div.cm-scroller > div.cm-sizer > div.cm-contentContainer > div > div.cm-preview-code-block.cm-embed-block.markdown-rendered > div.block-language-sheet > div > div > div.x-spreadsheet-toolbar > div > div:nth-child(3)
        const toolbar = s.getElementBySelector(".x-spreadsheet-toolbar")
    }

    // TODO: wait for data to be loaded before creating the spreadsheet
    if (filename) {
        (async () => {
            if (filename) {
                const data = await app.vault.adapter.readBinary(filename)
                s.loadData(stox(XLSX.read(data)));
            }

        })();
    } else {
        if (data) {
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
