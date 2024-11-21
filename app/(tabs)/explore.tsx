"use client";
import React, { useState } from "react";
import {
  StyleSheet,
  Button,
  Modal,
  Text,
  Pressable,
  View,
  Alert,
} from "react-native";
import Feather from "@expo/vector-icons/Feather";
import ParallaxScrollView from "@/components/ParallaxScrollView";
import { Audio } from "expo-av";
import { set, ref } from "firebase/database";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage"; // For Firebase Storage
import { db, storage } from "../config"; // Firebase config
import { useSelector } from "react-redux";
// import { speak } from "expo-speech";
import * as Speech from "expo-speech";

export default function TabTwoScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [recording, setRecording] = useState(null); // For managing the recording
  const [audioUri, setAudioUri] = useState(null); // To store the URI of the recorded audio
  const data = useSelector((state: any) => state.user);
  console.log("REDUX DATA =====>", data);
  // Function to start recording
  const startRecording = async () => {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();

      console.log("Starting recording..");
      console.log("data=", data);
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY // Use the default high-quality preset
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording:", err);
    }
  };

  // Function to stop recording
  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); // Get URI of the recorded audio
    setAudioUri(uri);
    console.log("Recording stopped and stored at:", uri);

    // Now upload the recorded audio to Firebase Storage
    uploadToFirebase(uri);
  };

  // Function to upload recorded audio to Firebase Storage
  const uploadToFirebase = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob(); // Convert file to blob format
      const tempval = Date.now();

      const metadata = {
        contentType: "audio/wav",
      };
      const storageReference = storageRef(
        storage,
        `voice-recordings/${tempval}.wav`
      );
      const uploadTask = uploadBytesResumable(storageReference, blob, metadata);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("Error during upload:", error);
        },
        async () => {
          // File uploaded successfully, get the download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          set(ref(db, "user/5225225225"), {
            audioFileUrl: tempval,
          });
          console.log("File available at:", downloadURL);
          Alert.alert("Upload Successful", `File available at: ${downloadURL}`);
        }
      );
    } catch (error) {
      console.error("Failed to upload audio file:", error);
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#F7F3DE", dark: "#353636" }}
      headerImage={
        <Feather
          size={310}
          name="mic"
          color={"#F7F3DE"}
          style={styles.headerImage}
        />
      }
    >
      <Button
        color={"#EDE0AB"}
        onPress={() => {
          Speech.speak(
            "please speak something for 30 sec for getting a sample of your voice after pressing the button"
          );
          setModalVisible(true);
        }}
        title="Add Voice"
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalOverlay}>
          <Text style={styles.titleContainer}>
            Tap mic to record and save Voice credentials
          </Text>
          <Pressable
            onPress={async () => {
              if (!recording) {
                await startRecording(); // Start recording
              } else {
                await stopRecording(); // Stop recording
              }
            }}
          >
            <Feather size={200} name="mic" style={styles.micbtn} />
            <Text>{recording ? "Recording..." : "Tap to Record"}</Text>
          </Pressable>
        </View>
      </Modal>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#EDE0AB",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  micbtn: {
    backgroundColor: "#EDE0AB",
    borderRadius: 100,
    justifyContent: "center",
    padding: 10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
