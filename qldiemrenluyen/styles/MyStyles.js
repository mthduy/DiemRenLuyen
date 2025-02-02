import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        // justifyContent: "center",
        // alignItems: "center"
    }, row: {
        flexDirection: "row",
        flexWrap: "wrap"
    }, margin: {
        margin: 5
    }, subject: {
        fontSize: 25,
        color: "blue",
        fontWeight: "bold"
    }, box: {
        width: 80,
        height: 80,
        borderRadius: 10
    },
    activityContainer: {
    marginBottom: 20,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  buttonContainer: {
    flexDirection: 'row',         // Các nút sẽ nằm ngang
    justifyContent: 'space-around', // Căn giữa các nút
    alignItems: "center",
    marginVertical: 10,
    width: "100%",
    flexWrap: 'nowrap',
  },
  registerButton: {
    color: '#007bff',
    fontSize: 16,
    width: "35%",
  },
  likeButton: {
    color: '#ff4500',
    fontSize: 16,
    width: "30%",
  },
  commentButton: {
    padding: 10,
  backgroundColor: "#32cd32",
  borderRadius: 5,
  alignItems: "center",
  justifyContent: "center",
  minWidth: 100,  // Đảm bảo kích thước nút
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    maxHeight: 250,  // Giới hạn chiều cao modal
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",  // Giúp modal không bị kéo dài
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",  // Căn nút Gửi - Hủy 2 bên
    width: "100%",
    marginTop: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  
  cancelButton: {
    padding: 10,
    backgroundColor: "#ff4500",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100,  // Đảm bảo kích thước nút
  },
  
})