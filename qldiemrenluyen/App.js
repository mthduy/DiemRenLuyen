import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from './components/Home/Home';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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


const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator  screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" component={Home} />
      <Stack.Screen name="SinhVien" component={SinhVien} />
      <Stack.Screen name="CTSV" component={CTSV} />
      <Stack.Screen name="TroLySV" component={TroLySV} />
      <Stack.Screen name="profile" component={UserProfile} />
      
    </Stack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user = useContext(MyUserContext); // Lấy thông tin người dùng từ context

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="home"
        component={StackNavigator}
        options={{ title: "Màn hình chính", tabBarIcon: () => <Icon source="home-account" size={20} /> }}
      />

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
          <TabNavigator />
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </NavigationContainer>
  );
}
