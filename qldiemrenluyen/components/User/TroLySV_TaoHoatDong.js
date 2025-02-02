import { View, Text, TextInput, Button } from "react-native";
import { useState } from "react";

const TroLySV_TaoHoatDong = () => {
    const [tenHoatDong, setTenHoatDong] = useState("");

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Tạo hoạt động mới</Text>

            <TextInput
                placeholder="Nhập tên hoạt động"
                value={tenHoatDong}
                onChangeText={setTenHoatDong}
                style={{ borderWidth: 1, padding: 10, marginVertical: 10 }}
            />

            <Button title="Tạo hoạt động" onPress={() => alert(`Hoạt động "${tenHoatDong}" đã được tạo!`)} />
        </View>
    );
};

export default TroLySV_TaoHoatDong;
