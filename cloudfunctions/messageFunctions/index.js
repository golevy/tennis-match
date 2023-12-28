const sendMessage = require("./sendMessage/index");
const getMessage = require("./getMessage/index");
const getMessageList = require("./getMessageList/index");
const sendGameMessage = require("./sendGameMessage/index");

exports.main = async (event, context) => {
  const data = event.data;
  switch (event.action) {
    case "sendMessage":
      return await sendMessage.main(data, context);
    case "getMessage":
      return await getMessage.main(data, context);
    case "getMessageList":
      return await getMessageList.main(data, context);
    case "sendGameMessage":
      return await sendGameMessage.main(data, context);
  }
};
