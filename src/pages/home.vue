<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1; padding: 32px 0 45px">
      <access-denied :display="$store.getters.role === 2 || $store.getters.role === 1"></access-denied>
      <div v-if="$store.getters.role === 3 || $store.getters.role === 4" class="Main__site">
        <div v-if="!data.length" class="Home__no-data row">
          <img src="../assets/images/box-no-data.png" alt="no data" style="max-width: 700px; height: auto;">
          <div class="no-data">
            <h3 style="color: #0078d4; font-weight: 600;">You don't have any subjects.</h3>
            <p style="font-weight: 400; line-height: 1.5; font-size: 20px">Please contact your school administration for more information.</p>
          </div>
        </div>
        <div class="row">
          <article
            v-for="item of data"
            :key="item.id"
            class="col-md-4 col-sm-6 col-lg-3"
            style="margin-bottom: 30px"
          >
            <div class="Home__course__item">
              <div class="Home__course__info">
                <h3 class="Home__course__title">
                  <span style="text-decoration: none; color: inherit">({{ item.courseCode }}) {{ item.title }}</span>
                </h3>
                <ul class="Home__list__infor">
                  <li v-if="$store.getters.role === 4">
                    <i class="las la-chalkboard-teacher"></i>
                    <span>{{ item.className }}</span>
                  </li>
                  <li>
                    <i class="la la-user-circle"></i>
                    <span>{{ item.email }}</span>
                  </li>
                  <li v-if="$store.getters.role === 4">
                    <i class="la la-id-card"></i>
                    <span>Number of students: {{ item.numberOfStudent }}</span>
                  </li>
                  <li v-if="$store.getters.role === 3">
                    <i class="la la-id-card"></i>
                    <span>Number of class: {{ item.numberOfClass }}</span>
                  </li>
                </ul>
                <router-link
                  :to="{ path: '/course-detail', query: { id: item.courseId, classId: item.classId } }"
                  class="Home__course__detail text-decoration-none"
                  >Go to course
                  <i class="la la-arrow-right"></i>
                </router-link>
              </div>
            </div>
          </article>
        </div>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import axiosCallApi from "@/config/axiosCallApi";
import { API } from "@/constants/constants-api";
import store from "@/store";
import {USER_ROLE} from "@/constants/constants";
import AccessDenied from "@/components/error-page/access-denied";
export default {
  name: "home",
  components: { Layout, AccessDenied },
  data() {
    return {
      data: [],
      loading: false,
    };
  },
  created() {
    if (store.getters.role === USER_ROLE.STUDENT) {
      this.listCourseForStudent()
    } else if (store.getters.role === USER_ROLE.LECTURER) {
      this.listCourseForLecturer();
    }
  },
  methods: {
    listCourseForLecturer() {
      this.loading = true;
      axiosCallApi
        .callApi(API.HOME.GET_DATA_FOR_LECTURER, {}, { id: store.getters.userId})
        .then((res) => {
          this.data = [...res.data];
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    listCourseForStudent() {
      this.loading = true;
      axiosCallApi
        .callApi(API.HOME.GET_DATA_FOR_STUDENT, {}, { id: store.getters.userId})
        .then((res) => {
          this.data = [...res.data];
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
  },
};
</script>

<style lang="scss">
@import "src/assets/styles/home";
@import "src/assets/styles/layout";
</style>