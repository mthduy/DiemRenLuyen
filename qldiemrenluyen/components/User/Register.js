import { useState, useEffect } from "react";
import { Image, KeyboardAvoidingView, Platform, Text, TouchableOpacity, View } from "react-native";
import { Button, TextInput, HelperText } from "react-native-paper";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';
import APIs, { endpoints } from "../../configs/APIs";
import { useNavigation } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

const Register = () => {
  const [user, setUser] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState(""); // Trường lưu khoa
  const [selectedClass, setSelectedClass] = useState(""); // Trường lưu lớp
  const [departments, setDepartments] = useState([]); // Lưu danh sách khoa lấy từ API
  const [classes, setClasses] = useState([]); // Lưu danh sách lớp lấy từ API

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
    },
    "password": {
      "title": "Mật khẩu",
      "field": "password",
      "icon": "eye",
      "secureTextEntry": true
    },
    "confirm": {
      "title": "Xác nhận mật khẩu",
      "field": "confirm",
      "icon": "eye",
      "secureTextEntry": true
    }
  };

  const nav = useNavigation();
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(false);

  const change = (value, field) => {
    setUser({ ...user, [field]: value });
  };

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert("Quyền truy cập bị từ chối!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // Giới hạn chỉ chọn ảnh
        quality: 1, // Chất lượng cao nhất
      });
      if (!result.canceled) {
        change(result.assets[0], 'image');
      }
    }
  };

  // Kiểm tra định dạng email theo yêu cầu (chỉ cho phép @ou.edu.vn)
  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._%+-]+@ou\.edu\.vn$/;
    return regex.test(email);
  };

  // Lấy danh sách khoa và lớp từ API khi component được mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        let res = await APIs.get(endpoints['department_list_departments']);
        setDepartments(res.data);
      } catch (error) {
        console.log("Lỗi lấy danh sách khoa:", error);
      }
    };

    const fetchClasses = async () => {
      try {
        let res = await APIs.get(endpoints['class']);
        setClasses(res.data);
      } catch (error) {
        console.log("Lỗi lấy danh sách lớp:", error);
      }
    };

    fetchDepartments();
    fetchClasses();
  }, []);

  const register = async () => {
    if (!validateEmail(user.email)) { // Kiểm tra email
      alert("Email phải có đúng dạng do trường cung cấp (@ou.edu.vn)");
      return;
    }
    // Kiểm tra các trường bắt buộc
    if (!user.email || !user.username || !user.password || !user.first_name || !user.last_name || !selectedDepartment || !selectedClass) {
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
          if (key === 'image' && user.image) {
            let localUri = user.image.uri;
            let filename = localUri.split('/').pop();
            let match = /\.(\w+)$/.exec(filename);
            let type = match ? `image/${match[1]}` : `image`;

            form.append('image', {
              uri: localUri,
              name: filename,
              type: type
            });
          } else {
            form.append(key, user[key]);
          }
        }
      }
      // Đảm bảo email được thêm vào form
      form.append('email', user.email);
      // Thêm thông tin khoa và lớp vào form
      form.append('department', selectedDepartment);
      form.append('class', selectedClass);

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
        console.info(ex);
        alert(`Đăng ký thất bại. Vui lòng thử lại. Lỗi: ${ex.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <View style={MyStyles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <HelperText type="error" visible={err}>
          Mật khẩu KHÔNG khớp
        </HelperText>
        {Object.values(users).map(u => (
          <TextInput
            secureTextEntry={u.secureTextEntry}
            key={u.field}
            value={user[u.field]}
            onChangeText={t => change(t, u.field)}
            style={MyStyles.margin}
            placeholder={u.title}
            right={<TextInput.Icon icon={u.icon} />}
          />
        ))}

        {/* Picker chọn khoa */}
        <Picker
          selectedValue={selectedDepartment}
          onValueChange={(itemValue) => {
            setSelectedDepartment(itemValue);
            // Reset lớp khi khoa thay đổi
            setSelectedClass("");
          }}
          style={{ margin: 10 }}
        >
          <Picker.Item label="Chọn khoa" value="" />
          {departments.map(dep => (
            <Picker.Item key={dep.id} label={dep.name} value={dep.id} />
          ))}
        </Picker>

        {/* Picker chọn lớp */}
        <Picker
          selectedValue={selectedClass}
          onValueChange={(itemValue) => setSelectedClass(itemValue)}
          style={{ margin: 10 }}
        >
          <Picker.Item label="Chọn lớp" value="" />
          {classes
            // Nếu muốn lọc lớp theo khoa đã chọn, uncomment đoạn code dưới
            .filter(cls => String(cls.department) === String(selectedDepartment))
            .map(cls => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))
          }
        </Picker>

        <TouchableOpacity onPress={pickImage}>
          <Text style={MyStyles.margin}>Chọn ảnh đại diện...</Text>
        </TouchableOpacity>

        {user.image ? (
          <Image source={{ uri: user.image.uri }} style={{ width: 100, height: 100 }} />
        ) : null}

        <Button loading={loading} mode="contained" onPress={register}>
          ĐĂNG KÝ
        </Button>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Register;
