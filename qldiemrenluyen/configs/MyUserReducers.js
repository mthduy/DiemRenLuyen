const MyUserReducers = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { ...action.payload }; // Cập nhật thông tin user
    case "LOGOUT":
      return null; // Xóa thông tin user khi đăng xuất
    default:
      return state;
  }
};

export default MyUserReducers;
