<template>
  <Layout :loading="loading">
    <main style="flex-grow: 1; padding: 32px 0 45px">
      <div v-if="createdFlag" class="Main__site">
        <b-breadcrumb
          class="SessionActive__breadcrumb"
          :items="items"
        ></b-breadcrumb>
        <h3>(Question): {{ questions.cq.title }}</h3>
        <div class="row">
          <div class="col-12 col-lg-8">
            <div class="SessionActive__content">
              <h5>Content</h5>
              <span v-html="questions.cq.content" style="white-space: pre-wrap;"></span>
            </div>
            <div v-if="classInfo.status === 2 && $store.getters.role === 3 && cqStatus !== 5" style="display: flex">
              <div v-if="isGrouped">
                <b-button
                    v-if="cqStatus === 1"
                    variant="primary"
                    :hidden="startCq"
                    style="margin-right: 10px"
                    @click="showTimer"
                >Start question</b-button>
                <b-button
                    v-if="cqStatus === 3"
                    variant="primary"
                    style="margin-right: 10px"
                    @click="showTimer"
                >Restart question</b-button>
                <b-button
                    v-if="cqStatus === 2"
                    variant="danger"
                    style="margin-right: 10px"
                    @click="onStopCQ"
                >Stop</b-button>
              </div>
              <div v-if="cqStatus === 1 && !isGrouped">
                <b-button variant="primary" @click="showModal">Create Groups</b-button>
                <p class="text-danger">Cannot start this question when students are not grouped. Please create groups now!</p>
              </div>
            </div>
            <div v-if="cqStatus === 2 && timeInterval > 0" style="text-align: center; font-weight: 600; font-size: 50px">
              <span id="h">{{ this.hour }}</span> :
              <span id="m">{{ this.minute }}</span> :
              <span id="s">{{ this.second }}</span>
            </div>
            <div class="SessionActive__status">
              <span v-if="cqStatus === 2 && timeInterval > 0">
                Discussion time has been started
                <br />
                Students can comment and vote for comments during this time.
              </span>
              <span v-if="cqStatus === 3" style="color: red">
                Dicussion time is over.
              </span>
            </div>
            <div>
              <div v-if="cqStatus !== 1" style="display: flex">
                <div style="display: flex; align-items: center; flex-wrap: nowrap; padding-bottom: 20px">
                  <h4 style="margin-right: 15px">Filter</h4>
                  <b-form-select
                      v-model="filterSelected"
                      :options="roomFilter"
                      class="form-control"
                      style="line-height: 24px; width: 180px; margin-left: 16px"
                      @change="changeCommentHistory($event)"
                  ></b-form-select>
                </div>
              </div>
              <b-tabs content-class="mt-3">
                <b-tab title="Discuss" active>
                  <div>
                    <p v-if="!comment.length && filterSelected !== 'voted'">This question have no comment.</p>
                  </div>
                  <div>
                    <p v-if="!comment.length && filterSelected === 'voted'">You have not voted any comment yet.</p>
                  </div>
                  <div v-if="cqStatus === 2 && (($store.getters.role === 4 && filterSelected === 'inside') || ($store.getters.role === 3 && filterSelected !== 'voted'))" class="SessionActive__discuss">
                    <b-form-textarea
                      id="textarea"
                      placeholder="Your comment"
                      v-model="contentComment"
                      rows="3"
                      max-rows="3"
                      class="SessionActive__discuss__yourComment"
                    ></b-form-textarea>
                    <div v-if="$store.getters.role === 3 && filterSelected !== 'all'" style="text-align: initial; display: flex; justify-content: space-between">
                      <span>Your comment will be display inside this group.</span>
                      <b-button variant="primary" @click="handleComment()"
                      >Send</b-button>
                    </div>
                    <div v-else>
                      <b-button variant="primary" @click="handleComment()"
                      >Send</b-button>
                    </div>
                    <div class="SessionActive__discuss__after" />
                  </div>
                  <div class="SessionActive__listComment">
                    <ul>
                      <li v-for="item of comment" :key="item._id">
                        <div style="display: flex">
                          <div>
                            <img
                                src="@/assets/images/logo_mini.png"
                                alt="mini-logo"
                            />
                          </div>
                          <div style="width: 100%">
                            <div style="margin-bottom: 12px">
                              <div class="SessionActive__listComment__title">
                            <span>
                              {{ item.name }}
                            </span>
                                <div class="SessionActive__listComment__title__time">
                                  <time>{{new Date(item.createdDateTime).toLocaleString()}}</time>
                                </div>
                                <div v-if="item.actions" class="SessionActive__listComment__title__actions">
                                  <i class="la la-ellipsis-h"></i>
                                  <div class="SessionActive__listComment__title__listActions">
                                    <ul>
                                      <li>
                                        <b-button
                                            class="SessionActive__listComment__title__buttons"
                                            variant="light"
                                            @click="handleEdit(item._id)"
                                        >Edit</b-button>
                                      </li>
                                      <li>
                                        <b-button
                                            class="SessionActive__listComment__title__buttons"
                                            variant="light"
                                            @click="handleDelete(item._id)"
                                        >Delete</b-button>
                                      </li>
                                    </ul>
                                  </div>
                                </div>
                              </div>
                              <div
                                  class="SessionActive__listComment__content"
                                  v-if="item.edit"
                              >
                                <b-form-textarea
                                    rows="3"
                                    max-row="3"
                                    v-model="item.text"
                                    class="SessionActive__discuss__yourComment"
                                ></b-form-textarea>
                                <div
                                    class="SessionActive__discuss"
                                    style="margin-left: 50px"
                                >
                                  <b-button
                                      variant="primary"
                                      style="margin-right: 10px"
                                      @click="handleUpdate(item._id, item.text)"
                                  >Update</b-button>
                                  <b-button @click="handleCancelEdit(item._id)"
                                  >Cancel</b-button>
                                </div>
                              </div>
                              <div
                                  v-if="!item.edit"
                                  class="SessionActive__listComment__content"
                              >
                                {{ item.text }}
                              </div>
                              <div v-if="cqStatus === 2" style="position: relative">
                                <button
                                    v-if="filterSelected !== 'voted' && cqStatus === 2"
                                    type="button"
                                    class="SessionActive__listComment__reply"
                                    @click="handleReply(item._id)"
                                >
                                  Reply</button>
                                <button
                                    :id="item._id + ''"
                                    type="button"
                                    class="SessionActive__listComment__reply"
                                    v-if="!item.actions"
                                    :class="getVotedClass(item.votedBy)"
                                >
                                  {{ onVoted(item.votedBy) }}</button>
                                <b-popover :target="item._id + ''" triggers="hover" placement="righttop">
                                  <div class="SessionActive__vote__vote-block">
                                    <div class="SessionActive__vote__vote-item" @click="onVote(item, 1)" :class="getVotedClass1(item.votedBy)">
                                      <span class="top-vote-item"><i class="las la-star level-1"></i> = 1 <i class="las la-star base-star"></i></span>
                                      <span class="remain-vote-item">Remain: <span class="total-remain">1</span></span>
                                    </div>
                                    <div class="SessionActive__vote__vote-item" @click="onVote(item, 2)" :class="getVotedClass2(item.votedBy)">
                                      <span class="top-vote-item"><i class="las la-star level-2"></i> = 2 <i class="las la-star base-star"></i></span>
                                      <span class="remain-vote-item">Remain: <span class="total-remain">2</span></span>
                                    </div>
                                    <div class="SessionActive__vote__vote-item" @click="onVote(item, 3)" :class="getVotedClass3(item.votedBy)">
                                      <span class="top-vote-item"><i class="las la-star level-3"></i> = 3 <i class="las la-star base-star"></i></span>
                                      <span class="remain-vote-item">Remain: <span class="total-remain">3</span></span>
                                    </div>
                                    <div class="SessionActive__vote__vote-item" style="border-right: none !important;" @click="onVote(item, 4)" :class="getVotedClass4(item.votedBy)">
                                      <span class="top-vote-item"><i class="las la-star level-4"></i> = 4 <i class="las la-star base-star"></i></span>
                                      <span class="remain-vote-item">Remain: <span class="total-remain">4</span></span>
                                    </div>
                                  </div>
                                </b-popover>
                                <div class="SessionActive__vote__cmt-summary">
                                  <div class="SessionActive__vote__vote-sumb">
                                    <i class="las la-star base-star"></i>
                                    <span>{{ getTotalVoted(item.votedBy) }}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <ul
                                class="SessionActive__listComment__child"
                                v-if="item.child.length > 0"
                            >
                              <li v-for="child of item.child" :key="child._id">
                                <div style="display:flex;">
                                  <div>
                                    <img
                                        src="@/assets/images/logo_mini.png"
                                        alt="mini-logo"
                                    />
                                  </div>
                                  <div style="width: 100%;">
                                    <div class="SessionActive__listComment__title">
                                      <span>{{ child.name }}</span>
                                      <div class="SessionActive__listComment__title__time">
                                        <time>{{new Date(child.createdDateTime).toLocaleString() }}</time>
                                      </div>
                                      <div v-if="child.actions" class="SessionActive__listComment__title__actions">
                                        <i class="la la-ellipsis-h"></i>
                                        <div class="SessionActive__listComment__title__listActions">
                                          <ul>
                                            <li>
                                              <b-button
                                                  class="SessionActive__listComment__title__buttons"
                                                  variant="light"
                                                  @click="handleEdit(item._id, child._id)"
                                              >Edit</b-button>
                                            </li>
                                            <li>
                                              <b-button
                                                  class="SessionActive__listComment__title__buttons"
                                                  variant="light"
                                                  @click="handleDelete(child._id)"
                                              >Delete</b-button>
                                            </li>
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                    <div
                                        class="SessionActive__listComment__content"
                                        v-if="child.edit"
                                    >
                                      <b-form-textarea
                                          rows="3"
                                          max-row="3"
                                          v-model="child.text"
                                          class="SessionActive__discuss__yourComment"
                                      ></b-form-textarea>
                                      <div class="SessionActive__discuss" style="margin-left: 50px">
                                        <b-button
                                            variant="primary"
                                            style="margin-right: 10px"
                                            @click="handleUpdate(child._id, child.text)"
                                        >Update</b-button>
                                        <b-button
                                            @click="handleCancelEdit(item._id, child._id)"
                                        >Cancel</b-button>
                                      </div>
                                    </div>
                                    <div
                                        v-if="!child.edit"
                                        class="SessionActive__listComment__content"
                                    >
                                      {{ child.text }}
                                    </div>
                                    <div v-if="cqStatus === 2" style="position: relative">
                                      <button
                                          v-if="filterSelected !== 'voted' && cqStatus === 2"
                                          type="button"
                                          class="SessionActive__listComment__reply"
                                          @click="handleReply(item._id)"
                                      >Reply</button>
                                      <button
                                          :id="child._id + ''"
                                          type="button"
                                          class="SessionActive__listComment__reply"
                                          v-if="!child.actions"
                                          :class="getVotedClass(child.votedBy)"
                                      >
                                        {{ onVoted(child.votedBy) }}</button>
                                      <b-popover :target="child._id + ''" triggers="hover" placement="righttop">
                                        <div class="SessionActive__vote__vote-block">
                                          <div class="SessionActive__vote__vote-item" @click="onVote(child, 1)" :class="getVotedClass1(child.votedBy)">
                                            <span class="top-vote-item"><i class="las la-star level-1"></i> = 1 <i class="las la-star base-star"></i></span>
                                            <span class="remain-vote-item">Remain: <span class="total-remain">1</span></span>
                                          </div>
                                          <div class="SessionActive__vote__vote-item" @click="onVote(child, 2)" :class="getVotedClass2(child.votedBy)">
                                            <span class="top-vote-item"><i class="las la-star level-2"></i> = 2 <i class="las la-star base-star"></i></span>
                                            <span class="remain-vote-item">Remain: <span class="total-remain">2</span></span>
                                          </div>
                                          <div class="SessionActive__vote__vote-item" @click="onVote(child, 3)" :class="getVotedClass3(child.votedBy)">
                                            <span class="top-vote-item"><i class="las la-star level-3"></i> = 3 <i class="las la-star base-star"></i></span>
                                            <span class="remain-vote-item">Remain: <span class="total-remain">3</span></span>
                                          </div>
                                          <div class="SessionActive__vote__vote-item" style="border-right: none !important;" @click="onVote(child, 4)" :class="getVotedClass4(child.votedBy)">
                                            <span class="top-vote-item"><i class="las la-star level-4"></i> = 4 <i class="las la-star base-star"></i></span>
                                            <span class="remain-vote-item">Remain: <span class="total-remain">4</span></span>
                                          </div>
                                        </div>
                                      </b-popover>
                                      <div class="SessionActive__vote__cmt-summary">
                                        <div class="SessionActive__vote__vote-sumb">
                                          <i class="las la-star base-star"></i>
                                          <span>{{ getTotalVoted(child.votedBy) }}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </li>
                            </ul>
                            <div
                                class="SessionActive__discuss"
                                style="margin-left: 50px"
                                v-if="item.reply && cqStatus === 2">
                              <b-form-textarea
                                  id="textarea"
                                  placeholder="Your comment"
                                  rows="3"
                                  v-model="contentReply"
                                  max-rows="3"
                                  class="SessionActive__discuss__yourComment"
                              ></b-form-textarea>
                              <b-button
                                  variant="primary"
                                  style="margin-right: 10px"
                                  @click="handleSendReply(item._id)"
                              >Send</b-button>
                              <b-button @click="handleCancel(item._id)">Cancel</b-button>
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </b-tab>
                <b-tab title="Group">
                  <SessionActiveGroup
                      :list-group="listGroup"
                      :waiting-list="waitingList"
                      :total-user-summary="totalUserSummary"
                      :cq-status="cqStatus"
                      :allow-group-change="allowGroupChange"
                      :user-online="userOnline"
                      @onAfterCommit="getGroups(true)"/>
                </b-tab>
              </b-tabs>
            </div>
          </div>
          <aside class="col-12 col-lg-4 col-xl-4">
            <div style="position: sticky; width: 25vw; top: 80px">
              <div v-if="$store.getters.role === 3" class="SessionActive__questions">
                <h3>Question summary</h3>
                <dl v-if="cqStatus !== 1">
                  <dt v-for="item in summary" :key="item.text">
                    <div style="display: flex; justify-content: space-between">
                      <div style="font-weight: 400">
                        {{item.text}}
                      </div>
                      <div style="font-weight: 400">{{item.value}}</div>
                    </div>
                  </dt>
                </dl>
                <dl v-if="cqStatus === 1">
                  <p>This question does not start.</p>
                </dl>
                <b-button v-if="isGrouped && cqStatus !== 1 && cqStatus !== 5" class="btn-success" @click="onExportExcel()">Export</b-button>
              </div>
              <div class="SessionActive__questions" style="background: #ffffff" >
                <h3>Table of contents</h3>
                <ul>
                  <li
                      ref="questions"
                      v-for="question in tableContent.questions"
                      :key="question.id"
                      class="SessionActive__questions"
                      :class="getSelectedCqClass(question)"
                      @click="onSelectCq(question)" >
                    <div style="padding-left: 20px">
                      <img src="@/assets/images/question.svg" alt="CQ" />{{ question.title }}
                      <div>{{ getStatus(question.status )}}</div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
    <SessionCreateGroup
        :show.sync="show"
        :class-info="classInfo"
        :group-loading.sync="groupLoading"
        :value.sync="numberOfGroup"
        :file-name="fileName"
        :group-list="createdGroups"
        @closeModal="closeModal"
        @handleCreateGroups="handleCreateGroups()"
        @onFileChange="onFileChange($event)"
        @handleCreateRandomGroup="handleCreateRandomGroup()"
    />
    <b-modal
      v-model="showTimerModal"
      title="Constructivism question settings"
      @hidden="onReset"
      centered
      hide-footer>
      <form @submit.prevent="handleSubmit">
        <div>
          <label style="font-style: italic">Time settings</label>
          <div style="margin-left: 20px">
            <label for="hour">Start in</label>
          </div>
          <div style="text-align: center" class="timer">
            <input
                v-model="timer.hour"
                :disabled="limitedTime"
                type="number"
                name="hour"
                id="hour"
                min="0"
                max="24"
                placeholder="00"
                class="SessionActive__timer"
            />
            <span>:</span>
            <input
                v-model="timer.minute"
                :disabled="limitedTime"
                type="number"
                name="minute"
                id="minute"
                min="0"
                max="59"
                placeholder="00"
                class="SessionActive__timer"
            />
            <span>:</span>
            <input
                v-model="timer.second"
                :disabled="limitedTime"
                type="number"
                name="second"
                id="second"
                min="0"
                max="59"
                placeholder="00"
                class="SessionActive__timer"
            />
          </div>
          <b-form-checkbox
              id="limited-time"
              style="margin-left: 20px"
              v-model="limitedTime"
              name="limited-time"
              :value="true"
              :unchecked-value="false"
          >
            Unlimited time
          </b-form-checkbox>
        </div>
        <div>
          <label style="font-style: italic">Display settings</label>
          <b-form-checkbox
              id="checkbox-1"
              style="margin-left: 20px"
              v-model="displayCommentAuthor"
              name="checkbox-1"
              :value="true"
              :unchecked-value="false"
          >
            Display student name in comments
          </b-form-checkbox>
          <b-form-checkbox
              id="checkbox-2"
              style="margin-left: 20px"
              v-model="allowViewOutGroupComment"
              name="checkbox-2"
              :value="true"
              :unchecked-value="false"
          >
            Allows outside group to view comment
          </b-form-checkbox>
        </div>
        <div class="modal-btn">
          <b-button variant="light" @click="onReset">Cancel</b-button>
          <b-button type="submit" variant="success" class="ms-1">Save</b-button>
        </div>
      </form>
    </b-modal>
  </Layout>
