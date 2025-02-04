import React, { useEffect, useState, useCallback } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  FlatList, 
  RefreshControl, 
  Modal, 
  Image 
} from "react-native";
import { List, TextInput } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import APIs, { endpoints } from "../../configs/APIs";

// Ví dụ về định dạng CSS (React Native Stylesheet)
const MyStyles = {
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  activityContainer: {
    backgroundColor: "white",
    margin: 10,
    borderRadius: 8,
    padding: 10,
    elevation: 3,
  },
  box: {
    width: 60,
    height: 60,
    borderRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  registerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#007bff",
    backgroundColor: "white",
  },
  likeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ff4500",
    backgroundColor: "white",
  },
  commentButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "#007bff",
  },
  likeButtonText: {
    fontSize: 16,
    color: "#ff4500",
  },
  commentButtonText: {
    fontSize: 16,
    color: "white",
  },
  // Styles cho modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 8,
    elevation: 5,
  },
  input: {
    marginTop: 10,
    backgroundColor: "white",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 5,
    backgroundColor: "gray",
  },
};

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
  const [likedActivities, setLikedActivities] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  // Component con để render từng item newsfeed
  const NewsfeedItem = ({ item }) => {
    const [likesCount, setLikesCount] = useState(0);
    const [commentsCount, setCommentsCount] = useState(0);

    useEffect(() => {
      const fetchCounts = async () => {
        try {
          const token = await AsyncStorage.getItem("token");
          const headers = token ? { Authorization: `Bearer ${token}` } : {};

          // Lấy số lượt thích
          const likesUrl = endpoints["newsfeeds_likes_count"].replace("{id}", item.id);
          const likesRes = await APIs.get(likesUrl, { headers });
          const likesValue = likesRes.data.count || likesRes.data.likes_count || 0;
          setLikesCount(likesValue);

          // Lấy số lượt bình luận
          const commentsUrl = endpoints["newsfeeds_comments_count"].replace("{id}", item.id);
          const commentsRes = await APIs.get(commentsUrl, { headers });
          const commentsValue = commentsRes.data.count || commentsRes.data.comments_count || 0;
          setCommentsCount(commentsValue);
        } catch (error) {
          console.error(
            "Error fetching counts:",
            error.response ? error.response.data : error.message
          );
        }
      };

      fetchCounts();
    }, [item.id]);

    return (
      <View style={MyStyles.activityContainer}>
        <List.Item
          key={item.id}
          title={`Hoạt động: ${item.activity.title}`}
          description={`Ngày tạo: ${new Date(item.created_date).toLocaleString()}`}
          left={() => (
            <Image 
              style={MyStyles.box} 
              source={{ uri: item.activity.image }} 
            />
          )}
        />

        <View style={MyStyles.buttonContainer}>
          <TouchableOpacity
            style={[
              MyStyles.registerButton,
              registeredActivities[item.activity.id] ? { backgroundColor: 'gray' } : {}
            ]}
            onPress={() => {
              if (!registeredActivities[item.activity.id]) {
                toggleRegistration(item.activity.id);
              }
            }}
            disabled={registeredActivities[item.activity.id]}
          >
            <Text style={{ color: registeredActivities[item.activity.id] ? 'white' : '#007bff' }}>
              {registeredActivities[item.activity.id] ? 'Đã đăng ký' : 'Đăng ký tham gia'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={MyStyles.likeButton}
            onPress={() => {
              if (!likedActivities[item.id]) {
                likeActivity(item.id);
              } else {
                alert("Bạn đã thích bài viết này rồi!");
              }
            }}
          >
            <Text style={MyStyles.likeButtonText}>
              {likedActivities[item.id] ? 'Đã thích' : 'Like'} ({likesCount})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={MyStyles.commentButton}
            onPress={() => {
              setSelectedActivity(item.id);
              setCommentModal(true);
            }}
          >
            <Text style={MyStyles.commentButtonText}>
              Bình luận ({commentsCount})
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // --- Hàm tải dữ liệu newsfeeds ---
  const loadNewsfeeds = useCallback(async () => {
    if (page > 0 && !loading) {
      let isMounted = true;
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        let url = `${endpoints["newsfeeds"]}?page=${page}`;
        if (cateId) {
          url = `${url}&category_id=${cateId}`;
        }
        if (q) {
          url = `${url}&q=${q}`;
        }
        const res = await APIs.get(url, { headers });
        console.log("API endpoint newsfeeds:", url);
        if (res.data && res.data.results) {
          if (isMounted) {
            setNewsFeeds((prev) =>
              page > 1 ? [...prev, ...res.data.results] : res.data.results
            );
          }
          if (res.data.next) {
            if (isMounted) {
              setPage((prevPage) => prevPage + 1);
            }
          } else {
            if (isMounted) {
              setPage(0);
            }
          }
        } else {
          console.log("Không có dữ liệu để hiển thị.");
          if (isMounted) {
            setNewsFeeds([]);
          }
        }
      } catch (ex) {
        console.error(
          "Lỗi khi tải newsfeeds:",
          ex.response ? ex.response.data : ex.message
        );
      } finally {
        if (isMounted) setLoading(false);
      }
      return () => {
        isMounted = false;
      };
    }
  }, [page, cateId, q, loading]);

  useEffect(() => {
    if (page > 0) {
      loadNewsfeeds();
    }
  }, [page, q, loadNewsfeeds]);

  const loadMore = () => {
    if (page > 0 && !loading && newsfeeds.length > 0) {
      loadNewsfeeds();
    }
  };

  const search = (value) => {
    setPage(1); // Reset page khi tìm kiếm
    setQ(value);
  };

  const loadCurrentUser = async () => {
    let isMounted = true;
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return null;
      const headers = { Authorization: `Bearer ${token}` };
      const res = await APIs.get(endpoints["currentUser"], { headers });
      if (isMounted) {
        return res.data;
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin người dùng:", error);
      return null;
    }
    return () => {
      isMounted = false;
    };
  };

  useEffect(() => {
    let isMounted = true;
    const checkLogin = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        if (isMounted) {
          setUserLoggedIn(true);
          const user = await loadCurrentUser();
          setCurrentUser(user);
        }
      } else {
        if (isMounted) {
          setUserLoggedIn(false);
          setCurrentUser(null);
        }
      }
    };
    checkLogin();
    return () => {
      isMounted = false;
    };
  }, []);

  const likeActivity = async (id) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để thích bài viết.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await APIs.post(`${endpoints["newsfeeds"]}/${id}/likes/`, {}, { headers });
      console.log("Response:", response);
      alert("Bạn đã thích hoạt động này!");
      const likeKey = `liked-${currentUser.id}-${id}`;
      await AsyncStorage.setItem(likeKey, "true");
      setLikedActivities((prev) => ({
        ...prev,
        [id]: true,
      }));
    } catch (error) {
      console.error(
        "Lỗi khi thích hoạt động:",
        error.response ? error.response.data : error.message
      );
      alert("Có lỗi xảy ra khi thích hoạt động. Vui lòng thử lại sau.");
    }
  };

  const postComment = async () => {
    if (!commentText.trim() || !selectedActivity) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await APIs.post(
        `${endpoints["newsfeeds"]}/${selectedActivity}/comments/`,
        { content: commentText },
        { headers }
      );
      console.log("Bình luận thành công:", response);
      alert("Bình luận thành công!");
      setCommentModal(false);
      setCommentText("");
    } catch (error) {
      console.error(
        "Lỗi khi bình luận:",
        error.response ? error.response.data : error.message
      );
      alert("Có lỗi xảy ra khi bình luận. Vui lòng thử lại sau.");
    }
  };

  const toggleRegistration = async (activityId) => {
    if (!currentUser) {
      alert("Vui lòng đăng nhập để đăng ký.");
      return;
    }
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (currentUser.role !== "student") {
        alert("Chỉ sinh viên mới được đăng ký tham gia hoạt động.");
        return;
      }

      const regKey = `registered-${currentUser.id}-${activityId}`;
      const registeredStatus = await AsyncStorage.getItem(regKey);
      if (registeredStatus) {
        alert("Bạn đã đăng ký tham gia hoạt động này rồi.");
        return;
      }

      const body = { activity: activityId };
      await APIs.post(endpoints["registration"], body, { headers });
      alert("Đăng ký thành công!");
      await AsyncStorage.setItem(regKey, "true");
      setRegisteredActivities((prev) => ({
        ...prev,
        [activityId]: true,
      }));
    } catch (error) {
      console.error("Lỗi khi xử lý đăng ký:", error);
      alert("Có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const loadRegistrations = useCallback(async () => {
    if (!currentUser) return;
    let isMounted = true;
    try {
      const registeredMap = {};
      for (let i = 0; i < newsfeeds.length; i++) {
        const activityId = newsfeeds[i].activity.id;
        const regKey = `registered-${currentUser.id}-${activityId}`;
        const registeredStatus = await AsyncStorage.getItem(regKey);
        if (registeredStatus) {
          registeredMap[activityId] = true;
        }
      }
      if (isMounted) {
        setRegisteredActivities(registeredMap);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách đăng ký:", error);
    }
    return () => {
      isMounted = false;
    };
  }, [newsfeeds, currentUser]);

  const loadLikes = useCallback(async () => {
    if (!currentUser) return;
    let isMounted = true;
    try {
      const likedMap = {};
      for (let i = 0; i < newsfeeds.length; i++) {
        const newsfeedId = newsfeeds[i].id;
        const likeKey = `liked-${currentUser.id}-${newsfeedId}`;
        const likedStatus = await AsyncStorage.getItem(likeKey);
        if (likedStatus) {
          likedMap[newsfeedId] = true;
        }
      }
      if (isMounted) {
        setLikedActivities(likedMap);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách like:", error);
    }
    return () => {
      isMounted = false;
    };
  }, [newsfeeds, currentUser]);

  useEffect(() => {
    loadRegistrations();
    loadLikes();
  }, [newsfeeds, currentUser, loadRegistrations, loadLikes]);

  const refresh = async () => {
    let isMounted = true;
    setLoading(true);
    setPage(1);
    try {
      const token = await AsyncStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      let url = `${endpoints["newsfeeds"]}?page=1`;
      if (cateId) {
        url = `${url}&category_id=${cateId}`;
      }
      if (q) {
        url = `${url}&q=${q}`;
      }
      const res = await APIs.get(url, { headers });
      if (res.data && res.data.results) {
        if (isMounted) {
          setNewsFeeds(res.data.results);
        }
        if (res.data.next) {
          if (isMounted) {
            setPage((prevPage) => prevPage + 1);
          }
        } else {
          if (isMounted) {
            setPage(0);
          }
        }
      }
    } catch (error) {
      console.error("Lỗi khi refresh:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  };

  return (
    <View style={MyStyles.container}>
      <FlatList
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
        data={newsfeeds}
        renderItem={({ item }) => <NewsfeedItem item={item} />}
        keyExtractor={(item, index) => `${item.id}-${index}`}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
      />

      <Modal visible={commentModal} transparent={true} animationType="fade">
        <View style={MyStyles.modalOverlay}>
          <View style={MyStyles.modalContainer}>
            <Text>Bình luận</Text>
            <TextInput
              style={MyStyles.input}
              placeholder="Nhập bình luận..."
              value={commentText}
              onChangeText={setCommentText}
            />
            <View style={MyStyles.modalButtons}>
              <TouchableOpacity onPress={postComment} style={MyStyles.commentButton}>
                <Text style={MyStyles.commentButtonText}>Gửi</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCommentModal(false)} style={MyStyles.cancelButton}>
                <Text style={{ color: "white" }}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default BanTin;
