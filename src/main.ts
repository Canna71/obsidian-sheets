import { DEFAULT_SETTINGS, SheetjsSettings } from "src/Settings";
import { addIcon, MarkdownView } from "obsidian";


// import { MathResult } from './Extensions/ResultMarkdownChild';
/* eslint-disable @typescript-eslint/no-unused-vars */
import {
    App,
    finishRenderMath,
    loadMathJax,
    Modal,
    Plugin,
    WorkspaceLeaf,
} from "obsidian";
import { SheetjsSettingsTab } from "src/SettingTab";
import { processCodeBlock } from "./Views/SheetView";


const sheetSVG = `<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 482.81 482.81" xml:space="preserve"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M464.764,25.771H18.037C8.086,25.771,0,33.869,0,43.808v395.196c0,6.106,3.068,11.491,7.729,14.76v2.843h6.469 c1.241,0.272,2.518,0.432,3.839,0.432h446.738c1.318,0,2.595-0.159,3.83-0.432h0.887v-0.271 c7.654-2.093,13.317-9.032,13.317-17.331V43.813C482.81,33.869,474.717,25.771,464.764,25.771z M467.347,43.813v51.979H348.363 v-54.56h116.4C466.194,41.233,467.347,42.392,467.347,43.813z M466.105,441.145H348.363V392.18h118.983v46.824 C467.347,439.92,466.832,440.695,466.105,441.145z M15.457,439.004V392.18h55.842v48.965H16.698 C15.971,440.695,15.457,439.92,15.457,439.004z M201.448,256.87v53.61H86.758v-53.61H201.448z M86.758,241.407v-57.99h114.689 v57.99H86.758z M201.448,325.943v50.773H86.758v-50.773H201.448z M201.448,392.18v48.965H86.758V392.18H201.448z M216.913,392.18 H332.9v48.965H216.913V392.18z M216.913,376.717v-50.779H332.9v50.779H216.913z M216.913,310.48v-53.61H332.9v53.61H216.913z M216.913,241.407v-57.99H332.9v57.99H216.913z M216.913,167.954v-56.702H332.9v56.702H216.913z M216.913,95.787v-54.56H332.9 v54.56H216.913z M201.448,95.787H86.758v-54.56h114.689V95.787z M201.448,111.252v56.702H86.758v-56.702H201.448z M71.299,167.954 H15.457v-56.702h55.842V167.954z M71.299,183.417v57.99H15.457v-57.99H71.299z M71.299,256.87v53.61H15.457v-53.61H71.299z M71.299,325.943v50.773H15.457v-50.773H71.299z M348.363,376.717v-50.779h118.983v50.779H348.363z M348.363,310.48v-53.61h118.983 v53.61H348.363z M348.363,241.407v-57.99h118.983v57.99H348.363z M348.363,167.954v-56.702h118.983v56.702H348.363z"></path> </g> </g></svg>
`;

// Remember to rename these classes and interfaces!

let gSettings: SheetjsSettings;

export function getSheetjsSettings() { return gSettings; }
export default class SheetjsPlugin extends Plugin {
    settings: SheetjsSettings;
 
    async onload() {
        await this.loadSettings();


        addIcon("sheet",sheetSVG); 


        if (this.settings.addRibbonIcon) {
            // This creates an icon in the left ribbon.
            const ribbonIconEl = this.addRibbonIcon(
                "sheet",
                "Add Sheet",
                (evt: MouseEvent) => {
                    this.addTable();
                }
            );
            // Perform additional things with the ribbon
            ribbonIconEl.addClass("Sheetjs-ribbon-class");
        }

        this.addCommand({
            id: "add-sheet-table",
            name: "Add Sheet Table",
            callback: () => this.addTable(),
          });
         

        this.app.workspace.onLayoutReady(() => {

        });

        this.registerCodeBlock();
        this.registerPostProcessor();
        this.registerEditorExtensions();

        this.app.workspace.on(
            "active-leaf-change",
            (leaf: WorkspaceLeaf | null) => {
                // console.log("active-leaf-change", leaf);
                if (leaf?.view instanceof MarkdownView) {
                    // @ts-expect-error, not typed
                    const editorView = leaf.view.editor.cm as EditorView;
                    
                }
            },
            this
        );

        this.app.workspace.on(
            "codemirror",
            (cm: CodeMirror.Editor) => {
                console.log("codemirror", cm);
            },
            this
        );

        this.addSettingTab(new SheetjsSettingsTab(this.app, this));
    }


    addTable() {
        throw new Error("Method not implemented.");
    }

    onunload() {
    }

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
        gSettings = this.settings;
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    

    async registerCodeBlock() {
        await loadMathJax();
        await finishRenderMath();
        this.registerMarkdownCodeBlockProcessor(
            "sheet",
            (source, el, ctx) => {
                processCodeBlock(source, el, this.settings, ctx);
            }
        );
    }

    async registerPostProcessor() {
        console.log("registerPostProcessor");
        // await loadMathJax();
        // await finishRenderMath();
        // this.registerMarkdownPostProcessor(getPostPrcessor(this.settings));
    }

    async registerEditorExtensions() {
        // this.registerEditorExtension([resultField, SheetjsConfigField]);
    }
}


