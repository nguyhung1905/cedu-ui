<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1">
      <div class="container" style="padding: 24px">
        <b-tabs content-class="mt-3" class="test">
          <b-tab title="Update Information" title-item-class="font-weight-bold"  active>
            <div class="col-12">
              <form @submit.prevent="handleUpdateProfile"  @reset="onResetProfile" class="form-horizontal" role="form" style="padding-top: 12px">
                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label="Full name: "
                    label-for="fullName"
                >
                  <b-form-input
                      id="fullName"
                      v-model="profile.name"
                      type="text"
                      placeholder="Full name"
                      :class="{
                      'is-invalid': profileSubmitted && $v.profile.name.$error,
                    }"
                  ></b-form-input>
                  <div
                      v-if="profileSubmitted && !$v.profile.name.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label="Date of birth: "
                    label-for="dob"
                >
                  <b-form-input
                      id="dob"
                      v-model="profile.DoB"
                      type="date"
                      :class="{
                      'is-invalid': profileSubmitted && $v.profile.DoB.$error,
                    }"
                  ></b-form-input>
                  <div
                      v-if="profileSubmitted && !$v.profile.DoB.dateValid"
                      class="invalid-feedback"
                  >
                    This value must be less than current date.
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label=""
                >
                  <div>
                    <router-link to="/home">
                      <b-button variant="outline-primary"  class="btn-custom">Back</b-button>
                    </router-link>
                    <b-button variant="primary"  class="btn-custom" type="submit">Update</b-button>
                  </div>
                </b-form-group>
              </form>
            </div>
          </b-tab>
          <b-tab title="Change password" title-item-class="font-weight-bold">
            <div class="col-12">
              <form @submit.prevent="handleUpdatePassword" @reset="resetPasswordForm" class="form-horizontal" role="form" style="padding-top: 12px">
                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label="Current password "
                    label-for="currentPassword"
                >
                  <b-form-input
                      id="currentPassword"
                      v-model="changePass.oldPassword"
                      type="password"
                      placeholder="Current password"
                      :class="{
                      'is-invalid': submitted && $v.changePass.oldPassword.$error,
                    }"
                  ></b-form-input>
                  <div
                      v-if="submitted && !$v.changePass.oldPassword.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label="New password "
                    label-for="newPassword"
                >
                  <b-form-input
                      id="newPassword"
                      v-model="changePass.newPassword"
                      type="password"
                      placeholder="New password"
                      :class="{
                      'is-invalid': submitted && $v.changePass.newPassword.$error,
                    }"
                  ></b-form-input>
                  <div
                      v-if="submitted && !$v.changePass.newPassword.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                  <div
                      v-if="submitted && !$v.changePass.newPassword.password"
                      class="invalid-feedback"
                  >
                    Password must have at least 8 characters, 1 digit, 1 special character, 1 uppercase, 1 lowercase
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label="Re-enter the password "
                    label-for="confirmPassword"
                >
                  <b-form-input
                      id="confirmPassword"
                      v-model="changePass.rePassword"
                      placeholder="Re-enter the password"
                      type="password"
                      :class="{
                      'is-invalid': submitted && $v.changePass.rePassword.$error,
                    }"
                  ></b-form-input>
                  <div
                      v-if="submitted && !$v.changePass.rePassword.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                  <div
                      v-if="submitted && !$v.changePass.rePassword.password"
                      class="invalid-feedback"
                  >
                    Password must have at least 8 characters, 1 digit, 1 special character, 1 uppercase, 1 lowercase
                  </div>
                </b-form-group>

                <b-form-group
                    class="mb-3"
                    label-cols-sm="2"
                    label-cols-lg="3"
                    label=""
                >
                  <div class="btn-custom">
                    <router-link to="/home">
                      <b-button variant="outline-primary"  class="btn-custom">Back</b-button>
                    </router-link>
                    <b-button type="submit" variant="primary"  class="btn-custom">Update</b-button>
                  </div>
                </b-form-group>
              </form>
            </div>
          </b-tab>
        </b-tabs>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import Vue from "vue";
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import store from "@/store";
import {DANGER, showAlert, SUCCESS} from "@/utils/alertMessage";
import {Vuelidate} from "vuelidate";
import {required} from "vuelidate/lib/validators";

Vue.use(Vuelidate);

export default {
  name: "user-profile",
  components: { Layout },
  data() {
    return {
      profile: {
        email: store.getters.email,
        name: '',
        DoB: null
      },
      changePass: {
        email: store.getters.email
      },
      loading: false,
      submitted: false,
      profileSubmitted: false,
    }
  },
  validations: {
    profile: {
      name: { required },
      DoB: { dateValid(value) {
        if (value) {
          return new Date(value) < new Date()
        } else return true
        }}
    },
    changePass: {
      oldPassword: { required },
      newPassword: { required, password(value) {
        if (value) {
          return !!(value && value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])[0-9a-zA-Z\W]{8,59}$/));
        } else return true
        }},
      rePassword: { required, password(value) {
        if (value) {
          return !!(value && value.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[\W])[0-9a-zA-Z\W]{8,59}$/));
        } else return true
        }},
    },
  },
  async created() {
    await this.getUserprofile()
  },
  methods: {
    getUserprofile() {
      axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH_BY_USERID, {}, { userId: store.getters.userId }).then(res => {
        this.profile.name = res.data[0].name
        this.profile.DoB = res.data[0].DoB ? new Date(res.data[0].DoB).toISOString().split("T")[0] : null
      })
    },
    handleUpdateProfile() {
      this.profileSubmitted = true;
      // stop here if form is invalid
      this.$v.profile.$touch();
      if (this.$v.profile.$invalid) {
        return;
      } else if (!this.loading) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.UPDATE_USER, this.profile, {}).then(res => {
            if (res.data.email) {
              showAlert(this, SUCCESS, 'Update user information successfully')
              this.getUserprofile()
              this.profileSubmitted = false
              this.loading = false
              this.onResetProfile()
            }
          }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Update user information failed')
          })
      }
    },
    handleUpdatePassword() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.changePass.$touch();
      if (this.$v.changePass.$invalid) {
        return;
      } else if (!this.loading) {
        axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.CHANGE_PASSWORD, this.changePass, {} ).then(res => {
          if (res.data.status) {
            showAlert(this, SUCCESS, 'Change password successfully')
            this.loading = false
            this.submitted = false;
            this.changePass = {
              email: store.getters.email
            }
            this.resetPasswordForm()
          } else {
            this.loading = false
            showAlert(this, DANGER, res.data.message)
          }
        })
      }
    },
    resetPasswordForm() {
      this.$nextTick(() => {
        this.$v.$reset();
      });
    },
    onResetProfile() {
      this.$nextTick(() => {
        this.$v.$reset();
      });
    }
  },
}
</script>

<style scoped>
.test {
  max-width: 800px;
  margin: 30px auto 80px;
  border-radius: 3px;
  box-shadow: 1px 2px 10px rgb(0 0 0 / 10%);
  padding: 16px;
}

.btn-custom {
  margin-right: 8px;
  padding: 8px 25px;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  line-height: 20px;
  border-radius: 8px;
  font-weight: 500;
  text-align: center;
}
</style>