import React, { useEffect, useState } from "react";
import { View, FlatList, Text, TouchableOpacity, Image, ActivityIndicator, RefreshControl, Modal } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authApis, endpoints } from '../../configs/APIs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ImageViewer from 'react-native-image-zoom-viewer';

const TroLySV_XemBaoThieu = () => {
    const navigation = useNavigation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nextPage, setNextPage] = useState(null);
    const [page, setPage] = useState(1); // Trang bắt đầu từ 1
    const [isModalVisible, setModalVisible] = useState(false); // Điều khiển hiển thị modal
    const [selectedImage, setSelectedImage] = useState(null); // Lưu ảnh đã chọn

    // Lấy token từ AsyncStorage
    const getToken = async () => {
        const token = await AsyncStorage.getItem('token');
        return token ? token : ''; // Trả về token nếu có, hoặc chuỗi rỗng nếu không có
    };

    // Lấy dữ liệu từ API report_list
    const loadReports = async () => {
        setLoading(true);
        try {
            const token = await getToken(); // Lấy token
            const api = authApis(token); // Tạo axios instance với token

            if (page <= 0) {
                console.log("Không còn trang tiếp theo.");
                return; // Dừng nếu không còn trang tiếp theo
            }
            let url = `${endpoints['report_list']}?page=${page}`;
            const res = await api.get(url);

            if (res.data && res.data.results) {
                setReports(prevReports => page > 1 ? [...prevReports, ...res.data.results] : res.data.results);

                if (res.data.next) {
                    setNextPage(res.data.next);
                    setPage(prevPage => prevPage + 1);
                } else {
                    setNextPage(null);
                    setPage(0);
                }
            } else {
                console.log("Không có dữ liệu báo cáo.");
                setReports([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải báo cáo:", error.response ? error.response.data : error.message);
        } finally {
            setLoading(false);
        }
    };

    // Gọi lại hàm khi trang được tải
    useEffect(() => {
        loadReports();
    }, [page]);

    // Hàm xác nhận báo cáo
    const handleApprove = async (reportId) => {
        try {
            const token = await getToken();
            const api = authApis(token); // Tạo axios instance với token

            const response = await api.patch(`${endpoints['report_approve'].replace("{id}", reportId)}`);
            console.log("Xác nhận báo cáo thành công:", response);
            alert("Báo cáo đã được xác nhận.");

            // Cập nhật lại danh sách báo cáo sau khi xác nhận
            setReports(prevReports => prevReports.filter(report => report.id !== reportId));

        } catch (error) {
            console.error("Lỗi khi xác nhận báo cáo:", error.response ? error.response.data : error.message);
            alert("Có lỗi xảy ra khi xác nhận báo cáo. Vui lòng thử lại sau.");
        }
    };

    // Hàm từ chối báo cáo
    const handleReject = async (reportId) => {
        try {
            const token = await getToken();
            const api = authApis(token); // Tạo axios instance với token

            const response = await api.patch(`${endpoints['report_reject'].replace("{id}", reportId)}`);
            console.log("Từ chối báo cáo thành công:", response);
            alert("Báo cáo đã bị từ chối.");

            // Cập nhật lại danh sách báo cáo sau khi từ chối
            setReports(prevReports => prevReports.filter(report => report.id !== reportId));

        } catch (error) {
            console.error("Lỗi khi từ chối báo cáo:", error.response ? error.response.data : error.message);
            alert("Có lỗi xảy ra khi từ chối báo cáo. Vui lòng thử lại sau.");
        }
    };

    // Hàm xử lý load thêm dữ liệu khi kéo xuống cuối
    const handleLoadMore = () => {
        if (nextPage) {
            setPage(prevPage => prevPage + 1); // Chuyển sang trang tiếp theo
        }
    };

    // Refresh khi kéo xuống
    const refresh = async () => {
        setPage(1); // Reset trang về 1 khi refresh
        setReports([]); // Reset danh sách báo cáo
        loadReports();
    };

    // Hiển thị modal ảnh phóng to
    const openImageViewer = (imageUrl) => {
        setSelectedImage([{ url: imageUrl }]); // Cập nhật ảnh để phóng to
        setModalVisible(true); // Mở modal
    };

    // Đóng modal ảnh
    const closeImageViewer = () => {
        setModalVisible(false); // Đóng modal
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text>Đang tải dữ liệu...</Text>
            </View>
        );
    }

    return (
        <View style={{ padding: 20 }}>
            <FlatList
                refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                data={reports}
                renderItem={({ item }) => {
                    return (
                        <View style={{ marginBottom: 20 }}>
                            {/* Group 2: Thông tin về hoạt động (ảnh, mô tả, nút hành động) */}
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    style={{ width: 50, height: 50, marginRight: 10 }}
                                    source={{ uri: item.activity.image }}
                                />

                                <View style={{ flex: 1 }}>
                                    <Text>{`Tên hoạt động: ${item.activity.title}`}</Text>
                                    <Text>{`Trạng thái: ${item.status}`}</Text>
                                    <Text>{`Người xử lý: ${item.handled_by}`}</Text>

                                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                        {item.status !== 'approved' && item.status !== 'rejected' && (
                                            <>
                                                <TouchableOpacity
                                                    style={{ backgroundColor: 'green', padding: 10, marginRight: 5 }}
                                                    onPress={() => handleApprove(item.id)}
                                                >
                                                    <Text style={{ color: 'white' }}>Xác nhận</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    style={{ backgroundColor: 'red', padding: 10 }}
                                                    onPress={() => handleReject(item.id)}
                                                >
                                                    <Text style={{ color: 'white' }}>Từ chối</Text>
                                                </TouchableOpacity>
                                            </>
                                        )}
                                        {item.status === 'approved' && (
                                            <Text>Đã xác nhận</Text>
                                        )}
                                        {item.status === 'rejected' && (
                                            <Text>Đã từ chối</Text>
                                        )}
                                    </View>
                                </View>
                            </View>

                            {/* Group 1: Ảnh báo cáo minh chứng (căn giữa) */}
                            {item.image && (
                                <View style={{ alignItems: 'center', marginBottom: 20 }}>
                                    <Text style={{ color: 'red' }}>ẢNH MINH CHỨNG: </Text>
                                    <TouchableOpacity onPress={() => openImageViewer(item.image)}>
                                        <Image
                                            style={{ width: 200, height: 200, borderRadius: 8 }}
                                            source={{ uri: item.image }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    );
                }}
                keyExtractor={(item) => item.id.toString()}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
            />

            {/* Modal ảnh phóng to */}
            <Modal visible={isModalVisible} onRequestClose={closeImageViewer} transparent={true}>
                <ImageViewer
                    imageUrls={selectedImage}
                    onCancel={closeImageViewer}
                />
            </Modal>
        </View>
    );
};

export default TroLySV_XemBaoThieu;
