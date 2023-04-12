<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1">
      <div class="container" style="margin: auto">
        <div>
          <div style="padding-top: 16px">
            <p><span style="font-weight: 700">Course code: </span>{{ courseInfo.courseCode }}</p>
            <p>
              <span style="font-weight: 700">Course title: </span> {{ courseInfo.title }}
            </p>
            <div v-if="$store.getters.role === 2" class="row">
              <div class="col-6">
                <b-form-group
                    id="input-group-2"
                    label="Owner filter"
                    label-for="input-2"
                    label-cols-sm="3"
                >
                  <b-form-select
                      id="input-2"
                      v-model="selectedLecturer"
                      :options="lecturerOptions"
                      @change="filterCq"
                  ></b-form-select>
                </b-form-group>
              </div>
              <div v-if="$store.getters.role === 2 && courseInfo.isActive" class="col-6" style="text-align: end;">
                <b-button variant="outline-primary" @click="addNewCq">Add new constructivism question</b-button>
              </div>
            </div>
            <div v-if="courseInfo.isActive" class="row mb-3">
              <div class="col-6"></div>
              <div class="col-6" style="text-align:end;"> 
                <input hidden ref="file" type="file" :accept="acceptFile" @change="onFileChange($event)" @click="(e) => e.target.value = null"/>
                <b-button v-if="$store.getters.role === 2" variant="success" class="mr-1" @click="uploadExcel()">Import Excel</b-button>
                <b-button
                    v-b-tooltip.hover
                    title="Download the template file of constructivism question"
                    v-if="$store.getters.role === 2"
                    variant="primary"
                    @click="exportExcel()"
                >Download template</b-button>
              </div>
            </div>
          </div>
          <table class="table cq-table">
            <thead>
            <tr>
              <th
                  v-for="item in cqFields"
                  :key="item.key"
                  class="table-td"
              >
                {{ item.key }}
              </th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="cq in cqList" :key="cq.id">
              <td>{{ cqList.indexOf(cq) + 1 }}</td>
              <td>{{ cq.sessionOrder }}</td>
              <td>{{ cq.title }}</td>
              <td>{{ getName(cq) }}</td>
              <td>
                <span v-if="cq.isActive" class="badge font-size-12">Active</span>
                <span v-else class="badge font-size-12">InActive</span>
              </td>
              <td>
                <button
                    v-b-tooltip.hover
                    title="View constructivism question"
                    class="la la-eye text-primary"
                    style="border: none; background: inherit"
                    @click="onViewCq(cq)"
                ></button>
                <button
                    type="button"
                    v-if="(cq.ownerId === $store.getters.userId || $store.getters.role === 2) && courseInfo.isActive && cq.isActive"
                    v-b-tooltip.hover
                    title="Update constructivism question"
                    class="la la-pencil text-success"
                    style="border: none; background: inherit"
                    @click="onEditCq(cq)"
                ></button>
                <button
                    v-if="(cq.ownerId === $store.getters.userId || $store.getters.role === 2) && cq.isActive && courseInfo.isActive"
                    v-b-tooltip.hover
                    title="Delete constructivism question"
                    class="la la-trash text-danger"
                    style="border: none; background: inherit"
                    @click="onDeleteCq(cq.id)"
                ></button>
                <button
                    v-b-tooltip.hover
                    v-if="(cq.ownerId === $store.getters.userId || $store.getters.role === 2) && !cq.isActive && courseInfo.isActive"
                    title="Active constructivism question"
                    class="la la-unlock-alt text-primary table-btn"
                    @click="onActiveCq(cq)"
                ></button>
              </td>
            </tr>
            </tbody>
          </table>
          <div v-if="!cqFields" style="text-align: center;">No data found</div>
          <div class="custom-pagination">
            <b-pagination
                v-model="currentPage"
                :total-rows="rows"
                :per-page="perPage"
                aria-controls="my-table"
                @change="onPageChange($event)"
            ></b-pagination>
          </div>
        </div>
      </div>

