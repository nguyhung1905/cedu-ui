<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1">
      <access-denied :display="role === 1 || role === 4"></access-denied>
      <div class="w-75" style="padding: 25px; margin: auto">
        <b-form  v-on:keyup.enter="onSearch()" @reset="onReset" v-if="show">
          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-1"
              label="Course Code"
              label-for="input-1"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-1"
                v-model="searchForm.courseCode"
                placeholder="Enter Course Code"
              ></b-form-input>
            </b-form-group>

            <b-form-group
              class="col-md-6"
              id="input-group-2"
              label="Title"
              label-for="input-2"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-2"
                v-model="searchForm.title"
                placeholder="Enter Title"
              ></b-form-input>
            </b-form-group>
          </div>

          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-3"
              label="Description"
              label-for="input-3"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-3"
                v-model="searchForm.description"
                placeholder="Enter Description"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              class="col-md-6"
              id="input-group-4"
              label="Status"
              label-for="input-4"
              label-cols-sm="3"
            >
              <b-form-select
                id="input-4"
                v-model="searchForm.isActive"
                :options="status"
              ></b-form-select>
            </b-form-group>
          </div>

          <div style="text-align: end; padding-right: 15px;">
            <b-button class="p-1 m-2" type="reset" variant="outline-danger">Reset</b-button>
            <b-button class="p-1 m-2" variant="outline-primary" @click="onSearch">Search</b-button>
            <b-button v-if="role === 2" variant="primary" class="p-1 m-2" @click="showModal = true">Add New</b-button>
          </div>
        </b-form>

        <!--      Table -->
        <div class="table-responsive" style="padding-right: 20px;">
          <table class="table course-table">
            <thead>
              <tr>
                <th v-for="item in fields" :key="item.key" class="table-td">
                  {{ item.key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in tableData.result" :key="course.id">
                <td>{{ tableData.page * tableData.perPage +  (tableData.result.indexOf(course) + 1) }}</td>
                <td>{{ course.courseCode }}</td>
                <td>{{ course.title }}</td>
                <td style="white-space: pre-wrap;">
                  <div class="course-desc" style="display: flex">
                    <div style="max-height: 25px; overflow: hidden">{{ course.description }}</div>
                    <div class="tooltiptext">{{ course.description }}</div>
                  </div>
                </td>
                <td>
                  <span class="badge font-size-12">
                    {{ getStatusText(course.isActive) }}
                  </span>
                </td>
                <td>
                  <router-link :to="{ path: '/cq-management', query: { courseId: course.id } }">
                    <button
                        v-b-tooltip.hover
                        title="Constructivism Question Management"
                        class="la la-question text-primary table-btn"
                    >
                    </button>
                  </router-link>
                  <button
                    v-b-tooltip.hover
                    title="Session Management"
                    class="la la-calendar text-primary table-btn"
                    @click="showModalSession(course)"
                  ></button>
                  <button
                      v-b-tooltip.hover
                      v-if="course.isActive && role === 2"
                      title="Update course"
                    class="la la-pencil text-success table-btn"
                    @click="onEdit(course)"
                  ></button>
                  <button
                      v-b-tooltip.hover
                      v-if="course.isActive && role === 2"
                      title="Delete course"
                    class="la la-trash text-danger table-btn"
                    @click="onDelete(course.id)"
                  ></button>
                  <button
                      v-b-tooltip.hover
                      v-if="!course.isActive && role === 2"
                      title="Active course"
                    class="la la-unlock-alt text-primary table-btn"
                    @click="onCourseActive(course)"
                  ></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!tableData.result" style="text-align: center;">No data found</div>
          <div class="custom-pagination">
            <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perPage"
                aria-controls="my-table"
                @change="onSearch($event)"
            ></b-pagination>
          </div>
        </div>

        <!--      Add new Course Modal -->
        <b-modal
          v-model="showModal"
          :title="modalTitle"
          :mode.sync="modalMode"
          size="xl"
          @hidden="onModalReset"
          title-class="text-black font-18"
          body-class="p-3"
          centered
          hide-footer
        >
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="courseCode" class="required">Course Code</label>
                  <input
                    id="courseCode"
                    maxlength="255"
                    :disabled="modalMode === 2"
                    v-model="submitForm.courseCode"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && $v.submitForm.courseCode.$error,
                    }"
                  />
                  <div
                    v-if="submitted && !$v.submitForm.courseCode.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label for="courseTitle" class="required">Course Title</label>
                  <input
                    id="courseTitle"
                    maxlength="255"
                    v-model="submitForm.title"
                    type="text"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.submitForm.title.$error,
                    }"
                  />
                  <div
                    v-if="submitted && !$v.submitForm.title.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label for="courseDesc" class="required"
                    >Course Description</label
                  >
                  <textarea
                    id="courseDesc"
                    v-model="submitForm.description"
                    maxlength="2000"
                    rows="3"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        submitted && $v.submitForm.description.$error,
                    }"
                  />
                  <div
                    v-if="submitted && !$v.submitForm.description.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div v-if="modalMode === 1" class="col-12">
                <div class="mb-3">
                  <label class="control-label">Session</label>
                  <div>
                    <span>You can download the
                    <a class="template-link" @click="downloadExcel">File of Sessions List Template</a> to add sessions list here
                    </span>
                    <i
                        v-b-tooltip.hover
                        title="Download Template"
                        class="la la-download"
                        @click="downloadExcel()"
                    ></i>
                  </div>
                  <div>
                    <input ref="myFile" type="file" :accept="acceptFile" @change="onFileChange" @click="(e) => e.target.value = null"/>
                    <p>Number of session: {{ numOfSession }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-btn">
              <b-button variant="light" @click="onModalReset">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1"
                >Save</b-button
              >
            </div>
          </form>
        </b-modal>

        <!-- View Session modal-->
        <b-modal
          v-model="showViewSessionModal"
          size="lg"
          @hidden="onCancelAddSessions"
          title="Session Management"
          title-class="text-black font-18"
          body-class="p-3"
          centered
          hide-footer
        >
          <form>
            <div style="padding-bottom: 16px;">
              <p><span style="font-weight: 700">Course code: </span>{{ courseCode }}</p>
              <p style="margin: 0;">
                <span style="font-weight: 700">Course title: </span>
                <span v-html="nl2br(courseName)"></span>
              </p>
            </div>
            <div  v-if="(sessionItems.length === 0 || !enableEdit) && courseStatus" class="mb-3" style="padding-top: 16px;">
              <b-button class="mr-3" variant="success" type="button" @click="onImportSessions">Import Excel</b-button>
              <span>You can download the file
                <a class="template-link" @click="downloadExcel">File of Sessions List Template</a> to add sessions list here
              <i
                  v-b-tooltip.hover
                  title="Download Template"
                  class="la la-download"
                  @click="downloadExcel()"
              ></i>
              </span>
              <div hidden>
                <input ref="file" type="file" :accept="acceptFile" @click="(e) => e.target.value = null" @change="onFileChange($event)" />
              </div>
            </div>
            <table class="table sesion-table" :class="{ 'flex-table' : sessionItems.length }">
              <thead>
              <tr>
                <th
                    v-for="item in sessionFields"
                    :key="item.key"
                    class="table-td"
                >
                  {{ item.key }}
                </th>
              </tr>
              </thead>
              <tbody>
              <tr v-for="session in sessionItems" :key="session.id">
                <td>{{ session.order }}</td>
                <td>
                  <div style="white-space: pre-wrap">{{ session.name }}</div>
                </td>
                <td>
                  <button
                      v-b-tooltip.hover
                      v-if="!addOnlySessions && courseStatus"
                      title="Edit session"
                      type="button"
                      class="la la-pencil text-success"
                      style="border: none; background: inherit"
                      @click="showEditSession(session)"
                  ></button>
                </td>
              </tr>
              </tbody>
            </table>
            <div v-if="!sessionItems.length" style="text-align: center;">No data found</div>
            <div class="modal-btn">
              <b-button v-if="!allowSave" variant="primary" @click="onCancelAddSessions">OK</b-button>
              <b-button v-if="addOnlySessions && allowSave"  variant="light" @click="onCancelAddSessions">Cancel</b-button>
              <b-button v-if="addOnlySessions && allowSave" type="button" variant="primary" class="ms-1" @click="handleSubmitSessionsClass">Save</b-button>
            </div>
          </form>
        </b-modal>

<!--        Edit session modal-->
        <b-modal
            v-model="showEditSessionModal"
            title="Edit session"
            size="md"
            title-class="text-black font-18"
            body-class="p-3"
            centered
            hide-footer
        >
          <form @submit.prevent="handleSubmitEditSession">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="sessionName" class="required">Session Name</label>
                  <textarea
                      id="sessionName"
                      maxlength="255"
                      rows="5"
                      v-model="editSessionData.name"
                      class="form-control"
                      :class="{
                          'is-invalid': submittedSession && $v.editSessionData.name.$error,
                      }"
                  />
                  <div
                      v-if="submittedSession && !$v.editSessionData.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-btn">
              <b-button variant="light" @click="showEditSessionModal = false">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1">Save</b-button>
            </div>
          </form>
        </b-modal>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import { required } from "vuelidate/lib/validators";
