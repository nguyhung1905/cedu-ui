<template>
  <div class="Login">
    <h1 class="Login__logo">
      <img src="@/assets/images/logo.png" alt="EduNext" style="width: 40%; margin: auto"/>
    </h1>
    <main class="Login__main">
      <div class="Login__title">
        <a>Login</a>
      </div>
      <ul class="Login__list">
        <li class="Login__item">
          <g-signin-button
              :params="googleSignInParams"
              @success="onSignInSuccess"
              @error="onSignInError"
          >
            <img src="@/assets/images/logo-gg-new.png" alt="Login with google" />
            Sign in with Google
          </g-signin-button>
        </li>
      </ul>
      <form @submit.prevent="onLogin">
        <b-input-group class="Login__group mb-4">
          <b-input-group-prepend is-text>
            <i class="la la-user Login__icon"></i>
          </b-input-group-prepend>
          <b-form-input
              type="text"
              placeholder="Email"
              v-model="login.email"
              :class="{
                      'is-invalid': submitted && $v.login.email.$error,
                    }"
          ></b-form-input>
          <div
              v-if="submitted && !$v.login.email.required"
              class="invalid-feedback"
              style="padding-left: 50px"
          >
            This value is required.
          </div>
          <div
              v-if="submitted && !$v.login.email.email"
              class="invalid-feedback"
              style="padding-left: 50px"
          >
            This value must be email.
          </div>
        </b-input-group>

        <b-input-group class="Login__group mb-4">
          <b-input-group-prepend is-text>
            <i class="la la-lock Login__icon" ></i>
          </b-input-group-prepend>
          <b-form-input
              type="password"
              placeholder="Password"
              v-model="login.password"
              :class="{
                      'is-invalid': submitted && $v.login.password.$error,
                    }"
          ></b-form-input>
          <div
              v-if="submitted && !$v.login.password.required"
              class="invalid-feedback"
              style="padding-left: 50px"
          >
            This value is required.
          </div>
        </b-input-group>
        <button
            class="btn btn-primary"
            type="submit"
            name="button"
            value="login"
            style="width: 100%"
        >
          Log In
        </button>
      </form>
      <a
          class="Login__forgot-password btn"
          style="width: 100%"
          @click="onResetPassword()"
      >Forgotten password?</a>
      <a
          class="Login__return-home-page btn text-bold"
          href="/"
          style="width: 100%">Return To Home Page
      </a>
    </main>

    <!--    Forgotten password modal-->
    <b-modal
        v-model="showResetPasswordModal"
        title="Reset password"
        size="sm"
        @hidden="onResetModalPassword"
        title-class="text-black font-18"
        body-class="p-3"
        centered
        hide-footer
    >
      <form @submit.prevent="handleSubmitResetPassword">
        <div class="row">
          <div class="col-12">
            <div class="mb-3">
              <label for="recoveryEmail" class="required">Enter Email Address</label>
              <input
                  id="recoveryEmail"
                  v-model="resetPassword.recoveryEmail"
                  type="text"
                  class="form-control"
                  :class="{
                      'is-invalid':
                        passwordSubmitted && $v.resetPassword.recoveryEmail.$error,
                    }"
              />
              <div
                  v-if="passwordSubmitted && !$v.resetPassword.recoveryEmail.required"
                  class="invalid-feedback"
              >
                This value is required.
              </div>
              <div
                  v-else-if="passwordSubmitted && !$v.resetPassword.recoveryEmail.email"
                  class="invalid-feedback"
              >
                This value must be a valid email.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-btn">
          <b-button variant="light" @click="onResetModalPassword">Cancel</b-button>
          <b-button type="submit" variant="success" class="ms-1"
          >Send</b-button
          >
        </div>
      </form>
    </b-modal>
    <b-overlay :show="loading" no-wrap style="z-index: 1099"></b-overlay>
  </div>
</template>

<script>
import {API, API_MANAGEMENT} from "@/constants/constants-api";
import axiosCallApi from "@/config/axiosCallApi";
import axios from "axios";
import { setToken } from "@/utils/cookie";
import {mapActions} from "vuex";
import store from "@/store";
import {USER_ROLE} from "@/constants/constants";
import {email, required} from "vuelidate/lib/validators";
import Vue from "vue";
import { Vuelidate } from "vuelidate";
import {DANGER, showAlert, SUCCESS} from "@/utils/alertMessage";

