import axios from "axios";

const BASE_URL = 'https://dinhtien.pythonanywhere.com/';

export const endpoints = {
    'activities': '/activities/',
    'login': '/o/token/',
    'currentUser': '/users/current-user/',
    'categories': '/categories/',
    'register': '/users/',
    'create_staff': '/users/create-staff/',
    'newsfeeds':'/newsfeeds/', 
    'list':'/newsfeeds/list/',
    'registration': '/registration/',              // ✅ Đăng ký hoạt động
    'registration_list': '/registration/list/'     // ✅ Lấy danh sách đăng ký (giả sử đúng)
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