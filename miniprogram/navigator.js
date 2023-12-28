const app = getApp();

const Pages = {
  Index: {
    authRequired: false,
    url: "/pages/index/index?tab="
  },
  PostGame: {
    authRequired: false,
    url: "/pages/postGame/postGame?id=",
  },
  GameDetail: {
    authRequired: false,
    url: "/pages/gamedetail/gamedetail?id=",
  },
  Profile: {
    authRequired: false,
    url: "/pages/profile/profile?id=",
  },
  ProfileSettings: {
    authRequired: false,
    url: "/pages/user/profilesettings/profilesettings?edit=",
  },
  Welcome: {
    authRequired: false,
    url: "/pages/welcome/welcome",
  },
  Chat: {
    authRequired: false,
    url: "/pages/chat/chat?id=",
  },
  UserGames: {
    authRequired: false,
    url: "/pages/userGames/userGames?symbol=",
  },
  ExploreDetail: {
    authRequired: false,
    url: "/pages/exploredetail/exploredetail?info=",
  },
  Explore: {
    authRequired: false,
    url: "/pages/index/index?tab=",
  },
  Feedback: {
    authRequired: false,
    url: "/pages/feedback/feedback",
  },
};

export function navigateToIndex(tab) {
  navigate(Pages.Index, tab);
}

export function navigateToPostGame(id) {
  navigate(Pages.PostGame, id);
}

export function navigateToGameDetail(id) {
  navigate(Pages.GameDetail, id);
}

export function navigateToProfile(id) {
  navigate(Pages.Profile, id);
}

export function navigateToProfileSettings(edit = false) {
  navigate(Pages.ProfileSettings, edit);
}

export function navigateToWelcome() {
  navigate(Pages.Welcome);
}

export function navigateToChat(id) {
  navigate(Pages.Chat, id);
}

export function navigateToUserGames(symbol) {
  navigate(Pages.UserGames, symbol);
}

export function navigateToExploreDetail(info) {
  navigate(Pages.ExploreDetail, info);
}

export function navigateToExplore(tab) {
  navigate(Pages.Explore, tab);
}

export function navigateToFeedback() {
  navigate(Pages.Feedback);
}

export function navigate(page, urlParam = null) {
  if (!page || !page.url) {
    return;
  }

  const url = urlParam ? page.url + urlParam : page.url;
  if (page.authRequired) {
    if (app.userInfo) {
      wx.navigateTo({
        url,
      });
    } else {
      //
    }
  } else {
    wx.navigateTo({
      url,
    });
  }
}
