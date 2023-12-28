import { feedback } from "../../api/feedback";

const app = getApp();

Page({
  /**
   * Page initial data
   */
  data: {
    problemList: [{ text: "UX/UI相关" }, { text: "与预期不符" }, { text: "建议新功能" }, { text: "其他问题" }],
    isSuccessed: true,
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad(options) {},

  selectProblem(e) {
    const { text } = e.currentTarget.dataset;
    this.setData({
      selectedProblem: text,
    });
  },

  handleSubmit(e) {
    let { selectedProblem } = this.data;
    const { feedbackContent } = e.detail.value;
    const { nickname, _openid } = wx.getStorageSync("userInfo");
    console.log(selectedProblem, feedbackContent, nickname, _openid);

    if (!selectedProblem) {
      wx.showToast({
        title: "请选择问题类型",
        icon: "none",
      });
      return;
    }

    if (!feedbackContent) {
      wx.showToast({
        title: "请填写问题描述",
        icon: "none",
      });
      return;
    }

    feedback({
      userId: _openid,
      userName: nickname,
      feedbackType: selectedProblem,
      feedbackContent,
    }).then((res) => {
      this.setData({
        isSuccessed: false,
      });
    });
  },

  closeDialog() {
    wx.navigateBack();
  },
});
