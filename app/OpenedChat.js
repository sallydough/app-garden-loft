import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import TextComponent from "./Text"; // Import your TextComponent here

const OpenChat = ({ friendId, friendName }) => {
  const [modalVisible, setModalVisible] = useState(true);
  const router = useRouter();
  const textComponentRef = useRef(null); // Ref for TextComponent

  // useEffect(() => {
  //   // Ensure it scrolls to the bottom when the modal is first displayed
  //   if (modalVisible && textComponentRef.current) {
  //     textComponentRef.current.scrollToEnd();
  //   }
  // }, [modalVisible]);

  return (
    <View style={styles.container}>
      {/* Modal to display TextComponent */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible(false);
        }}
        transparent={false} // Optional: Set to true for a semi-transparent modal
      >
        <View style={styles.modalContainer}>
        <KeyboardAvoidingView
    style={styles.modalContainer}
    behavior={Platform.OS === "ios" ? "padding" : ""}
  >
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            {/* <Text style={styles.modalTitle}>{friendName}'s Chat</Text> */}
            <Text style={styles.modalTitle}></Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                router.push("/home");
              }}
              style={styles.closeButton}
            >
              <FontAwesome name="times" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* TextComponent inside the modal */}
          <View style={styles.chatContainer}>
            
            <TextComponent friendId={friendId} friendName={friendName} />
          
          </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  openChatButton: {
    backgroundColor: "#f3b718",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  openChatButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#f3b718",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
  },
  closeButton: {
    padding: 15,
    marginTop: 20,
  },
  chatContainer: {
    flex: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
});

export default OpenChat;

