import store from "../../store";

export function convertYimeInterval2Time(timeInterval){
    const hour = Math.floor(timeInterval/3600000)
    const minute = Math.floor((timeInterval/60000)%60)
    const second = Math.floor((timeInterval/1000)%60)
    return [hour,minute,second]
}

export function getVotedClass1(votedBy) {
    let isVoted = false
    if (votedBy) {
        Object.keys(votedBy).forEach(item => {
            isVoted = item === store.getters.email;
        })
    }
    if (isVoted) {
        return votedBy[store.getters.email] === 1 ? 'voted-1' : ''
    }
}

export function getVotedClass2(votedBy) {
    let isVoted = false
    if (votedBy) {
        Object.keys(votedBy).forEach(item => {
            isVoted = item === store.getters.email;
        })
    }
    if (isVoted) {
        return votedBy[store.getters.email] === 2 ? 'voted-2' : ''
    }
}

export function getVotedClass3(votedBy) {
    let isVoted = false
    if (votedBy) {
        Object.keys(votedBy).forEach(item => {
            isVoted = item === store.getters.email;
        })
    }
    if (isVoted) {
        return votedBy[store.getters.email] === 3 ? 'voted-3' : ''
    }
}

export function getVotedClass4(votedBy) {
    let isVoted = false
    if (votedBy) {
        Object.keys(votedBy).forEach(item => {
            isVoted = item === store.getters.email;
        })
    }
    if (isVoted) {
        return votedBy[store.getters.email] === 4 ? 'voted-4' : ''
    }
}