import SheetjsPlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";

export class SheetjsSettingsTab extends PluginSettingTab {
    plugin: SheetjsPlugin;

    constructor(app: App, plugin: SheetjsPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();


        this.createToggle(
            containerEl,
            "Enable saving to file",
            "Enabling saving to external files (.xlsx, .xls, ,.csv)",
            "enableSaveToFile"
        );

        this.createToggle(
            containerEl,
            "Auto save",
            "Saves automatically",
            "autoSave"
        );
    }

    private createToggle(
        containerEl: HTMLElement,
        name: string,
        desc: string,
        prop: string
    ) {
        new Setting(containerEl)
            .setName(name)
            .setDesc(desc)
            .addToggle((bool) =>
                bool
                    .setValue((this.plugin.settings as any)[prop] as boolean)
                    .onChange(async (value) => {
                        (this.plugin.settings as any)[prop] = value;
                        await this.plugin.saveSettings();
                        this.display();
                    })
            );
    }
}
