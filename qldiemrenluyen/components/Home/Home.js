import { View,Text, TouchableOpacity, FlatList, RefreshControl, ScrollView } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Button, Chip, List, Modal, Searchbar, TextInput } from "react-native-paper";
import Items from "./Items";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Home = ()=>{
     const navigation = useNavigation();

    const [activities, setActivities]= useState([]); 
    const [categories, setCategories] =useState([]);
    const [loading, setLoading] = useState(false);
    const [cateId, setCateId] = useState(null);
    const [page, setPage] = useState(1);
    const [q, setQ] =useState("");
    const [commentModal, setCommentModal] = useState(false);
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [isLoggedIn, setIsLoggedIn] = useState(false);


    const loadCates = async () => {
        try {
            let url = endpoints["categories"]; // API để lấy danh mục
            let allCategories = [];
            
            while (url) {
                const res = await APIs.get(url);
                
                // Thêm kết quả từ trang hiện tại vào danh sách
                allCategories = [...allCategories, ...res.data.results];
                
                // Nếu có trang tiếp theo, lấy URL và tiếp tục
                url = res.data.next;
            }
    
            // Cập nhật danh sách categories
            setCategories(allCategories);
        } catch (error) {
            console.error("Lỗi khi tải categories:", error.message);
            setCategories([]); // Gán danh sách rỗng khi lỗi
        }
    };
    
    


    const loadActivities = async () => {
        if (page > 0 && !loading) {
            setLoading(true);
    
            try {
                const token = await AsyncStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
                let url = `${endpoints['activities']}?page=${page}`;
                console.log("API endpoint activities:", endpoints['activities']);
                console.log("Final URL:", url);
    
                if (cateId) {
                    url = `${url}&category_id=${cateId}`;
                }
    
                if (q) {
                    url = `${url}&q=${q}`;
                }
    
                const res = await APIs.get(url, { headers });
    
                console.log("Dữ liệu từ API:", res.data);
    
                // Cập nhật danh sách activities
                setActivities(prevActivities => page > 1 ? [...prevActivities, ...res.data.results] : res.data.results);
    
                // Kiểm tra nếu có trang tiếp theo (next)
                if (res.data.next) {
                    setPage(prevPage => prevPage + 1);  // Tiến đến trang tiếp theo
                } else {
                    setPage(0);  // Không còn dữ liệu, dừng lại và không tải tiếp
                }
    
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        } else {
            // Không còn trang tiếp theo, dừng tải
            console.log("Không còn dữ liệu hoặc đã đạt đến trang cuối cùng.");
        }
    };
    
    
    
    
    

    
   
    


    
    useEffect(() => {
        if (page > 0) {
            console.log("Gọi loadActivities(), page =", page, "cateId =", cateId);
            loadActivities();
        }
    }, [ cateId,page,q]); // Chỉ gọi lại khi `page`, `cateId`, hoặc `q` thay đổi
    

    useEffect(() => {
        loadCates();
    }, []);

    

    const loadMore = () => {
        if (page > 0 && !loading && activities.length > 0) {
            console.log("Đang tải trang:", page + 1);
            loadActivities(); // Chỉ gọi `loadActivities` thay vì tăng `page`
        }
    };
    
    
    

    const search = (value, callback) => {
        setPage(1);
        callback(value)
    }




    const refresh = async () => {
        setLoading(true);  // Hiển thị loading khi refresh
        setPage(1);        // Đặt lại trang đầu tiên mà không làm mất dữ liệu cũ
        
        try {
            // Cập nhật lại activities từ đầu
            const token = await AsyncStorage.getItem('token');
            const headers = token ? { Authorization: `Bearer ${token}` } : {};
            
            let url = `${endpoints['activities']}?page=1`;  // Đặt lại trang đầu tiên
            if (cateId) {
                url = `${url}&category_id=${cateId}`;
            }
            if (q) {
                url = `${url}&q=${q}`;
            }
    
            const res = await APIs.get(url, { headers });
            
            console.log("Dữ liệu mới sau khi refresh:", res.data);
            
            // Cập nhật lại activities với dữ liệu mới
            setActivities(res.data.results);
            
            // Kiểm tra nếu có trang tiếp theo (next)
            if (res.data.next) {
                setPage(prevPage => prevPage + 1);  // Tiến đến trang tiếp theo
            } else {
                setPage(0);  // Không còn dữ liệu, dừng lại và không tải tiếp
            }
        } catch (error) {
            console.error("Lỗi khi refresh:", error);
        } finally {
            setLoading(false);
        }
    };
    
    

    return (
        <View style={MyStyles.container}>
         
            <Text style={MyStyles.subject}>DANH MỤC CÁC HOẠT ĐỘNG</Text>
            <View style={MyStyles.row}>
            <TouchableOpacity ><Chip style={MyStyles.margin} icon="label" onPress={() => {setCateId(null), setPage(1);  }}>Tất cả</Chip></TouchableOpacity>
            {categories.map(c => <TouchableOpacity onPress={()=>{setCateId(c.id);setPage(1); }}  key={c.id}><Chip style={MyStyles.margin} icon="label" >{c.name}</Chip></TouchableOpacity>)}
            </View>
            
            <Searchbar placeholder="Tìm hoạt động..." value={q} onChangeText={t => search(t, setQ)} />



            <FlatList refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} />}
                data={activities} 
                renderItem={({ item }) => (
                    <View style={MyStyles.activityContainer}>
                    <List.Item
                        key={item.id}
                        title={item.title}
                        description={item.description.replace(/<\/?p>/g, '')}
                        left={props => <Image style={MyStyles.box} source={{ uri: item.image }} />}
            />
                

    </View>
  )}
  keyExtractor={(item, index) => `${item.id}-${index}`}

  onEndReached={loadMore}
  onEndReachedThreshold={0.1} 
/>

        </View>
    )
}
export default Home; 