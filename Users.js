class usersDictionary {
  constructor() {
    this.users = [];
  }

  addOrUpdateUser(userId, info, isDonor, isWaitingForPhoneNumberMsg, language, donationType, bloodType, location, phoneNumber, donorsNumber) {
    if (!this._isExist(userId)) {
      var user = {
        id: userId,
        isWaitingforPhoneNumberResponse: isWaitingForPhoneNumberMsg,
        isDonor: isDonor,
        donationType: donationType,
        bloodType: bloodType,
        location: {},
        phoneNumber: phoneNumber,
        donorsNumber: donorsNumber,
        userInfo: info,
        language: language
      };
      this.users.push(user);
    }
    else {
      this._updateUser(userId, isDonor, isWaitingForPhoneNumberMsg, language, donationType, bloodType, location, phoneNumber, donorsNumber);
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

  _updateUser(userId, isDonor, isWaitingforPhoneNumberResponse, language, donationType, bloodType, location, phoneNumber, donorsNumber) {
    var isUpdated = false;
    if (this.users.length && this.users.length > 0) {
      for (var i = 0; i < this.users.length; i++) {
        if (this.users[i].id == userId) {
          if (isDonor != null) {
            this.users[i].isDonor = isDonor;
          }
          if (isWaitingforPhoneNumberResponse != null) {
            this.users[i].isWaitingforPhoneNumberResponse = isWaitingforPhoneNumberResponse;
          }
          if (language != null) {
            this.users[i].language = language;
          }
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
          if (donorsNumber != null) {
            this.users[i].donorsNumber = donorsNumber;
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

  getUserLanguage(userId) {
    var user = this.getUser(userId);
    if (user && user.language) {
      return user.language;
    }
    return 'EN';
  }
}


module.exports = usersDictionary;

