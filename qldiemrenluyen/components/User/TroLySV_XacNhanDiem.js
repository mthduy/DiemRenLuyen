import { View, Text, Button } from "react-native";

const TroLySV_XacNhanDiem = () => {
    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Xác nhận điểm rèn luyện</Text>
            <Text>Danh sách sinh viên cần xác nhận điểm.</Text>

            <Button title="Xác nhận" onPress={() => alert("Xác nhận thành công")} />
            <Button title="Từ chối" onPress={() => alert("Từ chối điểm sinh viên")} />
        </View>
    );
};

export default TroLySV_XacNhanDiem;