Vue.use(Vuelidate);
export default {
  name: "Login",
  data() {
    return {
      submitted: false,
      login: {
        email: "",
        password: "",
      },
      googleSignInParams: {
        client_id:
            "201779232171-7noinciqi19tefmcae5ghfq6sh7qta48",
      },
      showResetPasswordModal: false,
      resetPassword: {
        recoveryEmail: '',
      },
      loading: false,
      passwordSubmitted: false,
    };
  },
  validations: {
    login: {
      email: { required, email },
      password: { required },
    },
    resetPassword: {
      recoveryEmail: { required, email },
    }
  },
  methods: {
    ...mapActions(['setEmail','setUserId','setRole','setName']),
    async onLogin() {
      this.submitted = true
      // stop here if form is invalid
      this.$v.login.$touch();
      if (this.$v.login.$invalid) {
        return;
      } else {
        const data = {
          email: this.login.email,
          password: this.login.password,
        };
        axiosCallApi.callApi(API.LOGIN, data).then(async (res) => {
          if (res.data.status) {
            await this.setUserId(res.data.userId)
            await this.setEmail( res.data.email)
            await this.setRole( res.data.role)
            await this.setName(res.data.name)
            setToken(res.data.accessToken);
            if (store.getters.role === USER_ROLE.ADMIN) {
              await this.$router.push({path: "/users-management"});
            }
            else if (store.getters.role === USER_ROLE.TRAINING_MANAGER) {
              await this.$router.push({path: "/course-management"});
            } else {
              await this.$router.push({path: "/home"});
            }
            this.submitted = false
          } else {
            showAlert(this, DANGER, res.data.message)
            this.submitted = false
          }
        });
      }
    },
    onSignInSuccess(googleUser) {
      this.loading = true
      const id_token = googleUser.wc ? googleUser.wc.id_token : googleUser.xc.id_token;
      axios
          .post(`${process.env.VUE_APP_LOGIN_API}/api/auth/google`, {
            id_token,
          })
          .then(
              async (response) => {
                if (response.data.status) {
                  await this.setUserId(response.data.userId)
                  await this.setEmail( response.data.email)
                  await this.setRole( response.data.role)
                  await this.setName(response.data.name)

                  setToken(response.data.accessToken);
                  this.$router.push({ path: "/home" });
                  this.loading = false
                } else {
                  showAlert(this, DANGER, response.data.message)
                  this.loading = false
                }
              },
              (error) => {
                this.loading = false
                console.log(error);
              }
          );
    },
    onSignInError(error) {
      // `error` contains any error occurred.
      console.log("OH NOES", error);
    },
    onResetPassword() {
      this.showResetPasswordModal = true
    },
    onResetModalPassword() {
      // Reset vuelidatecourse-table
      this.$nextTick(() => {
        this.$v.$reset();
      });
      this.recoveryEmail = ''
      this.showResetPasswordModal = false
    },
    handleSubmitResetPassword() {
      this.passwordSubmitted = true;
      // stop here if form is invalid
      this.$v.resetPassword.$touch();
      if (this.$v.resetPassword.$invalid) {
        return;
      } else {
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.RESET_PASSWORD, { email: this.resetPassword.recoveryEmail }, {}).then(res => {
          if (res.data.status === true) {
            this.loading = false
            this.onResetModalPassword()
            showAlert(this, SUCCESS, 'Reset password successfully')
          }
          else {
            this.loading = false
            showAlert(this, DANGER, 'Email does not exist in the system')
          }
        }).catch(() => {
          this.loading = false
          showAlert(this, DANGER, 'Reset password failed')
        })
      }
    },
  },
};
</script>

<style lang="scss">
@import "src/assets/styles/login";
.g-signin-button {
  /* This is where you control how the button looks. Be creative! */
  padding: 10px;
  border-radius: 8px;
  box-shadow: 1px 1px 3px rgb(0 0 0 / 17%);
  cursor: pointer;
}

.modal-btn {
  text-align: end;
}

.modal-btn button {
  margin-left: 10px;
}

.required:after {
  content: " *";
  color: red;
}
</style>