</template>

<script>
import Layout from "@/components/layout";
import SessionActiveGroup from "../components/session-active/session-active-group.vue";
import SessionCreateGroup from "../components/session-active/session-create-group.vue";
import socketConfig from "@/config/socketConfig";
import axiosCallApi from "@/config/axiosCallApi";
import {API, API_MANAGEMENT, REALTIME_API} from "@/constants/constants-api";
import { mapGetters } from "vuex";
import * as XLSX from "xlsx";
import {DANGER, showAlert, showConfirmDialog, SUCCESS, WARNING} from "@/utils/alertMessage";
import {QUESTION_STATUS, STATUS, USER_ROLE} from "@/constants/constants";
import store from "@/store";
import {convertYimeInterval2Time, getVotedClass1, getVotedClass2, getVotedClass3 ,getVotedClass4} from "@/components/session-active/session-active-utils";
import apiFactory from "@/config/apiFactory";

export default {
  name: "session-active",
  components: {
    Layout,
    SessionActiveGroup,
    SessionCreateGroup
  },
  props: {},
  data() {
    return {
      loading: false,
      groupLoading: false,
      summary: [
        {text: 'Total comment posted', value:'' },
        {text: 'Total vote' },
        {text: "Haven't voted for comments" },
        {text: "Haven't posted comments" },
        {text: 'Most active student' },
        {text: 'Most active group' },
        {text: 'Least active group' },
        {text: 'Group have no action' },
      ],
      totalUserSummary: [],
      message: [],
      showTimerModal: false,
      hour: 0o0,
      minute: 0o0,
      second: 0o0,
      file: null,
      fileName: null,
      collection: null,
      show: false,
      socket: null,
      contentComment: null,
      contentReply: null,
      createdFlag: false,
      questions: [],
      listGroup: [],
      waitingList: {},
      comment: [],
      numberOfGroup: null,
      tableContent: [],
      timer: {
        hour: 0o0,
        minute: 0o0,
        second: 0o0,
      },
      timeInterval: 0,
      intervalId: null,
      startCq: false,
      groups: {},
      filterSelected: 'all',
      roomFilter: [
        { text: 'All', value: 'all' },
        { text: 'Inside group', value: 'inside' },
        { text: 'Outside group', value: 'outside' },
        { text: 'Voted', value: 'voted' },
      ],
      acceptFile: '.csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel',
      classInfo: {},
      classId: this.$route.query.classId,
      items: [],
      cqStatus: null,
      displayCommentAuthor: false,
      allowViewOutGroupComment: false,
      limitedTime: false,
      isGrouped: false,
      classSessionId: null,
      listGroupImport: [],
      createdGroups: null,
      userOnline: [],
      allowGroupChange: true,
    };
  },
  watch: {
    classInfo() {
      this.items = [
        {
          text: "Home",
          href: "/home",
        },
        {
          text: this.classInfo.courseTitle,
          href: "/course-detail?id=" + this.classInfo.courseId + "&classId=" + this.classInfo.id,
        },
        {
          text: "Slot " + this.questions.cq.sessionOrder,
          href:
              "/session-detail?classId=" +
              this.classInfo.id +
              "&sessionId=" +
              this.questions.cq.session,
        },
        {
          text: this.questions.cq.title,
          active: true,
        },
      ]
    },
    '$route.params.cqId': {
      handler: function() {
        if (this.listGroup.length) {
          this.$router.go(0)
        }
      },
      deep: true,
      immediate: true
    }
  },
  async beforeCreate() {
    this.socket = await socketConfig.createSocketConnection(this.$route.query.cqId + "");
    this.socket.on('UserOnline', numberOfUserOnline => {
      this.userOnline = numberOfUserOnline
    })
  },
  async created() {
    await this.getCqStatus();
    await this.getQuestionById();
    this.createdFlag = true;
    await this.socket.on("comment:readHistoryInGroup", (comments) => {
      this.comment = comments.map((item) => {
        const data = item.child.map((child) => {
          return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
        });
        return item.author === this.email ? {...item, reply: false, name: "Me", edit: false, child: data, actions: true,} : { ...item, reply: false, child: data };
      });
    })
    await this.socket.on("comment:readHistoryOutGroup", (comments) => {
      console.log(comments);
      this.comment = comments.map((item) => {
        const data = item.child.map((child) => {
          return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
        });
        return item.author === this.email ? {...item, reply: false, name: "Me", edit: false, child: data, actions: true,} : { ...item, reply: false, child: data };
      });
    })
    await this.readHistory();
    this.socket.on('status:setDiscussionTime', ({ status, discussionEndTime, displayCommentAuthor, allowViewOutGroupComment }) => {
      this.getListSetting(status,discussionEndTime,displayCommentAuthor,allowViewOutGroupComment)
    })
    this.socket.on('status:get', ({ status, discussionEndTime, displayCommentAuthor, allowViewOutGroupComment }) => {
      this.getListSetting(status,discussionEndTime,displayCommentAuthor,allowViewOutGroupComment)
    })
    this.socket.on("comment:create", (newComment) => {
      newComment.author === this.email
          ? this.comment.unshift({
            ...newComment, name: "Me", reply: false, edit: false, actions: true,
          })
          : this.comment.unshift({
            ...newComment, reply: false, edit: false,
          });
    });
    this.socket.on("comment:edit", (editComment)=>{
      this.updateComment(editComment)
    });
    this.socket.on("comment:delete", (deleteComment) =>{
      this.deleteComment(deleteComment)
    });
    this.socket.on("comment:vote", (comment) => {
      this.onVotedChange(comment)
    });
    this.socket.on("comment:reply", (parentCmt) => {
      this.comment.forEach((item) => {
        if (item._id === parentCmt._id) {
          if (parentCmt.child[parentCmt.child.length - 1].author === this.email) {
            item.reply = false;
            item.child.push({
              ...parentCmt.child[parentCmt.child.length - 1], name: "Me", actions: true, edit: false,
            });
          } else item.child.push(parentCmt.child[parentCmt.child.length - 1]);
        }
      });
    });
    this.socket.on("group:change", (newGroups) => {
      console.log('change student to other group' + newGroups)
    });
    this.socket.on("status:change", (changeStatus) => {
      this.cqStatus = changeStatus;
    });
    this.socket.emit('status:get')
    this.socket.on('status:end', () => {
      this.cqStatus = STATUS.CLOSED
      this.onChangeStatus(STATUS.CLOSED)
      clearInterval(this.intervalId)
    })
    this.socket.emit('room:joinSummaryRoom')
    this.socket.on('summary', ({ leaderboardUser, leaderboardGroup }) => {
      this.totalUserSummary = leaderboardUser
      this.summary[0].value = leaderboardUser.reduce((a,b)=>{ return a + b.comment},0)
      this.summary[1].value = leaderboardUser.reduce((a,b)=>{ return a + b.vote},0)
      this.summary[2].value = leaderboardUser.filter(item=> item.vote === 0).length
      this.summary[3].value = leaderboardUser.filter(item=> item.comment === 0).length
      this.summary[4].value = leaderboardUser[0].comment ? leaderboardUser[0].email : 'None'
      this.summary[5].value = leaderboardGroup[0].comment ? leaderboardGroup[0].group : 'None'
      this.summary[6].value = leaderboardGroup[(leaderboardGroup.length-1)].comment ? leaderboardGroup[(leaderboardGroup.length-1)].group : 'None'
      let groupNoAction = leaderboardGroup.filter(item=> item.comment === 0 && item.vote === 0)
      if (groupNoAction.length) {
        this.summary[7].value = groupNoAction[0].group ? groupNoAction[0].group : "None"
      }
    })
    this.socket.on('comment:readHistoryVotedByMe', comments => {
      this.comment = comments.map((item) => {
        const data = item.child.map((child) => {
          return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
        });
        return item.author === this.email ? {...item, reply: false, name: "Me", edit: false, child: data, actions: true,} : { ...item, reply: false, child: data };
      });
    })
    this.getClassInfo()
    await this.getListCq()
  },
  computed: { ...mapGetters(["email", "name", "role"]) },
  methods: {
    viewCommentOptions(allowViewOutGroupComment) {
      this.roomFilter = [
        { text: 'All', value: 'all' },
        { text: 'Inside group', value: 'inside' },
        { text: 'Outside group', value: 'outside' },
        { text: 'Voted', value: 'voted' },
      ]
      if (this.role === USER_ROLE.LECTURER) {
        this.roomFilter = this.roomFilter.filter(item => item.value === 'all' || item.value === 'voted')
        this.listGroup.forEach(item => {
          this.roomFilter.push({
            text: item.name, value: item.name
          })
        })
      } else if (allowViewOutGroupComment && this.role === USER_ROLE.STUDENT) {
        this.filterSelected = 'inside'
        this.roomFilter = this.roomFilter.filter(item => item.value !== 'all')
      } else {
        this.filterSelected = 'inside'
        this.roomFilter = this.roomFilter.filter(item => item.value !== 'all' && item.value !== 'outside')
      }
    },
    getStatus(status) {
      return QUESTION_STATUS.find((item) => item.id === status).text;
    },
    updateComment(editComment) {
      this.comment.forEach((item) => {
        if (item._id === editComment._id) {
          item.edit = false;
          item.text = editComment.text;
          if (editComment.child[0]) {
            if (editComment.child[0].text) {
              editComment.child.forEach((child) => {
                if (child.author === this.email) {
                  (child.name = "Me"),
                      (child.actions = true),
                      (child.edit = false);
                }
              });
              item.child = editComment.child;
            }
          } else item.child = editComment.child;
        }
      });
    },
    deleteComment(deleteComment){
      this.comment = this.comment.filter(item => item._id !== deleteComment._id)
    },
    onVotedChange(comment) {
      const cmtIndex = this.comment.findIndex(item => item._id === comment._id)
      comment = comment.author === this.email ?
          {...comment, reply: false, name: "Me", edit: false, child: comment.child, actions: true,} :
          { ...comment, reply: false, child: comment.child };
      comment.child = comment.child.map((child) => {
        return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
      });
      this.comment[cmtIndex] = comment
    },
    getListSetting(status, discussionEndTime, displayCommentAuthor, allowViewOutGroupComment) {
      this.displayCommentAuthor = displayCommentAuthor
      this.allowViewOutGroupComment = allowViewOutGroupComment
      this.viewCommentOptions(allowViewOutGroupComment)
      this.changeCommentHistory()
      this.cqStatus = status
      const currentDate = Date.now()
      this.timeInterval = discussionEndTime - currentDate
      if (this.timeInterval <= 0) {
        this.hour = 0o0
        this.minute = 0o0
        this.second = 0o0
      } else if (this.timeInterval && this.timeInterval >= 0) {
        [this.hour,this.minute,this.second] = convertYimeInterval2Time(this.timeInterval)
        this.intervalId = setInterval(() => {
          this.second--;
          this.start();
        }, 1000);
      }
    },
    getCqStatus() {
      axiosCallApi.callApi(REALTIME_API.GET_STATUS, {}, { id: this.$route.query.cqId }).then(res => {
        this.cqStatus = res.data.data.status
      })
    },
    async getGroups(sendSocket) {
      this.listGroup = []
      this.loading = true
      await axiosCallApi.callApi(API_MANAGEMENT.GROUPS.GET_GROUPS, {}, { classSessionId : this.classSessionId }).then(res => {
        axiosCallApi.callApi(API_MANAGEMENT.GROUPS.WAITING_LIST, {}, { classId: this.$route.query.classId, classSessionId : this.classSessionId }).then(resStd => {
          this.waitingList = resStd.data
          if (res.data.length && this.role === USER_ROLE.STUDENT) {
            this.isGrouped = true
            let data = []
            if (resStd.data.listStudentByGroups.length !== 0) {
              data = [...res.data]
              data.unshift(resStd.data)
            } else {
              data = [...res.data]
            }
            data.forEach(item => {
              item.listStudentByGroups.forEach(group => {
                if (group.email === store.getters.email) {
                  this.listGroup.push(item)
                }
              })
            })
            if (sendSocket) {
              this.createGroupSocket(this.listGroup)
            }
            this.loading = false
          }
          else if (res.data.length) {
            this.isGrouped = true
            this.listGroup = res.data
            res.data.forEach(item => {
              this.roomFilter.push({
                text: item.name, value: item.name
              })
            })
            if (resStd.data.listStudentByGroups.length) {
              this.listGroup.unshift(resStd.data)
            }
            if (sendSocket) {
              this.createGroupSocket(this.listGroup)
            }
            this.loading = false
          }
          else {
            this.isGrouped = false
            this.listGroup = [...res.data]
            this.listGroup.push(resStd.data)
            if (sendSocket) {
              this.createGroupSocket(this.listGroup)
            }
            this.loading = false
          }
        })
      })
    },
    createGroupSocket(groupData) {
      this.groups = {}
      for (let group of groupData) {
        for (let item of group.listStudentByGroups) {
          this.groups[item.email] = group.name
        }
      }
      this.socket.emit("group:create", this.groups);
    },
    async getQuestionById() {
      this.loading = true;
      await axiosCallApi
        .callApi(API_MANAGEMENT.PRIVATE_CQ_MANAGEMENT.GET_BY_ID, {}, { id: this.$route.query.cqId })
        .then((res) => {
          this.questions = res.data;
          this.loading = false;
        })
        .catch(() => {
          this.loading = false;
        });
    },
    getListCq() {
      this.loading = true
      axiosCallApi.callApi(API.COURSE_DETAIL.GET_SESSION_DETAIL,{}, { classroomId: this.classId, sessionId: this.questions.cq.session })
          .then(res => {
            this.tableContent =  res.data[0]
            if (this.role === USER_ROLE.STUDENT) {
              this.tableContent.questions = this.tableContent.questions.filter(item => item.status !== STATUS.HIDDEN)
            }
            if (this.tableContent.questions.find(cq => cq.status !== STATUS.CREATED)) {
              this.allowGroupChange = false
            }
            this.classSessionId = res.data[0].classSessionId
            this.getGroups()
          }).catch(() => {
        this.loading = false
      })
    },
    showModal() {
      this.loading = true
      axiosCallApi.callApi(API_MANAGEMENT.GROUPS.CHECK_GROUPED, {}, { classId: this.$route.query.classId }).then(res => {
        if (res.data) {
          this.loading = false
          showConfirmDialog(this, 'This class have been had group, Do you want to reuse the old group?', (value) => {
            if (value) {
              this.loading = true
              axiosCallApi.callApi(API_MANAGEMENT.GROUPS.GET_OLD_GROUPS, {},{ classId: this.$route.query.classId, classSessionId: this.classSessionId }).then(() => {
                this.getGroups(true)
                showAlert(this, SUCCESS, 'Created group successfully')
              }).catch(() => {
                this.loading = false
              })
            } else if (value === false) {
              this.show = true;
            } else {
              this.show = false
            }
          })
        } else {
          this.loading = false
          this.show = true
        }
      })
    },
    async readHistory() {
      if (this.role === USER_ROLE.LECTURER) {
        await this.socket.on("comment:readHistory", (comments) => {
          this.comment = comments.map((item) => {
            const data = item.child.map((child) => {
              return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
            });
            return item.author === this.email ? {...item, reply: false, name: "Me", edit: false, child: data, actions: true } : { ...item, reply: false, child: data };
          });
        });
        this.socket.emit('comment:readHistory');
        this.socket.emit('room:joinCafeZone');
      } else {
        await this.socket.on("comment:readHistoryInGroup", (comments) => {
          this.comment = comments.map((item) => {
            const data = item.child.map((child) => {
              return child.author === this.email ? { ...child, name: "Me", edit: false, actions: true } : { ...child };
            });
            return item.author === this.email ? {...item, reply: false, name: "Me", edit: false, child: data, actions: true } : { ...item, reply: false, child: data };
          });
        });
        this.socket.emit('comment:readHistoryInGroup');
        this.socket.emit('room:joinInGroup');
      }
    },
    handleComment() {
      this.socket.emit("comment:create", this.contentComment);
      this.contentComment = "";
    },
    handleReply(_id) {
      const index = this.comment.findIndex((obj) => obj._id === _id);
      this.comment[`${index}`].reply = true;
    },
    handleSendReply(_id) {
      const text = this.contentReply;
      this.socket.emit("comment:reply", { _id, text });
      this.contentReply = "";
    },
    handleCancel(item) {
      const index = this.comment.findIndex((obj) => obj._id === item);
      this.comment[`${index}`].reply = false;
    },
    handleEdit(item, itemChild) {
      if (itemChild) {
        this.comment[
          `${this.comment.findIndex((obj) => obj._id === item)}`
        ].child[
          `${this.comment[
            `${this.comment.findIndex((obj) => obj._id === item)}`
          ].child.findIndex((objChild) => objChild._id === itemChild)}`
        ].edit = true;
      } else {
        const index = this.comment.findIndex((obj) => obj._id === item);
        this.comment[`${index}`].edit = true;
      }
    },
    handleCancelEdit(item, itemChild) {
      if (itemChild) {
        this.comment[
          `${this.comment.findIndex((obj) => obj._id === item)}`
        ].child[
          `${this.comment[
            `${this.comment.findIndex((obj) => obj._id === item)}`
          ].child.findIndex((objChild) => objChild._id === itemChild)}`
        ].edit = false;
      } else {
        const index = this.comment.findIndex((obj) => obj._id === item);
        this.comment[`${index}`].edit = false;
      }
    },
    handleUpdate(_id, newText) {
      this.socket.emit("comment:edit", { _id, newText });
    },
    handleDelete(id) {
      this.socket.emit("comment:delete", id);
    },
    handleCreateRandomGroup() {
      this.groupLoading = true
      axiosCallApi.callApi(API_MANAGEMENT.GROUPS.RANDOM, {}, { classSessionId: this.questions.classroomSession , numberOfGroup: this.numberOfGroup }).then(res => {
        if (res.data.length !== 0) {
          this.getGroups(true)
          this.show = false
          this.groupLoading = false
          showAlert(this, SUCCESS, 'Create random groups successfully')
        } else {
          this.groupLoading = false
        }
      }, err => {
        this.groupLoading = false
        showAlert(this, DANGER, err.response.data.error.message)
      }).catch(() => {
        this.groupLoading = false
      })
    },
    handleCreateGroups() {
      this.groupLoading = true
      axiosCallApi.callApi(API_MANAGEMENT.GROUPS.IMPORT_GROUPS, this.listGroupImport, { classSessionId: this.classSessionId }).then(res => {
        if (res.data) {
          this.getGroups(true)
          this.groupLoading = false
          this.show = false
          showAlert(this, SUCCESS, 'Create groups successfully')
        }
      }, err => {
        this.groupLoading = false
        showAlert(this, DANGER, err.response.data.error.message)
      }).catch(() => {
        this.groupLoading = false
        showAlert(this, DANGER, 'Create groups failed')
      })
    },
    closeModal() {
      this.show = false
      this.fileName = ''
      this.createdGroups = null
      this.listGroupImport = []
    },
    showTimer() {
      if (this.isGrouped) {
        this.showTimerModal = true;
      } else {
        showAlert(this, WARNING, 'Cannot start this question when students are not have group!')
      }
    },
    handleSubmit() {
      this.hour = this.timer.hour
      this.minute = this.timer.minute
      this.second = this.timer.second

      const time = +this.timer.hour*60*60 + +this.timer.minute*60 + +this.timer.second
      if(this.limitedTime === false && time <= 59){
        showAlert(this, WARNING, 'Discussion time must be greater than 1 minute')
        return
      }
      const endTime = this.limitedTime ? 0 : Date.now() + +this.timer.hour*60*60*1000 + +this.timer.minute*60*1000 + +this.timer.second*1000
      this.socket.emit("status:change", STATUS.OPENING);
      this.onChangeStatus(STATUS.OPENING)
      showAlert(this, SUCCESS, 'Start discussion successfully')
      this.socket.emit("status:setDiscussionTime",
          {
            discussionEndTime: endTime,
            displayCommentAuthor: this.displayCommentAuthor,
            allowViewOutGroupComment: this.allowViewOutGroupComment
          });
      this.showTimerModal = false;
      this.startCq = true;
    },
    onChangeStatus(status) {
      axiosCallApi.callApi(API_MANAGEMENT.PRIVATE_CQ_MANAGEMENT.UPDATE, { id: this.$route.query.cqId, statusId: status }).then(res => {
        if (res.data) {
          const activeCq = this.tableContent.questions.find(item => +item.id === +this.$route.query.cqId)
          activeCq.status = status
        }
      })
    },
    start() {
      if (this.hour === 0o0 && this.minute === 0o0 && this.second === 0o0) {
        clearInterval(this.intervalId)
        return false;
      } else {
        if (this.second === -1) {
          this.minute -= 1;
          this.second = 59;
        }
        if (this.minute === -1) {
          this.hour -= 1;
          this.minute = 59;
        }
      }
    },
    onReset() {
      this.showTimerModal = false
      this.timer = {
        hour: 0o0,
        minute: 0o0,
        second: 0o0,
      };
    },
    onStopCQ() {
      showConfirmDialog(this, 'Are you sure you want to stop discussion?', (value) => {
        if (value) {
          this.socket.emit("status:end")
          this.onChangeStatus(STATUS.CLOSED)
          this.cqStatus = STATUS.CLOSED
          this.hour = 0o0
          this.minute = 0o0
          this.second = 0o0
          clearInterval(this.intervalId)
          showAlert(this, SUCCESS, 'Stop discussion successfully')
        }
      })
    },
    async changeCommentHistory() {
      switch (this.filterSelected) {
        case 'all':
          this.socket.emit('comment:readHistory');
          this.socket.emit('room:joinCafeZone');
          break
        case 'outside':
          this.socket.emit('comment:readHistoryOutGroup');
          this.socket.emit('room:joinOutGroup');
          break
        case 'inside':
          this.socket.emit('comment:readHistoryInGroup');
          this.socket.emit('room:joinInGroup');
          break
        case 'voted':
          this.socket.emit('comment:readHistoryVotedByMe');
          break
        default:
          if (this.role === USER_ROLE.LECTURER) {
            this.socket.emit('comment:readHistoryInGroup', this.filterSelected);
            this.socket.emit('room:joinInGroup', this.filterSelected);
          }
          break
      }
    },
    getClassInfo() {
      axiosCallApi.callApi(API_MANAGEMENT.CLASS_MANAGEMENT.GET_CLASS_INFO, {}, {id: this.classId}).then(res => {
        this.classInfo = res.data
      })
    },
    onUploadStudentList() {
      this.$refs.file.click()
    },
    onFileChange(event) {
      this.file = event.target.files ? event.target.files[0] : null;
      if (this.file) {
        if (this.acceptFile.includes(this.file.type) && (this.file.name.indexOf('Students-group')) !== -1) {
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

          data.splice(1).forEach(item => {
            if (item[0] && item[1]) {
              this.groups[item[0]] = item[1]
            }
          })
          console.log(this.groups);
          if (!Object.values(this.groups).length) {
            showAlert(this, WARNING, 'This file has no data or student not been grouped.')
          } else {
            this.fileName = this.file.name
            let objGroup = {}
            for (const [key, value] of Object.entries(this.groups)) {
              if (!Object.prototype.hasOwnProperty.call(objGroup, value)) {
                objGroup[value] = [{ email: key }]
              } else {
                objGroup[value].push({ email: key })
              }
            }
            this.createdGroups = objGroup
            for (const [key, value] of Object.entries(objGroup)) {
              this.listGroupImport.push({
                classroomSessionId: this.classSessionId,
                name: key,
                groupStudentsImport: value
              })
            }
          }
          }
          reader.readAsBinaryString(this.file);
        } else {
          showAlert(this, DANGER, 'Upload file is not accepted')
        }
      }
    },
    getData(collection) {
      if (collection.collection) {
        this.collection = collection.collection;
        collection.collection.forEach(student => {
          this.groups[student.email] = student.group
        })
      }
    },
    onSelectCq(question) {
      if (+question.id !== +this.$route.query.cqId) {
        this.loading = true
        this.$router.push({
          name: 'session-active',
          query: {
            cqId: question.id,
            classId: this.$route.query.classId, }
        })
      }
    },
    getSelectedCqClass(question) {
      if (question.id === +this.$route.query.cqId) {
        return 'selected-cq'
      }
    },
    onVote(item, value){
      this.socket.emit('comment:vote', { _id: item._id, value });
    },
    onVoted(votedBy) {
      let isVoted = false
      if (votedBy) {
        isVoted = !!votedBy[store.getters.email]
      }
      if (isVoted) {
        return 'Voted'
      } else return 'Vote'
    },
    getVotedClass(votedBy) {
      let isVoted = false
      let votedValue
      if (votedBy) {
        isVoted = !!votedBy[store.getters.email]
        if (isVoted) {
          votedValue = votedBy[store.getters.email]
        }
      }
      return 'voted-' + votedValue
    },
    getTotalVoted(votedBy) {
      if (votedBy) {
        return Object.values(votedBy).reduce((previousValue, value) => previousValue + value, 0)
      } else return 0
    },
    getVotedClass1(votedBy){
      return getVotedClass1(votedBy);
    },
    getVotedClass2(votedBy){
      return getVotedClass2(votedBy);
    },
    getVotedClass3(votedBy){
      return getVotedClass3(votedBy);
    },
    getVotedClass4(votedBy){
      return getVotedClass4(votedBy);
    },
    onExportExcel() {
      this.loading = true
      apiFactory.download(REALTIME_API.EXPORT_SUMMARY, 'CQ-Summary.xlsx', { id: this.$route.query.cqId }, this).then(() => {
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
  },
};
</script>

<style lang="scss">
@import "src/assets/styles/session-active";
</style>
