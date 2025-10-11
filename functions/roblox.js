const settings = require('../storage/settings_.js')
const { prefix, colors, theme, commands, permissions, emojis } = settings
const others = require('../functions/others.js')
//Functions
const get = require('../functions/get.js')
const fetch = require('node-fetch');


async function refreshToken(cookie) {
  const response = await fetch('https://auth.roblox.com/v2/logout', {
    method: "POST",
    headers: {
      "Cookie": cookie
    }
  });

  if (response.status === 403) {
    csrfToken = response.headers.get('x-csrf-token')
    console.log("New csrfToken token: " + csrfToken)
    return csrfToken;
  } else {
    return { error: "Can't get CSRF token!" }
  }
}


let csrfToken = "abc"
async function main() {
  csrfToken = await refreshToken(process.env.Cookie);
  console.log(csrfToken);
}

main();

let userCache = {}
let groupRolesCache = []

module.exports = {
  handler: {
    changeUserRank: async function(data) {
      const auth = {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
        body: JSON.stringify({ roleId: data.roleId }),
      };
      let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(`https://groups.roblox.com/v1/groups/${data.groupId}/users/${data.userId}`, auth);
        return patchRes;
      }
      return patchRes;
    },
    getUserThumbnail: async function(userId) {
      let thumbnailResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=false&thumbnailType=HeadShot`);
      let thumbnail = await thumbnailResponse.json();
      thumbnail = !thumbnail.errors ? thumbnail.data[0].imageUrl : '';
      return thumbnail;
    },
    getUser: async function (usernameOrId) {
      // normalize incoming lookup key
      const lookupKey = typeof usernameOrId === "string"
        ? usernameOrId.toLowerCase()
        : String(usernameOrId);

      // quick cache hit by lookupKey
      if (userCache[lookupKey]) {
        console.log("User cache hit (by lookupKey):", lookupKey);
        return userCache[lookupKey];
      }

      // also try treating lookupKey as numeric id string
      if (userCache[String(Number(lookupKey))]) {
        console.log("User cache hit (by id):", String(Number(lookupKey)));
        return userCache[String(Number(lookupKey))];
      }

      let user;

      try {
        if (/^\d+$/.test(lookupKey)) {
          // Treat as Roblox ID (lookupKey is numeric string)
          const userResponse = await fetch(`https://users.roblox.com/v1/users/${lookupKey}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
              "Cookie": `${process.env.Cookie}`,
            },
          });

          if (!userResponse.ok) {
            return { error: `${userResponse.status}: ${userResponse.statusText}` };
          }
          user = await userResponse.json();
        } else {
          // Treat as Roblox username
          const userResponse = await fetch("https://users.roblox.com/v1/usernames/users", {
            method: "POST",
            body: JSON.stringify({ usernames: [usernameOrId], excludeBannedUsers: false }),
            headers: {
              "Content-Type": "application/json",
              "x-csrf-token": csrfToken,
              "Cookie": `${process.env.Cookie}`,
            },
          });

          if (!userResponse.ok) {
            return { error: `${userResponse.status}: ${userResponse.statusText}` };
          }

          const json = await userResponse.json();
          user = json.data && json.data[0];
        }

        if (!user) return { error: "This roblox account doesn't exist!" };

        console.log("Designated user:", user);

        // Cache under both id and lowercase username (if available)
        const idKey = String(user.id);
        userCache[idKey] = user;
        if (user.name) {
          const nameKey = user.name.toLowerCase();
          userCache[nameKey] = user;
        }

        // optional: log current cache keys for debugging
        console.log("Cached keys:", Object.keys(userCache).slice(-4)); // show last few keys

        return user;
      } catch (err) {
        console.error("getUser error:", err);
        return { error: "Network or code error: " + err.message };
      }
    },
    getUserRole: async function(groupId, userId) {
      try {
        let userRolesResponse = await fetch(`https://groups.roblox.com/v2/users/${userId}/groups/roles`);
        let userRoles = await userRolesResponse.json();
        let groupData = userRoles.data.find(d => d.group.id == groupId);
        if (groupData) {
          let role = groupData.role;
          return role;
        } else {
          return { error: "Player not in group." }
        }
      } catch (err) {
        return { error: err }
      }
    },
    acceptUser: async function(groupId, userId) {
      const auth = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json, text/plain, */*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let link = `https://groups.roblox.com/v1/groups/${groupId}/join-requests/users/${userId}`
      console.log(link)
      let patchRes = await fetch(link, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(link, auth);
        return patchRes;
      }
      return patchRes;
    },
    kickUser: async function(groupId, userId) {
      const auth = {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "x-csrf-token": csrfToken,
          "Cookie": `${process.env.Cookie}`,
        },
      };
      let patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
      if (patchRes.status === 403) {
        csrfToken = await refreshToken(process.env.Cookie);
        auth.headers["x-csrf-token"] = csrfToken;
        patchRes = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/users/${userId}`, auth);
        return patchRes;
      }
      return patchRes;
    },
    //
    cToken: function() { return csrfToken },
    getGroup: async function(groupId) {
      try {
        let group = await fetch(`https://groups.roblox.com/v1/groups/${groupId}`);
        group = await group.json();
        return group;

      } catch (err) {
        return { error: err }
      }
    },
    getGroupRoles: async function(groupId) {
      try {
        if (groupRolesCache[groupId]) {
          console.log('Group roles cache hit:', groupId)
          return groupRolesCache[groupId];
        }
        let groupRolesResponse = await fetch(`https://groups.roblox.com/v1/groups/${groupId}/roles`);
        let groupRoles = await groupRolesResponse.json();

        groupRolesCache[groupId] = groupRoles
        return groupRoles;
      } catch (err) {
        return { error: err }
      }
    },
    refreshToken,
    //
  }
};