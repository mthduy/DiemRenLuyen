import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const API_URL = 'https://dinhtien.pythonanywhere.com/';

const TroLySV_XemThongKe = ({ navigation }) => {
    const [stats, setStats] = useState([]);
    const [classification, setClassification] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [classes, setClasses] = useState([]);
    const [token, setToken] = useState(null);

    const fetchUserRole = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setToken(token);
            } else {
                console.log("Token chưa có");
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await axios.get(`${API_URL}class/`);
            setClasses(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách lớp:", error);
        }
    };

    const fetchStats = async () => {
        if (!token) {
            console.log("Token chưa có");
            return;
        }

        try {
            const response = await axios.get(`${API_URL}stat/get/?class=${selectedClass}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStats(response.data.stats_by_class);
            setClassification(response.data.classification);
        } catch (error) {
            console.error("Lỗi khi lấy thống kê:", error);
        }
    };

    const downloadCSV = async () => {
        if (!token) {
            console.log("Token chưa có");
            return;
        }

        try {
            const response = await axios.get(`${API_URL}csv/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'user_scores.csv');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Lỗi khi tải báo cáo CSV:", error);
        }
    };

    const downloadPDF = async () => {
        if (!token) {
            console.log("Token chưa có");
            return;
        }

        try {
            const response = await axios.get(`${API_URL}pdf/download`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'user_scores.pdf');
            document.body.appendChild(link);
            link.click();
        } catch (error) {
            console.error("Lỗi khi tải báo cáo PDF:", error);
        }
    };

    useEffect(() => {
        fetchUserRole();
    }, []);

    useEffect(() => {
        if (token) {
            fetchClasses();
        }
    }, [token]);

    useEffect(() => {
        fetchStats();
    }, [selectedClass, selectedDepartment, token]);

    return (
      <View style={styles.container}>
      <Text style={styles.title}>Thống kê điểm rèn luyện</Text>
  
      {/* Chọn lớp */}
      <Picker
    selectedValue={selectedClass}
    style={styles.picker}
    onValueChange={(itemValue) => setSelectedClass(itemValue)}
>
    <Picker.Item label="Tất cả các lớp" value="" style={styles.pickerItem} />
    {classes.map((classItem) => (
        <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} style={styles.pickerItem} />
    ))}
</Picker>
  
      <Text style={styles.sectionTitle}>Thống kê theo lớp</Text>
      {/* Tiêu đề cho các cột thống kê */}
      <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Lớp</Text>
          <Text style={styles.headerCell}>Tổng điểm</Text>
          <Text style={styles.headerCell}>Số sinh viên</Text>
          <Text style={styles.headerCell}>Điểm trung bình</Text>
      </View>
      <FlatList
          data={stats}
          renderItem={({ item }) => (
              <View style={styles.statRow}>
                  <Text>{item.student_class__name}</Text>
                  <Text>{item.total_score}</Text>
                  <Text>{item.student_count}</Text>
                  <Text>{item.avg_score}</Text>
              </View>
          )}
          keyExtractor={(item, index) => index.toString()}
      />
  
      <Text style={styles.sectionTitle}>Phân loại sinh viên</Text>
      {/* Tiêu đề cho các cột phân loại */}
      <View style={styles.headerRow}>
          <Text style={styles.headerCell}>Lớp</Text>
          <Text style={styles.headerCell}>Xuất sắc</Text>
          <Text style={styles.headerCell}>Giỏi</Text>
          <Text style={styles.headerCell}>Khá</Text>
          <Text style={styles.headerCell}>Trung bình</Text>
      </View>
      <FlatList
          data={classification}
          renderItem={({ item }) => (
              <View style={styles.statRow}>
                  <Text>{item.student_class__name}</Text>
                  <Text>{item.excellent}</Text>
                  <Text>{item.good}</Text>
                  <Text>{item.average}</Text>
                  <Text>{item.poor}</Text>
              </View>
          )}
          keyExtractor={(item, index) => index.toString()}
      />
  
      {/* Xuất báo cáo */}
      <View style={styles.buttonContainer}>
          <Button title="Tải về CSV" onPress={downloadCSV} />
          <Button title="Tải về PDF" onPress={downloadPDF} />
      </View>
  </View>
  
    );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 10,
  },
  title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
  },
  sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginVertical: 10,
  },
  headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 5,
      backgroundColor: '#f0f0f0',
      paddingVertical: 5,
  },
  headerCell: {
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
  },
  statRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 5,
      borderBottomWidth: 1,
      borderBottomColor: '#ddd',
  },
  buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      marginTop: 20,
  },
  picker: {
    height: 60, // Tăng chiều cao để dễ nhìn hơn
    width: '100%',
    marginBottom: 10,
},
pickerItem: {
    fontSize: 18,  // Tăng kích thước chữ
    paddingVertical: 10, // Đảm bảo các mục không bị chồng chéo
},
});

export default TroLySV_XemThongKe;
