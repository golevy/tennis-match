// components/levelSlider/levelSlider.js
Component({
  /**
   * Component properties
   */
  properties: {
    tennisLevel: {
      type: String,
      value: "",
    },
  },

  /**
   * Component initial data
   */
  data: {
    level: "2.0",
  },

  /**
   * Component methods
   */
  methods: {
    levelChange(level) {
      this.triggerEvent("levelChange", { value: level });
    },

    onChange(event) {
      this.setData({
        level: event.detail.toFixed(1),
      });
      this.levelChange(this.data.level);
    },

    onDrag(e) {
      this.setData({
        level: e.detail.value.toFixed(1),
      });
      this.levelChange(this.data.level);
    },
  },
});
