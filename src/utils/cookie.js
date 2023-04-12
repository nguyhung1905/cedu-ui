import Cookies from "js-cookie";
import {TOKEN} from "@/constants/constants";

export function getToken(){
    return Cookies.get(TOKEN)
}

export function setToken(token){
    return Cookies.set(TOKEN, token)
}

export function removeToken(){
    return Cookies.remove(TOKEN)
}

export function getMessage(){
    return Cookies.remove(TOKEN)
}