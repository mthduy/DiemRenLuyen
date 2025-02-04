import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from "react-native";
import { Button, Card } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import APIs, { authApis, endpoints } from "../../configs/APIs";
import AsyncStorage from '@react-native-async-storage/async-storage';

const HoatDongDaThamGia = ({ token }) => {
  const [disciplined, setDisciplined] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const navigation = useNavigation();
  const [page, setPage] = useState(1);

  const fetchActivities = async (page) => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      if (!token) {
        console.error("Token không tồn tại.");
        return;
      }

      const url = `${endpoints['disciplined']}?page=${page}`;
      console.log("Gửi request tới:", url);

      const res = await authApis(token).get(url);
      console.log("Kết quả disciplined:", res.data);

      setDisciplined(prevDisciplined => [...prevDisciplined, ...res.data.results]);
      setHasMore(!!res.data.next);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu hoạt động:", error.response?.status);
      console.error("Chi tiết lỗi:", error.response?.data);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchActivities(1);
  }, []);

  const loadMore = () => {
    if (hasMore && !isFetching) {
      setPage(prevPage => prevPage + 1);
      fetchActivities(page + 1);
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.studentInfo}>
          <Image source={{ uri: item.student.image }} style={styles.studentImage} />
          <View style={styles.studentDetails}>
            <Text style={styles.username}>{item.student.username}</Text>
            <Text style={styles.role}>Vai trò: {item.student.role}</Text>
          </View>
        </View>

        <Text style={styles.activity}>Hoạt động: {item.activity.title}</Text>
        <Text style={styles.description}>{item.activity.description.replace(/<[^>]+>/g, '')}</Text>
        <Text style={styles.activity}>Tiêu chí:</Text>
        <Text style={styles.description}>{item.criteria?.name || 'Không có tiêu chí'}</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Điểm:</Text>
          <Text style={styles.value}>{item.score}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Tổng điểm:</Text>
          <Text style={styles.value}>{item.group_total_score}</Text>
        </View>
      </Card.Content>
    </Card>
  );

  if (loading && disciplined.length === 0) {
    return <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />;
  }

  if (disciplined.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>Chưa có hoạt động nào để tham gia.</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
          Quay lại
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={disciplined}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
      {hasMore && !loading && (
        <Button mode="contained" onPress={loadMore} style={styles.button}>
          Tải thêm
        </Button>
      )}
      <Button mode="contained" onPress={() => navigation.goBack()} style={styles.button}>
        Quay lại
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
  },
  studentInfo: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  studentImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  studentDetails: {
    justifyContent: 'center',
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  activity: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    marginBottom: 10,
    color: 'gray',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 50,
  },
  noData: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'gray',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  list: {
    paddingBottom: 20,
  },
  button: {
    marginTop: 10,
  },
});

export default HoatDongDaThamGia;
