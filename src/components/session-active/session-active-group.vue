<template>
  <div class="SessionGroup">
    <div v-for="group of listGroup" :key="group.id">
      <div style="display: flex; justify-content: space-between">
        <div class="SessionGroup__header" style="width: 100%" v-b-toggle="[group.name]">
          <div>
            <i class="la la-angle-down"></i>
            <span class="SessionGroup__name">
          {{ group.name }}({{ group.numberOfStudents }} students)
            <i v-if="$store.getters.role === 4"> - your group</i>
          </span>
          </div>
        </div>
        <div v-if="group.id && $store.getters.role === 3" style="background-color: #f8f9fa; margin: auto auto auto -53px;">
          <i v-if="waitingList.numberOfStudents !== 0 && cqStatus === 1 && allowGroupChange" class="las la-plus text-white bg-success p-1 m-1" style="border-radius: 50%; cursor: pointer" @click="onAddStudentToGroup(group)"></i>
        </div>
      </div>
      <b-collapse :id="group.name">
        <ul>
          <li
              v-for="item of group.listStudentByGroups"
              :key="item.id"
          >
            <div style="display: flex; justify-content: space-between">
              <div class="SessionGroup__member" v-b-toggle="[item.email]" style="width: 100%">
                <span>
                  <i class="la la-angle-down pr-2"></i>
                  <span class="SessionGroup__member__custom-img" style="position: relative; display: inline-block" :class="getUserOnline(item.email)">
                    <img src="@/assets/images/logo_mini.png" class="student-img"/>
                  </span>{{ item.email }}
                </span>
              </div>
              <div v-if="group.id && $store.getters.role === 3" style="padding-right: 10px; display: flex; margin: auto">
                <span><i v-if="cqStatus === 1 && allowGroupChange && group.listStudentByGroups && group.listStudentByGroups.length > 2" class="las la-exchange-alt text-white bg-primary p-1 m-1" style="border-radius: 50%; cursor: pointer" @click="onChangeStudentGroup(item)"></i></span>
                <span><i v-if="cqStatus === 1 && allowGroupChange && group.listStudentByGroups && group.listStudentByGroups.length > 2" class="las la-times text-white bg-danger p-1 m-1" style="border-radius: 50%; cursor: pointer" @click="onRemoveStudentGroup(item)"></i></span>
              </div>
            </div>
            <b-collapse :id="item.email">
              <div class="SessionActive__questions mt-1 mr-3">
                <h3>Question summary</h3>
                <dl>
                  <dt v-for="user in getUserSummary(item)" :key="user.email">
                    <div style="display: flex; justify-content: space-between">
                      <div style="font-weight: 400">
                        {{ user.text }}
                      </div>
                      <div style="font-weight: 400">{{ user.value }}</div>
                    </div>
                  </dt>
                </dl>
              </div>
            </b-collapse>
          </li>
        </ul>
      </b-collapse>
    </div>

<!--    Add Student to group modal-->
    <b-modal
        v-model="showModal"
        title="Add student to group"
        centered
        @hidden="onModalReset"
        size="md"
        title-class="text-black font-18"
        body-class="p-3"
        no-close-on-backdrop
        hide-footer
    >
      <form @submit.prevent="handleSubmit">
        <div class="row">
          <div class="col-12">
            <div class="mb-3">
              <label for="studentEmail" class="required">Email</label>
              <b-form-select
                  id="studentEmail"
                  v-model="submitForm.email"
                  :options="waitingList.listStudentByGroups"
                  value-field="email"
                  text-field="email"
                  class="form-control"
                  placeholder="Select student email"
                  :class="{
                      'is-invalid': submitted && $v.submitForm.email.$error,
                    }"
              />
              <div
                  v-if="submitted && !$v.submitForm.email.required"
                  class="invalid-feedback"
              >
                This value is required.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-btn">
          <b-button variant="light" @click="onModalReset">Cancel</b-button>
          <b-button type="submit" variant="success" class="ms-1">Save</b-button>
        </div>
      </form>
    </b-modal>

<!--    Change student group modal-->
    <b-modal
        v-model="showModalChangeStudentGroup"
        title="Change student's group"
        centered
        @hidden="onModalResetChangeStudent"
        size="md"
        title-class="text-black font-18"
        body-class="p-3"
        no-close-on-backdrop
        hide-footer
    >
      <form @submit.prevent="handleSubmitChangeStudentGroup">
        <div class="row">
          <div class="col-12">
            <div class="mb-3">
              <label for="group" class="required">Group name</label>
              <b-form-select
                  id="group"
                  v-model="submitGroupForm.groupId"
                  :options="groupOptions"
                  value-field="id"
                  text-field="name"
                  class="form-control"
                  placeholder="Select group"
                  :class="{
                      'is-invalid': submittedGroup && $v.submitGroupForm.groupId.$error,
                    }"
              />
              <div
                  v-if="submittedGroup && !$v.submitGroupForm.groupId.required"
                  class="invalid-feedback"
              >
                This value is required.
              </div>
            </div>
          </div>
        </div>

        <div class="modal-btn">
          <b-button variant="light" @click="onModalResetChangeStudent">Cancel</b-button>
          <b-button type="submit" variant="success" class="ms-1">Save</b-button>
        </div>
      </form>
    </b-modal>
    <loading :loading="loading"></loading>
  </div>
</template>

<script>
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import {required} from "vuelidate/lib/validators";
import Vue from "vue";
import {Vuelidate} from "vuelidate";
import {DANGER, showAlert, showConfirmDialog, SUCCESS} from "@/utils/alertMessage";
import Loading from "@/components/loading";

Vue.use(Vuelidate);

