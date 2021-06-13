<template>
  <div class="reset-password">
    <Loading v-if="isLoading" />
    <Modal v-if="modalActive" :modalMessage="modalMessage" v-on:close-modal="closeModal" />
    <div class="form-wrap">
      <form class="reset">
        <p class="login-register">
          Back to
          <router-link class="router-link" :to="{ name: 'Login' }">Login</router-link>
        </p>
        <h2>Reset Password</h2>
        <p>Forgot your passowrd? Enter your email to reset it</p>
        <div class="inputs">
          <div class="input">
            <input type="text" placeholder="Email" v-model="email" />
            <email class="icon" />
          </div>
        </div>
        <button @click.prevent="resetPassword">Reset</button>
        <div class="angle"></div>
      </form>
      <div class="background"></div>
    </div>
  </div>
</template>

<script>
import email from "../assets/Icons/envelope-regular.svg";
import Modal from "../components/Modal";
import Loading from '@/components/Loading.vue';
import firebase from "firebase/app";
import "firebase/auth";
  export default {
    name: "ForgotPassword",
    components: {
      email,
      Modal,
      Loading
    },
    data() {
      return {
        email: "",
        modalActive: false,
        isLoading: false,
        modalMessage: ""
      }
    },
    methods: {
      resetPassword() {
        this.isLoading = true;
        firebase.auth().sendPasswordResetEmail(this.email).then(() => {
          this.modalActive = true;
          this.isLoading = false;
          this.modalMessage = "If you have an account a password reset link has been sent to your email"
        }).catch((error) => {
          this.isLoading = false;
          this.modalActive = true;
          this.modalMessage = error.message;
        })
      },
      closeModal() {
        this.email = "",
        this.modalActive = false
      }
    },
  }
</script>

<style lang="scss" scoped>
.reset-password {
  position: relative;
  .form-wrap {
    .reset {
      h2 {
        margin-bottom: 8px;
      }
      p {
        text-align: center;
        margin-bottom: 32px;
      }
    }
  }
}
</style>