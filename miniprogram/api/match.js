export const matchUsers = function matchUsers(data) {
  return wx.cloud.callFunction({
    name: 'matchFunctions',
    data: data,
  })
}
