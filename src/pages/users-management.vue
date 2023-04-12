<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1">
      <access-denied :display="$store.getters.role !== 1"></access-denied>
      <div class="w-75" style="padding: 25px; margin: auto"
           v-if="$store.getters.role === 1">
        <b-form v-on:keyup.enter="onSearch()" @reset="onReset">
          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-1"
              label="Email"
              label-for="input-1"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-1"
                v-model="searchForm.email"
                placeholder="Enter email"
              ></b-form-input>
            </b-form-group>

            <b-form-group
                class="col-md-6"
                id="input-group-2"
                label="Role"
                label-for="input-2"
                label-cols-sm="3"
            >
              <b-form-select
                  id="input-2"
                  v-model="searchForm.role"
                  :options="roles"
              ></b-form-select>
            </b-form-group>
          </div>

          <div class="row">
            <b-form-group
              class="col-md-6"
              id="input-group-3"
              label="Name"
              label-for="input-3"
              label-cols-sm="3"
            >
              <b-form-input
                id="input-3"
                v-model="searchForm.name"
                placeholder="Enter Name"
              ></b-form-input>
            </b-form-group>
            <b-form-group
              class="col-md-6"
              id="input-group-6"
              label="Status"
              label-for="input-6"
              label-cols-sm="3"
            >
              <b-form-select
                id="input-6"
                v-model="searchForm.status"
                :options="status"
              ></b-form-select>
            </b-form-group>
          </div>

          <div style="text-align: end; padding-right: 15px;">
            <b-button class="p-1 m-2" type="reset" variant="outline-danger">Reset</b-button>
            <b-button class="p-1 m-2" variant="outline-primary" @click="onSearch">Search</b-button>
            <b-button class="p-1 m-2" variant="primary" @click="showModal = true">Add New</b-button>
          </div>
        </b-form>

        <!--      Table -->
        <div class="table-responsive" style="padding-right: 20px;">
          <table class="table users-table">
            <thead>
              <tr>
                <th v-for="item in fields" :key="item.key" class="table-td">
                  {{ item.key }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in tableData" :key="user.userId">
                <td>{{ (searchForm.page - 1) * perPage +  (tableData.indexOf(user) + 1) }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.name }}</td>
                <td>{{ getRoleName(user.role) }}</td>
                <td>
                  <span class="badge bg-soft-danger font-size-12">
                    {{ getStatusName(user.status) }}
                  </span>
                </td>
                <td>
                  <div>
                    <button
                        v-b-tooltip.hover
                        v-if="user.status === 'active'"
                        title="Update user account"
                        class="la la-pencil text-success table-btn"
                        @click="onEdit(user)"
                    ></button>
                    <button
                        v-b-tooltip.hover
                        v-if="( user.status === 'active' && user.role !== 1 )|| user.status === 'unverified'"
                        title="Delete user account"
                        class="la la-trash text-danger table-btn"
                        @click="onDelete(user)"
                    ></button>
                    <button
                        v-b-tooltip.hover
                        v-if="user.status === 'inactive'"
                        title="Active user account"
                        class="la la-unlock-alt text-primary table-btn"
                        @click="onActiveUser(user.email)"
                    ></button>
                    <button
                        v-b-tooltip.hover
                        v-if="user.status === 'active'"
                        title="Reset password"
                        class="la la-key text-primary table-btn"
                        @click="onResetPassword(user.email)"
                    ></button>
                    <button
                        v-b-tooltip.hover
                        title="View user account details"
                        class="la la-eye text-primary table-btn"
                        @click="onViewUser(user)"
                    ></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          <div v-if="!tableData.length" style="text-align: center;">No data</div>
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

