<template>
  <b-modal v-model="show"
           size="xl"
           centered
           @hidden="onResetModal()"
           title="Create Groups"
           hide-footer
           no-close-on-backdrop
           hideHeaderClose>
    <div  class="SessionActive__createGroups">
      <div class="SessionActive__createGroups__class-name">
        Class: {{ classInfo.className }}
      </div>
      <b-tabs content-class="mt-3" align="center">
        <b-tab title="Upload file" active>
          <form @submit.prevent="handleCreateGroups()">
            <div>
              <div class="SessionActive__createGroups__table">
                <div class="SessionActive__createGroups__info">
                  <span>You need to download the <a class="template-link" @click="onDownloadStudentList()">File of Student List</a> to create groups</span>
                </div>
                <div v-if="!fileName" class="SessionActive__createGroups__action">
                  <p>Please click "Upload" to import the file</p>
                  <b-button variant="outline-primary" @click="onUploadStudentList">Upload</b-button>
                </div>
                <div style="text-align: center">
                  <label>{{ fileName }}</label>
                </div>
                <div v-for="(group, index) of groupList" :key="index" style="margin-left: 24px;">
                  <span style="font-weight: 600">Group name:  {{ index }}</span>
                  <ul>
                    <li v-for="item in group" :key="item.email">{{ item.email }}</li>
                  </ul>
                </div>
              </div>
              <input ref="file" hidden type="file" :accept="acceptFile" @change="onFileChange($event)" @click="(e) => e.target.value = null"/>
            </div>
            <div class="modal-btn">
              <b-button size="sm" @click="onResetModal"> Cancel </b-button>
              <b-button v-if="fileName" size="sm" type="submit" variant="primary">OK</b-button>
            </div>
          </form>
        </b-tab>
        <b-tab title="Random">
          <form @submit.prevent="handleCreateRandomGroup()">
            <div class="SessionActive__createGroups__table">
              <div class="SessionActive__createGroups__info">
                Class size: <span style="color: #c26d00">{{ classInfo.numberOfStudent }}</span> students
              </div>
              <div class="SessionActive__createGroups__action">
                <label for="numOfGroup" style="margin-bottom: 16px">How many group do you want create?</label>
                <b-form-input v-model="numberOfGroup" id="numOfGroup" type="number" min="1" required style="width: 40%; margin: auto"></b-form-input>
              </div>
            </div>
            <div class="modal-btn">
              <b-button size="sm" @click="onResetModal"> Cancel </b-button>
              <b-button size="sm" type="submit" variant="primary">OK</b-button>
            </div>
          </form>
        </b-tab>
        <b-overlay :show="groupLoading" no-wrap style="z-index: 1099"></b-overlay>
      </b-tabs>
    </div>
  </b-modal>
</template>

<script>
import apiFactory from "../../config/apiFactory";
import {API_MANAGEMENT} from "../../constants/constants-api";

export default {
  name: "sessionCreateGroup",
  props:{
    value:{
      type: String,
      default: ''
    },
    show: {
      type: Boolean,
      default: false
    },
    classInfo:{
      type: Object,
      default: null
    },
    groupLoading: {
      type: Boolean,
      default: false
    },
    fileName: {
      type: String,
      default: '',
    },
    groupList: {
      type: Object,
      default: null
    }
  },
  watch:{
    numberOfGroup(val) {
      this.$emit('update:value', val)
    },
  },
  data() {
    return {
      acceptFile: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      numberOfGroup: null,
    }
  },
  methods:{
    onDownloadStudentList(){
      this.groupLoading = true
        apiFactory.download(API_MANAGEMENT.STUDENT.EXPORT_STUDENTS, 'Students-group.xlsx', { classId: this.$route.query.classId }, this).then(() => {
          this.groupLoading = false
        }).catch(() => {
          this.groupLoading = false
        })
    },
    onUploadStudentList() {
      this.$refs.file.click()
    },
    handleCreateGroups(){
      this.$emit('handleCreateGroups')
    },
    onFileChange(event){
      this.$emit('onFileChange', event)
    },
    handleCreateRandomGroup(){
      this.$emit('handleCreateRandomGroup')
    },
    onResetModal() {
      this.numberOfGroup = null
      this.$emit('closeModal')
    },
  }
}
</script>

<style scoped>

</style>