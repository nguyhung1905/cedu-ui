<template>
  <div style="display: flex; flex-direction: column; min-height: 100vh">
    <header class="Main__header">
      <div class="Main__header__container">
        <div class="Main__logo">
          <a :href="href" @click="onLogoClick">
            <img src="@/assets/images/logo.png" alt="Login with google" />
          </a>
        </div>
        <div>
          <nav class="Main__nav">
            <router-link
              v-if="$store.getters.role === 3 || $store.getters.role === 4"
              to="/home"
              class="Main__list__item home"
              active-color="#0078d4"
              >Home
            </router-link>
            <router-link
              v-if="$store.getters.role === 2 || $store.getters.role === 3"
              to="/course-management"
              class="Main__list__item course-management"
              active-color="#0078d4"
              >Course Management
            </router-link>
            <router-link
              v-if="$store.getters.role === 2 || $store.getters.role === 3"
              to="/class-management"
              class="Main__list__item class-management"
              active-color="#0078d4"
              >Classroom Management
            </router-link>
            <router-link
              v-if="$store.getters.role === 1"
              to="/users-management"
              class="Main__list__item musers-management"
              active-color="#0078d4"
              >User Management
            </router-link>
            <span class="Main__indicator"></span>
          </nav>
        </div>
        <ul class="Main__account">

          <li>
            <b-dropdown variant="black" no-caret style="padding: 0">
              <template v-slot:button-content style="padding: 0">
                <label style="margin-bottom: 0">
                  <span class="Main__avatar">{{
                    email.charAt(0).toUpperCase()
                  }}</span>
                </label>
              </template>
              <a href="/user-profile" class="dropdown-item">
                <div style="display: flex; align-items: center; width: 100%">
                  <span class="Main__avatar">{{
                    email.charAt(0).toUpperCase()
                  }}</span>
                  <p class="Main__email">
                    {{ email }}
                  </p>
                </div>
                <div style="float: right; font-size:14px; padding:0 5px 0 0"><i>{{ getRoleName($store.getters.role ) }}</i></div>
              </a>
              <hr />
              <a href="/login" class="dropdown-item" @click="logout()">
                <i class="la la-sign-in-alt"></i>
                Logout
              </a>
            </b-dropdown>
          </li>
        </ul>
      </div>
    </header>
    <slot />
    <footer class="Main__footer">
      <div class="Main__footer__container">
        <div class="row">
          <div class="col-12 col-md-4 col-lg-4">
            <img
              class="Main__footer__logo"
              src="@/assets/images/logo.png"
              alt="EduNext"
            />
            <p>
              CEdu platform provides learners and instructors with a variety of
              educational technologies following the social constructive
              learning.
            </p>
          </div>
          <div class="col-12 col-md-4 col-lg-4"></div>
          <div class="col-12 col-md-4 col-lg-4">
            <h3>Address</h3>
            <ul>
              <li>
                <i class="la la-map-marker"></i>
                <span
                  >FPT University, Hoa Lac Hi-tech Park, Km29, Thang Long
                  Highway, Hanoi</span
                >
              </li>
              <li>
                <i class="la la-envelope"></i>
                <span>platformcedu@gmail.com</span>
              </li>
              <li>
                <i class="la la-phone"></i>
                <span>0349946562</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
    <loading :loading="loading"></loading>
  </div>
</template>

<script>
import {TOKEN, USER_ROLE} from "@/constants/constants";
import { removeToken } from "@/utils/cookie";
import { mapGetters, mapActions } from "vuex";
import store from "@/store";
import Loading from "@/components/loading";

export default {
  components: {Loading},
  created() {
    window.closeDialog = this.closeDialog;
  },
  mounted() {
    this.setStyleMenu();
  },
  data() {
    return {
      groupName: null,
      friends: null,
      roles: [
        { text: "Select one", value: '', disabled: true },
        { text: "Admin", value: 1 },
        { text: "Training manager", value: 2 },
        { text: "Lecturer", value: 3 },
        { text: "Student", value: 4 },
      ],
      href: '/',
    };
  },
  computed: {
    ...mapGetters(["email"]),
  },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    ...mapActions(["setemail", "setUserId", "setRole", "setName"]),
    getRoleName(role) {
      return this.roles.find(item => item.value === role).text
    },
    setStyleMenu() {
      let routeName = this.$route.name;
      const listRouter = [
        "home",
        "class-management",
        "course-management",
        "users-management",
      ];
      if (listRouter.indexOf(routeName) !== -1) {
        if (document.querySelector(`.${routeName}`)) {
          document.querySelector(`.${routeName}`).style.color = document
              .querySelector(`.${routeName}`)
              .getAttribute("active-color");
        }
      }
    },
    logout() {
      removeToken(TOKEN);
      this.$route.path = "/login";
      this.setUserId("");
      this.setemail("");
      this.setRole("");
      this.setName("");
    },
    onLogoClick() {
      const role = store.getters.role
      if (role === USER_ROLE.ADMIN) {
        this.href = "/users-management"
      }
      else if (role === USER_ROLE.TRAINING_MANAGER) {
        this.href = "/course-management"
      } else {
        this.href = "/home"
      }
    },
  },
};
</script>
<style lang="scss">
@import "src/assets/styles/layout";
</style>