import { View } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const TroLySV = () => {
    const navigation = useNavigation();

    return (
        <View style={{ padding: 20 }}>
            <Button mode="contained" onPress={() => navigation.navigate("home", {screen:'TroLySV_XemThanhTich'})} style={{ marginBottom: 10 }}>
                Xem thành tích ngoại khoá
            </Button>

            <Button mode="contained" onPress={() => navigation.navigate("home",{screen:'TroLySV_XemBaoThieu'})} style={{ marginBottom: 10 }}>
                Xem danh sách báo thiếu
            </Button>

            <Button mode="contained" onPress={() => navigation.navigate("home",{screen:'TroLySV_XacNhanDiem'})} style={{ marginBottom: 10 }}>
                Xác nhận hoặc từ chối điểm rèn luyện
            </Button>

            <Button mode="contained" onPress={() => navigation.navigate("home", {screen: 'TroLySV_TaoHoatDong'})} style={{ marginBottom: 10 }}>
                Tạo hoạt động mới
            </Button>

            <Button mode="contained" onPress={() => navigation.navigate("home",{screen:'TroLySV_NapDanhSachCSV'})} style={{ marginBottom: 10 }}>
                Nạp danh sách điểm danh (CSV)
            </Button>



            
        </View>
    );
};

export default TroLySV;
