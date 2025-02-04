import { View, Text, TouchableOpacity, FlatList, RefreshControl, Modal, Image } from "react-native";
import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";
import * as ImagePicker from 'expo-image-picker';

const SinhVien_BaoThieu = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [selectedActivity, setSelectedActivities] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);

  const loadActivities = async () => {
    if (page > 0 && !loading) {
      setLoading(true);

      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let url = `${endpoints['activities']}?page=${page}`;
        console.log("API endpoint activities:", url);

        const res = await APIs.get(url, { headers });
        console.log("Dữ liệu từ API:", res.data);

        let reportedActivities = await AsyncStorage.getItem('reportedActivities');
        reportedActivities = reportedActivities ? JSON.parse(reportedActivities) : [];

        setActivities(prevActivities => page > 1 ? [...prevActivities, ...res.data.results] : res.data.results);

        setActivities(prevActivities =>
          prevActivities.map(activity => ({
            ...activity,
            is_reported: reportedActivities.includes(activity.id),
          }))
        );

        if (res.data.next) {
          setPage(prevPage => prevPage + 1);
        } else {
          setPage(0);
        }
      } catch (ex) {
        console.error(ex);
      } finally {
        setLoading(false);
      }
    } else {
      console.log("Không còn dữ liệu hoặc đã đạt đến trang cuối cùng.");
    }
  };

  useEffect(() => {
    loadActivities();
  }, [page]);

  const pickImage = async () => {
    let { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert("Bạn cần cấp quyền truy cập vào thư viện ảnh!");
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0]);
        console.log("Hình ảnh đã chọn:", result.assets[0]);
      }
    }
  };

  const handleReportMissing = async () => {
    if (!selectedActivity) return;
  
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      };
  
      const reportData = {
        activity_id: selectedActivity.id,
        status: "pending",
      };
  
      const formData = new FormData();
      formData.append('activity_id', selectedActivity.id);
      formData.append('status', "pending");
  
      if (selectedImage) {
        const localUri = selectedImage.uri;
        const filename = localUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
  
        // Đảm bảo hình ảnh được thêm vào dưới dạng đúng đối tượng với các thuộc tính như uri, name, type
        formData.append('image', {
          uri: localUri,
          name: filename,
          type: type,
        });
      }
  
      console.log("Form Data:", formData);  // Kiểm tra lại dữ liệu
  
      const response = await APIs.post(endpoints.report_create, formData, { headers });
      alert("Đã báo thiếu thành công!");
  
      let reportedActivities = await AsyncStorage.getItem('reportedActivities');
      reportedActivities = reportedActivities ? JSON.parse(reportedActivities) : [];
      reportedActivities.push(selectedActivity.id);
      await AsyncStorage.setItem('reportedActivities', JSON.stringify(reportedActivities));
  
      setActivities(prevActivities =>
        prevActivities.map(activity =>
          activity.id === selectedActivity.id
            ? { ...activity, is_reported: true }
            : activity
        )
      );
  
      setReportModal(false);
    } catch (error) {
      console.error("Lỗi khi báo thiếu:", error.response?.data || error.message);
      alert(`Có lỗi xảy ra: ${error.response?.data?.message || error.message}`);
    }
  };
  
  
  const refresh = () => {
    loadActivities();
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator animating={true} />
      ) : (
        <FlatList
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
          data={activities}
          renderItem={({ item }) => (
            <View style={styles.activityContainer}>
              <Text style={styles.activityTitle}>
                {item.title} (Điểm: {item.max_score})
              </Text>
              <Text style={styles.activityDescription}>
                {item.description.replace(/<\/?p>/g, '')}
              </Text>
              <Text style={styles.activityDates}>{`Ngày bắt đầu: ${item.start_date}`}</Text>
              <Text style={styles.activityDates}>{`Ngày kết thúc: ${item.end_date}`}</Text>
              <Image source={{ uri: item.image }} style={styles.activityImage} />
              <TouchableOpacity
                style={styles.registerButton}
                onPress={() => {
                  setSelectedActivities(item);
                  setReportModal(true);
                }}
                disabled={item.is_reported}
              >
                <Text style={styles.registerButtonText}>
                  {item.is_reported ? "Đã Báo Thiếu" : "Báo Thiếu"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item) => `${item.id}`}
        />
      )}

      <Modal visible={reportModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Báo thiếu cho hoạt động: {selectedActivity?.title}</Text>
            <Text style={styles.modalDescription}>{selectedActivity?.description.replace(/<\/?p>/g, '')}</Text>
            <Text style={styles.modalDates}>{`Ngày bắt đầu: ${selectedActivity?.start_date}`}</Text>
            <Text style={styles.modalDates}>{`Ngày kết thúc: ${selectedActivity?.end_date}`}</Text>

            <TouchableOpacity onPress={pickImage} style={styles.commentButton}>
              <Text style={{ color: 'white', fontSize: 16 }}>Chọn Hình Ảnh</Text>
            </TouchableOpacity>

            {selectedImage && (
              <Image source={{ uri: selectedImage.uri }} style={{ width: 100, height: 100, marginVertical: 10 }} />
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleReportMissing} style={styles.commentButton}>
                <Text style={{ color: 'white', fontSize: 16 }}>Gửi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setReportModal(false)} style={styles.cancelButton}>
                <Text style={{ color: 'white' }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff', // Thêm màu nền trắng để dễ phân biệt
  },
  activityContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f8f8',  // Màu nền cho mỗi hoạt động
    borderRadius: 8,  // Bo góc cho mỗi hoạt động
    borderWidth: 1,
    borderColor: '#ddd',
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  activityDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  activityDates: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  activityImage: {
    width: '100%',
    height: 200,
    marginBottom: 10,
    borderRadius: 8,  // Bo góc cho hình ảnh
  },
  registerButton: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',  // Làm mờ nền khi mở modal
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  modalDates: {
    fontSize: 12,
    color: '#888',
    marginBottom: 5,
  },
  commentButton: {
    backgroundColor: '#28a745',  // Green for 'Gửi' (Send)
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,  // Slightly more rounded corners for a smoother look
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,  // Add a subtle shadow to make it pop
  },

  cancelButton: {
    backgroundColor: '#dc3545',  // Red for 'Hủy' (Cancel)
    paddingVertical: 14,
    paddingHorizontal: 25,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    elevation: 2,  // Add shadow for better emphasis
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,  // Add padding for better spacing between buttons
  },

  commentButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',  // Make the text slightly bolder for better readability
  },

  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default SinhVien_BaoThieu;

