import { View, Text, FlatList, RefreshControl, StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [token, setToken] = useState(null); // Lưu token để tránh gọi lại quá nhiều lần

    useEffect(() => {
        const fetchToken = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('token');
                setToken(storedToken); // Lưu token vào state
            } catch (error) {
                console.error("Lỗi lấy token:", error);
            }
        };
        fetchToken();
    }, []);

    useEffect(() => {
        if (page > 0 && hasMore && !loading && token) {
            loadStudents();
        }
    }, [page, token]); // Thêm token vào dependency

    const loadStudents = async () => {
        if (loading || !hasMore || !token) return;
        setLoading(true);
        try {
            const url = `${endpoints['users_list_students']}?page=${page}`;
            const res = await APIs.get(url, { headers: { Authorization: `Bearer ${token}` } });
    
            // console.log(`📌 API Response (page ${page}):`, res.data); // Debug dữ liệu nhận được từ API
    
            if (res.data.length === 0) {
                setHasMore(false);
            } else {
                setStudents(prev => {
                    // Loại bỏ dữ liệu trùng
                    const newData = res.data.filter(item => !prev.some(s => s.id === item.id));
                    const updatedList = page > 1 ? [...prev, ...newData] : newData;
    
                    // console.log("📌 Updated Students List:", updatedList); // Debug danh sách sau khi cập nhật
                    return updatedList;
                });
            }
        } catch (error) {
            console.error("Lỗi khi tải sinh viên:", error);
        } finally {
            setLoading(false);
        }
    };
    
    

    const refresh = async () => {
        if (!token) return; // Tránh gọi API nếu chưa có token
        setPage(1);
        setHasMore(true);
        setLoading(true);
        try {
            const res = await APIs.get(`${endpoints['users_list_students']}?page=1`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setStudents(res.data);
            if (res.data.length === 0) setHasMore(false);
        } catch (error) {
            console.error("Lỗi khi làm mới dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!loading && hasMore) {
            setPage(prev => prev + 1);
        }
    };

    const renderStudent = ({ item }) => (
        <View style={styles.row}>
            <Text style={styles.cell}>{item.first_name} {item.last_name}</Text>
            <Text style={[styles.cell, styles.score]}>{item.total_score}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>DANH SÁCH SINH VIÊN</Text>
            <View style={styles.table}>
                <View style={styles.headerRow}>
                    <Text style={styles.headerCell}>Tên Sinh Viên</Text>
                    <Text style={styles.headerCell}>Điểm Tổng</Text>
                </View>
                <FlatList
                    refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                    data={students}
                    renderItem={renderStudent}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    onEndReached={handleLoadMore}
                    onEndReachedThreshold={0.1}
                />
                {loading && <ActivityIndicator size="large" color="#007bff" />}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: "#f8f9fa" 
    },
    title: { 
        fontSize: 24, 
        fontWeight: "bold", 
        textAlign: "center", 
        marginBottom: 16, 
        color: "#333" 
    },
    table: { 
        width: "100%", 
        backgroundColor: "#fff", 
        borderRadius: 10, 
        shadowColor: "#000", 
        shadowOffset: { width: 0, height: 2 }, 
        shadowOpacity: 0.1, 
        shadowRadius: 4, 
        elevation: 2 
    },
    headerRow: { 
        flexDirection: "row", 
        backgroundColor: "#007bff", 
        paddingVertical: 10, 
        borderTopLeftRadius: 10, 
        borderTopRightRadius: 10 
    },
    headerCell: { 
        flex: 1, 
        fontWeight: "bold", 
        color: "#fff", 
        textAlign: "center" 
    },
    row: { 
        flexDirection: "row", 
        paddingVertical: 12, 
        borderBottomWidth: 1, 
        borderColor: "#ddd", 
        backgroundColor: "#fff" 
    },
    cell: { 
        flex: 1, 
        textAlign: "center", 
        color: "#333" 
    },
    score: { 
        fontWeight: "bold", 
        color: "#28a745" 
    }
});

export default StudentList;
