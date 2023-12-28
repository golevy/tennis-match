import { navigateToProfileSettings } from "../navigator";
import { cloudCall, cloudFunctionCall } from "./util";

const COLLECTION_USER = "users";
const CLOUD_FUNCTION_NAME = "userFunctions";
const db = wx.cloud.database();
const app = getApp();
const _ = db.command;

function signup(user) {
  return new Promise((resolve, reject) => {
    fetchUserInfo()
      .then((userInfo) => {
        if (userInfo) {
          resolve(userInfo._id);
        } else {
          db.collection(COLLECTION_USER)
            .add({
              data: user,
            })
            .then((res) => {
              resolve(res._id);
            })
            .catch((err) => {
              reject(err);
            });
        }
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function fetchUserInfo() {
  const call = cloudCall(db.collection(COLLECTION_USER).get(), "fetchUserInfo");
  return new Promise((resolve, reject) => {
    call
      .then((data) => {
        if (data && data.length > 0) {
          const userInfo = data[0];
          app.userInfo = userInfo;
          wx.setStorageSync("userInfo", userInfo);
          resolve(userInfo);
        } else {
          resolve(null);
        }
      })
      .catch((err) => {
        reject(`fetchUserInfo failure: ${err}`);
      });
  });
}

function fetchUserProfile(userId = null) {
  if (!userId) {
    return fetchUserInfo();
  }

  const data = {
    id: userId,
  };
  return cloudFunctionCall(CLOUD_FUNCTION_NAME, "fetchUserProfile", data);
}

function fetchUserInfoOrSignup() {
  return new Promise((resolve, reject) => {
    if (app.userInfo) {
      fetchUserInfo().then((user) => {
        if (user) {
          app.userInfo = user;
          resolve(user);
        } else {
          // This shouldn't happen
        }
      });
    } else {
      navigateToProfileSettings();
    }
  });
}

function updateUserInfo(id, updateData) {
  return cloudCall(
    db.collection(COLLECTION_USER).doc(id).update({
      data: updateData,
    }),
    "updateUserInfo"
  );
}

function needAuthenticate() {
  if (!app.userInfo) {
    fetchUserInfoOrSignup().then((userInfo) => {
      if (userInfo) {
        app.userInfo = userInfo;
      }
    });

    return true;
  }

  return false;
}

function addActiveTimestamp(activeTimestamp, _id) {
  const data = {
    activeTimestamp,
    _id,
  };
  return cloudFunctionCall(CLOUD_FUNCTION_NAME, "addActiveTimestamp", data);
}

function deleteActiveTimestamp(activeTimestamp, _id) {
  const data = {
    activeTimestamp,
    _id,
  };
  return cloudFunctionCall(CLOUD_FUNCTION_NAME, "deleteActiveTimestamp", data);
}

module.exports = {
  signup,
  fetchUserInfo,
  fetchUserProfile,
  fetchUserInfoOrSignup,
  updateUserInfo,
  needAuthenticate,
  addActiveTimestamp,
  deleteActiveTimestamp,
};