<!--        Add new user modal-->
        <b-modal
            v-model="showModal"
            :title="modalTitle"
            :mode.sync="modalMode"
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
                  <label for="email" class="required">Email</label>
                  <input
                      id="email"
                      maxlength="255"
                      :disabled="modalMode === 2 || modalMode === 3"
                      v-model="submitForm.email"
                      type="text"
                      class="form-control"
                      :class="{
                      'is-invalid':
                        submitted && $v.submitForm.email.$error,
                    }"
                  />
                  <div
                      v-if="submitted && !$v.submitForm.email.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                  <div
                      v-if="submitted && !$v.submitForm.email.email"
                      class="invalid-feedback"
                  >
                    This value must be email.
                  </div>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label for="name" class="required">Name</label>
                  <input
                      id="name"
                      v-model="submitForm.name"
                      type="text"
                      :disabled="modalMode === 3"
                      class="form-control"
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
              <div :hidden="modalMode !== 3" class="col-12">
                <div class="mb-3">
                  <label for="dob">Date of birth</label>
                  <input
                      id="dob"
                      v-model="submitForm.DoB"
                      disabled
                      type="Date"
                      class="form-control"
                  />
                </div>
              </div>
              <div :hidden="modalMode !== 3" class="col-12">
                <div class="mb-3">
                  <label class="control-label required">Status</label>
                  <b-form-select
                      id="input-4"
                      disabled
                      v-model="submitForm.status"
                      :options="status"
                      class="form-control"
                  ></b-form-select>
                </div>
              </div>
              <div class="col-12">
                <div class="mb-3">
                  <label class="control-label required">Role</label>
                  <b-form-select
                      id="input-5"
                      :disabled="disableRole || modalMode === 3"
                      v-model="submitForm.role"
                      :options="roles"
                      class="form-control"
                      :class="{
                      'is-invalid':
                        submitted && $v.submitForm.role.$error,
                    }"
                  ></b-form-select>
                  <div
                      v-if="submitted && !$v.submitForm.role.required"
                      class="invalid-feedback"
                  >
                    This value is required.
                  </div>
                </div>
              </div>
            </div>

            <div  v-if="modalMode !== 3" class="modal-btn">
              <b-button variant="light" @click="onModalReset">Cancel</b-button>
              <b-button type="submit" variant="success" class="ms-1">Save</b-button>
            </div>
            <div  v-if="modalMode === 3" class="modal-btn">
              <b-button variant="primary" @click="onModalReset">OK</b-button>
            </div>
          </form>
        </b-modal>
      </div>
    </main>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import {MODAL_MODE, USER_ROLE, USER_STATUS} from "@/constants/constants";
import { email, required } from "vuelidate/lib/validators";
import Vue from "vue";
import {Vuelidate} from "vuelidate";
import {DANGER, showAlert, showConfirmDialog, SUCCESS} from "@/utils/alertMessage";
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import AccessDenied from "@/components/error-page/access-denied";

Vue.use(Vuelidate);

