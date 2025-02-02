import { View, Text, Button } from "react-native";
import * as DocumentPicker from "expo-document-picker";

const TroLySV_NapDanhSachCSV = () => {
    const pickCSVFile = async () => {
        let result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
        if (result.canceled) return;
        alert(`Đã chọn file: ${result.name}`);
    };

    return (
        <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nạp danh sách điểm danh</Text>
            <Button title="Chọn file CSV" onPress={pickCSVFile} />
        </View>
    );
};

export default TroLySV_NapDanhSachCSV;
