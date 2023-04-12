<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1">
      <access-denied :display="role === 1 || role === 4"></access-denied>
      <div class="w-75" style="padding: 25px; margin: auto">
        <b-form @submit.prevent="onSearch" @reset="onReset" v-if="show">
          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-1"
              label="Classroom Name"
              label-for="input-1"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-1"
                v-model="searchForm.name"
                placeholder="Enter Classroom Name"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              class="col-md-6"
              id="input-group-2"
              label="Course Code"
              label-for="input-2"
              label-cols-sm="3"
            >
              <b-form-select
                id="input-2"
                v-model="searchForm.courseId"
                :options="courseListAll"
              ></b-form-select>
            </b-form-group>
          </div>

          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-3"
              label="Lecturer"
              label-for="input-3"
              label-cols-sm="3"
            >
              <b-form-select
                id="input-3"
                :disabled="role === 3"
                v-model="searchForm.ownerId"
                :options="lecturerList"
              ></b-form-select>
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
                v-model="searchForm.statusId"
                :options="status"
              ></b-form-select>
            </b-form-group>
          </div>

          <div style="text-align: end; padding-right: 15px;">
            <b-button class="p-1 m-2" type="reset" variant="outline-danger">Reset</b-button>
            <b-button class="p-1 m-2" variant="outline-primary" @click="onSearch">Search</b-button>
            <b-button variant="primary" class="p-1 m-2" @click="onAddNewClass">Add New</b-button>
          </div>
        </b-form>

        <!--      Table -->
        <div class="table-responsive" style="padding-right: 20px;">
          <table class="table class-table">
            <thead>
              <tr>
                <th v-for="item in fields" :key="item.key" class="table-td">
                  {{ item.key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in tableData.result" :key="item.id">
                <td>{{ tableData.page * tableData.perPage +  (tableData.result.indexOf(item) + 1) }}</td>
                <td>{{ item.name }}</td>
                <td>{{ item.courseCode }}</td>
                <td v-if="$store.getters.role === 2">{{ getLecturerName(item.ownerId) }}</td>
                <td>{{ getStatusText(item.statusId) }}</td>
                <td>
                  <button
                    v-if="item.statusId === 1"
                    v-b-tooltip.hover
                    title="Start classroom"
                    class="la la-play-circle text-success table-btn"
                    @click="onStartClass(item, true)"
                  ></button>
                  <button
                    v-if="item.statusId === 3"
                    v-b-tooltip.hover
                    title="Restart classroom"
                    class="la la-play-circle text-success table-btn"
                    @click="onStartClass(item, false)"
                  ></button>
                  <button
                    v-if="item.statusId === 2"
                    v-b-tooltip.hover
                    title="Stop classroom"
                    class="la la-stop-circle text-danger table-btn"
                    @click="onStopClass(item)"
                  ></button>
                  <button
                    v-b-tooltip.hover
                    title="Student Management"
                    class="la la-users text-primary table-btn"
                    @click="onStudentManage(item.id)"
                  ></button>
                  <button
                    v-b-tooltip.hover
                    v-if="item.statusId === 1 || item.statusId === 2"
                    title="Update classroom"
                    class="la la-pencil text-success table-btn"
                    @click="onEdit(item)"
                  ></button>
                  <button
                    v-b-tooltip.hover
                    v-if="item.statusId !== 4"
                    title="Delete classroom"
                    class="la la-trash text-danger table-btn"
                    @click="onDelete(item.id)"
                  ></button>
                  <button
                      v-b-tooltip.hover
                      title="View classroom details"
                      class="la la-eye text-primary table-btn"
                      @click="onViewClass(item)"
                  ></button>
                  <button
                      v-b-tooltip.hover
                      v-if="item.statusId === 4"
                      title="Active classroom"
                      class="la la-unlock-alt text-primary table-btn"
                      @click="onActiveClass(item)"
                  ></button>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!tableData.result" style="text-align: center;">No data found</div>
          <div class="custom-pagination">
            <b-pagination
                :total-rows="rows"
                :per-page="perPage"
                aria-controls="my-table"
                @change="onSearch($event, true)"
            ></b-pagination>
          </div>
        </div>

        <!--      Add New Modal -->
        <b-modal
          v-model="showModal"
          :title="modalTitle"
          :mode.sync="modalMode"
          centered
          @hidden="onModalReset"
          size="lg"
          title-class="text-black font-18"
          body-class="p-3"
          hide-footer
        >
          <form @submit.prevent="handleSubmit">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="className" class="required">Classroom Name</label>
                  <input
                    id="className"
                    maxlength="255"
                    v-model="submitForm.name"
                    :disabled="modalMode === 3"
                    type="text"
                    class="form-control"
                    placeholder="Insert class name"
                    :class="{
                      'is-invalid': submitted && $v.submitForm.name.$error,
                    }"
                  />
                  <div
                    v-if="submitted && !$v.submitForm.name.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label for="classDesc" class="required">Classroom Description</label>
                  <textarea
                    id="classDesc"
                    maxlength="2000"
                    v-model="submitForm.description"
                    :disabled="modalMode === 3"
                    rows="3"
                    class="form-control"
                    placeholder="Insert class description"
                    :class="{
                      'is-invalid': submitted && $v.submitForm.description.$error,
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
              <div class="col-12">
                <div class="mb-3">
                  <label class="control-label required">Course Code</label>
                  <b-form-select
                      :disabled="modalMode !== 1"
                    id="input-2"
                    v-model="submitForm.courseId"
                    :options="courseList"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.submitForm.courseId.$error,
                    }"
                  ></b-form-select>
                  <div
                    v-if="submitted && !$v.submitForm.courseId.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="control-label required">Lecturer</label>
                  <b-form-select
                    id="input-3"
                    :disabled="role === 3 || modalMode !== 1"
                    v-model="submitForm.ownerId"
                    :options="lecturerList"
                    class="form-control"
                    :class="{
                      'is-invalid': submitted && $v.submitForm.ownerId.$error,
                    }"
                  ></b-form-select>
                  <div
                    v-if="submitted && !$v.submitForm.ownerId.required"
                    class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
              <div :hidden="modalMode !== 3" class="col-12">
                <div class="mb-3">
                  <label class="control-label">Start date</label>
                  <b-form-input
                    id="input-startDate"
                    type="date"
                    disabled
                    v-model="submitForm.startDate"
                    class="form-control"
                  ></b-form-input>
                </div>
              </div>
              <div :hidden="modalMode !== 3" class="col-12">
                <div class="mb-3">
                  <label class="control-label">End date</label>
                  <b-form-input
                    id="input-endDate"
                    type="date"
                    disabled
                    v-model="submitForm.endDate"
                    class="form-control"
                  ></b-form-input>
                </div>
              </div>
              <div v-if="modalMode === 3" class="col-12">
                <div class="mb-3">
                  <label class="control-label required">Status</label>
                  <b-form-select
                    id="input-4"
                    disabled
                    v-model="submitForm.statusId"
                    :options="status"
                    class="form-control"
                  ></b-form-select>
                </div>
              </div>
              <div v-if="modalMode === 1" class="col-12">
                <div class="mb-3">
                  <label class="control-label">Students</label>
                  <div>
                    <span>You can download the file
                    <a class="template-link" @click="downloadExcel">File of Students List Template</a> to add students list here
                    </span>
                    <i
                        v-b-tooltip.hover
                        title="Download Template"
                        class="la la-download"
                        @click="downloadExcel()"
                    ></i>
                  </div>
                  <div>
                    <input type="file" :accept="acceptFile" @click="(e) => e.target.value = null" @change="onChange" />
                    <p>Number of students: {{ numOfStudents }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="modalMode !== 3" class="modal-btn">
              <b-button variant="light" @click="onModalReset">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1">Save</b-button>
            </div>
            <div v-if="modalMode === 3" class="modal-btn">
              <b-button variant="primary" @click="onModalReset">OK</b-button>
            </div>
          </form>
        </b-modal>

<!--        Update student class-->
        <b-modal
          v-model="showUpdateStudent"
          title="Update student"
          centered
          @hidden="onResetUpdateStudentModal()"
          size="md"
          title-class="text-black font-18"
          body-class="p-3"
          hide-footer
        >
          <form @submit.prevent="handleSubmitUpdateStudent" @reset="onResetUpdateStudentModal">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="email" class="required">Email</label>
                  <input
                      id="email"
                      v-model="updateStudentForm.newEmail"
                      type="text"
                      class="form-control"
                      placeholder="Insert student email"
                      :class="{
                      'is-invalid': submittedUpdateStudent && $v.updateStudentForm.newEmail.$error,
                    }"
                  />
                  <div
                      v-if="submittedUpdateStudent && !$v.updateStudentForm.newEmail.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                  <div
                      v-if="submittedUpdateStudent && !$v.updateStudentForm.newEmail.email"
                      class="invalid-feedback"
                  >
                    This value must be email.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-btn">
              <b-button variant="light" type="reset">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1">Save</b-button>
            </div>
          </form>
        </b-modal>