<!--      Cq modal-->
      <b-modal
          v-model="showCqModal"
          id="modal-1"
          :mode.sync="mode"
          @hidden="onResetModal"
          size="lg"
          title="Constructive Question"
          title-class="text-black font-18"
          body-class="p-3"
          centered
          hide-footer
          no-close-on-backdrop
      >
        <form @submit.prevent="handleSubmit" class="add-new-cq-modal" @reset="onResetModal">
          <div class="col-12">
            <div class="mb-3">
              <label for="session" class="required">Session</label>
              <b-form-select
                  id="session"
                  :disabled="mode !== 1"
                  v-model="submitForm.sessionId"
                  :options="sessionList"
                  class="form-control"
                  :class="{
                'is-invalid':
                submitted && $v.submitForm.sessionId.$error,
              }"
              ></b-form-select>
              <div
                  v-if="submitted && !$v.submitForm.sessionId.required"
                  class="invalid-feedback"
              >
                This value is required.
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="mb-3">
              <label for="title" class="required">Title</label>
              <input
                  id="title"
                  maxlength="255"
                  :disabled="mode === 3"
                  v-model="submitForm.title"
                  type="text"
                  class="form-control"
                  :class="{
                'is-invalid':
                submitted && $v.submitForm.title.$error,
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
              <label for="description" class="required">Description</label>
              <textarea
                  id="description"
                  v-model="submitForm.content"
                  maxlength="2000"
                  :disabled="mode === 3"
                  rows="3"
                  max-rows="5"
                  class="form-control"
                  :class="{
                'is-invalid':
                submitted && $v.submitForm.content.$error,
              }"
              ></textarea>
              <div
                  v-if="submitted && !$v.submitForm.content.required"
                  class="invalid-feedback"
              >
                This value is required.
              </div>
            </div>
          </div>
          <div style="text-align: end; padding-top: 10px">
            <b-button
                v-if="mode === 3"
                type="reset"
                variant="outline-primary"
                class="add-cq-button"
            >Ok</b-button>
            <b-button
                v-if="mode !== 3"
                type="reset"
                variant="outline-primary"
                class="add-cq-button"
            >Close</b-button>
            <b-button
                v-if="mode !== 3"
                type="submit"
                variant="primary"
                class="ms-1 add-cq-button"
            >Save</b-button>
          </div>
        </form>
        <b-overlay :show="modalLoading" no-wrap style="z-index: 1099"></b-overlay>
      </b-modal>
    </main>
  </Layout>
</template>

<script>
import {MODAL_MODE, USER_ROLE} from "@/constants/constants";
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import Layout from "@/components/layout";
import * as XLSX from "xlsx";
import {DANGER, showAlert, showConfirmDialog, SUCCESS, WARNING} from "@/utils/alertMessage";
import store from "@/store";
import {required} from "vuelidate/lib/validators";
import Vue from "vue";
import {Vuelidate} from "vuelidate";
import {mapGetters} from "vuex";
// import apiFactory from "@/config/apiFactory";

