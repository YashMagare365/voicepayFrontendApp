// import React, { useEffect, useState } from "react";
// import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
// import { Audio } from "expo-av";
// // import {
// //   useAudioRecorder,
// //   RecordingOptions,
// //   AudioModule,
// //   RecordingPresets,
// // } from "expo-audio";
// import {
//   ref as storageRef,
//   uploadBytesResumable,
//   getDownloadURL,
// } from "firebase/storage";
// import { getDatabase, set, ref, update } from "firebase/database";
// // import RazorpayCheckout from 'react-native-razorpay';
// import { nanoid } from "nanoid";
// import { useSelector } from "react-redux";
// import Feather from "@expo/vector-icons/Feather";
// import * as LocalAuthentication from "expo-local-authentication";
// // import { updateAccountNo } from '@/redux/slices/UserSlice';
// import * as Speech from "expo-speech";
// import { db, storage } from "../config";

// const Pay = () => {
//   const [recording, setRecording] = useState(null);
//   const [audioUri, setAudioUri] = useState(null);
//   const [isBiometricSupported, setIsBiometricSupported] = useState(false);

//   useEffect(() => {
//     (async () => {
//       const compatible = await LocalAuthentication.hasHardwareAsync();
//       setIsBiometricSupported(compatible);
//     })();
//   });

//   const Presets = (Audio.RecordingOptionsPresets.HIGH_QUALITY = {
//     android: {
//       extension: ".wav",
//       outputFormat: Audio.AndroidOutputFormat.DEFAULT,
//       audioEncoder: Audio.AndroidAudioEncoder.AMR_NB,
//       sampleRate: 16000, // Ensure sample rate is 16,000 Hz
//       numberOfChannels: 1, // Mono recording
//       bitRate: 256000, // Note: Expo doesn't directly allow setting ByteRate, but this value influences it
//     },
//     ios: {
//       extension: ".wav",
//       audioQuality: Audio.IOSAudioQuality.HIGH,
//       sampleRate: 16000, // Ensure sample rate is 16,000 Hz
//       numberOfChannels: 1, // Mono recording
//       bitRate: 256000,
//       linearPCMBitDepth: 16, // Ensure 16-bit PCM
//       linearPCMIsBigEndian: false,
//       linearPCMIsFloat: false,
//     },
//     web: {
//       mimeType: "audio/wav",
//       bitsPerSecond: 128000,
//     },
//   });

//   const fallBackToDefaultAuth = () => {
//     console.log("fall back to passwordauthentication");
//   };

//   const handleBiometricAuth = async () => {
//     const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
//     if (!isBiometricAvailable) {
//       Speech.speak("Biometric not supported...please enter your password");
//       return;
//     }
//     let supportedBiometrics;
//     if (isBiometricAvailable) {
//       supportedBiometrics =
//         await LocalAuthentication.supportedAuthenticationTypesAsync();
//     }

//     const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

//     if (!savedBiometrics) {
//       Speech.speak("Biometric data not found");
//       return;
//     }

//     const biometricAuth = await LocalAuthentication.authenticateAsync({
//       promptMessage: "Login With Biometrics",
//       cancelLabel: "cancel",
//       disableDeviceFallback: true,
//     });
//     // if(biometricAuth){}
//     console.log(biometricAuth);
//     console.log(savedBiometrics);
//     console.log(supportedBiometrics);
//     console.log(isBiometricAvailable);
//   };

//   const data = useSelector((state) => state.user);
//   // const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

//   const startRecording = async () => {
//     try {
//       console.log("Requesting permissions..");
//       await Audio.requestPermissionsAsync();
//       // const record = () => audioRecorder.record();
//       console.log("Starting recording..");
//       console.log("data=", data);
//       // const recording = await Audio.Recording.createAsync({
//       //   android: {
//       //     extension: ".wav",
//       //     outputFormat: Audio.AndroidOutputFormat.WEBM,
//       //     audioEncoder: Audio.AndroidAudioEncoder.AAC,
//       //     sampleRate: 44100,
//       //     numberOfChannels: 1,
//       //     bitRate: 128000,
//       //   },
//       //   ios: {
//       //     extension: ".wav",
//       //     audioQuality: Audio.IOSAudioQuality.HIGH,
//       //     sampleRate: 44100,
//       //     numberOfChannels: 2,
//       //     bitRate: 128000,
//       //     linearPCMBitDepth: 16,
//       //     linearPCMIsBigEndian: false,
//       //     linearPCMIsFloat: false,
//       //   },
//       //   web: {
//       //     mimeType: "audio/wav",
//       //     bitsPerSecond: 128000,
//       //   },
//       // });

//       const { recording } = await Audio.Recording.createAsync(
//         Audio.RecordingOptionsPresets.HIGH_QUALITY
//       );

//       console.log(recording);
//       setRecording(recording);
//       console.log("Recording started");
//     } catch (err) {
//       console.error("Failed to start recording:", err);
//     }
//   };

//   const stopRecording = async () => {
//     console.log("Stopping recording..");
//     setRecording(null);
//     // await audioRecorder.stop();
//     await recording.stopAndUnloadAsync();
//     const uri = recording.getURI(); // Get URI of the recorded audio
//     setAudioUri(uri);
//     console.log("Recording stopped and stored at:", uri);
//     handleBiometricAuth();

//     // Now upload the recorded audio to Firebase Storage
//     uploadToFirebase(uri);
//   };

