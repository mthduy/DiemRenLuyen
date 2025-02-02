// CTSV.js
import React from 'react';
import { View, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const CTSV = () => {
  const navigation = useNavigation();

  return (
    <View>
      <Button
        title="Thêm tài khoản Trợ lý"
        onPress={() => navigation.navigate("home", { screen: 'CTSV_addaccount' })}
 // Điều hướng tới màn hình CTSV_addaccount
      />
      <Button
        title="Xem thống kê điểm rèn luyện"
        onPress={() => navigation.navigate("home", { screen: 'CTSV_report' })}  
      />
    </View>
  );
};

export default CTSV;
