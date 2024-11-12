'use strict';  
  const obsidian = require('obsidian');
  class TouchZoomSettings {
    constructor() {
      this.zoomSensitivity = 0.05; // حساسية التكبير الافتراضية
      this.maxZoom = 3.0;          // الحد الأقصى للتكبير الافتراضي
      this.minZoom = 0.5;          // الحد الأدنى للتصغير الافتراضي
    }
  }
  
  class TouchZoomPlugin extends Plugin {
    async onload() {
      // تحميل الإعدادات
      this.settings = Object.assign(new TouchZoomSettings(), await this.loadData());
  
      this.addSettingTab(new TouchZoomSettingTab(this.app, this));
  
      // تنفيذ الكود الأساسي للتكبير والتصغير باستخدام الإعدادات
      const zoomContent = (event) => {
        let scale = parseFloat(document.body.style.transform.replace('scale(', '').replace(')', '')) || 1;
        scale += this.settings.zoomSensitivity * (event.deltaY < 0 ? 1 : -1);
  
        // التحقق من القيم المدخلة لضمان أنها ضمن الحدود المسموح بها
        scale = Math.min(this.settings.maxZoom, Math.max(this.settings.minZoom, scale));
  
        document.body.style.transform = `scale(${scale})`;
        event.preventDefault();
      };
  
      this.registerDomEvent(document, "wheel", zoomContent);
    }
  
    onunload() {
      // إعادة ضبط التكبير عند إلغاء التحميل
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
  
      // إعداد حساسية التكبير
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
  
      // إعداد الحد الأقصى للتكبير، مع ضبط القيم إذا تجاوزت 9
      new Setting(containerEl)
        .setName("Max Zoom")
        .setDesc("Set the maximum zoom level (Max: 9)")
        .addSlider(slider => slider
          .setLimits(1, 9, 0.1)
          .setValue(Math.min(this.plugin.settings.maxZoom, 9)) // تأكد من أنها لا تتجاوز 9
          .onChange(async (value) => {
            this.plugin.settings.maxZoom = Math.min(value, 9);
            await this.plugin.saveSettings();
          })
        );
  
      // إعداد الحد الأدنى للتصغير، مع ضبط القيم إذا كانت أقل من 0.2
      new Setting(containerEl)
        .setName("Min Zoom")
        .setDesc("Set the minimum zoom level (Min: 0.2)")
        .addSlider(slider => slider
          .setLimits(0.2, 1, 0.1)
          .setValue(Math.max(this.plugin.settings.minZoom, 0.2)) // تأكد من أنها لا تقل عن 0.2
          .onChange(async (value) => {
            this.plugin.settings.minZoom = Math.max(value, 0.2);
            await this.plugin.saveSettings();
          })
        );
    }
  }
  module.exports = TouchZoomPlugin;  