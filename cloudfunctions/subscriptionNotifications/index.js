const newMembersJoin = require("./newMembersJoin/index");
const newMessagesSend = require("./newMessagesSend/index");

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data } = event;
  switch (action) {
    case "newMembersJoin":
      return await newMembersJoin.main(data, context);
    case "newMessagesSend":
      return await newMessagesSend.main(data, context);
  }
};
