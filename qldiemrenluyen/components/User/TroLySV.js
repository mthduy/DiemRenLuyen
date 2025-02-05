import { View, StyleSheet, Text } from "react-native";
import { Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

const TroLySV = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trang Chức Năng Trợ lý Sinh Viên</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("home", { screen: 'TroLySV_XemThanhTich' })}
        style={styles.button}
      >
        Xem thành tích ngoại khoá
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("home", { screen: 'TroLySV_XemBaoThieu' })}
        style={styles.button}
      >
        Xem danh sách báo thiếu và xác nhận
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("home", { screen: 'TroLySV_TaoHoatDong' })}
        style={styles.button}
      >
        Tạo hoạt động mới
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("home", { screen: 'TroLySV_NapDanhSachCSV' })}
        style={styles.button}
      >
        Nạp danh sách điểm danh (CSV)
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("home", { screen: 'TroLySV_XemThongKe' })}
        style={styles.button}
      >
        Xem thống kê
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  button: {
    marginBottom: 15,
    width: '100%',
    borderRadius: 8,
    paddingVertical: 12,
    backgroundColor: '#4CAF50', // Màu nền cho các nút
  },
});

export default TroLySV;
