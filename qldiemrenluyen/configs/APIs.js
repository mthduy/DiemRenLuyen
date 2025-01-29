import axios from "axios";

const BASE_URL = 'https://dinhtien.pythonanywhere.com/';

export const endpoints = {
    'activities': '/activities/',
    'login': '/o/token/',
    'currentUser': '/users/current-user/',
    'categories': '/categories/',
    'register': '/users/',
}

export const authApis = (token) => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json' // Thêm header nếu cần
            
           
        }
    })
}

export default axios.create({
    baseURL: BASE_URL
});