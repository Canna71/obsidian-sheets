import SheetjsPlugin from "src/main";
import { App, PluginSettingTab, Setting } from "obsidian";


export class SheetjsSettingsTab extends PluginSettingTab {
	plugin: SheetjsPlugin;

	constructor(app: App, plugin: SheetjsPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Sheetjs Settings'});

        this.createToggle(containerEl, "Add Ribbon Icon",
            "Adds an icon to the ribbon to launch scan",
            "addRibbonIcon"
        );

        this.createToggle(containerEl, "Show Sheetjs Sidebar",
        "Opens Sheetjs sidebar at startup",
        "showAtStartUp"
    	);

       
	}

    private createToggle(containerEl: HTMLElement, name: string, desc: string, prop: string) {
		new Setting(containerEl)
			.setName(name)
			.setDesc(desc)
			.addToggle(bool => bool
				.setValue((this.plugin.settings as any)[prop] as boolean)
				.onChange(async (value) => {
					(this.plugin.settings as any)[prop] = value;
					await this.plugin.saveSettings();
					this.display();
				})
			);
	}
}
