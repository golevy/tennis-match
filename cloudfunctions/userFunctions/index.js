const fetchUserProfile = require("./fetchUserProfile/index");
const addActiveTimestamp = require("./addActiveTimestamp/index");
const deleteActiveTimestamp = require("./deleteActiveTimestamp/index");

exports.main = async (event, context) => {
  const data = event.data;
  switch (event.action) {
    case "fetchUserProfile":
      return await fetchUserProfile.main(data, context);
    case "addActiveTimestamp":
      return await addActiveTimestamp.main(data, context);
    case "deleteActiveTimestamp":
      return await deleteActiveTimestamp.main(data, context);
  }
};
