<template>
  <Layout :loading="loading">
    <main class="CourseDetail__main">
      <div class="CourseDetail__overlay"></div>
      <div class="CourseDetail__container">
        <ul class="CourseDetail__breadcrumb">
          <li>
            <router-link to="/home">Home</router-link>
          </li>
          <li style="padding: 0 8px">/</li>
          <li>
            <span>{{ classInfo.courseTitle }}</span>
          </li>
        </ul>
        <article>
          <div class="row">
            <div class="col-12 col-lg-8">
              <section style="margin-bottom: 20px">
                <h1 class="CourseDetail__title">{{ classInfo.courseTitle }}</h1>
              </section>
              <p class="CourseDetail__code">Course code: {{ classInfo.courseCode }}</p>

              <div class="CourseDetail__content">
                <section>
                  <div class="CourseDetail__content__list">
                    <ul class="CourseDetail__content__slot">
                      <li v-for="item of section" :key="item.order">
                        <div
                          class="CourseDetail__item"
                          v-b-toggle="[item.order+'']"
                        >
                          <div class="CourseDetail__item__top">
                            <div class="CourseDetail__item__top__left">
                              <router-link
                                :to="{
                                  path: '/session-detail',
                                  query: {
                                    classId: classSelected,
                                    sessionId: item.sessionId,
                                  },
                                }"
                                >Slot {{ item.order }}</router-link>
                            </div>
                            <div class="CourseDetail__item__top__right">
                              <router-link
                                :to="{
                                  path: '/session-detail',
                                  query: {
                                    classId: classSelected,
                                    sessionId: item.sessionId,
                                  },
                                }"
                                >View Detail</router-link>
                            </div>
                          </div>
                          <div class="CourseDetail__item__name">
                            <div>
                              <span v-html="nl2br(item.sessionName)" style="white-space: pre-wrap;"></span>
                            </div>
                          </div>
                        </div>
                        <b-collapse :id="item.order+''" class="mt-2">
                          <ul style="list-style: none; padding: 10px 25px">
                            <li
                              v-if="item.question.length === 0"
                              class="CourseDetail__question"
                            >
                              <span>This slot has no content</span>
                            </li>
                            <div
                                v-for="question of item.question"
                                :key="question.id">
                              <li v-if="question.status !== 5" class="CourseDetail__question">
                                <img
                                    src="@/assets/images/question.svg"
                                    alt="question"
                                    style="margin-right: 10px"
                                />
                                <div class="CourseDetail__question__content">
                                  <router-link
                                      :to="{
                                    path: '/session-active',
                                    query: {
                                      cqId: question.id,
                                      classId: classSelected, } }"
                                  >
                                  <span class="CourseDetail__question__detail"
                                  >(Question) {{ question.title }}</span
                                  >
                                    <span
                                        class="CourseDetail__question__status"
                                        :class="getStatus(question.status)"
                                    >{{ getStatus(question.status) }}</span
                                    >
                                  </router-link>
                                </div>
                              </li>
                            </div>
                          </ul>
                        </b-collapse>
                      </li>
                    </ul>
                  </div>
                  <div v-if="section.length === 0">
                    <p>This course don't have any session.</p>
                  </div>
                </section>
              </div>
            </div>
            <aside class="col-12 col-lg-4 col-xl-4">
              <div style="position: sticky; width: 20vw; top: 85px">
                <div class="CourseDetail__class">
                  <div style="padding: 25px 15px 15px">
                    <div class="CourseDetail__class__detail">
                      <span style="padding-right: 5px">Class</span>
                      <b-form-select
                          :disabled="$store.getters.role === 4"
                          class="CourseDetail__dropdown"
                          v-model="classSelected"
                          :options="options"
                          @change="onClassChange"
                      ></b-form-select>
                    </div>
                    <div>
                      <ul class="CourseDetail__class__member">
                        <li class="CourseDetail__class__member__child">
                          <h4 style="margin: 0">{{ classInfo.numberOfStudent }}</h4>
                          <span>students</span>
                        </li>
                        <li class="CourseDetail__class__member__child">
                          <h4 style="margin: 0">{{ numberOfSlot }}</h4>
                          <span>slots</span>
                        </li>
                        <li class="CourseDetail__class__member__child" style="min-width: 111px">
                          <h4 style="margin: 0">{{ getClasStatus(classInfo.status) }}</h4>
                          <span>Status</span>
                        </li>
                      </ul>
                      <div class="CourseDetail__class__date">
                        <h4>Start date: {{ classInfo.startDate }}</h4>
                      </div>
                      <div class="CourseDetail__teacher">
                        <div class="CourseDetail__teacher__heading">
                          <h4>Lecturer</h4>
                        </div>
                        <ul class="CourseDetail__teacher__detail">
                          <li class="CourseDetail__teacher__item">
                            <div>
                              <img
                                  src="@/assets/images/logo_mini.png"
                                  alt="avatar"
                                  class="CourseDetail__teacher__user"
                              />
                              <span
                                style="font-weight: 600; padding-left: 10px"
                                >{{ classInfo.teacherName }}</span
                              >
                            </div>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </article>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import {CLASS_STATUS, QUESTION_STATUS} from "@/constants/constants";
import axiosCallApi from "@/config/axiosCallApi";
import {API, API_MANAGEMENT} from "@/constants/constants-api";
import store from "@/store";
export default {
  name: "course-detail",
  components: { Layout },
  data() {
    return {
      loading: false,
      online: 1,
      numberOfSlot: 0,
      classInfo: [],
      classSelected: null,
      options: [],
      section: [],
    };
  },
  async created() {
    this.loading = true;
    await this.getListClass();
  },
  methods: {
    getStatus(statusId) {
      const status = QUESTION_STATUS.find((item) => item.id === statusId)
      if (status) {
        return status.text;
      }
    },
    getClasStatus(statusId) {
      const status = CLASS_STATUS.find((item) => item.id === statusId);
      if (status) {
        return status.text
      }
    },
    async getListClass() {
      await axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.GET_LIST_CLASS, {},
          { courseId: this.$route.query.id, userId : store.getters.userId, roleId: store.getters.role })
          .then(res => {
        this.options = [...res.data].map(item => {
          return { value: item.id, text: item.name }
        })
        this.classSelected = this.$route.query.classId ? this.$route.query.classId : res.data[0].id
        this.getCourseData(this.classSelected);
        this.getClassInfo(this.classSelected);
      }).catch(() => {
        this.loading = false
      })
    },
    async getCourseData(classId) {
      this.loading = true
      this.section = []
      await axiosCallApi
        .callApi(API.COURSE_DETAIL.GET_COURSE_DETAIL, {}, { id: classId })
        .then((res) => {
          this.section = [...res.data];
          this.numberOfSlot = this.section.length;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    async getClassInfo(classId) {
      this.loading = true
      await axiosCallApi
        .callApi(API_MANAGEMENT.CLASS_MANAGEMENT.GET_CLASS_INFO, {}, { id: classId })
        .then((res) => {
          this.classInfo = res.data
          if (this.section) {
            this.loading = false;
          }
        })
        .catch(() => {
          this.loading = false;
        });
    },
    onClassChange() {
      this.$router.push({
        name: 'course-detail',
        query: {
          id: this.$route.query.id,
          classId: this.classSelected,
        }
      })
      this.getCourseData(this.classSelected);
      this.getClassInfo(this.classSelected);
    },
    nl2br(str) {
      return str.replace(/\\n/g, "<br />");
    },
  },
};
</script>

<style lang="scss">
@import "src/assets/styles/course-detail";
</style>