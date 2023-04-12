<template>
  <b-modal
      v-model="showModal"
      id="modal-1"
      :mode.sync="mode"
      @hidden="resetModal"
      size="lg"
      title="Constructive Question"
      title-class="text-black font-18"
      body-class="p-3"
      centered
      hide-footer
      no-close-on-backdrop
  >
    <form @submit.prevent="handleSubmit" class="add-new-cq-modal" @reset="resetModal">
      <div class="col-12">
        <div class="mb-3">
          <label for="title" class="required">Title</label>
          <input
              id="title"
              :disabled="mode === 3"
              maxlength="255"
              v-model="submitForm.cq.title"
              type="text"
              class="form-control"
              :class="{
                'is-invalid':
                submitted && $v.submitForm.cq.title.$error,
              }"
          />
          <div
              v-if="submitted && !$v.submitForm.cq.title.required"
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
              v-model="submitForm.cq.content"
              maxlength="2000"
              rows="3"
              max-rows="5"
              class="form-control"
              :class="{
                'is-invalid':
                submitted && $v.submitForm.cq.content.$error,
              }"
          ></textarea>
          <div
              v-if="submitted && !$v.submitForm.cq.content.required"
              class="invalid-feedback"
          >
            This value is required.
          </div>
        </div>
      </div>
      <div style="text-align: end; padding-top: 10px">
        <b-button
            type="reset"
            variant="outline-primary"
            class="add-cq-button"
        >Close</b-button>
        <b-button
            type="submit"
            variant="primary"
            class="ms-1 add-cq-button"
        >Save</b-button>
      </div>
    </form>
    <b-overlay :show="loading" no-wrap style="z-index: 1099"></b-overlay>
  </b-modal>
</template>

<script>
import {required} from "vuelidate/lib/validators";
import axiosCallApi from "@/config/axiosCallApi";
import {API_MANAGEMENT} from "@/constants/constants-api";
import {DANGER, showAlert, SUCCESS} from "@/utils/alertMessage";
import {MODAL_MODE} from "@/constants/constants";
import Vue from "vue";
import {Vuelidate} from "vuelidate";
import store from "@/store";

Vue.use(Vuelidate);
export default {
  name: "cq-modal",
  props: {
    showModal: {
      type: Boolean,
      default: false,
    },
    submitForm: {
      type: Object,
      default: () => {},
    },
    mode: {
      type: Number,
      default: MODAL_MODE.NEW,
    },
    courseId: {
      type: Number
    },
    sessionId: {
      type: Number
    }
  },
  data() {
    return {
      show: this.showModal,
      submitted: false,
      loading: false,
    }
  },
  validations: {
    submitForm: {
      cq: {
        title: { required },
        content: { required },
      }
    },
  },
  methods: {
    handleSubmit() {
      this.submitted = true;
      // stop here if form is invalid
      this.$v.$touch();
      if (this.$v.$invalid) {
        return;
      } else {
        if (!this.loading) {
          this.loading = true
          axiosCallApi.callApi(API_MANAGEMENT.PRIVATE_CQ_MANAGEMENT.CREATE, this.submitForm,
              { courseId: this.courseId, sessionId: this.sessionId, ownerId: store.getters.userId, classId: this.submitForm.cq.classId }).then(res => {
            this.resetModal();
            this.submitted = false;
            if (res) {
              this.loading = false
              showAlert(this, SUCCESS, 'Add new constructivism question successfully')
              this.$emit('onAfterCommit')
            }
          }).catch(() => {
            this.loading = false
            showAlert(this, DANGER, 'Add new constructivism question failed')
          })
        }
      }
    },
    resetModal() {
      // Reset vuelidate
      this.$nextTick(() => {
        this.$v.$reset();
      });
      this.$emit('onClose')
    },
  },
}
</script>

<style scoped>
.required:after {
  color: red;
  content: " *";
}

.add-new-cq-modal label {
  font-weight: 500;
}

.add-cq-button {
  margin-left: 8px;
  width: 100px;
  border-radius: 1rem;
}
</style>