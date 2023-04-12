import Axios from 'axios'
import {HttpMethod} from "@/constants/constants";


const objectToParams = (obj) => Object.keys(obj).reduce(function(previousValue, currentValue) {
    previousValue.push(currentValue + '=' + obj[currentValue])
    return previousValue
}, []).join('&')


class ApiFactory {
    /**
     * @param constantApi : {} config in ConstantAPI.MENU_CODE.ENDPOINT
     * @param fileName : string fileName to download
     * @param params : {} object request params
     * @param $this : Object component
     */
    static download(constantApi, fileName, params, $this) {
        const url = `${constantApi['url']}?${objectToParams(params)}`
        return Axios({
          method: constantApi.method || HttpMethod.GET,
          url: url,
          responseType: 'blob',
          data: constantApi.method === HttpMethod.POST ? $this.data : null
        }).then((res) => {
          const fileURL = window.URL.createObjectURL(new Blob([res.data]))
          const fileLink = document.createElement('a')
          fileLink.href = fileURL
          const name = res.headers.file ? decodeURIComponent(res.headers.file) : decodeURIComponent(fileName)
          fileLink.setAttribute('download', name)
          document.body.appendChild(fileLink)
          if ($this && $this.callback) {
            $this.callback()
          }
          fileLink.click()
        }).catch(() => {
          if ($this && $this.callback) {
            $this.callback()
          }
        })
      }
}

export default ApiFactory