Vue.use(Vuelidate);
export default {
  name: "cq-management",
  components: {Layout},
  data() {
    return {
      file: null,
      showCqModal: false,
      submitted: false,
      sessionList: [],
      loading: false,
      modalLoading: false,
      cqFields: [{ key: "No" },{ key: "Session" }, { key: "Title" }, { key: "Owner" }, { key: "Status" }, { key: "Action" }],
      cqList: [],
      courseId: this.$route.query.courseId,
      listUsers: [],
      submitForm: {
        isActive: true,
        isCreatedByManager: store.getters.role === USER_ROLE.TRAINING_MANAGER ? 1 : 0,
        ownerId: store.getters.userId,
      },
      mode: MODAL_MODE.NEW,
      selectedLecturer: '',
      lecturerOptions: [
        { text: 'All', value: ''},
      ],
      acceptFile: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      rows: 0,
      currentPage: 1,
      perPage: 10,
      pageNumber: 1,
      courseInfo: [],
    }
  },
  validations: {
    submitForm: {
      sessionId: { required },
      title: { required },
      content: { required },
    },
  },
  computed: {
    ...mapGetters(["role"]),
  },
  async created() {
    this.loading = true
    await axiosCallApi.callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_BY_ID, {}, { id: this.$route.query.courseId }).then(res => {
      if (res.data) {
        this.courseInfo = res.data
      }
    })
    this.getListSession()
    await this.listCq()
  },
  methods: {
    onFileChange(event) {
      this.loading = true
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
          const fileData = []

          if ((this.file.name.indexOf('CQTemplate') !== -1)) {
            let errorNum = 0
            data.splice(1).filter(cq => !!cq[0]).forEach(item => {
              if (item[0] && item[3] && item[4]) {
                fileData.push({
                  sessionId: item[0],
                  title: item[3],
                  content: item[4],
                  isCreatedByManager: store.getters.role === USER_ROLE.TRAINING_MANAGER ? 1 : 0,
                  ownerId: store.getters.userId,
                })
              } else if (item[0] && (!item[3] || !item[4])) {
                errorNum = errorNum + 1
              }
            })
            if (errorNum) {
              if (errorNum === 1) {
                this.loading = false
                showAlert(this, DANGER, 'Add list of constructivism questions failed. Upload file has ' + errorNum + ' row missing data')
              } else {
                this.loading = false
                showAlert(this, DANGER, 'Add list of constructivism questions failed. Upload file have ' + errorNum + ' rows missing data')
              }
            } else { 
              if (fileData.length > 0) {
                axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.INSERT_LIST_CQ, fileData, { courseId: this.$route.query.courseId }).then(res => {
                  if (res.data) {
                    this.listCq()
                    this.loading = false
                    showAlert(this, SUCCESS, 'Add list of constructivism questions successfully')
                  } else {
                    this.loading = false
                    showAlert(this, DANGER, 'Add list of constructivism questions failed')
                  }
                }, err => {
                  this.loading = false
                  showAlert(this, DANGER, err.response.data.error.message)
                }).catch(() => {
                  this.loading = false
                  showAlert(this, DANGER, 'Add list of constructivism questions failed')
                })
              } else {
                this.loading = false
                showAlert(this, DANGER, 'Upload file have no data or data is missing data. Please check upload file')
              }
            }
          } else {
            this.loading = false
            showAlert(this, DANGER, 'Upload file is not accepted')
          }
        }
        reader.readAsBinaryString(this.file);
      } else {
        this.loading = false
        showAlert(this, DANGER, 'Upload file is not accepted')
      }
    },
    uploadExcel() {
      if (this.sessionList.length !== 0) {
        this.$refs.file.click()
      } else {
        showAlert(this, WARNING, 'This course not have any session. You need to add new at least one session first.')
      }
    },
    exportExcel() {
      if (this.sessionList.length !== 0) {
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.EXPORT_TEMPLATE, {}, { courseId: this.$route.query.courseId }).then(res => {
          const byteString = window.atob(res.data)
          const arrayBuffer = new ArrayBuffer(byteString.length)
          const int8Array = new Uint8Array(arrayBuffer)
          for (let i = 0; i < byteString.length; i++) {
            int8Array[i] = byteString.charCodeAt(i)
          }
          const blob = new Blob([int8Array], { type: 'application/vnd.ms-excel' })
          const url = URL.createObjectURL(blob)

          const fileLink = document.createElement('a')

          fileLink.href = url
          fileLink.setAttribute('download', 'CQTemplate.xlsx')
          document.body.appendChild(fileLink)
          this.loading = false
          fileLink.click()
        }).catch(() => {
          this.loading = false
          showAlert(this,  DANGER, "Export failed")
        })
      } else {
        showAlert(this, WARNING, 'This course not have any session. You need to add new at least one session first.')
      }
    },
    getListSession() {
      axiosCallApi.callApi(API_MANAGEMENT.COURSE_MANAGEMENT.GET_SESSIONS_BY_COURSE, {}, { courseId: this.courseId}).then((res) => {
        res.data.forEach(item => {
          this.sessionList.push({
            value: item.id,
            text: item.name
          })
        })
      })
    },
    onPageChange(page) {
      this.pageNumber = +(page)
      this.listCq()
    },
    listCq(){
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.LIST_BY_COURSE, {},
          {
            id: this.courseId,
            pageSize: 10,
            pageNumber: this.pageNumber,
            userId: store.getters.role === USER_ROLE.TRAINING_MANAGER ? this.selectedLecturer : store.getters.userId,
            isCreatedByManager:  store.getters.role === USER_ROLE.LECTURER ? 1 : '',
            roleId: this.role,
          })
          .then(res => {
        this.cqList = [...res.data.result]
        this.rows = res.data.totalElements
        this.getLecturerList()
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    onDeleteCq(id) {
      showConfirmDialog(this, 'Are you sure you want to delete this constructivism question?', (value) => {
        if (value) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.DELETE, {}, { id: id}).then(() => {
            this.listCq()
            this.loading = false
            showAlert(this, SUCCESS, 'Delete constructivism question successfully')
          }, err => {
            this.loading = false
            showAlert(this, DANGER, err.response.data.error.message)
          }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Deleted constructivism question failed')
          })
        }
      })
    },
    onActiveCq(cq) {
      this.loading = true
      this.submitForm = {...cq, isActive: true }
      axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.UPDATE, this.submitForm).then(() => {
        this.listCq()
        showAlert(this, SUCCESS, 'Activate constructivism question successfully')
      }).catch(() => {
        this.loading = false
        showAlert(this, DANGER, 'Activate constructivism question failed')
      })
    },
    addNewCq() {
      this.mode = MODAL_MODE.NEW
      if (this.sessionList.length !== 0) {
        this.showCqModal = true
      } else {
        showAlert(this, WARNING, 'This course not have any session. You need to add new at least one session first.')
      }
    },
    onEditCq(cq) {
      this.showCqModal = true
      this.mode = MODAL_MODE.EDIT
      this.submitForm = {
        id: cq.id,
        sessionId: cq.sessionId,
        title: cq.title,
        content: cq.content,
        isActive: cq.isActive,
      }
    },
    onViewCq(cq) {
      this.mode = MODAL_MODE.VIEW
      this.showCqModal = true
      this.submitForm = cq
    },
    handleSubmit() {
      this.submitted = true
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (!this.submitForm.id && !this.modalLoading) {
          this.modalLoading = true
          const payload = [this.submitForm]
          axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.INSERT_LIST_CQ, payload, { courseId: this.$route.query.courseId }).then(res => {
            if (res.data) {
              this.listCq()
              this.modalLoading = false
              this.showCqModal = false
              this.submitted = false
              showAlert(this, SUCCESS, 'Add new constructivism question successfully')
            } else {
              this.submitted = false
              showAlert(this, DANGER, 'Add new constructivism question failed')
            }
          }, err => {
            this.modalLoading = false
            showAlert(this, DANGER, err.response.data.error.message)
            this.submitted = false
          }).catch(() => {
            this.modalLoading = false
            showAlert(this, DANGER, 'Add new constructivism question failed')
          })
        } else if (!this.modalLoading){
          this.modalLoading = true
          axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.UPDATE, this.submitForm).then(() => {
            this.listCq()
            this.submitted = false
            this.showCqModal = false
            this.modalLoading = false
            showAlert(this, SUCCESS, 'Update constructivism question successfully')
          }).catch(() => {
            this.modalLoading = false
            showAlert(this, DANGER, 'Update constructivism question failed')
            this.submitted = false
          })
        }
      }
    },
    onResetModal() {
      this.$nextTick(() => {
        this.$v.$reset();
      });
      this.showCqModal = false
      this.submitForm = {
        isActive: true,
        isCreatedByManager: store.getters.role === USER_ROLE.TRAINING_MANAGER ? 1 : 0,
        ownerId: store.getters.userId,
      }
    },
    getLecturerList() {
      const data = []
      this.cqList.forEach(item => {
          if (data.findIndex(lecturer => lecturer === item.ownerId) === -1) {
            data.push(item.ownerId)
          }
      })
      axiosCallApi
          .callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH_BY_USERID, {}, { userId: data })
          .then((res) => {
            this.lecturerOptions = [
              { text: 'All', value: ''},
            ]
            this.listUsers = [...res.data]
            this.listUsers.forEach(item => {
              this.lecturerOptions.push({
                value: item.userId,
                text: item.name + ' - ' + item.email
              })
            })
          }).catch(() => {
        this.loading = false
      });
    },
    filterCq() {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.CQ_MANAGEMENT.LIST_BY_COURSE, {},
          { id: this.courseId, pageSize: 10, pageNumber: 1, userId: this.selectedLecturer, roleId: this.role }).then(res => {
        this.cqList = [...res.data.result]
        this.currentPage = 1
        this.rows = res.data.totalElements
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    getName(user) {
      if (Object.keys(this.listUsers).length !== 0) {
        const owner = this.listUsers.find(item => item.userId === user.ownerId)
        if (store.getters.role === USER_ROLE.LECTURER && user.isCreatedByManager) {
          return 'Training manager'
        } else if (owner) {
          return owner.name
        }
      }
    },
  }
}
</script>

<style scoped>

.cq-table td:last-child {
  width: 140px;
  text-align: center;
}

.cq-table th:last-child {
  width: 140px;
  text-align: center;
}
.custom-pagination {
  overflow: auto;
  padding-top: 8px;
  display: flex;
  justify-content: center;
}
.table-btn {
  border: none;
  background: inherit;
  outline: none;
}
.add-cq-button {
  margin-left: 8px;
  width: 100px;
  border-radius: 1rem;
}
</style>