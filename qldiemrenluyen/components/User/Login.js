import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { View, Alert, ActivityIndicator } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { Picker } from "@react-native-picker/picker";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import MyStyles from "../../styles/MyStyles";
import { useEffect, useContext, useState } from "react";
import { MyDispatchContext } from "../../configs/MyUserContext";
import { CLIENT_ID, CLIENT_SECRET } from "@env";

const Login = () => {
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState(null); // Vai trò được chọn
    const dispatch = useContext(MyDispatchContext);
    const nav = useNavigation();

    const users = {
        username: {
            title: "Tên đăng nhập",
            field: "username",
            icon: "text",
            secureTextEntry: false,
        },
        password: {
            title: "Mật khẩu",
            field: "password",
            icon: "eye",
            secureTextEntry: true,
        },
    };

    const change = (value, field) => {
        setUser({ ...user, [field]: value });
    };

    const validateInput = () => {
        if (!user.username || user.username.trim() === "") {
            Alert.alert("Lỗi", "Vui lòng nhập tên đăng nhập!");
            return false;
        }
        if (!user.password || user.password.trim() === "") {
            Alert.alert("Lỗi", "Vui lòng nhập mật khẩu!");
            return false;
        }
        if (!role) {
            Alert.alert("Lỗi", "Vui lòng chọn vai trò!");
            return false;
        }
        return true;
    };
    
    

    const checkLogin = async () => {
        const token = await AsyncStorage.getItem("token");
        console.log("Token hiện tại:", token);
        const savedRole = await AsyncStorage.getItem("role");
    
        if (!token || !savedRole) {
            console.log("Không tìm thấy token hoặc vai trò trong AsyncStorage, yêu cầu người dùng đăng nhập.");
            return nav.navigate("Login"); // Điều hướng đến màn hình đăng nhập
        }
    
        console.log("Token và vai trò đã lưu:", token, savedRole);
    
        // Lấy thông tin người dùng từ API
        setLoading(true);
        try {
            let currentUser = await authApis(token).get(endpoints["currentUser"]);
            console.log("Thông tin người dùng từ API:", currentUser.data);
    
            if (!currentUser.data || !currentUser.data.role) {
                console.error("Không có vai trò trong dữ liệu người dùng từ API");
                return;
            }
    
            const apiRole = currentUser.data.role;  // Vai trò của API
            console.log("Vai trò của API:", apiRole);
            console.log("Vai trò đã lưu:", savedRole);
    
            // Kiểm tra vai trò từ API và vai trò đã lưu
            if (apiRole === savedRole) {
                dispatch({
                    type: "LOGIN",
                    payload: currentUser.data,
                });
    
                // Điều hướng theo vai trò
                switch (apiRole) {
                    case "student":
                        nav.navigate("SinhVien");
                        break;
                    case "admin":
                        nav.navigate("CTSV");
                        break;
                    case "staff":
                        nav.navigate("TroLySV");
                        break;
                    default:
                        nav.navigate("home");
                }
            } else {
                Alert.alert("Lỗi", "Vai trò không khớp. Vui lòng đăng nhập lại!");
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("role");
            }
        } catch (error) {
            console.error("Lỗi kiểm tra đăng nhập:", error);
            Alert.alert("Lỗi", "Đăng nhập không thành công. Vui lòng thử lại sau!");
        } finally {
            setLoading(false);
        }
    };
    
    
    
    
    

    useEffect(() => {
        checkLogin();
    }, []);

    const login = async () => {
        if (!validateInput()) return;
    
        setLoading(true);
        try {
            let res = await APIs.post(endpoints["login"], {
                ...user,
                grant_type: "password",
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                role: role,
            });
    
            console.info("Dữ liệu trả về từ API:", res.data);
    
            if (!res.data.access_token) {
                Alert.alert("Lỗi", "Không nhận được token từ server!");
                return;
            }
    
            // Lưu token và vai trò vào AsyncStorage
            await AsyncStorage.setItem("token", res.data.access_token);
            await AsyncStorage.setItem("role", role);  // Lưu vai trò vào AsyncStorage
    
            // Gửi yêu cầu để lấy thông tin người dùng từ API với token
            let currentUser = await authApis(res.data.access_token).get(endpoints["currentUser"]);
            console.info("Thông tin người dùng từ API:", currentUser.data);
    
            if (!currentUser.data || !currentUser.data.role) {
                console.error("Không có vai trò trong dữ liệu người dùng từ API");
                return;
            }
    
            const apiRole = currentUser.data.role;  // Vai trò của API
            console.log("Vai trò của API:", apiRole);
            console.log("Vai trò được chọn:", role);
    
            // Kiểm tra vai trò của người dùng
            if (apiRole !== role) {
                Alert.alert(
                    "Lỗi",
                    `Vai trò không khớp: Vai trò từ API là ${apiRole}, nhưng vai trò bạn chọn là ${role}.`
                );
                return;
            }
    
            // Đăng nhập thành công và chuyển hướng
            dispatch({
                type: "LOGIN",
                payload: currentUser.data,
            });
    
            // Điều hướng theo vai trò
            switch (apiRole) {
                case "student":
                    nav.navigate("SinhVien");
                    break;
                case "admin":
                    nav.navigate("CTSV");
                    break;
                case "staff":
                    nav.navigate("TroLySV");
                    break;
                default:
                    nav.navigate("home");
            }
        } catch (ex) {
            console.error("Đăng nhập thất bại:", ex.response || ex.message);
            Alert.alert("Lỗi", "Đăng nhập không thành công. Vui lòng thử lại sau!");
        } finally {
            setLoading(false);
        }
    };
    
    
    return (
        <View>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <>
                    {Object.values(users).map((u) => (
                        <TextInput
                            secureTextEntry={u.secureTextEntry}
                            key={u.field}
                            value={user[u.field]}
                            onChangeText={(t) => change(t, u.field)}
                            style={MyStyles.margin}
                            placeholder={u.title}
                            right={<TextInput.Icon icon={u.icon} />}
                        />
                    ))}
                    <Picker
                        selectedValue={role}
                        onValueChange={(itemValue) => setRole(itemValue)}
                        style={{
                            marginVertical: 10,
                            borderWidth: 1,
                            borderColor: "#ccc",
                            padding: 10,
                        }}
                    >
                        <Picker.Item label="Chọn vai trò" value={null} />
                        <Picker.Item label="Sinh viên" value="student" />
                        <Picker.Item label="Chuyên viên CTSV" value="admin" />
                        <Picker.Item label="Trợ lý sinh viên" value="staff" />
                    </Picker>
                    <Button loading={loading} onPress={login} mode="contained">
                        ĐĂNG NHẬP
                    </Button>
                </>
            )}
        </View>
    );
};

export default Login;
