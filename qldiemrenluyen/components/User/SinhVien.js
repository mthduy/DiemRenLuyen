import { View } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const SinhVien = () => {
    const navigation = useNavigation(); 

    return (
        <View style={{ padding: 20 }}>
            <Button
                mode="contained"
                onPress={() => navigation.navigate("home")}
                style={{ marginBottom: 10 }}
            >
                Đăng ký hoạt động
            </Button>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("home", { screen: 'SinhVien_XemHĐ'})}
            >
                Xem hoạt động đã tham gia
            </Button>
        </View>
    );
};

export default SinhVien;
