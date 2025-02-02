// import React, { useState, useEffect } from 'react';
// import { View, Text, Button, Picker, Alert, ActivityIndicator } from 'react-native';
// import { APIs } from '../../configs/APIs';  // Đảm bảo bạn có đúng API config
// import { writeFile, DocumentDirectoryPath } from 'react-native-fs';
// import { Parser } from 'json2csv';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';

// const CTSV_report = () => {
//   const [statistics, setStatistics] = useState([]);
//   const [department, setDepartment] = useState("");
//   const [classGroup, setClassGroup] = useState("");
//   const [achievement, setAchievement] = useState("");
//   const [loading, setLoading] = useState(false);

//   // Fetch statistics when filters change
//   useEffect(() => {
//     getStatistics();
//   }, [department, classGroup, achievement]);

//   const getStatistics = async () => {
//     setLoading(true);
//     try {
//       const response = await APIs.get('/api/statistics', {
//         params: {
//           department,
//           classGroup,
//           achievement,
//         }
//       });
//       setStatistics(response.data);
//     } catch (error) {
//       console.error("Error fetching statistics:", error);
//       Alert.alert("Lỗi", "Không thể lấy dữ liệu thống kê.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Export data to CSV
//   const exportToCSV = () => {
//     try {
//       const csv = new Parser().parse(statistics);
//       writeFile(DocumentDirectoryPath + '/statistics.csv', csv, 'utf8')
//         .then(() => Alert.alert('Đã xuất báo cáo thành công!'))
//         .catch((err) => console.error('Lỗi khi xuất CSV:', err));
//     } catch (error) {
//       console.error("Lỗi khi xuất CSV:", error);
//     }
//   };

//   // Export data to PDF
//   const exportToPDF = async () => {
//     const options = {
//       html: `<h1>Thống kê điểm rèn luyện</h1><p>${JSON.stringify(statistics)}</p>`,
//       fileName: 'statistics_report',
//       directory: 'Documents',
//     };

//     try {
//       const file = await RNHTMLtoPDF.convert(options);
//       Alert.alert('Đã xuất PDF thành công!', file.filePath);
//     } catch (error) {
//       console.error("Lỗi khi xuất PDF:", error);
//     }
//   };

//   return (
//     <View style={{ padding: 20 }}>
//       <Text>Thống kê điểm rèn luyện</Text>

//       {/* Chọn khoa */}
//       <Picker selectedValue={department} onValueChange={(value) => setDepartment(value)}>
//         <Picker.Item label="Khoa Công Nghệ Thông Tin" value="IT" />
//         <Picker.Item label="Khoa Kinh Tế" value="Economics" />
//         <Picker.Item label="Khoa Xây Dựng" value="Construction" />
//       </Picker>

//       {/* Chọn lớp */}
//       <Picker selectedValue={classGroup} onValueChange={(value) => setClassGroup(value)}>
//         <Picker.Item label="Lớp 1" value="Class1" />
//         <Picker.Item label="Lớp 2" value="Class2" />
//       </Picker>

//       {/* Chọn thành tích */}
//       <Picker selectedValue={achievement} onValueChange={(value) => setAchievement(value)}>
//         <Picker.Item label="Thành tích 1" value="Achievement1" />
//         <Picker.Item label="Thành tích 2" value="Achievement2" />
//       </Picker>

//       {/* Hiển thị thống kê */}
//       {loading ? (
//         <ActivityIndicator size="large" color="#0000ff" />
//       ) : (
//         <View>
//           <Text>Danh sách thống kê:</Text>
//           {statistics.map((item, index) => (
//             <Text key={index}>{JSON.stringify(item)}</Text>
//           ))}
//         </View>
//       )}

//       {/* Nút xuất PDF */}
//       <Button title="Xuất ra PDF" onPress={exportToPDF} disabled={loading || statistics.length === 0} />
      
//       {/* Nút xuất CSV */}
//       <Button title="Xuất ra CSV" onPress={exportToCSV} disabled={loading || statistics.length === 0} />
//     </View>
//   );
// };

// export default CTSV_report;

import { View } from "react-native";
import { Text } from "react-native-paper";

const CTSV_report = () => {
    return (
        <View>
            <Text>Trang dành CTSV thống kê</Text>
        </View>
    );
};

export default CTSV_report;

