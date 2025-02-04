import React, { useState, useEffect } from "react";
import { Text, TextInput, Button, Alert, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import * as ImagePicker from 'expo-image-picker';
import APIs from "../../configs/APIs";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

const TroLySV_TaoHoatDong = () => {
    const [tenHoatDong, setTenHoatDong] = useState("");
    const [moTa, setMoTa] = useState("");
    const [ngayBatDau, setNgayBatDau] = useState("");
    const [ngayKetThuc, setNgayKetThuc] = useState("");
    const [soLuong, setSoLuong] = useState(0);
    const [categories, setCategories] = useState([]);  // Sửa lại state categories là một mảng
    const [tags, setTags] = useState([]);
    const [selectedTag, setSelectedTag] = useState(null);
    const [diemToiDa, setDiemToiDa] = useState(100);
    const [hinhAnh, setHinhAnh] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const fetchTagsAndCategories = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Lỗi', 'Bạn chưa đăng nhập hoặc token không hợp lệ');
                return;
            }
    
            // Lấy tất cả các Tags
            let allTags = [];
            let tagsPage = 1;
            let hasMoreTags = true;
            
            while (hasMoreTags) {
                const responseTags = await APIs.get(`https://dinhtien.pythonanywhere.com/activities/?page=${tagsPage}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
    
                const tags = responseTags.data.results.flatMap(activity => activity.tags);
                allTags = [...allTags, ...tags];
                hasMoreTags = responseTags.data.next !== null;  // Kiểm tra xem có trang tiếp theo không
                tagsPage++;
            }
            setTags(allTags);
    
            // Lấy tất cả các Categories (nếu có API cho categories)
            let allCategories = [];
            let categoriesPage = 1;
            let hasMoreCategories = true;
            
            while (hasMoreCategories) {
                const responseCategories = await APIs.get(`https://dinhtien.pythonanywhere.com/categories/?page=${categoriesPage}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    }
                });
    
                const categories = responseCategories.data.results;
                allCategories = [...allCategories, ...categories];
                hasMoreCategories = responseCategories.data.next !== null;  // Kiểm tra xem có trang tiếp theo không
                categoriesPage++;
            }
            setCategories(allCategories);
    
        } catch (error) {
            console.error("Lỗi khi tải tags hoặc categories:", error.message);
            Alert.alert('Lỗi', `Có lỗi khi tải dữ liệu: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    

    useEffect(() => {
        fetchTagsAndCategories();
    }, []);  // Chạy 1 lần khi component mount

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
                setHinhAnh(result.assets[0]);
                console.log("Hình ảnh đã chọn:", result.assets[0]);  // Kiểm tra URI của hình ảnh
            }
        }
    };

    const handleTaoHoatDong = async () => {
        if (!tenHoatDong || !moTa || !ngayBatDau || !ngayKetThuc || !soLuong || !selectedCategory || !selectedTag) {
            Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        const formData = new FormData();
        formData.append('title', tenHoatDong);
        formData.append('description', moTa);
        formData.append('start_date', ngayBatDau);
        formData.append('end_date', ngayKetThuc);
        formData.append('created_by', '1');
        formData.append('capacity', soLuong);
        formData.append('status', 'open');
        formData.append('category', selectedCategory);
        formData.append('max_score', diemToiDa);

        formData.append('tags', selectedTag ? selectedTag : []); // Gửi dưới dạng mảng

        console.log("Selected Tag:", selectedTag);  // In giá trị của selectedTag để kiểm tra



        if (hinhAnh) {
            const localUri = hinhAnh.uri;
            const filename = localUri.split('/').pop();
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            console.log("Hình ảnh URI:", localUri);
            console.log("Tên tệp:", filename);
            console.log("Loại tệp:", type);

            formData.append('image', {
                uri: localUri,
                name: filename,
                type: type
            });
            
        }

        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert('Lỗi', 'Token không hợp lệ!');
                return;
            }

            setLoading(true);
            const response = await APIs.post("https://dinhtien.pythonanywhere.com/activities/", formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201) {
                Alert.alert('Thành công', `Hoạt động "${tenHoatDong}" đã được tạo!`);
            } else {
                Alert.alert('Lỗi', `Không thể tạo hoạt động. Lỗi từ server: ${response.status}`);
            }
        } catch (error) {
            console.error('Lỗi khi tạo hoạt động:', error.response ? error.response.data : error.message); // Log lỗi chi tiết từ response
            Alert.alert('Lỗi', error?.response?.data?.message || error?.message || 'Có lỗi xảy ra khi tạo hoạt động.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAwareScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollViewContent}
            resetScrollToCoords={{ x: 0, y: 0 }}
            scrollEnabled={true}
            enableAutomaticScroll={true}
            extraHeight={150}
        >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>Tạo hoạt động mới</Text>

            {/* Các TextInput */}
            <TextInput
                placeholder="Nhập tên hoạt động"
                value={tenHoatDong}
                onChangeText={setTenHoatDong}
                style={styles.input}
            />
            <TextInput
                placeholder="Nhập mô tả hoạt động"
                value={moTa}
                onChangeText={setMoTa}
                style={styles.input}
            />
            <TextInput
                placeholder="Ngày bắt đầu (YYYY-MM-DD)"
                value={ngayBatDau}
                onChangeText={setNgayBatDau}
                style={styles.input}
            />
            <TextInput
                placeholder="Ngày kết thúc (YYYY-MM-DD)"
                value={ngayKetThuc}
                onChangeText={setNgayKetThuc}
                style={styles.input}
            />
            <Text style={{ fontSize: 18 }}>Số lượng: </Text>
            <TextInput
                keyboardType="numeric"
                value={soLuong.toString()}
                onChangeText={(text) => setSoLuong(Number(text))}
                style={styles.input}
            />
            <Text style={{ fontSize: 18 }}>Điểm tối đa: </Text>
            <TextInput
                placeholder="Điểm tối đa"
                keyboardType="numeric"
                value={diemToiDa.toString()}
                onChangeText={(text) => setDiemToiDa(Number(text))}
                style={styles.input}
            />



            {/* Chọn danh mục */}
            <Text style={{ marginVertical: 10 }}>Chọn danh mục:</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Picker
                    selectedValue={selectedCategory}
                    onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Chọn danh mục" value={null} />
                    {categories.map((category) => (
                        <Picker.Item key={category.id} label={category.name} value={category.id} />
                    ))}
                </Picker>
            )}

            {/* Chọn tag */}
            <Text style={{ marginVertical: 10 }}>Chọn tag:</Text>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Picker
                    selectedValue={selectedTag}
                    onValueChange={(itemValue) => setSelectedTag(itemValue)}
                    style={styles.picker}
                >
                    <Picker.Item label="Chọn tag" value={null} />
                    {tags.map((tag) => (
                        <Picker.Item key={tag.id} label={tag.name} value={tag.id} />
                    ))}
                </Picker>
            )}

            {/* Chọn ảnh */}
            <TouchableOpacity onPress={pickImage}>
                <Text>Chọn ảnh</Text>
            </TouchableOpacity>
            {hinhAnh && <Image source={{ uri: hinhAnh.uri }} style={styles.image} />}

            {/* Nút tạo hoạt động */}
            <Button title="Tạo hoạt động" onPress={handleTaoHoatDong} />
        </KeyboardAwareScrollView>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
    },
    picker: {
        height: 60,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 20,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 10,
    },
    scrollViewContent: {
        paddingBottom: 20,
    }
});

export default TroLySV_TaoHoatDong;
