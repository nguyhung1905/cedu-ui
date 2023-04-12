import axios from 'axios'

const objectToParams = (obj) => Object.keys(obj).reduce(function(previousValue, currentValue) {
    previousValue.push(currentValue + '=' + obj[currentValue])
    return previousValue
}, []).join('&')

class axiosCallApi {
    static callApi(api,payload={}, params){
        let url
        if(params){
            url = `${api[`url`]}?${objectToParams(params)}`
        } else  url = `${api[`url`]}`
        return axios({
            method: api[`method`],
            baseURL: url,
            data: payload,
        }).then(res => {
            return res
        }, err => {
            throw err
        })
    }
}

export default axiosCallApi
