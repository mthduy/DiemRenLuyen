import axios from "axios";

const BASE_URL = 'https://dinhtien.pythonanywhere.com/';

export const endpoints = {
    'activities': '/activities/',
    'activities_create': '/activities/',
    'login': '/o/token/',
    'currentUser': '/users/current-user/',
    'users_list_students':'/users/students/',
    'categories': '/categories/',
    'register': '/users/',
    'create_staff': '/users/create-staff/',
    'newsfeeds':'/newsfeeds/', 
    'list':'/newsfeeds/list/',
    'registration': '/registration/',              // ✅ Đăng ký hoạt động
    'registration_list': '/registration/list/',   // ✅ Lấy danh sách đăng ký (giả sử đúng)
    'disciplined':'/disciplined/',
    'criteria':'/criteria/',
    'report_list': '/report/',                    // Lấy danh sách báo cáo
    'report_create': '/report/',                  // Tạo báo cáo mới
    'report_approve': '/report/{id}/approve/',    // Xác nhận báo cáo
    'report_reject': '/report/{id}/reject/',      // Từ chối báo cáo
    'class':'/class/',
    'department_list_departments':'/department/list/',
    'newsfeeds_comments_count':'/newsfeeds/{id}/comments-count/', 
    'newsfeeds_likes_count':'/newsfeeds/{id}/likes-count/',
    'registration_exprort_csv':'/registration/export-csv/',
    'participation_upload_csv': '/participation/upload-csv/'


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