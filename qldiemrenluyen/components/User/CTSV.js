// CTSV.js
import React from 'react';
import { View, Button, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Sử dụng icon từ MaterialIcons

const CTSV = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Trang Chức Năng Chuyên Viên</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Thêm tài khoản Trợ lý"
          onPress={() => navigation.navigate("home", { screen: 'CTSV_addaccount' })}
          color="#4CAF50" // Màu xanh lá cho nút thêm tài khoản
          icon={<Icon name="person-add" size={20} color="white" />} // Thêm icon "person-add"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Xem thống kê điểm rèn luyện"
          onPress={() => navigation.navigate("home", { screen: 'CTSV_report' })}
          color="#2196F3" // Màu xanh dương cho nút thống kê
          icon={<Icon name="insert-chart" size={20} color="white" />} // Thêm icon "insert-chart"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f9',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  buttonContainer: {
    marginVertical: 15,
    width: '100%',
    paddingHorizontal: 20,
  }
});

export default CTSV;