<!--        Student class management modal-->
        <b-modal
            v-model="showStudentClass"
            size="xl"
            title="Student management"
            title-class="text-black font-18"
            body-class="p-3"
            centered
            hide-footer
        >
          <form>
            <div>
              <div>
                <p style="margin: 8px 0;"><span style="font-weight: 700">Course code: </span>{{ classInfo.courseCode }}</p>
                <p style="margin: 8px 0;"><span style="font-weight: 700">Classroom name: </span> {{ classInfo.className }}</p>
                <p style="margin: 8px 0;"><span style="font-weight: 700">Lecturer: </span> {{ classInfo.teacherName }}</p>
                <p style="margin: 8px 0;"><span style="font-weight: 700">Number of students active: </span> {{ classInfo.numberOfStudent }}</p>
              </div>
              <div v-if="classInfo.status !== 3 && classInfo.status !== 4" style="text-align: end;padding-right: 20px;" >
                <div>
                    <span>You can download the file
                    <a class="template-link" @click="downloadExcel">File of Students List Template</a> to add students list here
                    </span>
                  <i
                      v-b-tooltip.hover
                      title="Download Template"
                      class="la la-download"
                      @click="downloadExcel()"
                  ></i>
                </div>
                <div hidden>
                  <input ref="file" type="file" :accept="acceptFile" @change="onChange($event)" @click="(e) => e.target.value = null"/>
                  <p>Number of students: {{ numOfStudents }}</p>
                </div>
                <b-button variant="success" type="button" class="pb-1 m-1" @click="onImportStudents">Import Excel</b-button>
                <b-button variant="primary" type="button" class="pb-1 m-1" @click="showAddNewStudentModal = true">Add Student</b-button>
              </div>
            </div>
            <div class="table-responsive" style="padding-right: 20px;">
              <table class="table student-table">
                <thead>
                <tr>
                  <th v-for="item in studentClassFields" :key="item.key" class="table-td">
                    {{ item.key }}
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="student in studentClassData" :key="student.userId">
                  <td>{{ studentClassData.indexOf(student) + 1 }}</td>
                  <td>{{ student.name }}</td>
                  <td>{{ student.email }}</td>
                  <td>
                    <span v-if="student.status">Active</span>
                    <span v-else-if="student.status === false">InActive</span>
                    <span v-else></span>
                  </td>
                  <td>
                    <button
                        v-if="!addOnlyStudents && student.status && classInfo.status === 1"
                        v-b-tooltip.hover
                        title="Update student"
                        class="la la-user-edit text-success table-btn"
                        type="button"
                        @click="onUpdateStudent(student)"
                    ></button>
                    <button
                        v-if="student.status === false"
                        v-b-tooltip.hover
                        title="Active student"
                        class="la la-unlock-alt text-primary table-btn"
                        type="button"
                        @click="onActiveStudent(student)"
                    ></button>
                    <button
                        v-if="!(student.status === false) && classInfo.status !== 3 && classInfo.status !== 4"
                        v-b-tooltip.hover
                        title="Delete Student"
                        class="la la-user-times text-danger table-btn"
                        type="button"
                        @click="onDeleteStudent(student)"
                    ></button>
                  </td>
                </tr>
                </tbody>
              </table>
              <div v-if="!studentClassData.length" style="text-align: center;">This class does not have any student.</div>
            </div>
            <div class="modal-btn">
              <b-button v-if="!addOnlyStudents" variant="primary" @click="showStudentClass = false">OK</b-button>
              <b-button v-if="addOnlyStudents"  variant="light" @click="onCancelAddStudents">Cancel</b-button>
              <b-button v-if="addOnlyStudents" type="button" variant="primary" class="ms-1" @click="handleSubmitStudentsClass">Save</b-button>
            </div>
          </form>
        </b-modal>