import Vue from "vue";
import { Vuelidate } from "vuelidate";
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import {MODAL_MODE, USER_ROLE} from "@/constants/constants";
import {DANGER, showAlert, showConfirmDialog, SUCCESS, WARNING} from "@/utils/alertMessage";
import store from "@/store";
import AccessDenied from "@/components/error-page/access-denied";
import * as XLSX from "xlsx";

Vue.use(Vuelidate);

export default {
  name: "course-management",
  components: {AccessDenied, Layout },
  computed: {},
  data() {
    return {
      role: store.getters.role,
      loading: false,
      tableData: {},
      file: null,
      allowSave: false,
      collection: null,
      acceptFile: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      fields: [
        { key: "No" },
        { key: "Course Code" },
        { key: "Title" },
        { key: "Description" },
        { key: "Status" },
        { key: "Action" },
      ],
      sessionFields: [
        { key: "Order", label: "Order", class: 'no-col'},
        { key: "Name", label: "Title"},
        { key: "Actions", label: "", class: "edit-col" },
      ],
      status: [
        { text: "Select one", value: '', disabled: true  },
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      show: true,
      showModal: false,
      showViewSessionModal: false,
      showEditSessionModal: false,
      submitted: false,
      submittedSession: false,
      modalMode: MODAL_MODE.NEW,
      modalTitle: "Create New Course",
      submitForm: {
        isActive: true,
        sessions: []
      },
      numOfSession: 0,
      sessionItems: [],
      courseCode: '',
      courseName: '',
      courseStatus: null,
      showCqModal: false,
      isManager: 0,
      rowUpdate: {},
      searchForm: {
        isActive: '',
        pageSize: 10,
        pageNumber: 1,
      },
      rows: 0,
      currentPage: 1,
      perPage: 10,
      addOnlySessions: false,
      courseId: null,
      enableEdit: false,
      editSessionData: [],
      course: {},
    };
  },
  validations: {
    submitForm: {
      courseCode: { required },
      title: { required },
      description: { required },
      isActive: { required },
    },
    editSessionData: {
      name: { required }
    }
  },
  async created() {
    if (store.getters.role === USER_ROLE.LECTURER) {
      this.searchForm.lecturerId = store.getters.userId
    }
  },
  methods: {
    getStatusText(status) {
      return this.status.find((i) => i.value === status).text;
    },
    onSearch(page) {
      this.loading = true;
      if (!isNaN(page)) {
        this.searchForm.pageNumber = +(page)
      } else {
        this.searchForm.pageSize = 10
        this.searchForm.pageNumber = 1
        this.rows = 0
      }
      axiosCallApi
        .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.SEARCH, {}, this.searchForm)
        .then((res) => {
          this.tableData = res.data;
          this.rows = res.data.totalElements
          this.loading = false
          this.isPage = false
        }).catch(() => {
          this.loading = false
      });
    },
    onReset(event) {
      event.preventDefault();
      // Reset our form values
      this.searchForm = {
        isActive: '',
        pageSize: 10,
        pageNumber: this.currentPage,
      }
      if (store.getters.role === USER_ROLE.LECTURER) {
        this.searchForm.lecturerId = store.getters.userId
      }
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    onModalReset() {
      // Reset vuelidate course-table
      this.$nextTick(() => {
        this.$v.$reset();
      });
      // Reset our form values
      this.submitForm = {
        isActive: true,
        sessions: []
      };
      this.numOfSession = 0
      this.showModal = false;
      this.modalMode = MODAL_MODE.NEW;
      this.modalTitle = "Create New Course"
    },
    handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.submitForm.$touch();
      if (this.$v.submitForm.$invalid) {
        return;
      } else {
        if (!this.submitForm.id && !this.loading) {
          this.loading = true
          axiosCallApi
            .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.CREATE, this.submitForm)
            .then((res) => {
              if (res.data) {
                this.onSearch();
                this.onModalReset();
                this.submitted = false;
                this.loading = false;
                showAlert(this, SUCCESS, 'Add new course successfully')
              }
            }, err => {
            showAlert(this, DANGER, err.response.data.error.message)
            this.loading = false
            }).catch(() => {
              this.loading = false
            showAlert(this, DANGER, 'Add new course failed')
          });
        } else if (!this.loading){
          this.loading = true
          axiosCallApi
            .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.UPDATE, this.submitForm)
            .then(() => {
              this.onSearch(this.currentPage);
              this.onModalReset();
              this.submitted = false;
              this.loading = false;
              showAlert(this, SUCCESS, 'Update course successfully')
            }, err => {
              showAlert(this, DANGER, err.response.data.error.message)
              this.loading = false
            }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Update course failed')
          });
        }
      }
    },
    onEdit(rowData) {
      this.modalTitle = "Update Course";
      this.modalMode = MODAL_MODE.EDIT;
      this.submitForm = {
        id: rowData.id,
        courseCode: rowData.courseCode,
        title: rowData.title,
        description: rowData.description,
        isActive: rowData.isActive,
      }
      this.showModal = true;
    },
    onDelete(id) {
      showConfirmDialog(this, 'Are you sure you want to delete this course?', (value) => {
        if (value && id) {
          this.loading = true
          axiosCallApi
              .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.DELETE, {}, { id: id })
              .then(() => {
                this.onSearch(this.currentPage);
                this.loading = false;
                showAlert(this, SUCCESS, 'Delete course successfully')
              }).catch(() => {
                this.loading = false
                showAlert(this, DANGER, 'Delete course failed')
          });
        }
      })
    },
    onCourseActive(course) {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.COURSE_MANAGEMENT.UPDATE, { id: course.id, isActive: true }).then(res => {
        if (res.data) {
          this.onSearch(this.currentPage)
          this.loading = false
          showAlert(this, SUCCESS, 'Activate course successfully')
        }
      }).catch(() => {
        this.loading = false
        showAlert(this, SUCCESS, 'Activate course successfully')
      })
    },
    onImportSessions() {
      this.$refs.file.click()
      this.addOnlySessions = true
    },
    onFileChange(event) {
      this.file = event.target.files ? event.target.files[0] : null;
      if (this.file && this.acceptFile.includes(this.file.type)) {
        const reader = new FileReader();

        reader.onload = (e) => {
          /* Parse data */
          const bstr = e.target.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          /* Get first worksheet */
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          /* Convert array of arrays */
          const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

          if ((this.file.name.indexOf('Add-Session') !== -1)) {
            const realData = data.splice(1)
            this.allowSave = !!realData.length;
            if (!this.allowSave) {
              showAlert(this, WARNING, 'Upload file have no data. Please check the upload file')
            }
            if (!this.addOnlySessions) {
              this.submitForm.sessions = []
              this.numOfSession = 0
              let errorNum = 0
              realData.forEach(item => {
                if (item[0] && item[1]) {
                  this.submitForm.sessions.push({
                    order: item[0],
                    name: item[1]
                  })
                }  else if (!item[0] || !item[1]){
                  errorNum = errorNum + 1
                }
              })
              if (errorNum) {
                if (errorNum === 1) {
                  showAlert(this, WARNING, 'Upload file has ' + errorNum + ' row missing data')
                } else {
                  showAlert(this, WARNING, 'Upload file have ' + errorNum + ' rows missing data')
                }
              }
              this.numOfSession = this.submitForm.sessions.length
            } else {
              this.sessionItems = []
              const sessionsData = []
              let errorNum = 0
              realData.forEach(item => {
                if (item[0] && item[1]) {
                  sessionsData.sort((a, b) => a.order - b.order).push({
                    courseId: this.courseId,
                    order: item[0],
                    name: item[1]
                  })
                } else {
                  errorNum = errorNum + 1
                }
              })
              let listFailOrder = []
              if(sessionsData.length){
                for (let i = sessionsData[0].order; i <= sessionsData.length; i++) {
                  if (sessionsData[+(i - 1)].order === i) {
                    this.sessionItems.push(sessionsData[+(i - 1)])
                  } else {
                    listFailOrder.push(sessionsData[+(i - 1)].order)
                  }
                }
                if (listFailOrder.length) {
                  showAlert(this, DANGER, 'Can\'t get the session with the order is in ' + listFailOrder)
                }
              }
              if (errorNum) {
                if (errorNum === 1) {
                  showAlert(this, WARNING, 'Upload file has ' + errorNum + ' row missing data')
                } else {
                  showAlert(this, WARNING, 'Upload file have ' + errorNum + ' rows missing data')
                }
              }
            }
          } else {
            this.numOfSession = 0
            showAlert(this, DANGER, 'Upload file is not accepted')
          }
        }
        reader.readAsBinaryString(this.file);
      } else {
        showAlert(this, DANGER, 'Upload file is not accepted')
      }
    },
    onCancelAddSessions() {
      this.showViewSessionModal = false
      this.enableEdit = false
      this.addOnlySessions = false
      this.sessionItems = []
      this.allowSave = false
    },
    async handleSubmitSessionsClass() {
      if (!this.loading) {
        this.loading = true
        await axiosCallApi.callApi(API_MANAGEMENT.SESSION_MANAGEMENT.INSERT_LIST_SESSION, this.sessionItems).then(res => {
          if (res.data) {
            showAlert(this, SUCCESS, 'Add list of sessions successfully')
            axiosCallApi
                .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_SESSIONS_BY_COURSE, {}, { courseId: this.courseId})
                .then(res => {
                  this.sessionItems = [...res.data]
                  if (this.sessionItems.length !== 0) {
                    this.enableEdit = true
                    this.addOnlySessions = false
                  }
                  this.loading = false
                }).catch(() => {
              this.loading = false
            })
            this.loading = false
          } else {
            this.loading = false
            showAlert(this, DANGER, 'Add list of sessions failed')
          }
        }, err => {
          this.loading = false
          showAlert(this, DANGER, err.response.data.error.message)
        }).catch(() => {
          this.loading = false
          showAlert(this, DANGER, 'Add list of sessions failed')
        })
      }
    },
    downloadExcel() {
      let fileLink = "";
      fileLink = document.createElement("a");
      fileLink.href = "Add-Session.xlsx";
      fileLink.setAttribute("download", "");
      fileLink.click();
    },
    showEditSession(session) {
      this.editSessionData = {
        courseId: session.courseId,
        id: session.id,
        name: session.name,
        order: session.order,
      }
      this.showEditSessionModal = true
    },
    handleSubmitEditSession() {
      this.submittedSession = true
      this.$v.editSessionData.$touch()
      if (this.$v.editSessionData.$invalid) {
        return;
      } else {
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.SESSION_MANAGEMENT.UPDATE, this.editSessionData, {}).then(res => {
          if (res.data) {
            this.loading = false
            this.showEditSessionModal = false
            this.showModalSession(this.course)
            showAlert(this, SUCCESS, 'Update session title successfully')
          }
        }).catch(() => {
          this.loading = false
        })
      }
    },
    showModalSession(course) {
      this.course = course
      this.showViewSessionModal = true
      this.loading = true
      this.courseId = course.id
      this.courseCode = course.courseCode
      this.courseName = course.title
      this.courseStatus = course.isActive
      axiosCallApi
          .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_SESSIONS_BY_COURSE, {}, { courseId: course.id})
            .then(res => {
              this.sessionItems = [...res.data]
              if (this.sessionItems.length !== 0) {
                this.enableEdit = true
              }
              this.loading = false
            }).catch(() => {
              this.loading = false
      })
    },
    nl2br(str) {
      if (str)
      return str.replace(/\\n/g, "<br />");
    },
  },
};
</script>

<style scoped lang="scss">
@import "src/assets/styles/course-management.scss";
</style>