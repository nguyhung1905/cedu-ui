<template>
  <Layout :loading="loading">
    <main class="SessionDetail__main">
      <div class="SessionDetail__container">
        <b-breadcrumb
          class="SessionDetail__breadcrumb"
          :items="breadcrumbItems"
      ></b-breadcrumb>
        <article>
          <div class="row">
            <div class="col-12 col-lg-8">
              <section style="margin-bottom: 20px">
                <h1 class="SessionDetail__title" v-html="nl2br(session.sessionName)"></h1>
              </section>
              <section>
                <ul class="SessionDetail__session_info">
                  <li>
                    <i class="la la-book"></i>
                    {{ classInfo.courseCode}}
                  </li>
                  <li>
                    <i class="la la-folder"></i>
                    {{ classInfo.className}}
                  </li>
                </ul>
              </section>

              <div class="SessionDetail__content">
                <b-tabs
                  active-nav-item-class="font-weight-bold text-primary"
                  active-tab-class=""
                  content-class="mt-3"
                >
                  <b-tab title="Contents" active>
                    <section>
                      <div class="SessionDetail__content__list">
                        <div class="SessionDetail__content__slot">
                          <div
                              v-if="session.questions.length === 0"
                            class="SessionDetail__question"
                          >
                            <span>This slot has no content</span>
                          </div>
                          <div
                            v-else
                            class="SessionDetail__question"
                            v-for="question of session.questions"
                            :key="question.id"
                          >
                            <div class="session-item">
                              <img
                                src="@/assets/images/question.svg"
                                alt="question"
                                style="margin-right: 10px"
                              />
                              <div class="SessionDetail__question__content">
                                <router-link :to="{ path: '/session-active', query: {
                                      cqId: question.id,
                                      classId: classId } }">
                                  <span
                                    class="SessionDetail__question__detail"
                                    >(Question) {{ question.title }}
                                  </span>
                                  <span
                                    class="SessionDetail__question__creator"
                                    >{{ getCreator(question.isCreatedByManager) }}
                                  </span>
                                  <span
                                    class="SessionDetail__question__status"
                                    :class="getStatus(question.status)"
                                    >{{ getStatus(question.status) }}
                                  </span>
                                </router-link>
                              </div>
                            </div>
                            <div v-if="$store.getters.role === 3">
                              <b-button v-if="question.status === 5 && classInfo.status !== 3" variant="outline-primary" @click="onShowCq(question)">Show</b-button>
                              <b-button v-if="question.status === 1 && classInfo.status !== 3" variant="outline-primary" @click="onHiddenCq(question)">Hidden</b-button>
                            </div>
                            <b-button
                              v-if="question.status === 'finished'"
                              variant="outline-primary"
                              class="SessionDetail__cq-action-btn primary"
                              >Restart</b-button>
                            <b-button
                              v-if="question.status === 'not-start'"
                              variant="outline-primary"
                              class="SessionDetail__cq-action-btn primary"
                              >Start</b-button>
                          </div>
                          <div></div>
                        </div>
                      </div>
                      <div v-if="$store.getters.role === 3 && classInfo.status !== 3" class="SessionDetail__activity_list">
                        <b-button
                          variant="outline-primary"
                          style="border-radius: 8px"
                          @click="onAddNewCq"
                        >
                          + Add new constructivism question</b-button>
                      </div>
                      <cq-modal :show-modal="showModal" :submit-form="submitForm" :course-id="classInfo.courseId" :session-id="session.sessionId" @onClose="closeCq()" @onAfterCommit="onAfterCommit()"></cq-modal>
                    </section>
                  </b-tab>
                  <b-tab title="Students" @click="getStudentsList()">
                    <section>
                      <div>
                        <div v-if="isGrouped === false">
                          <span class="SessionDetail__no-group"
                            >Students have not been grouped.</span
                          >
                        </div>
                        <table class="SessionDetail__table_student" style="border: 1px solid #dee2e6; border-bottom: none">
                          <thead>
                            <tr class="fs-16" style="display: table-row">
                              <th class="SessionDetail__table_student__no-number">#</th>
                              <th id="student-col" style="width: 50%">Student</th>
                              <th id="email-col">Email</th>
                              <th class=""></th>
                            </tr>
                          </thead>
                        </table>
                        <div v-for="group of studentsList" :key="group.id">
                          <div v-if="isGrouped">
                            <div class="">
                              <div
                                v-b-toggle="[group.name]"
                                style="border: 1px solid #dee2e6"
                                class="SessionDetail__group-title font-weight-bold">
                                <i class="las la-angle-down"></i>
                                <span class="name">
                                  <span>{{ group.name }}</span>
                                </span>
                              </div>
                              <b-collapse :id="group.name">
                                <table class="SessionDetail__student-table" style="border: 1px solid #dee2e6">
                                  <tbody>
                                    <tr v-for="std of group.listStudentByGroups" :key="std.id">
                                      <td style="width: 60px; text-align: center">{{ group.listStudentByGroups.indexOf(std) + 1 }}</td>
                                      <td id="name-col-data" style="width: 50%">
                                        <div style="
                                            display: flex;
                                            align-items: center;
                                          ">
                                          <img
                                            src="@/assets/images/logo_mini.png"
                                            :alt="std.name"
                                            class="student-img"
                                          />
                                          <div class="student-content">
                                            <span class="font-weight-bold" :title="std.email">
                                              <span>{{ std.name }}</span>
                                            </span>
                                          </div>
                                        </div>
                                      </td>
                                      <td id="email-col-data">{{ std.email }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </b-collapse>
                            </div>
                          </div>
                        </div>
                      </div>
                    </section>
                  </b-tab>
                </b-tabs>
              </div>
            </div>
            <aside class="col-12 col-lg-4 col-xl-4">
              <div style="position: fixed; width: 25vw">
                <div class="SessionDetail__class">
                  <div style="padding: 25px 15px 15px">
                    <div>
                      <ul class="SessionDetail__class__member">
                        <li class="SessionDetail__class__member__child">
                          <h4 style="margin: 0">{{ classInfo.numberOfStudent }}</h4>
                          <span>students</span>
                        </li>
                        <li class="SessionDetail__class__member__child">
                          <h4 style="margin: 0">{{ session.questions.length }}</h4>
                          <span>activities</span>
                        </li>
                        <li class="SessionDetail__class__member__child">
                          <h4 style="margin: 0">{{ getClasStatus(classInfo.status) }}</h4>
                          <span>Status</span>
                        </li>
                      </ul>
                      <div class="SessionDetail__teacher">
                        <div class="SessionDetail__teacher__heading">
                          <h4>Lecturer</h4>
                        </div>
                        <ul class="SessionDetail__teacher__detail">
                          <li class="SessionDetail__teacher__item">
                            <div>
                              <img
                                  src="@/assets/images/logo_mini.png"
                                  alt="avatar"
                                  class="SessionDetail__teacher__user"
                              />
                              <span style="font-weight: 600; padding-left: 10px">{{ classInfo.teacherName }}</span>
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
import Vue from "vue";
import { Vuelidate } from "vuelidate";
import axiosCallApi from "@/config/axiosCallApi";
import {API, API_MANAGEMENT, REALTIME_API} from "@/constants/constants-api";
import {CLASS_STATUS, QUESTION_STATUS, STATUS, USER_ROLE} from "@/constants/constants";
import CqModal from "@/pages/cq-modal";
import store from "@/store";
import {DANGER, showAlert, SUCCESS} from "@/utils/alertMessage";

Vue.use(Vuelidate);

export default {
  name: "session-detail",
  components: {CqModal, Layout },
  computed: {},
  data() {
    return {
      loading: false,
      session: {
        questions: [],
      },
      studentsList: [],
      isGrouped: false,
      classInfo: [],
      creator: [
        { text: 'System provided', value: true },
        { text: 'Teacher provided', value: false },
      ],
      classId: this.$route.query.classId,
      showModal: false,
      submitForm: {
        cq: {},
        settings: {},
      },
      visible: false,
      breadcrumbItems: []
    };
  },
  beforeCreate() {
  },
  watch: {
    classInfo() {
      this.breadcrumbItems = [
        {
          text: "Home",
          href: "/home",
        },
        {
          text: this.classInfo.courseTitle,
          href: "/course-detail?id=" + this.classInfo.courseId,
        },
        {
          text: 'Slot ' + this.session.order,
          active: true,
        },
      ]
    },
    session() {
      this.breadcrumbItems = [
        {
          text: "Home",
          href: "/home",
        },
        {
          text: this.classInfo.courseTitle,
          href: "/course-detail?id=" + this.classInfo.courseId,
        },
        {
          text: 'Slot ' + this.session.order,
          active: true,
        },
      ]
    }
  },
  async created() {
    await this.getData()
    await this.getClassInfo()
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
    getCreator(isManager) {
      return this.creator.find(item => item.value === isManager).text
    },
    getData() {
      this.loading = true
      axiosCallApi.callApi(API.COURSE_DETAIL.GET_SESSION_DETAIL,{}, { classroomId: this.$route.query.classId, sessionId: this.$route.query.sessionId })
      .then(res => {
        this.session =  res.data[0]
        if (store.getters.role === USER_ROLE.STUDENT) {
          this.session.questions = this.session.questions.filter(item => item.status !== STATUS.HIDDEN)
        }
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getClassInfo() {
      this.loading = true;
      axiosCallApi
          .callApi(
              API_MANAGEMENT.CLASS_MANAGEMENT.GET_CLASS_INFO,
              {},
              { id: this.$route.query.classId }
          )
          .then(res => {
            this.classInfo = res.data
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
          });
    },
    getStudentsList() {
      this.loading = true
      let studentsData = []
      axiosCallApi.callApi(API_MANAGEMENT.GROUPS.GET_GROUPS, {},
          { classSessionId: this.session.classSessionId }).then(res => {
        axiosCallApi.callApi(API_MANAGEMENT.GROUPS.WAITING_LIST, {},
            { classId: this.$route.query.classId, classSessionId: this.session.classSessionId }).then(resStd => {
          if (!res.data) {
            this.isGrouped = false
            studentsData.push(resStd.data)
            this.loading = false
          } else {
            this.isGrouped = true
            studentsData = [...res.data]
            if (resStd.data.listStudentByGroups.length) {
              studentsData.unshift(resStd.data)
            }
            this.loading = false
          }
          const userData = []
          studentsData.forEach(group => {
            group.listStudentByGroups.forEach(item => {
              userData.push(item.id)
            })
          })
          if (userData) {
            this.getUsersData(userData, studentsData)
          }
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    getUsersData(userData, data) {
      axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH_BY_USERID, {}, { userId: userData }).then(res => {
        data.forEach(group => {
          group.listStudentByGroups.forEach(item => {
            const userValid = res.data.find(user => user.userId === item.id)
            if (userValid) {
              item.name = userValid.name
            }
          })
        })
        this.studentsList = data
      })
    },
    onAddNewCq() {
      this.submitForm.classroomSessionId = this.session.classSessionId
      this.submitForm.statusId = STATUS.CREATED
      this.submitForm.cq.sessionId = this.session.sessionId
      this.submitForm.cq.ownerId = store.getters.userId
      this.submitForm.cq.classId = this.$route.query.classId
      this.showModal = true
    },
    closeCq() {
      this.submitForm = {
        cq: {},
      }
      this.showModal = false
    },
    async onShowCq(question) {
      this.loading = true
      await axiosCallApi.callApi(API_MANAGEMENT.PRIVATE_CQ_MANAGEMENT.UPDATE, { id: question.id, statusId: STATUS.CREATED }).then(() => {
        question.status = STATUS.CREATED
        axiosCallApi.callApi(REALTIME_API.CHANGE_STATUS, { id: question.id, statusId: STATUS.CREATED })
        this.loading = false
        showAlert(this, SUCCESS, 'Show the constructivism question to student successfully')
      }).catch(() => {
        this.loading = false
        showAlert(this, DANGER, 'Show failed.')
      })
    },
    async onHiddenCq(question) {
      this.loading = true
      await axiosCallApi.callApi(API_MANAGEMENT.PRIVATE_CQ_MANAGEMENT.UPDATE, { id: question.id, statusId: STATUS.HIDDEN }).then(() => {
        question.status = STATUS.HIDDEN
        axiosCallApi.callApi(REALTIME_API.CHANGE_STATUS, { id: question.id, statusId: STATUS.HIDDEN })
        this.loading = false
        showAlert(this, SUCCESS, 'Hide the constructivism question to student successfully')
      }).catch(() => {
        this.loading = false
        showAlert(this, DANGER, 'Hidden failed.')
      })
    },
    onAfterCommit() {
      this.getData()
    },
    nl2br(str) {
      if (str)
      return str.replace(/\\n/g, "<br />");
    },
  }
};
</script>

<style scoped lang="scss">
@import "src/assets/styles/session-detail.scss";
</style>