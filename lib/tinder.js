const axios = require('axios');
const moment = require('moment');

class Tinder {
  constructor({ phoneNumber }) {
    this.request = axios.create({
      baseURL: 'https://api.gotinder.com',
      headers: {
        'x-client-version': '10090106',
        'app-version': '2749',
        platform: 'ios',
        'os-version': '110000400001',
        'User-Agent': 'Tinder/10.9.1 (iPhone;iOS 11.4.1; Scale/2.00)'
      }
    });
    this.phone = phoneNumber;
    this.refreshToken = '';
  }

  setRefreshToken(refreshToken) {
    this.refreshToken = refreshToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  setAccessToken(apiToken) {
    this.request.defaults.headers.common['X-Auth-Token'] = '';
    delete this.request.defaults.headers.common['X-Auth-Token'];

    this.request.defaults.headers.common['X-Auth-Token'] = `${apiToken}`;

    this.request.defaults.headers.common['Authorization'] = '';
    delete this.request.defaults.headers.common['Authorization'];

    this.request.defaults.headers.common[
      'Authorization'
    ] = `Token token="${apiToken}"`;
  }

  async requestAuth() {
    try {
      return await this.request({
        method: 'POST',
        url: '/v2/auth/sms/send',
        params: {
          auth_type: 'sms'
        },
        data: {
          phone_number: this.phone
        }
      });
    } catch (err) {
      console.log('error with requestAuth', err);
    }
  }

  async validateAuth(otpCode) {
    try {
      const validation = await this.request({
        method: 'POST',
        url: '/v2/auth/sms/validate',
        params: {
          auth_type: 'sms'
        },
        data: {
          phone_number: this.phone,
          otp_code: otpCode
        }
      });
      const { data } = validation.data;
      console.log(data);
      this.setRefreshToken(data.refresh_token);
      return validation.data;
    } catch (err) {
      console.log('error with validateAuth', err);
    }
  }

  async login() {
    try {
      console.log('refresh token', this.getRefreshToken());
      const login = await this.request({
        method: 'POST',
        url: '/v2/auth/login/sms',
        params: {
          auth_type: 'sms'
        },
        data: {
          refresh_token: this.getRefreshToken()
        }
      });
      const { data } = login.data;
      this.setAccessToken(data.api_token);
      return login.data;
    } catch (err) {
      console.log('error with login', err);
    }
  }

  async getProfile() {
    try {
      const profile = await this.request({
        method: 'GET',
        url: '/v2/profile',
        params: {
          include:
            'user,boost,super_likes,onboarding,account,instagram,feed_control,spotify,events,tutorials,plus_control,travel,notifications,tinder_u,products,email_settings,select,likes,purchase'
        }
      });
      return profile.data;
    } catch (err) {
      console.log('error with login', err);
    }
  }

  async getUser(userId) {
    try {
      const user = await this.request({
        method: 'GET',
        url: `/user/${userId}`
      });
      return user.data;
    } catch (err) {
      console.log('error with getUser', err);
    }
  }

  async getUpdates(isNow) {
    try {
      const updates = await this.request({
        method: 'POST',
        url: `/updates`,
        params: {
          is_boosting: false
        },
        data: {
          nudge: false,
          last_activity_date: isNow
            ? moment().format('YYYY-MM-DDTHH:mm:ss.SSSS')
            : ''
        }
      });
      return updates.data;
    } catch (err) {
      console.log('error with getUpdates', err);
    }
  }

  async sendMessage(userId, message) {
    try {
      const post = await this.request({
        method: 'POST',
        url: `/user/matches/${userId}`,
        data: {
          message
        }
      });
      return post.data;
    } catch (err) {
      console.log('error with sendMessage', err);
    }
  }

  async getMessage(messageId) {
    try {
      const message = await this.request({
        method: 'GET',
        url: `/message/${messageId}`
      });
      return message.data;
    } catch (err) {
      console.log('error with getMessage', err);
    }
  }

  async getRecommendations() {
    try {
      const recommendations = await this.request({
        method: 'GET',
        url: `/v2/recs/core`
      });
      const { data } = recommendations.data;
      return data;
    } catch (err) {
      console.log('error with recommendations', err);
    }
  }

  async likeUser({ _id, content_hash, s_number }) {
    try {
      const like = await this.request({
        method: 'GET',
        url: `/like/${_id}`,
        params: {
          content_hash: content_hash,
          s_number: s_number
        }
      });
      return like.data;
    } catch (err) {
      console.log('error with likeUser', err);
    }
  }

  async superlikeUser({ _id, content_hash, s_number }) {
    try {
      const like = await this.request({
        method: 'GET',
        url: `/like/${_id}/super`,
        params: {
          content_hash: content_hash,
          s_number: s_number
        }
      });
      return like.data;
    } catch (err) {
      console.log('error with superlikeUser', err);
    }
  }

  async passUser({ _id, content_hash, s_number }) {
    try {
      const like = await this.request({
        method: 'GET',
        url: `/pass/${_id}`,
        params: {
          content_hash: content_hash,
          s_number: s_number
        }
      });
      return like.data;
    } catch (err) {
      console.log('error with passUser', err);
    }
  }

  async likeEmAll() {
    try {
      const reco = await this.getRecommendations();
      const nbReco = reco.results.length;
      console.log(`${nbReco > 0 ? nbReco : 'No'} new recommendations`);
      return await Promise.all(
        reco.results.map(async result => {
          return await this.likeUser({
            _id: result.user._id,
            ...result
          });
        })
      );
    } catch (err) {
      console.log('error with likeEmAll', err);
    }
  }

  async changeLocation({ latitude, longitude }) {
    try {
      const location = await this.request({
        method: 'POST',
        url: `/user/ping`,
        data: {
          lat: latitude,
          lon: longitude
        }
      });
      return location.data;
    } catch (err) {
      console.log('error with changeLocation', err);
    }
  }
}

module.exports = Tinder;
