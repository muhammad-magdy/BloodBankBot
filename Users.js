class usersDictionary {
  constructor() {
    this.users = [];
  }

  addOrUpdateUser(userId, donationType, bloodType, location, phoneNumber) {
    if (!this._isExist(userId)) {
      var user = {
        id: userId,
        donationType: donationType,
        bloodType: bloodType,
        location: {},
        phoneNumber: phoneNumber
      };
      this.users.push(user);
    }
    else {
      this._updateUser(userId, donationType, bloodType, location, phoneNumber);
    }
  }

  _isExist(userId) {
    var exists = false;
    if (this.users.length > 0) {
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].id == userId) {
          exists = true;
          break;
        }
      }
    }
    return exists;
  }

  _updateUser(userId, donationType, bloodType, location, phoneNumber) {
    var isUpdated = false;
    if (this.users.length && this.users.length > 0) {
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].id == userId) {
          if (donationType != null) {
            this.users[i].donationType = donationType;
          }
          if (bloodType != null) {
            this.users[i].bloodType = bloodType;
          }
          if (location != null) {
            Object.assign(this.users[i].location, location);
          }
          if (phoneNumber != null) {
            this.users[i].phoneNumber = phoneNumber;
          }
          isUpdated = true;
          break;
        }
      }
    }
    return isUpdated;
  }

  getUser(userId) {
    var user = null;
    if (this.users.length && this.users.length > 0) {
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].id == userId) {
          user = this.users[i];
          break;
        }
      }
    }
    return user;
  }
}
module.exports = usersDictionary;

