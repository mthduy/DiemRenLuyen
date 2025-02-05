import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const SinhVien = () => {
    const navigation = useNavigation(); 

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Quản lý Hoạt Động Sinh Viên</Text>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("BanTin")}
                style={styles.button}
            >
                Đăng ký hoạt động
            </Button>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("home", { screen: 'SinhVien_XemHD'})}
                style={styles.button}
            >
                Xem hoạt động đã tham gia
            </Button>

            <Button
                mode="contained"
                onPress={() => navigation.navigate("home", { screen: 'SinhVien_BaoThieu'})}
                style={styles.button}
            >
                Báo Thiếu
            </Button>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 20,
        paddingVertical: 40,
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#333',
    },
    button: {
        marginBottom: 15,
        width: '100%',
        borderRadius: 8,
        paddingVertical: 12,
        backgroundColor: '#007bff', // Màu nền của nút
    },
});

export default SinhVien;
