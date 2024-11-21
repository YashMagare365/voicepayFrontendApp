import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { ref, set } from "firebase/database";
import { db } from "../config";
import axios from "axios";

const RAZORPAY_KEY = "rzp_test_TuFO3qxUo5AFOO";
const RAZORPAY_SECRET_KEY = "vPZtgdvIWyOs32sZe21ubCXC";

const SignUpScreen = ({ navigation }: any) => {
  const [userName, setUserName] = useState("");
  const [userIFSC, setUserIFSC] = useState("");
  const [vpa, setVpa] = useState("");
  const [phoneNO, setPhoneNo] = useState("");
  const [accountNO, setAccountNo] = useState("");

  const dataAddOn = async () => {
    try {
      const response: any = await axios.post(
        "https://api.razorpay.com/v1/contacts",
        {
          name: userName,
          contact: phoneNO,
          type: "customer",
        },
        {
          auth: { username: RAZORPAY_KEY, password: RAZORPAY_SECRET_KEY },
        }
      );

      const contactId = response.data.id;
      const response2: any = await axios.post(
        "https://api.razorpay.com/v1/fund_accounts",
        {
          contact_id: contactId,
          account_type: "bank_account",
          bank_account: {
            name: userName,
            ifsc: userIFSC,
            account_number: accountNO,
          },
        },
        {
          auth: { username: RAZORPAY_KEY, password: RAZORPAY_SECRET_KEY },
        }
      );

      const response3: any = await axios.post(
        "https://api.razorpay.com/v1/fund_accounts",
        {
          contact_id: contactId,
          account_type: "vpa",
          vpa: { address: vpa },
        },
        {
          auth: { username: RAZORPAY_KEY, password: RAZORPAY_SECRET_KEY },
        }
      );

      await set(ref(db, "user/" + accountNO), {
        userName,
        phoneNO,
        accountNO,
        IFSC: userIFSC,
        vpa,
        contactId,
        fundUpiId: response3.data.id,
        fundBankId: response2.data.id,
      });

      Alert.alert("Sign Up Successful", "Your account has been created!");
      navigation.goBack();
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Sign Up Failed", "An error occurred. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        onChangeText={(text) => setUserName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="IFSC"
        onChangeText={(text) => setUserIFSC(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="vpa: example@bankname"
        onChangeText={(text) => setVpa(text)}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Phone Number"
        onChangeText={(text) => setPhoneNo(text)}
      />
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Account Number"
        onChangeText={(text) => setAccountNo(text)}
      />
      <Pressable style={styles.button} onPress={dataAddOn}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </Pressable>
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </Pressable>
    </View>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  switchText: {
    color: "#2196F3",
    textAlign: "center",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