export default {
  name: "sessionActiveGroup",
  components: {Loading},
  props: {
    listGroup: {
      type: Array,
      default: () => []
    },
    waitingList: {
      type: Object,
      default: () => {}
    },
    totalUserSummary: {
      type: Array,
      default: () => []
    },
    cqStatus: {
      type: Number,
    },
    allowGroupChange: {
      type: Boolean,
      default: true,
    },
    userOnline: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      showModal: false,
      showModalChangeStudentGroup: false,
      loading: false,
      submitted: false,
      submittedGroup: false,
      submitForm: {},
      submitGroupForm: {},
      groupOptions: [],
    }
  },
  validations: {
    submitForm: {
      email: { required },
    },
    submitGroupForm: {
      groupId: { required },
    }
  },
  created() {
    this.getUserOnline()
  },
  methods: {
    onAddStudentToGroup(group) {
      this.submitForm.groupId = group.id
      this.showModal = true
    },
    onModalReset() {
      // Reset vuelidate
      this.$nextTick(() => {
        this.$v.$reset();
      });
      // Reset our form values
      this.submitForm = {}
      this.showModal = false
    },
    onModalResetChangeStudent() {
      // Reset vuelidate
      this.$nextTick(() => {
        this.$v.submitGroupForm.$reset();
      });
      // Reset our form values
      this.submitGroupForm = {}
      this.showModalChangeStudentGroup = false
    },
    handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.submitForm.$touch();
      if (this.$v.submitForm.$invalid) {
        return;
      } else {
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.GROUPS.ADD_STUDENT_TO_GROUP, this.submitForm, { classId: this.$route.query.classId }).then(() => {
          this.submitted = false
          this.loading = false
          this.showModal = false
          this.$emit('onAfterCommit')
          showAlert(this, SUCCESS, 'Add student to group successfully')
        }, err => {
          this.loading = false
          showAlert(this, DANGER, err.response.data.error.message)
        }).catch(() => {
          this.loading = false
          showAlert(this, DANGER, 'Add student to group failed')
        })
      }
    },
    onRemoveStudentGroup(student) {
      showConfirmDialog(this, 'Are you sure you want to remove this student from group?', (value) => {
        if (value) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.GROUPS.DELETE_STUDENT_GROUP, {}, { id: student.studentGroupId }).then(() => {
            this.$emit('onAfterCommit')
            showAlert(this, SUCCESS, 'Remove student from group successfully. The student is on waiting list')
            this.loading = false
          }, err => {
            this.loading = false
            showAlert(this, DANGER, err.response.data.error.message)
          }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Remove student from group failed')
          })
        }
      })
    },
    onChangeStudentGroup(student) {
      this.showModalChangeStudentGroup = true
      this.submitGroupForm.studentGroupId = student.studentGroupId
      this.groupOptions = this.listGroup.filter(item => item.id && item.id !== student.groupId)
    },
    handleSubmitChangeStudentGroup() {
      this.submittedGroup = true;
      // stop here if form is invalid
      this.$v.submitGroupForm.$touch();
      if (this.$v.submitGroupForm.$invalid) {
        return;
      } else {
        this.loading = true
        axiosCallApi.callApi(API_MANAGEMENT.GROUPS.UPDATE_STUDENT_GROUP, {},
            { groupId: this.submitGroupForm.groupId, studentGroupId: this.submitGroupForm.studentGroupId }).then(res => {
          console.log(res)
          this.submittedGroup = false
          this.loading = false
          this.$emit('onAfterCommit')
          this.showModalChangeStudentGroup = false
          showAlert(this, SUCCESS, "Change student to new group successfully")
        }).catch(() => {
          this.loading = false
          showAlert(this, DANGER, "Change student to new group failed")
        })
      }
    },
    getUserSummary(user) {
      const dataUserSummary = this.totalUserSummary.find(summary => summary.email === user.email)
      if (dataUserSummary) {
        return [
            { text: 'No. of comments posted', value: dataUserSummary.comment },
            { text: 'No. of stars rated by others', value: dataUserSummary.star },
            { text: 'No. of votes', value: dataUserSummary.vote },
              ]
      }
    },
    getUserOnline(email) {
      if (this.userOnline.find(item => item === email)) {
        return 'user-online'
      }
    }
  }
};
</script>

<style lang="scss">
.required:after {
  color: red;
  content: " *";
}
.SessionGroup {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 10px 12px 16px;
    min-height: 54px;
    border: 1px solid #e6e6e6;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background-color: #f8f9fa;
  }

  &__name {
    font-weight: 600;
    margin-left: 10px;

    i {
      font-style: italic;
      font-weight: 400;
    }
  }

  ul {
    list-style: none;
    border: 1px solid #e6e6e6;
    border-top: none;
  }

  &__member {
    //display: flex;
    //justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    padding: 8px 0;
    position: relative;
    font-weight: 600;

    &__custom-img:after {
      width: 12px;
      height: 12px;
      content: "";
      display: block;
      position: absolute;
      background: #a9a9a9;
      right: 0;
      bottom: 0;
      z-index: 10;
      border-radius: 50%;
      border: 1px solid var(--white-color);
    }

    .student-img {
      width: 34px;
      flex: 0 0 34px;
      height: 34px;
      border-radius: 50%;
      object-fit: cover;
      border: 1px solid #DDDDDD;
    }
  }
}
.user-online:after {
  width: 12px;
  height: 12px;
  content: "";
  display: block;
  position: absolute;
  background: #2eb82e !important;
  right: 0;
  bottom: 0;
  z-index: 10;
  border-radius: 50%;
  border: 1px solid var(--white-color);
}
</style>