<!--        Add new student modal-->
        <b-modal
            v-model="showAddNewStudentModal"
            title="Add new student to classroom"
            centered
            @hidden="onStudentModalReset"
            size="md"
            title-class="text-black font-18"
            body-class="p-3"
            no-close-on-backdrop
            hide-footer
        >
          <form @submit.prevent="handleSubmitAddNewStudent">
            <div class="row">
              <div class="col-12">
                <div class="mb-3">
                  <label for="studentEmail" class="required">Email</label>
                  <input
                      id="studentEmail"
                      v-model="studentForm.email"
                      type="text"
                      class="form-control"
                      placeholder="Insert student email"
                      :class="{
                      'is-invalid': submittedStudent && $v.studentForm.email.$error,
                    }"
                  />
                  <div
                      v-if="submittedStudent && !$v.studentForm.email.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                  <div
                      v-if="submittedStudent && !$v.studentForm.email.email"
                      class="invalid-feedback"
                  >
                    This value must be email.
                  </div>
                </div>
              </div>
              <div v-if="!existUser" class="col-12">
                <div class="mb-3">
                  <label for="studentName" class="required">Name</label>
                  <input
                      id="studentName"
                      v-model="studentForm.name"
                      type="text"
                      class="form-control"
                      placeholder="Insert student name"
                      :class="{
                      'is-invalid': submittedStudent && $v.studentForm.name.$error,
                    }"
                  />
                  <div
                      v-if="submittedStudent && !$v.studentForm.name.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
            </div>

            <div class="modal-btn">
              <b-button variant="light" @click="onStudentModalReset">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1">Save</b-button>
            </div>
          </form>
          <b-overlay :show="modalLoading" no-wrap style="z-index: 1099"></b-overlay>
        </b-modal>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import { email, required } from "vuelidate/lib/validators";
