import React, { useState, useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
import { FileSystem } from "expo-file-system"; // For handling file system
import * as Sharing from "expo-sharing"; // For sharing the file
import APIs, { endpoints, BASE_URL } from "../../configs/APIs"; // Điều chỉnh đường dẫn đúng với dự án của bạn
import AsyncStorage from "@react-native-async-storage/async-storage";

const TroLySV_NapDanhSachCSV = () => {
  const [activityId, setActivityId] = useState(""); // Lưu activity_id
  const [activities, setActivities] = useState([]); // Lưu danh sách hoạt động
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false); // Quản lý trạng thái loading
  const [page, setPage] = useState(1); // Quản lý trang

  // Lấy danh sách hoạt động từ API
  const loadActivities = async () => {
    if (loading) return; // Nếu đang tải, không làm gì thêm
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      let url = `${endpoints['activities']}?page=${page}`;
      console.log("API endpoint activities:", endpoints['activities']);
      console.log("Final URL:", url);

      const res = await APIs.get(url, { headers });

      console.log("Dữ liệu từ API:", res.data);

      // Cập nhật danh sách activities
      setActivities(prevActivities => page > 1 ? [...prevActivities, ...res.data.results] : res.data.results);

      // Kiểm tra nếu có trang tiếp theo (next)
      if (res.data.next) {
        setPage(prevPage => prevPage + 1);  // Tiến đến trang tiếp theo
      } else {
        setPage(0);  // Không còn dữ liệu, dừng lại và không tải tiếp
      }

    } catch (ex) {
      console.error(ex);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (page === 0) return; // Dừng nếu không còn dữ liệu
    loadActivities();
  }, [page]); // Chạy lại khi page thay đổi

  // Gọi API GET /registration/export-csv/


const downloadCSV = async () => {
  try {
    // Kiểm tra xem FileSystem có sẵn không
    if (!FileSystem.cacheDirectory) {
      throw new Error("FileSystem không khả dụng");
    }

    const url = `https://dinhtien.pythonanywhere.com/registration/export-csv/?activity_id=${activityId}`;
    console.log(url); // Kiểm tra URL trong console

    const response = await axios.get(url, { responseType: 'blob' });

    console.log('Response:', response.data);

    if (response.data) {
      const fileUri = `${FileSystem.cacheDirectory}activity.csv`;

      await FileSystem.writeAsStringAsync(fileUri, response.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Tải file thành công', `File đã được lưu tại: ${fileUri}`);
      }
    } else {
      Alert.alert("Lỗi", "Không có dữ liệu hoặc lỗi từ server.");
    }
  } catch (error) {
    console.error("Lỗi tải CSV:", error);
    Alert.alert("Lỗi", "Không thể tải file CSV");
  }
};

  

  

  // Chọn file CSV từ máy của người dùng
  const pickCSVFile = async () => {
    let result = await DocumentPicker.getDocumentAsync({ type: "text/csv" });
    if (result.canceled) return;
    setCsvFile(result); // Lưu file được chọn vào state
    alert(`Đã chọn file: ${result.name}`);
  };

  // Upload file CSV lên API POST /participation/upload-csv/
  const uploadCSVFile = async () => {
    if (!csvFile) {
      Alert.alert("Lỗi", "Vui lòng chọn file CSV trước khi tải lên.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: csvFile.uri,
      name: csvFile.name,
      type: "text/csv",
    });

    try {
      const response = await axios.post(endpoints.participation_upload_csv, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (response.status === 200) {
        alert("Đã tải lên file CSV thành công!");
      } else {
        Alert.alert("Lỗi", "Không thể tải lên file CSV.");
      }
    } catch (error) {
      console.error("Lỗi khi tải lên file CSV:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi tải lên file.");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>Nạp danh sách điểm danh</Text>

      {/* Dropdown để chọn hoạt động */}
      <Text style={{ marginVertical: 10 }}>Chọn hoạt động</Text>
      <Picker
        selectedValue={activityId}
        onValueChange={(itemValue) => setActivityId(itemValue)}
        style={{
          height: 50,
          borderColor: "gray",
          borderWidth: 1,
          marginBottom: 20,
        }}
      >
        <Picker.Item label="Chọn hoạt động" value="" />
        {activities.map((activity) => (
          <Picker.Item key={activity.id} label={activity.title} value={activity.id} />
        ))}
      </Picker>

      {/* Nút tải CSV mẫu */}
      <Button title="Tải file CSV mẫu" onPress={downloadCSV} />
      <View style={{ marginVertical: 20 }} />

      {/* Chọn file CSV */}
      <Button title="Chọn file CSV" onPress={pickCSVFile} />
      {csvFile && (
        <View style={{ marginVertical: 10 }}>
          <Text>Đã chọn: {csvFile.name}</Text>
        </View>
      )}

      {/* Tải lên file CSV */}
      <Button title="Tải lên file CSV" onPress={uploadCSVFile} />
    </View>
  );
};

export default TroLySV_NapDanhSachCSV;
