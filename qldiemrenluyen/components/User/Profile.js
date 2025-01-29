
import { Image, View } from "react-native";
import { MyDispatchContext, MyUserContext } from "../../configs/MyUserContext";
import MyStyles from "../../styles/MyStyles";
import { useContext } from "react";
import { Button, Text } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserProfile = () => {
    const user = useContext(MyUserContext); 
    const dispatch = useContext(MyDispatchContext);

    const logout = async () => {
        await AsyncStorage.removeItem("token"); // Xóa token khỏi AsyncStorage
        dispatch({
            type: "LOGOUT", // Đảm bảo action type là 'LOGOUT'
        });
        nav.navigate("login"); // Điều hướng về màn hình đăng nhập
    };
    

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.subject}>Chào {user?.first_name} {user?.last_name}</Text>

{/* Hiển thị avatar nếu có */}
{user?.avatar ? (
    <Image
        source={{ uri: user.avatar }} // Nếu avatar là URL
        style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }} // Kích thước và bo tròn hình ảnh
    />
) : (
    <Text>Chưa có avatar</Text> // Nếu không có avatar
)}

<Text>Username: {user?.username}</Text>
<Text>Vai trò: {user?.role}</Text>
            <Button mode="contained-tonal" onPress={logout}>Đăng xuất</Button>
        </View>
    );
};

export default UserProfile;