import Vue from "vue";
import { Vuelidate } from "vuelidate";
import axiosCallApi from "@/config/axiosCallApi";
import { API_MANAGEMENT} from "@/constants/constants-api";
import { MODAL_MODE, STATUS, USER_ROLE} from "@/constants/constants";
import {DANGER, showAlert, showConfirmDialog, SUCCESS, WARNING} from "@/utils/alertMessage";
import store from "@/store";
import AccessDenied from "@/components/error-page/access-denied";
import * as XLSX from "xlsx";

Vue.use(Vuelidate);

export default {
  name: "class-management",
  components: { Layout, AccessDenied },
  computed: {},
  data() {
    return {
      acceptFile: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      showModal: false,
      loading: false,
      modalLoading: false,
      modalTitle: "Create New Classroom",
      submitted: false,
      tableData: {},
      fields: [],
      managerFields: [
        { key: "No" },
        { key: "Classroom Name" },
        { key: "Course Code" },
        { key: "Lecturer" },
        { key: "Status" },
        { key: "Actions" },
      ],
      lecturerFields: [
        { key: "No" },
        { key: "Classroom Name" },
        { key: "Course Code" },
        { key: "Status" },
        { key: "Actions" },
      ],
      studentClassFields: [
        { key: "No" },
        { key: "Name" },
        { key: "Email" },
        { key: "Status" },
        { key: "Actions" },
      ],
      status: [
        { text: "Select one", value: '', disabled: true },
        { text: "Created", value: 1 },
        { text: "Opening", value: 2 },
        { text: "Closed", value: 3 },
        { text: "Canceled", value: 4 },
      ],
      isActive: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      searchForm: {
        courseId: '',
        statusId: ''
      },
      lecturerList: [],
      courseList: [],
      courseListAll: [
        { text: 'Select one', value: '', disabled: true }
      ],
      courseListAddNew: [],
      show: true,
      submitForm: {
        statusId: 1,
        ownerId: store.getters.userId,
        studentsClass: [],
        classroomSessions: [],
      },
      file: null,
      numOfStudents: 0,
      addOnlyStudents: false,
      disableCourse: false,
      modalMode: MODAL_MODE.NEW,
      role: store.getters.role,
      showStudentClass: false,
      courseCode: '',
      className: '',
      studentClassData: [],
      classInfo: [],
      showAddNewStudentModal: false,
      submittedStudent: false,
      studentForm: {},
      rows: 0,
      currentPage: 1,
      perPage: 10,
      existUser: true,
      showUpdateStudent: false,
      updateStudentForm: {},
      submittedUpdateStudent: false,
    };
  },
  validations: {
    submitForm: {
      name: { required },
      description: { required },
      courseId: { required },
      ownerId: { required },
    },
    studentForm: {
      email: { required, email },
      name: { required(value) {
          if  (this.existUser)  return true
          else return !!value
        } },
    },
    updateStudentForm: {
      newEmail: { required, email },
    }
  },
  created() {
    if (this.role === USER_ROLE.LECTURER) {
      this.searchForm.ownerId = store.getters.userId
      this.fields = this.lecturerFields
    } else {
      this.fields = this.managerFields
    }
    if (this.role === USER_ROLE.TRAINING_MANAGER || this.role === USER_ROLE.LECTURER) {
      this.getCourseData()
      this.getLecturerData()
    }
  },
  methods: {
    getStatusText(status) {
      return this.status.find((i) => i.value === status).text;
    },
    getLecturerName(ownerId) {
      const userId = this.lecturerList.find((lecturer) => lecturer.value === ownerId)
      if (userId) {
        return userId.lecturerName
      }
    },
    onSearch(page, isPaging) {
      this.loading = true
      if (!isNaN(page)) {
        if (isPaging) {
          this.searchForm.pageNumber = this.currentPage = +(page)
        } else {
          this.searchForm.pageNumber = page
        }
      } else {
        this.searchForm.pageSize = 10
        this.searchForm.pageNumber = 1
        this.rows = 0
      }
      axiosCallApi
        .callApi(API_MANAGEMENT.CLASS_MANAGEMENT.SEARCH, {}, this.searchForm)
        .then((res) => {
          this.tableData = res.data;
          this.rows = res.data.totalElements
          this.loading = false;
          this.isPage = false
        }).catch(() => {
          this.loading = false
      });
    },
    onAddNewClass() {
      this.showModal = true
      this.courseList = this.courseListAddNew
    },
    onReset(event) {
      event.preventDefault();
      // Reset our form values
      this.searchForm = {
        courseId: '',
        statusId: '',
        pageSize: 10,
        pageNumber: this.currentPage,
      }
      if (this.role === USER_ROLE.LECTURER) {
        this.searchForm.ownerId = store.getters.userId
      }
      // Trick to reset/clear native browser form validation state
      this.show = false;
      this.$nextTick(() => {
        this.show = true;
      });
    },
    onModalReset() {
      // Reset vuelidate
      this.$nextTick(() => {
        this.$v.$reset();
      });
      // Reset our form values
      this.submitForm = {
        statusId: STATUS.CREATED,
        ownerId: store.getters.userId,
        studentsClass: [],
        classroomSessions: [],
      };
      this.numOfStudents = 0
      this.modalTitle = "Create New Classroom";
      this.modalMode = MODAL_MODE.NEW
      this.showModal = false;
      this.courseList = this.courseListAddNew
    },
    async getCourseData() {
      await axiosCallApi
        .callApi(API_MANAGEMENT.COURSE_MANAGEMENT.SEARCH, {}, { pageSize: 5000 })
        .then((res) => {
          res.data.result.forEach((item) => {
            this.courseListAll.push({
              text: item.courseCode,
              value: item.id,
            });
            if (item.isActive === true) {
              this.courseListAddNew.push({
                text: item.courseCode,
                value: item.id,
              })
            }
          });
          this.courseListAll.sort((a, b) => { a.text - b.text})
        });
    },
    getLecturerData() {
      axiosCallApi
        .callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH, {}, { role: USER_ROLE.LECTURER })
        .then((res) => {
          res.data.users.forEach((item) => {
            this.lecturerList.push({
              text: item.name + ' - ' + item.email,
              lecturerName: item.name,
              value: item.userId,
            });
          });
        });
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
            .callApi(API_MANAGEMENT.CLASS_MANAGEMENT.CREATE, this.submitForm)
            .then(() => {
              this.onSearch();
              this.onModalReset();
              this.submitted = false;
              this.loading = false
              showAlert(this, SUCCESS, 'Add new classroom successfully')
            }, err => {
              showAlert(this, DANGER, err.response.data.error.message)
              this.loading = false
            }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Add new classroom failed')
          });
        } else if (!this.loading) {
          this.loading = true
          axiosCallApi
            .callApi(API_MANAGEMENT.CLASS_MANAGEMENT.UPDATE, this.submitForm)
            .then(() => {
              this.onSearch(this.currentPage);
              this.onModalReset();
              this.submitted = false;
              this.loading = false
              showAlert(this, SUCCESS, 'Update classroom successfully')
            }, err => {
              showAlert(this, DANGER, err.response.data.error.message)
              this.loading = false
            }).catch(() => {
            this.loading = false
            this.modalMode = MODAL_MODE.NEW
            showAlert(this, DANGER, 'Update classroom failed')
          });
        }
      }
    },
    onEdit(rowData) {
      this.modalMode = MODAL_MODE.EDIT
      this.modalTitle = "Update Classroom";
      this.courseList = this.courseListAll
      this.submitForm = {
        id: rowData.id,
        name: rowData.name,
        description: rowData.description,
        courseId: rowData.courseId,
        ownerId: rowData.ownerId,
        statusId: rowData.statusId,
        studentsClass: [],
        classroomSessions: [],
      };
      this.showModal = true;
    },
    onDelete(id) {
      showConfirmDialog(this,'Are you sure you want to delete this classroom?', (value) => {
        if (value && id) {
          this.loading = true
            axiosCallApi
                .callApi(API_MANAGEMENT.CLASS_MANAGEMENT.DELETE, {}, { id: id })
                .then(() => {
                  this.onSearch(this.currentPage);
                  this.loading = false
                  showAlert(this, SUCCESS, 'Delete classroom successfully')
                }).catch(() => {
                  this.loading =false
              showAlert(this, DANGER, 'Delete classroom failed')
            });
        }
      })
    },
    onViewClass(classRoom) {
      this.modalTitle = 'View classroom details'
      this.showModal = true
      this.modalMode = MODAL_MODE.VIEW
      this.courseList = this.courseListAll
      this.submitForm = classRoom
    },
    async onStudentManage(id) {
      this.showStudentClass = true
      this.addOnlyStudents = false
      this.loading = true
      const data = []
      await axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.GET_CLASS_INFO, {}, { id: id }).then(res => {
        const userPayload = []
        res.data.listStudents.forEach(item => {
          userPayload.push(item.userId)
        })
        this.classInfo = res.data
        axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH_BY_USERID, {}, { userId: userPayload, role: USER_ROLE.STUDENT }).then(resUser => {
          res.data.listStudents.forEach(item1 => {
            resUser.data.forEach(user => {
              if (item1.userId === user.userId) {
                data.push({
                  email: user.email,
                  name: user.name,
                  role: user.role,
                  status: item1.isActive,
                  userId: user.userId,
                  userClassId: item1.userClassId,
                })
              }
            })
          })
          this.studentClassData = data
          this.loading = false
        }).catch(() => {
          this.loading = false
        })
      }).catch(() => {
        this.loading = false
      })
    },
    downloadExcel() {
      let fileLink = "";
      fileLink = document.createElement("a");
      fileLink.href = "StudentsClass.xlsx";
      fileLink.setAttribute("download", "");
      fileLink.click();
    },
    onStudentModalReset() {
      // Reset vuelidate
      this.$nextTick(() => {
        this.$v.$reset();
      });
      // Reset our form values
      this.studentForm = {}
      this.existUser = true
      this.showAddNewStudentModal = false
    },
    async handleSubmitAddNewStudent() {
      this.submittedStudent = true;
      // stop here if form is invalid
      this.$v.studentForm.$touch();
      if (this.$v.studentForm.$invalid) {
        return;
      } else if (!this.modalLoading){
        this.modalLoading = true
        this.existUser = true
        await axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH, {}, { email: this.studentForm.email }).then(resUser => {
          if (resUser.data.users.length !== 0) {
            this.existUser = true
            this.onAddStudent()
          } else {
            this.existUser = false
            this.modalLoading = false
            this.$v.studentForm.$touch();
            if (this.$v.studentForm.$invalid) {
              this.modalLoading = false
              return;
            } else {
              this.onAddStudent()
            }
          }
        })
      }
    },
    onAddStudent() {
      this.modalLoading = true
      this.studentForm.classId = this.classInfo.id
      const studentPayload = [this.studentForm]
      axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.ADD_STUDENT, studentPayload).then(res => {
        if (res.data) {
          this.modalLoading = false
          this.existUser = true
          this.showAddNewStudentModal = false
          this.onStudentManage(this.classInfo.id)
          showAlert(this, SUCCESS, 'Add new student successfully')
        }
      }, err => {
        showAlert(this, DANGER, err.response.data.error.message)
        this.modalLoading = false
      }).catch(() => {
        this.modalLoading = false
        showAlert(this, DANGER, 'Add new student failed')
      })
    },
    onChange(event) {
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

          if ((this.file.name.indexOf('StudentsClass') !== -1)) {
            if (this.addOnlyStudents) {
              this.studentClassData = []
              this.numOfStudents = 0
              let errorNum = 0
              data.splice(1).forEach(item => {
                if (item[0] && item[1] && String(item[1]).trim().toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) {
                  if (!this.studentClassData.find(std => std.email === item[1])) {
                    this.studentClassData.push({
                      name: item[0],
                      email: item[1],
                      classId: this.classInfo.id
                    })
                  }
                }
                else if (item[1] && !String(item[1]).trim().toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) {
                  showAlert(this, DANGER, item[1] + ' is not a valid email')
                }
                else {
                  errorNum = errorNum + 1
                }
              })
              if(errorNum) {
                if (errorNum === 1) {
                  showAlert(this, WARNING, 'Upload file has ' + errorNum + ' row missing data')
                } else {
                  showAlert(this, WARNING, 'Upload file have ' + errorNum + ' rows missing data')
                }
              }
              this.numOfStudents = this.studentClassData.length
              if (!this.numOfStudents && !errorNum) {
                showAlert(this, WARNING, 'Upload file have no data. Please check the upload file')
              }
            } else {
              this.submitForm.studentsClass = []
              this.numOfStudents = 0
              let errorNum = 0
              data.splice(1).forEach(item => {
                if (item[0] && item[1] && String(item[1]).trim().toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) {
                  if (!this.submitForm.studentsClass.find(std => std.email === item[1])) {
                    this.submitForm.studentsClass.push({
                      name: item[0],
                      email: item[1]
                    })
                  }
                } else if(item[1] && !String(item[1]).trim().toLowerCase()
                    .match(
                        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
                    )) {
                  showAlert(this, WARNING, item[1] + ' is not a valid email')
                } else {
                  errorNum = errorNum + 1
                }
              })
              if(errorNum) {
                if (errorNum === 1) {
                  showAlert(this, WARNING, 'Upload file has ' + errorNum + ' row missing data')
                } else {
                  showAlert(this, WARNING, 'Upload file have ' + errorNum + ' rows missing data')
                }
              }
              this.numOfStudents = this.submitForm.studentsClass.length
              if (!this.numOfStudents && !errorNum) {
                showAlert(this, WARNING, 'Upload file have no data. Please check the upload file')
              }
            }
          } else {
            showAlert(this, DANGER, 'Upload file is not accepted')
          }
        }
        reader.readAsBinaryString(this.file);
      } else {
        showAlert(this, DANGER, 'Upload file is not accepted')
      }
    },
    onImportStudents() {
      this.$refs.file.click()
      this.addOnlyStudents = true
    },
    onCancelAddStudents() {
      this.showStudentClass = false
      this.addOnlyStudents = false
      this.studentClassData = []
    },
    handleSubmitStudentsClass() {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.ADD_STUDENT, this.studentClassData, {}).then(res => {
        if (res) {
          this.loading = false
          this.addOnlyStudents = false
          this.onStudentManage(this.classInfo.id)
          showAlert(this, SUCCESS, 'Add list of students successfully')
        } else {
          this.loading = false
          showAlert(this, DANGER, 'Add list of students failed')
        }
      }, err => {
        showAlert(this, DANGER, err.response.data.error.message)
        this.loading = false
      }).catch(() => {
        this.loading = false
        showAlert(this, DANGER, 'Add list of students failed')
      })
    },
    onDeleteStudent(student) {
      if (student.userId) {
        showConfirmDialog(this, 'Are you sure you want to delete this student?', (value) => {
          if (value) {
            this.loading = true
            axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.DELETE_STUDENT, {}, { classId: this.classInfo.id, studentId: student.userId }).then(res => {
              if (res) {
                this.loading = false
                this.onStudentManage(this.classInfo.id)
                showAlert(this, SUCCESS, 'Delete student successfully')
              }
            }).catch(() => {
              this.loading = false
              showAlert(this, DANGER, 'Delete student failed')
            })
          }
        })
      } else {
        const index = this.studentClassData.findIndex(item => item.email === student.email)
        this.studentClassData.splice(index, 1)
      }
    },
    onActiveStudent(item) {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.STUDENT.ACTIVE, {}, { id: item.userClassId }).then(res => {
        if (res.data) {
          this.onStudentManage(this.classInfo.id)
          this.loading = false
          showAlert(this, SUCCESS, 'Activate student successfully')
        } else {
          showAlert(this, DANGER, 'Activate student failed')
        }
      })
    },
    onStartClass(data, sendMail) {
      this.loading = true
      const listEmail = []
      axiosCallApi.callApi(API_MANAGEMENT.STUDENT.LIST_STUDENTS, {}, { classId: data.id }).then(res => {
        if (res.data.length > 0) {
          const date = new Date()
          this.onChangeClassStatus(data.id, STATUS.OPENING, date.toISOString().split("T")[0], null, (sendMail == true)?'Start':'Restart')
          res.data.forEach(item => {
            listEmail.push(item.email)
          })
          if (sendMail) {
            const mailPayload = {
              content: "You have been enrolled in " + data.name + " - Constructivism Education at constructivism-edu.xyz " +
                  "by a member of the course staff. The course should now appear on your constructivism-edu.xyz home.",
              sendTo: listEmail,
              subject: 'You have been enrolled in class ' + data.name + ' - Constructivism Education'
            }
            axiosCallApi.callApi(API_MANAGEMENT.SEND_MAIL.SEND_MAIL, mailPayload).then(res => {
              showAlert(this, SUCCESS, res.data)
            })
          }
        } else {
          this.loading = false
          showAlert(this, DANGER, 'This classroom has no students, please add students to start class.')
        }
      })
    },
    onStopClass(item) {
      this.loading = true
      const endDate = new Date()
      this.onChangeClassStatus(item.id, STATUS.CLOSED, item.startDate, endDate.toISOString().split("T")[0], 'Stop')
    },
    onChangeClassStatus(classId, status, startDate, endDate, action) {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.UPDATE,
          { id: classId, statusId: status, startDate: startDate, endDate: endDate }).then(res => {
        if (res.data) {
          this.loading = false
          this.onSearch(this.currentPage)
          showAlert(this, SUCCESS, action + ' classroom successfully')
        }
      }).catch(() => {
        this.loading = false
      })
    },
    onActiveClass(item){
      this.loading = true
      let status
      if (item.startDate && !item.endDate) {
        status = 2
      } else if (item.endDate) {
        status = 3
      }
      axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.UPDATE, { id: item.id, statusId: status, endDate: item.endDate }).then(res => {
        if (res.data.status) {
          this.onSearch(this.currentPage)
          this.loading = false
          showAlert(this, SUCCESS, 'Activate classroom successfully')
        }
      }).catch(() => {
        this.loading = false
        showAlert(this, DANGER, 'Activate classroom failed')
      })
    },
    onUpdateStudent(student) {
      this.showUpdateStudent = true
      this.updateStudentForm.newEmail = student.email
      this.updateStudentForm.classId = this.classInfo.id
      this.updateStudentForm.oldName = student.name
      this.updateStudentForm.oldUserId = student.userId
    },
    handleSubmitUpdateStudent() {
      this.submittedUpdateStudent = true;
      // stop here if form is invalid
      this.$v.updateStudentForm.$touch();
      if (this.$v.updateStudentForm.$invalid) {
        return;
      } else if (!this.loading){
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.STUDENT.UPDATE_STUDENT, this.updateStudentForm).then(res => {
          if (res.data) {
            this.onStudentManage(this.classInfo.id)
            this.loading = false
            this.showUpdateStudent = false
            showAlert(this, SUCCESS, 'Update student successfully')
          } else {
            showAlert(this, DANGER, 'Update student failed')
          }
        }).catch(() => {
          this.loading = false
          showAlert(this, DANGER, 'Update student failed')
        })
      }
    },
    onResetUpdateStudentModal() {
      this.$nextTick(() => {
        this.$v.updateStudentForm.$reset();
      });
      this.submittedUpdateStudent = false
      this.updateStudentForm = {}
      this.showUpdateStudent = false
    },
  },
};
</script>

<style scoped>
.required:after {
  content: " *";
  color: red;
}

.student-table,
.class-table {
  border: 1px solid #cccccc;
}

.class-table td:last-child {
  width: 170px;
  text-align: center;
}
.class-table th:last-child {
  text-align: center;
}

.student-table thead th:first-child,
.class-table thead th:first-child {
  max-width: 10px;
}

.student-table tbody tr:hover,
.class-table tbody tr:hover {
  color: #212529;
  background-color: rgba(0, 0, 0, 0.075);
}

.student-table th:last-child {
  text-align: center;
}
.student-table td:last-child {
  width: 80px !important;
  text-align: center;
}

.modal-btn {
  text-align: end;
}
.modal-btn button {
  margin-left: 10px;
}

.table-btn {
  border: none;
  background: inherit;
  outline: none;
}

.custom-pagination {
  overflow: auto;
  padding-top: 8px;
  display: flex;
  justify-content: center;
}
.template-link {
  color: #007bff;
  text-decoration: none;
  background-color: transparent;
  cursor: pointer;
}
</style>
