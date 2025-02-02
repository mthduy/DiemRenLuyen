import React, { useState } from "react";
import { View, Text, TextInput, Button, Image, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CTSV_addaccount = () => {
    const [user, setUser] = useState({
        role: "staff",
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        password: "",
        confirm: "",
        avatar: null
    });

    const [selectedDepartment, setSelectedDepartment] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState(false);
    const nav = useNavigation();

    const change = (value, field) => {
        setUser({ ...user, [field]: value });
    };

    const pickImage = async () => {
        let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            alert("Permissions denied!");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.canceled) {
            change(result.assets[0], 'avatar');
        }
    };

    const getToken = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            if (!token) {
                console.warn("Không tìm thấy token trong AsyncStorage");
            }
            return token;
        } catch (error) {
            console.error("Lấy token thất bại:", error);
            return null;
        }
    };
    
    const handleAddAccount = async () => {
        if (!user.email || !user.username || !user.password || !user.first_name || !user.last_name || !selectedDepartment) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
        if (user.password !== user.confirm) {
            setErr(true);
            return;
        } else {
            setErr(false);
            let form = new FormData();
    
            for (let key in user) {
                if (key !== 'confirm') {
                    if (key === 'avatar' && user.avatar) {
                        form.append('avatar', {
                            uri: user.avatar.uri,
                            name: user.avatar.fileName || "avatar.jpg",
                            type: user.avatar.type || "image/jpeg",
                        });
                    } else {
                        form.append(key, user[key]);
                    }
                }
            }
            form.append('department', selectedDepartment);
    
            setLoading(true);
            try {
                let token = await getToken(); // Lấy access_token từ AsyncStorage
    
                if (!token) {
                    alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
                    return;
                }
    
                let res = await APIs.post(endpoints['create_staff'], form, {
                    headers: { 
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`  // Truyền token vào header
                    },
                });
                console.info(res.data);
                alert("Tạo tài khoản thành công!");
                nav.navigate("CTSV");
            } catch (ex) {
                console.error(ex);
                alert(`Tạo tài khoản thất bại. Lỗi: ${ex.response?.data?.detail || ex.message}`);
            } finally {
                setLoading(false);
            }
        }
    };
    

    return (
        <View style={MyStyles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <Text style={MyStyles.subject}>Thêm tài khoản trợ lý sinh viên</Text>

                <HelperText type="error" visible={err}>Mật khẩu KHÔNG khớp</HelperText>

                <TextInput placeholder="Tên" value={user.first_name} onChangeText={t => change(t, 'first_name')} style={MyStyles.margin} />
                <TextInput placeholder="Họ và tên lót" value={user.last_name} onChangeText={t => change(t, 'last_name')} style={MyStyles.margin} />
                <TextInput placeholder="Tên đăng nhập" value={user.username} onChangeText={t => change(t, 'username')} style={MyStyles.margin} />
                <TextInput placeholder="Email" value={user.email} onChangeText={t => change(t, 'email')} style={MyStyles.margin} />
                <TextInput placeholder="Mật khẩu" value={user.password} onChangeText={t => change(t, 'password')} secureTextEntry style={MyStyles.margin} />
                <TextInput placeholder="Xác nhận mật khẩu" value={user.confirm} onChangeText={t => change(t, 'confirm')} secureTextEntry style={MyStyles.margin} />

                {/* Chọn vai trò */}
                <View style={MyStyles.margin}>
                    <Text>Chọn vai trò:</Text>
                    <RadioButton.Group onValueChange={(value) => change(value, 'role')} value={user.role}>
                        <View style={MyStyles.row}>
                            <RadioButton.Item label="Trợ lý sinh viên" value="staff" />
                            
                        </View>
                    </RadioButton.Group>
                </View>

                {/* Chọn khoa */}
                <Picker selectedValue={selectedDepartment} onValueChange={setSelectedDepartment} style={{ margin: 10 }}>
                    <Picker.Item label="Chọn khoa" value="" />
                    <Picker.Item label="Khoa Công Nghệ Thông Tin" value="IT" />
                    <Picker.Item label="Khoa Kinh Tế" value="Economics" />
                    <Picker.Item label="Khoa Xây Dựng" value="Construction" />
                </Picker>

                {/* Chọn ảnh đại diện */}
                <TouchableOpacity onPress={pickImage}>
                    <Text style={MyStyles.margin}>Chọn ảnh đại diện...</Text>
                </TouchableOpacity>

                {user.avatar ? <Image source={{ uri: user.avatar.uri }} style={{ width: 100, height: 100 }} /> : null}
            </KeyboardAvoidingView>

            <Button onPress={handleAddAccount} title={loading ? "Đang xử lý..." : "Thêm tài khoản"} disabled={loading} />
        </View>
    );
};

export default CTSV_addaccount;
