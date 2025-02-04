import React, { useEffect, useState, useContext } from "react";
import { MyDispatchContext, MyUserContext } from "../../configs/MyUserContext";
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Button, Card, Text } from "react-native-paper";
import { Image, View } from "react-native";
import MyStyles from "../../styles/MyStyles";
import { useNavigation } from "@react-navigation/native";

const UserProfile = () => {
    const user = useContext(MyUserContext); // Lấy thông tin người dùng từ Context
    const dispatch = useContext(MyDispatchContext); // Để dispatch action cập nhật thông tin người dùng
    const [loading, setLoading] = useState(true); // Trạng thái loading khi fetch dữ liệu mới từ API
    const navigation = useNavigation();
    const fetchUserData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");
            const response = await axios.get("https://dinhtien.pythonanywhere.com/users/current-user/", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Giả sử response.data.results[0] chứa thông tin người dùng hiện tại
            const userData = response.data.results[0]; 
            
            // Cập nhật thông tin người dùng từ API vào context
            dispatch({ type: "UPDATE_USER", payload: userData });
            setLoading(false);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) {
            fetchUserData(); // Chỉ fetch dữ liệu khi người dùng chưa có thông tin trong context
        } else {
            setLoading(false); // Nếu đã có dữ liệu trong context, không cần gọi API
        }
    }, [user, dispatch]);

    const logout = async () => {
        await AsyncStorage.removeItem("token");
        dispatch({ type: "LOGOUT" });
        nav.navigate("login");
    };

    if (loading) {
        return <Text>Đang tải...</Text>; // Hiển thị loading trong khi dữ liệu đang được tải
    }

    return (
        <View style={[MyStyles.container, { padding: 20, alignItems: "center", backgroundColor: "#f9f9f9", flex: 1 }]}> 
            <Card style={{ width: "90%", padding: 20, borderRadius: 16, elevation: 4 }}>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                    <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
                        Chào {user?.first_name} {user?.last_name}
                    </Text>

                    {user?.image ? (
                <Image
                    source={{ uri: user.image }} // Sử dụng trực tiếp user.image mà không cần truyền URL
                    style={{ width: 120, height: 120, borderRadius: 60 }}
                    onError={(e) => console.log('Image load error:', e.nativeEvent.error)} // Xử lý lỗi tải ảnh
                />
                ) : (
                <Text style={{ color: "#888", fontStyle: "italic" }}>Chưa có avatar</Text>
                )}

                </View>

                <View style={{ marginBottom: 10 }}>
                    <Text style={{ fontSize: 16 }}>Tên đăng nhập: <Text style={{ fontWeight: "bold" }}>{user?.username}</Text></Text>
                    <Text style={{ fontSize: 16 }}>Vai trò: <Text style={{ fontWeight: "bold" }}>{user?.role}</Text></Text>
                </View>
                <Button mode="contained" onPress={() => navigation.navigate("home", { screen: 'ChatScreen'})}>💬 Hỗ trợ sinh viên</Button>
                <Button mode="contained" onPress={logout} style={{ marginTop: 10, borderRadius: 20, backgroundColor: "#6200ee" }}>
                    Đăng xuất
                </Button>
            </Card>
        </View>
    );
};

export default UserProfile;
