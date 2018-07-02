import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

const store = () => new Vuex.Store({
  state: {
    apps: [],
    langs: []
  },
  mutations: {
    setApps (state, data) {
      if (data) state.apps = data;
    },
    setLangs(state, data) {
      if (data) state.langs = data;
    }
  },
  actions: {
    async getApps(context) {
      let url = '/api/app/list';
      if (process.server) {
        url = 'http://127.0.0.1:8882' + url;
      }
      let apps = await axios.get(url);
      if (apps.status === 200 && apps.data.status === 0) {
        context.commit('setApps', apps.data.data.list);
      } else {
        console.log(res.data);
      }
      return Promise.resolve();
    },
    async getLangs(context) {
      let url = '/api/lang/list';
      if (process.server) {
        url = 'http://127.0.0.1:8882' + url;
      }
      let langs = await axios.get(url);
      if (langs.status === 200 && langs.data.status === 0) {
        context.commit('setLangs', langs.data.data.langs);
      } else {
        console.log(res.data);
      }
      return Promise.resolve();
    },
    async nuxtServerInit ({ dispatch, commit }, { req }) {
      await dispatch('getApps');
      await dispatch('getLangs');
    }
  }
});
export default store;
