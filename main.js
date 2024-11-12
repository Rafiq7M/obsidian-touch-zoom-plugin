class TouchZoomSettings {
  constructor() {
    this.zoomSensitivity = 0.05; // حساسية التكبير الافتراضية
    this.maxZoom = 3.0;          // الحد الأقصى للتكبير الافتراضي
    this.minZoom = 0.5;          // الحد الأدنى للتصغير الافتراضي
  }
}

class TouchZoomPlugin extends Plugin {
  async onload() {
    this.settings = Object.assign(new TouchZoomSettings(), await this.loadData());
    this.addSettingTab(new TouchZoomSettingTab(this.app, this));

    const zoomContent = (event) => {
      let scale = parseFloat(document.body.style.transform.replace('scale(', '').replace(')', '')) || 1;
      scale += this.settings.zoomSensitivity * (event.deltaY < 0 ? 1 : -1);
      scale = Math.min(this.settings.maxZoom, Math.max(this.settings.minZoom, scale));

      document.body.style.transform = `scale(${scale})`;
      event.preventDefault();
    };

    this.registerDomEvent(document, "wheel", zoomContent);
  }

  onunload() {
    document.body.style.transform = "scale(1)";
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class TouchZoomSettingTab extends PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Touch Zoom Settings" });

    new Setting(containerEl)
      .setName("Zoom Sensitivity")
      .setDesc("Control the sensitivity of the zoom")
      .addSlider(slider => slider
        .setLimits(0.01, 0.2, 0.01)
        .setValue(this.plugin.settings.zoomSensitivity)
        .onChange(async (value) => {
          this.plugin.settings.zoomSensitivity = value;
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Max Zoom")
      .setDesc("Set the maximum zoom level (Max: 9)")
      .addSlider(slider => slider
        .setLimits(1, 9, 0.1)
        .setValue(Math.min(this.plugin.settings.maxZoom, 9))
        .onChange(async (value) => {
          this.plugin.settings.maxZoom = Math.min(value, 9);
          await this.plugin.saveSettings();
        })
      );

    new Setting(containerEl)
      .setName("Min Zoom")
      .setDesc("Set the minimum zoom level (Min: 0.2)")
      .addSlider(slider => slider
        .setLimits(0.2, 1, 0.1)
        .setValue(Math.max(this.plugin.settings.minZoom, 0.2))
        .onChange(async (value) => {
          this.plugin.settings.minZoom = Math.max(value, 0.2);
          await this.plugin.saveSettings();
        })
      );
  }
}

module.exports = TouchZoomPlugin;
