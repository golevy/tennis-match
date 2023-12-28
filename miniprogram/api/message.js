import { cloudFunctionCall } from "./util";
const CLOUD_FUNCTION = "messageFunctions";
const db = wx.cloud.database();

export const sendMessage = async (conversation) => {
  return await cloudFunctionCall(CLOUD_FUNCTION, "sendMessage", conversation);
};

export const sendGameMessage = async (conversation) => {
  return cloudFunctionCall(CLOUD_FUNCTION, "sendGameMessage", conversation);
};

export const getMessage = async (senderId, receiverId) => {
  const data = {
    senderId,
    receiverId,
  };
  return await cloudFunctionCall(CLOUD_FUNCTION, "getMessage", data);
};

export const getMessageList = async (_id) => {
  const data = {
    _id,
  };
  return await cloudFunctionCall(CLOUD_FUNCTION, "getMessageList", data);
};
