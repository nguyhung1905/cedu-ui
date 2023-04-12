import { io } from 'socket.io-client';
import {getToken} from "@/utils/cookie";

const eventEmiter = {};


const createSocketConnection = async function (cqId) {
    //Connect
    let socketClient = await io(`localhost:9999/${cqId}`, {
        auth: {
            token: getToken()
        }
    });
    await socketClient.on('welcome', message => {
        console.log('[welcome]', message);
    })
    //Default and error area
    socketClient.on("connect_error", (err) => {
        console.log('[connect_error]', err);
    });

    socketClient.on("HumanError", (err) => {
        console.log('[HumanError]', err);
    });

    //Write area
    eventEmiter.replyComment = (_id, text) => {
        socketClient.emit('comment:reply', { _id, text });
    }

    eventEmiter.createComment = (text) => {
        socketClient.emit('comment:create', text);
    }

    eventEmiter.deleteComment = (_id) => {
        socketClient.emit('comment:delete', _id);
    }

    eventEmiter.editComment = (_id, newText) => {
        socketClient.emit('comment:edit', { _id, newText });
    }

    eventEmiter.voteComment = (commentId, value) => {
        socketClient.emit('comment:vote', { _id: commentId, value });
    }

    return socketClient;
}

export default {eventEmiter, createSocketConnection};