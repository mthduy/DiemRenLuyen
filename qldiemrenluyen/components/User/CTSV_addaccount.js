import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  Image, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform, 
  Alert 
} from "react-native";
import { RadioButton, HelperText } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";

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

  // Hàm cập nhật state cho user
  const change = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  // Hàm chọn ảnh
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert("Permissions denied!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      // Cập nhật avatar với thông tin ảnh được chọn
      change(result.assets[0], 'avatar');
      console.log("Hình ảnh đã chọn:", result.assets[0]);
    }
  };

  // Hàm lấy token từ AsyncStorage
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

  // Hàm xử lý gửi dữ liệu tạo tài khoản
  const handleAddAccount = async () => {
    // Kiểm tra nhập đầy đủ thông tin
    if (!user.email || !user.username || !user.password || !user.first_name || !user.last_name ) {
      alert("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (user.password !== user.confirm) {
      setErr(true);
      return;
    } else {
      setErr(false);

      // Khởi tạo FormData và thêm dữ liệu
      let form = new FormData();
      for (let key in user) {
        if (key !== 'confirm') {
          if (key === 'avatar' && user.avatar) {
            // Xử lý ảnh giống TroLySV_TaoHoatDong: lấy uri, fileName và type
            const localUri = user.avatar.uri;
            const filename = user.avatar.fileName || localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            console.log("Hình ảnh URI:", localUri);
            console.log("Tên tệp:", filename);
            console.log("Loại tệp:", type);

            form.append('avatar', {
              uri: localUri,
              name: filename,
              type: type
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }
      

      setLoading(true);
      try {
        const token = await getToken();
        if (!token) {
          alert("Bạn chưa đăng nhập hoặc token đã hết hạn!");
          return;
        }

        // Gửi request tạo tài khoản
        const res = await APIs.post(endpoints['create_staff'], form, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
        });
        console.info("Kết quả tạo tài khoản:", res.data);
        alert("Tạo tài khoản thành công!");
        nav.navigate("CTSV");
      } catch (ex) {
        console.error("Lỗi tạo tài khoản:", ex.response?.data || ex.message);
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

        <TextInput 
          placeholder="Tên" 
          value={user.first_name} 
          onChangeText={t => change(t, 'first_name')} 
          style={MyStyles.margin} 
        />
        <TextInput 
          placeholder="Họ và tên lót" 
          value={user.last_name} 
          onChangeText={t => change(t, 'last_name')} 
          style={MyStyles.margin} 
        />
        <TextInput 
          placeholder="Tên đăng nhập" 
          value={user.username} 
          onChangeText={t => change(t, 'username')} 
          style={MyStyles.margin} 
        />
        <TextInput 
          placeholder="Email" 
          value={user.email} 
          onChangeText={t => change(t, 'email')} 
          style={MyStyles.margin} 
        />
        <TextInput 
          placeholder="Mật khẩu" 
          value={user.password} 
          onChangeText={t => change(t, 'password')} 
          secureTextEntry 
          style={MyStyles.margin} 
        />
        <TextInput 
          placeholder="Xác nhận mật khẩu" 
          value={user.confirm} 
          onChangeText={t => change(t, 'confirm')} 
          secureTextEntry 
          style={MyStyles.margin} 
        />

        {/* Chọn vai trò */}
        <View style={MyStyles.margin}>
          <Text>Chọn vai trò:</Text>
          <RadioButton.Group onValueChange={(value) => change(value, 'role')} value={user.role}>
            <View style={MyStyles.row}>
              <RadioButton.Item label="Trợ lý sinh viên" value="staff" />
            </View>
          </RadioButton.Group>
        </View>

        {/* Chọn ảnh đại diện */}
        <TouchableOpacity onPress={pickImage}>
          <Text style={MyStyles.margin}>Chọn ảnh đại diện...</Text>
        </TouchableOpacity>
        {user.avatar && (
          <Image 
            source={{ uri: user.avatar.uri }} 
            style={{ width: 100, height: 100, margin: 10 }} 
          />
        )}
      </KeyboardAvoidingView>

      <Button 
        onPress={handleAddAccount} 
        title={loading ? "Đang xử lý..." : "Thêm tài khoản"} 
        disabled={loading} 
      />
    </View>
  );
};

export default CTSV_addaccount;
