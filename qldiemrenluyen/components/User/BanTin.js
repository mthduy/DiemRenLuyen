import { View, Text, TouchableOpacity, FlatList, RefreshControl, Modal } from "react-native";
import { cloneElement, useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, List, Searchbar, TextInput } from "react-native-paper";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyStyles from "../../styles/MyStyles";

const BanTin = () => {
  const [newsfeeds, setNewsFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cateId, setCateId] = useState(null);
  const [page, setPage] = useState(1);
  const [commentModal, setCommentModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [q, setQ] = useState("");
  const [registeredActivities, setRegisteredActivities] = useState({});


  // Hàm tải dữ liệu newsfeeds
  const loadNewsfeeds = async () => {
    if (page > 0 && !loading) {
      setLoading(true);
  
      try {
        const token = await AsyncStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
        let url = `${endpoints['newsfeeds']}?page=${page}`;
  
        if (cateId) {
          url = `${url}&category_id=${cateId}`;
        }
  
        if (q) {
          url = `${url}&q=${q}`;
        }
  
        const res = await APIs.get(url, { headers });
        console.log("API endpoint activities:", url);
        // console.log("Dữ liệu từ API:", res.data.results); // Xem toàn bộ phản hồi
  
        
        
        if (res.data && res.data.results) {
          setNewsFeeds(prevNewsfeeds => page > 1 ? [...prevNewsfeeds, ...res.data.results] : res.data.results);
  
          if (res.data.next) {
            setPage(prevPage => prevPage + 1);
          } else {
            setPage(0);
          }
        } else {
          console.log("Không có dữ liệu để hiển thị.");
          setNewsFeeds([]);
        }
      } catch (ex) {
        console.error("Lỗi khi tải newsfeeds:", ex.response ? ex.response.data : ex.message);
      } finally {
        setLoading(false);
      }
    }
  }


  
  useEffect(() => {
    if (page > 0) {
      loadNewsfeeds();
    }
  }, [page, q]); // 👉 Thêm `q` vào dependencies
  // Thêm phụ thuộc cần thiết để load lại khi thay đổi

  const loadMore = () => {
    if (page > 0 && !loading && newsfeeds.length > 0) {
      loadNewsfeeds();
    }
  };

  const search = (value) => {
    setPage(1);  // Reset page khi tìm kiếm
    setQ(value);
  };

  const likeActivity = async (id) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      // Đảm bảo bạn đang gửi đúng endpoint
      const response = await APIs.post(`${endpoints['newsfeeds']}/${id}/likes/`, {}, { headers });
      console.log('Response:', response);
      alert("Bạn đã thích hoạt động này!");
    } catch (error) {
      console.error("Lỗi khi thích hoạt động:", error.response ? error.response.data : error.message);
      alert("Có lỗi xảy ra khi thích hoạt động. Vui lòng thử lại sau.");
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || !selectedActivity) return;
  
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      // Đảm bảo bạn đang gửi đúng endpoint và thêm headers nếu cần
      const response = await APIs.post(`${endpoints['newsfeeds']}/${selectedActivity}/comments/`, { content: commentText }, { headers });
      console.log("Bình luận thành công:", response);
      alert("Bình luận thành công!");
      setCommentModal(false);
      setCommentText("");
    } catch (error) {
      console.error("Lỗi khi bình luận:", error.response ? error.response.data : error.message);
      alert("Có lỗi xảy ra khi bình luận. Vui lòng thử lại sau.");
    }
  };
  
  const loadRegistrations = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      console.log("Headers:", headers);
  
      const res = await APIs.get(endpoints['registration_get_list'], { headers });
      console.log("Response from registration list:", res.data);
  
      if (!res.data || !Array.isArray(res.data)) {
        console.error("(NOBRIDGE) ERROR: Dữ liệu nhận về không đúng định dạng!", res.data);
        return;
      }
  
      const registeredMap = {};
      res.data.results.forEach(item => {
        registeredMap[item.activity.id] = true;
      });
  
      setRegisteredActivities(registeredMap);
  
    } catch (error) {
      console.error("Lỗi khi tải danh sách đăng ký:", error.response ? error.response.data : error.message);
    }
  };
  
  const loadCurrentUser = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      const res = await APIs.get(endpoints['currentUser'], { headers });
      return res.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return null;
    }
  };
  
  useEffect(() => {
    loadRegistrations();
  }, []);
  
  const toggleRegistration = async (activityId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      const currentUser = await loadCurrentUser();
      if (!currentUser) {
        alert("Không thể xác thực người dùng. Vui lòng đăng nhập lại.");
        return;
      }
  
      if (currentUser.role !== "student") {
        alert("Chỉ sinh viên mới được đăng ký tham gia hoạt động.");
        return;
      }
  
      const body = { activity: activityId };
  
      if (registeredActivities[activityId]) {
        alert("Chức năng hủy đăng ký chưa được hỗ trợ.");
      } else {
        await APIs.post(endpoints['registration'], body, { headers });
        alert("Đăng ký thành công!");
      }
  
      setRegisteredActivities(prev => ({
        ...prev,
        [activityId]: !prev[activityId],
      }));
  
    } catch (error) {
      console.error("Lỗi khi xử lý đăng ký:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };  
  


  const refresh = async () => {
    setLoading(true);
    setPage(1); // Reset lại trang về 1

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
  
      let url = `${endpoints['newsfeeds']}?page=1`;
      if (cateId) {
        url = `${url}&category_id=${cateId}`;
      }
  
      if (q) {
        url = `${url}&q=${q}`;
      }
  
      const res = await APIs.get(url, { headers });
      setNewsFeeds(res.data.results);

      if (res.data.next) {
        setPage(prevPage => prevPage + 1);
      } else {
        setPage(0);
      }
    } catch (error) {
      console.error("Lỗi khi refresh:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={MyStyles.container}>

  
     
            <FlatList
              refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
              data={newsfeeds}
              renderItem={({ item }) => (
                <View style={MyStyles.activityContainer}>
                  <List.Item
                    key={item.id}
                    title={`Hoạt động ${item.activity.title}`}
                    description={`Ngày tạo: ${new Date(item.created_date).toLocaleString()}`}
                    left={props => <Image style={MyStyles.box} source={{ uri: item.activity.image }} />}
                  />
                  <View style={MyStyles.buttonContainer}>
                  <TouchableOpacity 
                      style={[
                        MyStyles.registerButton,
                        registeredActivities[item.activity.id] ? { backgroundColor: 'gray' } : {}
                      ]}
                      onPress={() => toggleRegistration(item.activity.id)}
                    >
                      <Text style={{ color: registeredActivities[item.activity.id] ? 'white' : '#007bff' }}>
                        {registeredActivities[item.activity.id] ? 'Đã đăng ký' : 'Đăng ký tham gia'}
                      </Text>
                  </TouchableOpacity>

                    <TouchableOpacity style={MyStyles.likeButton} onPress={() => likeActivity(item.id)}>
                      <Text style={{ color: '#ff4500' }}>Like</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={MyStyles.commentButton}
                      onPress={() => {
                        setSelectedActivity(item.id);
                        setCommentModal(true);
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 16 }}>Bình luận</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              keyExtractor={(item, index) => `${item.id}-${index}`}
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
            />
  
  <Modal visible={commentModal} transparent={true} animationType="fade">
  <View style={MyStyles.modalOverlay}>
    <View style={MyStyles.modalContainer}>
      <Text >Bình luận</Text>
      <TextInput
        style={MyStyles.input}
        placeholder="Nhập bình luận..."
        value={commentText}
        onChangeText={setCommentText}
      />
      <View style={MyStyles.modalButtons}>
        <TouchableOpacity onPress={postComment} style={MyStyles.commentButton}>
          <Text style={{ color: 'white', fontSize: 16 }}>Gửi</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCommentModal(false)} style={MyStyles.cancelButton}>
          <Text style={{ color: 'white' }}>Hủy</Text>
        </TouchableOpacity>
      </View>
    </View>
  </View>
</Modal>

    </View>
  );
}
  
export default BanTin;
