import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; // Thêm icon nút trở về
import { Picker } from '@react-native-picker/picker';

const ChatScreen = ({ navigation }) => {
    const [departments, setDepartments] = useState([]);
    const [students, setStudents] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [selectedAssistant, setSelectedAssistant] = useState(null);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [role, setRole] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);

    // Lấy thông tin người dùng hiện tại
    const fetchUserRole = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://dinhtien.pythonanywhere.com/users/current-user', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRole(response.data.role);
            setCurrentUser(response.data);
        } catch (error) {
            console.error("Lỗi khi lấy thông tin người dùng:", error);
        }
    };

    // Lấy danh sách sinh viên đã nhắn tin
    const fetchStudents = async () => {
        if (role !== 'staff' && role !== 'admin') return;
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://dinhtien.pythonanywhere.com/message/get-sent-students', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStudents(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách sinh viên:", error);
        }
    };

    // Lấy danh sách khoa
    const fetchDepartments = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get('https://dinhtien.pythonanywhere.com/department/list', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDepartments(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách khoa:", error);
        }
    };

    // Lấy danh sách staff theo khoa đã chọn
    const fetchStaffList = async (departmentId) => {
        if (!departmentId) return;
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(`https://dinhtien.pythonanywhere.com/users/staff-by-department?department_id=${departmentId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setStaffList(response.data);
        } catch (error) {
            console.error("Lỗi khi tải danh sách staff:", error);
        }
    };

    // Lấy tin nhắn giữa người dùng và người được chọn
    const fetchMessages = async () => {
        if (!selectedAssistant) return;
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get(
                `https://dinhtien.pythonanywhere.com/message/list?receiver_id=${selectedAssistant.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setMessages(response.data);
        } catch (error) {
            console.error("Lỗi khi tải tin nhắn:", error);
        }
    };

    // Gửi tin nhắn
    const sendMessage = async () => {
        if (!message.trim() || !selectedAssistant) return;
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.post(
                'https://dinhtien.pythonanywhere.com/message/create/',
                {
                    receiver_id: selectedAssistant.id,
                    content: message,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.success) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    {
                        sender: currentUser?.id,
                        receiver: selectedAssistant.id,
                        content: message,
                        timestamp: new Date().toISOString(),
                    },
                ]);
                setMessage('');
            }
        } catch (error) {
            console.error("Lỗi khi gửi tin nhắn:", error);
        }
    };

    useEffect(() => {
        fetchUserRole();
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (role === 'staff' || role === 'admin') {
            fetchStudents();
        } else if (role === 'student' && selectedDepartment) {
            fetchStaffList(selectedDepartment);
        }
    }, [role, selectedDepartment]);

    useEffect(() => {
        fetchMessages();
    }, [selectedAssistant]);

    return (
        <View style={styles.container}>
            {!selectedAssistant ? (
                role === 'staff' || role === 'admin' ? (
                    <>
                        <Text style={styles.title}>Danh sách sinh viên đã gửi tin nhắn</Text>
                        <FlatList
                            data={role === 'student' ? staffList : students}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.item} onPress={() => setSelectedAssistant(item)}>
                                    <Text>{item.username}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.title}>Chọn khoa và trợ lý</Text>
                        {/* Chọn khoa */}
                        <Picker
                            selectedValue={selectedDepartment}
                            onValueChange={(itemValue) => {
                                setSelectedDepartment(itemValue);
                                setSelectedAssistant(null); // Reset trợ lý khi thay đổi khoa
                                fetchStaffList(itemValue); // Tải lại danh sách staff theo khoa
                            }}
                            style={styles.picker}
                        >
                            <Picker.Item label="Chọn khoa" value={null} />
                            {departments.map((department) => (
                                <Picker.Item key={department.id} label={department.name} value={department.id} />
                            ))}
                        </Picker>

                        {/* Chọn trợ lý */}
                        <Picker
                            selectedValue={selectedAssistant}
                            onValueChange={(itemValue) => setSelectedAssistant(itemValue)}
                            style={styles.picker}
                            enabled={selectedDepartment !== null}
                        >
                            <Picker.Item label="Chọn trợ lý" value={null} />
                            {staffList.map((assistant) => (
                                <Picker.Item key={assistant.id} label={assistant.username} value={assistant} />
                            ))}
                        </Picker>
                    </>
                )
            ) : (
                <View style={styles.chatContainer}>
                    {/* Nút trở về */}
                    <TouchableOpacity onPress={() => setSelectedAssistant(null)} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="black" />
                        <Text style={styles.backText}>Trở về</Text>
                    </TouchableOpacity>

                    {/* Tin nhắn */}
                    <FlatList
                        data={(messages || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))}
                        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                        renderItem={({ item }) => {
                            const isSentByUser = item.sender === currentUser?.id;
                            const formattedDate = new Date(item.timestamp).toLocaleDateString();
                            const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                            return (
                                <View style={isSentByUser ? styles.sentMessage : styles.receivedMessage}>
                                    <Text>{item.content}</Text>
                                    <Text style={styles.timestamp}>{formattedDate} - {formattedTime}</Text>
                                </View>
                            );
                        }}
                        contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}
                    />

                    {/* Ô nhập tin nhắn */}
                    <TextInput
                        value={message}
                        onChangeText={setMessage}
                        placeholder="Nhập tin nhắn..."
                        style={styles.input}
                    />
                    <Button title="Gửi" onPress={sendMessage} />
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f9f9f9' },
    title: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    item: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc' },
    chatContainer: { flex: 1, padding: 10 },
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    backText: { marginLeft: 5, fontSize: 16 },
    input: { height: 40, borderColor: '#ccc', borderWidth: 1, marginBottom: 10, paddingHorizontal: 8, borderRadius: 5 },
    sentMessage: { alignSelf: 'flex-end', backgroundColor: '#e1ffc7', padding: 10, borderRadius: 10, marginBottom: 10 },
    receivedMessage: { alignSelf: 'flex-start', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10 },
    timestamp: { fontSize: 12, color: '#888', marginTop: 5 },
});

export default ChatScreen;
