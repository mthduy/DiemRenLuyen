import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './components/Home/Home';
import Login from './components/User/Login';
import Register from './components/User/Register';
import { Icon } from 'react-native-paper';
import { MyDispatchContext, MyUserContext } from './configs/MyUserContext';
import { useContext, useReducer } from 'react';
import MyUserReducers from './configs/MyUserReducers';
import UserProfile from './components/User/Profile';
import SinhVien from './components/User/SinhVien';
import CTSV from './components/User/CTSV';
import TroLySV from './components/User/TroLySV';
import CTSV_addaccount from './components/User/CTSV_addaccount';
import CTSV_report from './components/User/CTSV_report';
import SinhVien_XemHĐ from './components/User/SinhVien_XemHĐ';
import TroLySV_XemThanhTich from './components/User/TroLySV_XemThanhTich';
import TroLySV_XemBaoThieu from './components/User/TroLySV_XemBaoThieu';
import TroLySV_XacNhanDiem from './components/User/TroLySV_XacNhanDiem';
import TroLySV_TaoHoatDong from './components/User/TroLySV_TaoHoatDong';
import TroLySV_NapDanhSachCSV from './components/User/TroLySV_NapDanhSachCSV';
import BanTin from './components/User/BanTin';

const Stack = createNativeStackNavigator();

// Tạo StackNavigator cho các màn hình như CTSV, SinhVien, TroLySV và CTSV_addaccount
const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" component={Home} />
      <Stack.Screen name="SinhVien" component={SinhVien} />
      <Stack.Screen name="SinhVien_XemHĐ" component={SinhVien_XemHĐ} />
      <Stack.Screen name="CTSV" component={CTSV} />
      <Stack.Screen name="CTSV_addaccount" component={CTSV_addaccount} />
      <Stack.Screen name="CTSV_report" component={CTSV_report} />
      <Stack.Screen name="TroLySV" component={TroLySV} />
      <Stack.Screen name="TroLySV_XemThanhTich" component={TroLySV_XemThanhTich} />
      <Stack.Screen name="TroLySV_XemBaoThieu" component={TroLySV_XemBaoThieu} />
      <Stack.Screen name="TroLySV_XacNhanDiem" component={TroLySV_XacNhanDiem} />
      <Stack.Screen name="TroLySV_TaoHoatDong" component={TroLySV_TaoHoatDong} />
      <Stack.Screen name="TroLySV_NapDanhSachCSV" component={TroLySV_NapDanhSachCSV} />
      <Stack.Screen name="BanTin" component={BanTin} />
      <Stack.Screen name="profile" component={UserProfile} />

    
    </Stack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

// TabNavigator sẽ bao gồm StackNavigator để cho phép điều hướng giữa các màn hình
const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="home"
        component={StackNavigator} // Lồng StackNavigator vào TabNavigator
        options={{ title: "Màn hình chính", tabBarIcon: () => <Icon source="home-account" size={20} /> }}
      />

       {/* Chỉ hiển thị tab Bảng tin nếu người dùng đã đăng nhập */}
       {user !== null && (
        <Tab.Screen
          name="BanTin"
          component={BanTin}
          options={{ title: "Bảng tin", tabBarIcon: () => <Icon source="newspaper" size={20} /> }}
        />
      )}

      {user === null ? (
        <>
          <Tab.Screen
            name="login"
            component={Login}
            options={{ title: "Đăng nhập", tabBarIcon: () => <Icon source="account-check" size={20} /> }}
          />
          <Tab.Screen
            name="register"
            component={Register}
            options={{ title: "Đăng ký", tabBarIcon: () => <Icon source="account-plus" size={20} /> }}
          />
        </>
      ) : (
        <>
          {user.role === "student" && (
            <Tab.Screen
              name="SinhVien"
              component={SinhVien}
              options={{ title: "Sinh viên", tabBarIcon: () => <Icon source="school" size={20} /> }}
            />
          )}
          {user.role === "admin" && (
            <Tab.Screen
              name="CTSV"
              component={CTSV}
              options={{ title: "Chuyên viên CTSV", tabBarIcon: () => <Icon source="account-tie" size={20} /> }}
            />
          )}
          {user.role === "staff" && (
            <Tab.Screen
              name="TroLySV"
              component={TroLySV}
              options={{ title: "Trợ lý", tabBarIcon: () => <Icon source="briefcase" size={20} /> }}
            />
          )}
          <Tab.Screen
            name="profile"
            component={UserProfile}
            options={{ title: "Tài khoản", tabBarIcon: () => <Icon source="account-check" size={20} /> }}
          />
        </>
      )}
    </Tab.Navigator>
  );
};

export default function App() {
  const [user, dispatch] = useReducer(MyUserReducers, null);

  return (
    <NavigationContainer>
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <TabNavigator /> {/* Lồng TabNavigator vào App */}
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}
