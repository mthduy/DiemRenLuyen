import { View,Text, TouchableOpacity, FlatList, RefreshControl, ScrollView } from "react-native"
import MyStyles from "../../styles/MyStyles"
import { useEffect, useState } from "react"
import APIs, { endpoints } from "../../configs/APIs";
import { ActivityIndicator, Chip, List, Searchbar } from "react-native-paper";
import Items from "./Items";
import { Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Home = ()=>{

    const [activities, setActivities]= useState([]); 
    const [categories, setCategories] =useState([]);
    const [loading, setLoading] = useState(false);
    const [cateId, setCateId] = useState("");
    const [page, setPage] = useState(1);
    const [q, setQ] =useState("");

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
        if (page > 0) {
            setLoading(true);
    
            try {
                // Lấy token từ AsyncStorage
                const token = await AsyncStorage.getItem('token');
                const headers = token ? { Authorization: `Bearer ${token}` } : {};  // Nếu có token thì thêm vào header
    
                let url = `${endpoints['activities']}?page=${page}`;
    
                // Lọc theo cateId nếu có
                if (cateId) {
                    url = `${url}&category_id=${cateId}`;
                }
    
                if (q) {
                    url = `${url}&q=${q}`;
                }
    
                let res = await APIs.get(url, { headers });
    
                // Cập nhật activities dựa trên trang hiện tại
                setActivities(prevActivities => {
                    if (page > 1) {
                        return [...prevActivities, ...res.data.results]; // Nối thêm dữ liệu trang mới
                    } else {
                        return res.data.results; // Dữ liệu mới từ trang đầu tiên
                    }
                });
    
                // Kiểm tra nếu không còn trang tiếp theo
                if (!res.data.next) { // Nếu không có trang tiếp theo
                    setPage(0); // Dừng tải thêm trang
                }
    
            } catch (ex) {
                console.error(ex);
            } finally {
                setLoading(false);
            }
        }
    };
    
    
    
    
    
    
    

     useEffect(() => {
        loadActivities();
    }, [ cateId,page,q]); // Chỉ gọi lại khi `page`, `cateId`, hoặc `q` thay đổi
    

    useEffect(() => {
        loadCates();
    }, []);

    useEffect(() => {
        let timer = setTimeout(() => loadActivities(), 500);

        return () => clearTimeout(timer);
    }, [cateId, page, q]);

    const loadMore = () => {
        if (page > 0 && !loading) {
            setPage(prevPage => {
                const newPage = prevPage + 1;
                loadActivities(); // Gọi lại API để tải trang tiếp theo
                return newPage;
            });
        }
    };
    

    const search = (value, callback) => {
        setPage(1);
        callback(value)
    }

    const refresh = () => {
        setPage(1);
        loadActivities()
    }

    return (
        <View style={MyStyles.container}>
            <Text style={MyStyles.subject}>DANH MỤC CÁC HOẠT ĐỘNG</Text>
            <View style={MyStyles.row}>
            <TouchableOpacity ><Chip style={MyStyles.margin} icon="label" onPress={() => {setCateId(""), setPage(1);  }}>Tất cả</Chip></TouchableOpacity>
            {categories.map(c => <TouchableOpacity onPress={()=>{setCateId(c.id);setPage(1); }}  key={c.id}><Chip style={MyStyles.margin} icon="label" >{c.name}</Chip></TouchableOpacity>)}
            </View>
            
            {/* <Searchbar placeholder="Tìm hoạt động..." value={q} onChangeText={t => search(t, setQ)} /> */}



            <FlatList data={activities} renderItem={({item}) => <List.Item
                                        key={item.id||index} 
                                        title= {item.title}
                                        description={item.description}
                                        left={props => <Image style={MyStyles.box} source={{uri:item.image}} />}
                                    />}
                                    keyExtractor={(item) => item.id.toString()}
                                    onEndReached={loadMore}
                                    />
        </View>
    )
}
export default Home; 
