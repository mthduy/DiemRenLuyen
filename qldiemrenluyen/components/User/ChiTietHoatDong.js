import { View, Text, Image, ActivityIndicator, ScrollView, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useState, useEffect } from "react";
import APIs, { endpoints, authApis } from "../../configs/APIs";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ChiTietHoatDong = () => {
  const route = useRoute();
  const { activityId } = route.params;
  const [activityDetails, setActivityDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = async () => {
    const token = await AsyncStorage.getItem("token");
    return token ? token : "";
  };

  useEffect(() => {
    const loadActivityDetails = async () => {
      try {
        const token = await getToken();
        const api = authApis(token);

        const apiUrl = endpoints["activities_read"](activityId);
        console.log("API URL:", apiUrl);
        console.log("Authorization:", token ? `Bearer ${token}` : "Không có token");

        const res = await api.get(apiUrl);
        setActivityDetails(res.data);
      } catch (error) {
        console.error("Lỗi khi lấy thông tin chi tiết hoạt động:", error);
      } finally {
        setLoading(false);
      }
    };

    loadActivityDetails();
  }, [activityId]);

  if (loading) {
    return <ActivityIndicator size="large" color="#007BFF" style={styles.loader} />;
  }

  if (!activityDetails) {
    return <Text style={styles.errorText}>Không tìm thấy thông tin hoạt động.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{activityDetails?.title || "Không có tiêu đề"}</Text>
      {activityDetails?.image && (
        <Image style={styles.image} source={{ uri: activityDetails.image }} />
      )}
      <Text style={styles.description}>{activityDetails?.description.replace(/<\/?p>/g, '') || "Không có mô tả"}</Text>
      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>📅 Ngày bắt đầu: {activityDetails?.start_date || "Chưa cập nhật"}</Text>
        <Text style={styles.infoText}>📅 Ngày kết thúc: {activityDetails?.end_date || "Chưa cập nhật"}</Text>
        <Text style={styles.infoText}>👤 Được tạo bởi: {activityDetails?.created_by || "Không rõ"}</Text>
        <Text style={styles.infoText}>👥 Số lượng tối đa: {activityDetails?.capacity ?? "Không giới hạn"}</Text>
        <Text style={styles.infoText}>📌 Trạng thái: {activityDetails?.status || "Không có trạng thái"}</Text>
        <Text style={styles.infoText}>📂 Danh mục: {activityDetails?.category || "Không rõ"}</Text>
        <Text style={styles.infoText}>⭐ Điểm tối đa: {activityDetails?.max_score ?? "Không có điểm"}</Text>
      </View>
      <Text style={styles.tagsTitle}>🏷️ Tags:</Text>
      {activityDetails?.tags?.length > 0 ? (
        activityDetails.tags.map((tag) => <Text key={tag.id} style={styles.tag}># {tag.name}</Text>)
      ) : (
        <Text style={styles.noTags}>Không có tag</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F9FA",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    padding: 20,
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#007BFF",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginVertical: 10,
    resizeMode: "cover",
  },
  description: {
    fontSize: 16,
    color: "#333",
    marginBottom: 10,
  },
  infoContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },
  tagsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  tag: {
    fontSize: 16,
    color: "#28A745",
    marginVertical: 2,
  },
  noTags: {
    fontSize: 16,
    color: "#888",
  },
});

export default ChiTietHoatDong;
