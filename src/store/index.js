import Vue from 'vue';
import Vuex from 'vuex';
import firebase from 'firebase/app';
import 'firebase/auth';
import db from '../firebase/firebaseInit';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    blogPosts: [],
    isEditPost: false,
    user: null,
    profileAdmin: null,
    profileEmail: null,
    profileFirstName: null,
    profileLastName: null,
    profileUsername: null,
    profileId: null,
    profileInitials: null,
    stateLoaded: false,
  },
  getters: {
    blogPostFeed(state) {
      return state.blogPosts.slice(0, 2);
    },
    blogPostCards(state) {
      return state.blogPosts.slice(2, 6);
    },
  },
  mutations: {
    toggleEditPost(state, payload) {
      state.isEditPost = payload;
    },
    setProfileUser(state, doc) {
      state.profileId = doc.id;
      state.profileEmail = doc.data().email;
      state.profileFirstName = doc.data().firstName;
      state.profileLastName = doc.data().lastName;
      state.profileUsername = doc.data().username;
      state.profileAdmin = doc.data().isAdmin;
    },
    updateUser(state, user) {
      state.user = user;
    },
    setProfileInitials(state) {
      state.profileInitials =
        state.profileFirstName.match(/(\b\S)?/g).join('') + state.profileLastName.match(/(\b\S)?/g).join('');
    },
    updateFirstName(state, payload) {
      state.profileFirstName = payload;
    },
    updateLastName(state, payload) {
      state.profileLastName = payload;
    },
    updateUsername(state, payload) {
      state.profileUsername = payload;
    },
    filterPosts(state, payload) {
      state.blogPosts = state.blogPosts.filter((post) => post.blogID !== payload);
    },
  },
  actions: {
    async getCurrentUser({ commit }) {
      const currentUserInfo = await db
        .collection('users')
        .doc(firebase.auth().currentUser.uid)
        .get();
      commit('setProfileUser', currentUserInfo);
      commit('setProfileInitials');
    },
    async updateUserProfile({ commit, state }) {
      await db
        .collection('users')
        .doc(state.profileId)
        .update({
          firstName: state.profileFirstName,
          lastName: state.profileLastName,
          username: state.profileUsername,
        });
      commit('setProfileInitials');
    },
    async getBlogPosts({ state }) {
      const result = await db
        .collection('blogPosts')
        .orderBy('date', 'desc')
        .get();
      result.forEach((doc) => {
        if (!state.blogPosts.some((post) => post.blogID === doc.id)) {
          const data = {
            blogID: doc.data().blogId,
            blogHTML: doc.data().blogHTML,
            blogCoverPhoto: doc.data().blogCoverPhoto,
            blogTitle: doc.data().blogTitle,
            blogDate: doc.data().date,
            blogCoverPhotoName: doc.data().blogCoverPhotoName,
          };
          state.blogPosts.push(data);
        }
      });
      state.stateLoaded = true;
    },
    async deletePost({ commit }, payload) {
      await db
        .collection('blogPosts')
        .doc(payload)
        .delete();
      commit('filterPosts', payload);
    },
    async updatePost({ dispatch, commit }, payload) {
      commit('filterPosts', payload);
      await dispatch('getBlogPosts');
    },
  },
  modules: {},
});
