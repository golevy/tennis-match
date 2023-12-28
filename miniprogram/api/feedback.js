export const feedback = function feedback(data) {
  return wx.cloud.callFunction({
    name: "feedbackFunctions",
    data,
  });
};