//   const uploadToFirebase = async (uri) => {
//     try {
//       const response = await fetch(uri);
//       const blob = await response.blob(); // Convert file to blob format
//       const tempval = Date.now();

//       const storageReference = storageRef(
//         storage,
//         `voice-recordings/${tempval}.wav`
//       );
//       const metadata = {
//         contentType: "audio/wav",
//       };
//       const uploadTask = uploadBytesResumable(storageReference, blob, metadata);

//       uploadTask.on(
//         "state_changed",
//         (snapshot) => {
//           const progress =
//             (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
//           console.log(`Upload is ${progress}% done`);
//         },
//         (error) => {
//           console.error("Error during upload:", error);
//         },
//         async () => {
//           // File uploaded successfully, get the download URL
//           const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
//           set(ref(db, "user/5225225225"), {
//             tempAudioUrl: downloadURL,
//           });
//           console.log("File available at:", downloadURL);
//           Alert.alert("Upload Successful", `File available at: ${downloadURL}`);
//         }
//       );
//     } catch (error) {
//       console.error("Failed to upload audio file:", error);
//     }
//   };

//   // const updateTempAudioUrl = async (url) => {
//   //   try {
//   //     const db = getDatabase();
//   //     const userRef = dbRef(db, `user/5225225225`);
//   //     await update(userRef, { tempAudioUrl: url });
//   //     console.log("Updated tempAudioUrl in Firebase Realtime Database");
//   //   } catch (error) {
//   //     console.error("Error updating tempAudioUrl:", error);
//   //   }
//   // };

//   const initiatePayout = () => {
//     // Your Razorpay payout code here
//   };

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
//         <Feather size={100} name="mic" style={styles.micbtn} />
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default Pay;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   recordButton: {
//     width: 80,
//     height: 80,
//     borderRadius: 40,
//     // backgroundColor: "#EDE0AB",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   recordButtonText: {
//     color: "#fff",
//   },
//   micbtn: {
//     backgroundColor: "#EDE0AB",
//     borderRadius: 100,
//     justifyContent: "center",
//     padding: 10,
//   },
// });

import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Alert } from "react-native";
import { Audio } from "expo-av";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { getDatabase, set, ref, update } from "firebase/database";
// import RazorpayCheckout from 'react-native-razorpay';
import { nanoid } from "nanoid";
import { useSelector } from "react-redux";
import Feather from "@expo/vector-icons/Feather";
import * as LocalAuthentication from "expo-local-authentication";
// import { updateAccountNo } from '@/redux/slices/UserSlice';
import * as Speech from "expo-speech";
import { db, storage } from "../config";

const Pay = () => {
  const [recording, setRecording] = useState(null);
  const [audioUri, setAudioUri] = useState(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);

  useEffect(() => {
    (async () => {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
    })();
  });

  const fallBackToDefaultAuth = () => {
    console.log("fall back to passwordauthentication");
  };

  const handleBiometricAuth = async () => {
    const isBiometricAvailable = await LocalAuthentication.hasHardwareAsync();
    if (!isBiometricAvailable) {
      Speech.speak("Biometric not supported...please enter your password");
      return;
    }
    let supportedBiometrics;
    if (isBiometricAvailable) {
      supportedBiometrics =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
    }

    const savedBiometrics = await LocalAuthentication.isEnrolledAsync();

    if (!savedBiometrics) {
      Speech.speak("Biometric data not found");
      return;
    }

    const biometricAuth = await LocalAuthentication.authenticateAsync({
      promptMessage: "Login With Biometrics",
      cancelLabel: "cancel",
      disableDeviceFallback: true,
    });
    // if(biometricAuth){}
    console.log(biometricAuth);
    console.log(savedBiometrics);
    console.log(supportedBiometrics);
    console.log(isBiometricAvailable);
  };

  const data = useSelector((state) => state.user);

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

  const stopRecording = async () => {
    console.log("Stopping recording..");
    setRecording(null);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI(); // Get URI of the recorded audio
    setAudioUri(uri);
    console.log("Recording stopped and stored at:", uri);
    handleBiometricAuth();

    // Now upload the recorded audio to Firebase Storage
    uploadToFirebase(uri);
  };

  const uploadToFirebase = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob(); // Convert file to blob format
      const tempval = Date.now();

      const storageReference = storageRef(
        storage,
        `voice-recordings/${tempval}.wav`
      );
      const metadata = {
        contentType: "audio/wav",
      };
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
            tempAudioUrl: tempval,
          });
          console.log("File available at:", downloadURL);
          Alert.alert(
            "Upload Successful",
            ` File available at: ${downloadURL}`
          );
        }
      );
    } catch (error) {
      console.error("Failed to upload audio file:", error);
    }
  };

  // const updateTempAudioUrl = async (url) => {
  //   try {
  //     const db = getDatabase();
  //     const userRef = dbRef(db, user/5225225225);
  //     await update(userRef, { tempAudioUrl: url });
  //     console.log("Updated tempAudioUrl in Firebase Realtime Database");
  //   } catch (error) {
  //     console.error("Error updating tempAudioUrl:", error);
  //   }
  // };

  const initiatePayout = () => {
    // Your Razorpay payout code here
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
        <Feather size={100} name="mic" style={styles.micbtn} />
      </TouchableOpacity>
    </View>
  );
};

export default Pay;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor: "#EDE0AB",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonText: {
    color: "#fff",
  },
  micbtn: {
    backgroundColor: "#EDE0AB",
    borderRadius: 100,
    justifyContent: "center",
    padding: 10,
  },
});
