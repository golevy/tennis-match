const cloud = require("wx-server-sdk")
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command
const COLLECTION_NAME = "users"

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)
  const deltaLat = toRad(lat2 - lat1)
  const deltaLon = toRad(lon2 - lon1)
  const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance.toFixed(1)
}

function toRad(degree) {
  return (degree * Math.PI) / 180
}

function calculateTimeMatchScore(currentUser, matchUser) {
  let timeMatchScore = 0

  if (currentUser.availableWorkday === matchUser.availableWorkday) {
    if (currentUser.workdayAvailability === matchUser.workdayAvailability || matchUser.workdayAvailability === "全天") {
      timeMatchScore += 1.0
    }
  }

  if (currentUser.availableWeekend === matchUser.availableWeekend) {
    if (currentUser.weekendAvailability === matchUser.weekendAvailability || matchUser.weekendAvailability === "全天") {
      timeMatchScore += 1.0
    }
  }

  return timeMatchScore
}

exports.main = async (event, context) => {
  const { userId, filteredUsers, longitude, latitude, level, page, pageSize } = event

  const parsedLatitude = parseFloat(latitude)
  const parsedLongitude = parseFloat(longitude)
  const LEVEL_WEIGHT = 0.3
  const DISTANCE_WEIGHT = 0.4
  const AVAILABILITY_WEIGHT = 0.3
  const MAX_LEVEL = 7.0
  const MAX_DISTANCE = 20.0

  db.collection(COLLECTION_NAME)
    .doc(userId)
    .update({
      data: {
        longitude: parsedLongitude,
        latitude: parsedLatitude,
      },
    })

  const matchedUsers = await db
    .collection(COLLECTION_NAME)
    .where({
      _id: _.nin([userId, ...filteredUsers.map((item) => item._id)]),
      longitude: _.and(_.neq(null), _.exists(true)),
      latitude: _.and(_.neq(null), _.exists(true)),
    })
    .skip((page - 1) * pageSize * 100)
    .limit(pageSize * 100)
    .get()

  matchedUsers.data.forEach((person) => {
    if (!person.latitude || !person.longitude || !latitude || !longitude) {
      person.distance = "距离未知"
      person.matchScore = -100000
      return
    }

    const distance = calculateDistance(parsedLatitude, parsedLongitude, person.latitude, person.longitude)
    const distanceScore = 1 - calculateDistance(parsedLatitude, parsedLongitude, person.latitude, person.longitude) / MAX_DISTANCE
    const levelScore = 1 - Math.abs(level - person.level) / MAX_LEVEL
    const timeMatchScore = calculateTimeMatchScore(event, person)

    const matchScore = LEVEL_WEIGHT * levelScore + DISTANCE_WEIGHT * distanceScore + AVAILABILITY_WEIGHT * timeMatchScore

    person.distance = distance
    person.matchScore = matchScore
  })

  matchedUsers.data.sort((a, b) => b.matchScore - a.matchScore)

  return {
    matchedUsers: matchedUsers.data,
  }
}
