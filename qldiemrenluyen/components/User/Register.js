import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Text, Touchable, TouchableOpacity, View } from "react-native"
import { Button, TextInput, HelperText } from "react-native-paper";
import MyStyles from "../../styles/MyStyles"
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Register = () => {
    const [user, setUser] = useState({});
    const [selectedDepartment, setSelectedDepartment] = useState(""); // Trường lưu khoa
    

    const users = {
        "first_name": {
            "title": "Tên",
            "field": "first_name",
            "icon": "text",
            "secureTextEntry": false
        },
        "last_name": {
            "title": "Họ và tên lót",
            "field": "last_name",
            "icon": "text",
            "secureTextEntry": false
        },
        "username": {
            "title": "Tên đăng nhập",
            "field": "username",
            "icon": "text",
            "secureTextEntry": false
        },
        "email": {  
            "title": "Email Address",
            "field": "email",
            "icon": "email",
            "secureTextEntry": false
        },"password": {
            "title": "Mật khẩu",
            "field": "password",
            "icon": "eye",
            "secureTextEntry": true
        }, "confirm": {
            "title": "Xác nhận mật khẩu",
            "field": "confirm",
            "icon": "eye",
            "secureTextEntry": true
        }
    }
    const nav = useNavigation();
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);

    const change = (value, field) => {
        setUser({...user, [field]: value});
    }

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (status !== 'granted') {
            alert("Permissions denied!");
        } else {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images, // Giới hạn chỉ chọn ảnh
                quality: 1, // Chất lượng cao nhất
            });
    
            if (!result.canceled) {
                change(result.assets[0], 'avatar');
            }
        }
    };
    
    // Kiểm tra định dạng email
    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@ou\.edu\.vn$/;
        return regex.test(email);
    };

    const register = async () => {
        if (!validateEmail(user.email)) {  // Kiểm tra email
            alert("Email phải có đúng dạng do trường cung cấp");
            return;
        }
        if (!user.email || !user.username || !user.password || !user.first_name || !user.last_name || !selectedDepartment) {  // Kiểm tra các trường
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (user.password !== user.confirm) {
            setErr(true);
        } else {
            setErr(false);
            let form = new FormData();
    
            // Lặp qua các trường thông tin và thêm vào formData
            for (let key in user) {
                if (key !== 'confirm') {
                    if (key === 'avatar') {
                        if (user.avatar) {
                            form.append('avatar', {
                                uri: user.avatar.uri,
                                name: user.avatar.fileName || "avatar.jpg", 
                                type: user.avatar.type || "image/jpeg",
                            });
                        }
                    } else {
                        form.append(key, user[key]);
                    }
                }
            }
            form.append('email', user.email);  // Đảm bảo email được thêm vào form
            // Thêm khoa vào form
            form.append('department', selectedDepartment);
    
            console.info(form);
            
            setLoading(true);
            try {
                let res = await APIs.post(endpoints['register'], form, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                console.info(res.data);
                alert("Đăng ký thành công!");
                nav.navigate("login");
            } catch (ex) {
                console.error(ex);
                alert(`Đăng ký thất bại. Vui lòng thử lại. Lỗi: ${ex.message}`);
            } finally {
                setLoading(false);
            }
        }
    };
    
    return (
        <View style={MyStyles.container}>
            <KeyboardAvoidingView  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

                <HelperText type="error" visible={err}>
                Mật khẩu KHÔNG khớp
                </HelperText>
            
                {Object.values(users).map(u => <TextInput secureTextEntry={u.secureTextEntry} key={u.field} value={user[u.field]} onChangeText={t => change(t, u.field)} 
                style={MyStyles.margin} placeholder={u.title} right={<TextInput.Icon icon={u.icon} />} />)}
                
                 {/* Dropdown cho khoa */}
                 <Picker
                    selectedValue={selectedDepartment}
                    onValueChange={(itemValue) => setSelectedDepartment(itemValue)}
                    style={{ margin: 10 }}
                >
                    <Picker.Item label="Chọn khoa" value="" />
                    <Picker.Item label="Khoa Công Nghệ Thông Tin" value="IT" />
                    <Picker.Item label="Khoa Kinh Tế" value="Economics" />
                    <Picker.Item label="Khoa Xây Dựng" value="Construction" />
                    {/* Thêm các khoa khác nếu cần */}
                </Picker>

                <TouchableOpacity onPress={pickImage}>
                    <Text style={MyStyles.margin}>Chọn ảnh đại diện...</Text>
                </TouchableOpacity>

                {user.avatar ? <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100 }} /> : ""}

                <Button loading={loading} mode="contained" onPress={register}>ĐĂNG KÝ</Button>
            </KeyboardAvoidingView>
        </View>
    );
}

export default Register;