export default {
  name: "users-management",
  components: {AccessDenied, Layout },
  data() {
    return {
      loading: false,
      tableData: [],
      fields: [
        { key: "No" },
        { key: "Email" },
        { key: "Name" },
        { key: "Role" },
        { key: "Status" },
        { key: "Action" },
      ],
      searchForm: {
        role: '',
        status: '',
        page: 1,
        size: 10
      },
      rows: 0,
      currentPage: 1,
      perPage: 10,
      status: [
        { text: "Select one", value: '', disabled: true },
        { text: "Unverified", value: 'unverified' },
        { text: "Active", value: 'active' },
        { text: "Inactive", value: 'inactive' },
      ],
      roles: [
        { text: "Select one", value: '', disabled: true },
        { text: "Admin", value: 1 },
        { text: "Training manager", value: 2 },
        { text: "Lecturer", value: 3 },
        { text: "Student", value: 4 },
      ],
      showModal: false,
      submitted: false,
      modalMode: MODAL_MODE.NEW,
      modalTitle: "Create New User Account",
      submitForm: {},
      disableRole: false,
    };
  },
  validations() {
    return {
      submitForm: {
        email: { required, email },
        name: { required },
        role: { required },
      },
    }
  },
  created() {},
  methods: {
    getRoleName(roleId){
      const role = this.roles.find(role => role.value === roleId)
      if (role)  {
          return role.text
      }
    },
    getStatusName(isActive){
      return this.status.find(status => status.value === isActive).text
    },
    onSearch(page) {
      this.loading = true
      if (!isNaN(page)) {
        this.searchForm.page = page
      } else {
        this.searchForm.page = 1
        this.rows = 0
      }
      axiosCallApi
          .callApi(API_MANAGEMENT.USER_MANAGEMENT.SEARCH, {}, this.searchForm)
          .then((res) => {
            this.tableData = [...res.data.users]
            this.rows = res.data.totalElement
            this.loading = false
          }).catch(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
      });
    },
    async handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (!this.submitForm.userId && !this.loading) {
          this.loading = true
          await axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.CREATE_MYSQL, this.submitForm, {}).then(res => {
            if (res.data.id) {
              this.submitForm.userId = res.data.id
              axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.CREATE_MONGODB, this.submitForm, {}).then(res1 => {
                if (res1.data.userId) {
                  this.onSearch()
                  this.loading = false;
                  this.showModal = false
                  showAlert(this, SUCCESS, 'Add new user successfully')
                } else {
                  this.loading = false;
                  showAlert(this, DANGER, res1.data.message)
                }
              }).catch(() => {
                this.loading = false;
              })
            }
          },  err => {
            showAlert(this, DANGER, err.response.data.error.message)
            this.loading = false
          }).catch(() => {
            this.loading = false;
          })
        } else if (!this.loading) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.UPDATE_MYSQL, {}, {id: this.submitForm.userId, role: this.submitForm.role }).then(res => {
            if (res) {
              axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.CREATE_MONGODB, this.submitForm, {}).then(res1 => {
                if (res1.data.userId) {
                  this.onSearch(this.currentPage)
                  this.loading = false;
                  this.showModal = false
                  showAlert(this, SUCCESS, 'Update user successfully')
                  this.disableRole = false
                } else {
                  this.loading = false;
                  showAlert(this, DANGER, res1.data.message)
                }
              }).catch(() => {
                this.loading = false;
              })
            }
          },  err => {
            showAlert(this, DANGER, err.response.data.error.message)
            this.loading = false
          }).catch(() => {
            this.loading = false;
          })
        }
      }
    },
    onReset(event){
      event.preventDefault();
      // Reset our form values
      this.searchForm = {
        role: '',
        status: '',
        page: this.currentPage,
        size: 10,
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
      this.disableRole = false
      this.modalMode = MODAL_MODE.NEW
      this.submitForm = {};
      this.showModal = false;
      this.modalTitle = "Create New User Account"
    },
    onEdit(rowData) {
      this.modalMode = MODAL_MODE.EDIT
      this.modalTitle = "Update User Account";
      if (rowData.role === USER_ROLE.ADMIN) {
        this.disableRole = true
      }
      this.submitForm = {
        email: rowData.email,
        name: rowData.name,
        status: rowData.status,
        role: rowData.role,
        userId: rowData.userId,
      }
      this.showModal = true;
    },
    onDelete(user) {
      showConfirmDialog(this, 'Are you sure you want to delete this user?', (value) => {
        if (value) {
          this.loading = true
          if(user.status !== 'unverified'){
            axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.UPDATE_USER, { email: user.email, status: USER_STATUS.INACTIVE }).then(res => {
              if (!res.data.error) {
                this.loading = false
                this.onSearch(this.currentPage)
               showAlert(this, SUCCESS, 'Deactivate user successfully')
             } else {
               this.loading = false
                if (res.data.error) {
                  showAlert(this, DANGER, res.data.error)
                } else {
                  showAlert(this, DANGER, 'Deactivate user failed')
                }
              }
            })
          } else {
            axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.DELETE, { email: user.email }).then(res => {
              if (res.data.status) {
                this.loading = false
                this.onSearch(this.currentPage)
               showAlert(this, SUCCESS, 'Delete user successfully')
             } else {
               this.loading = false
                if (res.data.message) {
                  showAlert(this, DANGER, res.data.message)
                } else {
                  showAlert(this, DANGER, 'Delete user failed')
                }
              }
            })
          }
        }
      })
    },
    onActiveUser(email) {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.UPDATE_USER, { email: email, status: USER_STATUS.ACTIVE }).then(res => {
        if (res.data) {
          this.loading = false
          this.onSearch(this.currentPage)
          showAlert(this, SUCCESS, 'Activate user successfully')
        } else {
          showAlert(this, DANGER, 'Activate user failed')
          this.loading = false
        }
      })
    },
    onResetPassword(email) {
      showConfirmDialog(this, 'Are you sure you want to reset password this user?', (value) => {
        if (value) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.USER_MANAGEMENT.RESET_PASSWORD, { email: email }, {}).then(res => {
            if (res.data) {
              this.loading = false
              showAlert(this, SUCCESS, 'Reset password successfully')
            }
          }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Reset password failed')
          })
        }
      })
    },
    onViewUser(user) {
      this.showModal = true
      this.modalMode = MODAL_MODE.VIEW
      this.modalTitle = 'View User Account Details'
      this.submitForm = user
      if (this.submitForm.DoB) {
        this.submitForm.DoB = user.DoB.split("T")[0]
      }
    },
  },
};
</script>

<style scoped>
.users-table thead th:first-child {
  max-width: 10px;
}

.users-table thead th:last-child {
  width: 140px;
  text-align: center;
}

.users-table td:last-child {
  text-align: center;
}

.required:after {
  content: " *";
  color: red;
}

.modal-btn {
  text-align: end;
}

.modal-btn button {
  margin-left: 10px;
}

.users-table tbody tr:hover {
  color: #212529;
  background-color: rgba(0, 0, 0, 0.075);
}
.users-table {
  border: 1px solid #cccccc;
}

.users-table thead th {
  vertical-align: middle;
  white-space: nowrap;
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
</style>