"use client";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  Modal,
  TouchableOpacity,
  Pressable,
} from "react-native";
// @ts-ignore
import RazorpayCheckout from "react-native-razorpay";
import * as Speech from "expo-speech";
import axios from "axios";
import { db } from "../config";
import { ref, set, onValue } from "firebase/database";
import { useSelector, useDispatch } from "react-redux";
import {
  updateName,
  updateAccountNo,
  updatePhoneNO,
  LogIn,
  LogOut,
} from "../../redux/slices/UserSlice";

const RAZORPAY_KEY = "rzp_test_TuFO3qxUo5AFOO";
const RAZORPAY_SECRET_KEY = "vPZtgdvIWyOs32sZe21ubCXC";
const VOICEPAY_BACKEND = "https://voicepaybackend.onrender.com";
console.log("Backend URL:", VOICEPAY_BACKEND);
console.log("rzp key:", RAZORPAY_KEY);

const TabThreeScreen = () => {
  const dispatch = useDispatch();
  const [userData, setUserData] = React.useState({});
  const [accountNO, setAccountNo] = React.useState("");
  const [phoneNO, setPhoneNo] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [userIFSC, setUserIFSC] = React.useState("");
  const [vpa, setVpa] = React.useState("");
  const [balance, setBalance] = React.useState(0);
  const [currentbalance, setcurrentBalance] = React.useState(0);
  const [orderId, setOrderId] = React.useState("");
  const [modalVisible, setModalVisible] = React.useState(false); // Control modal visibility
  const [isLogin, setIsLogin] = React.useState(true); // Toggle between login and signup views

  const fetchOrder = async () => {
    try {
      const response = await axios.post(
        `${VOICEPAY_BACKEND}/deposit/${balance}`,
        {
          amount: balance,
          currency: "INR",
        }
      );
      console.log("response = ", response);
      if (response.data.order_id) {
        setOrderId(response.data.order_id);
        initiatePayment(response.data.order_id, response.data.amount);
      } else {
        console.error("Failed to create order:", response.data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const initiatePayment = (orderId: any, amount: any) => {
    console.log("voicepay initiating payment");
    const options = {
      description: "Depositing money for voice payments",
      currency: "INR",
      key: RAZORPAY_KEY,
      amount: `${amount}`,
      name: "Yash Magare",
      order_id: orderId,
      prefill: {
        email: "gaurav.kumar@example.com",
        contact: "9191919191",
        name: "Gaurav Kumar",
      },
      theme: { color: "#53a20e" },
    };

    RazorpayCheckout.open(options)
      .then((data: any) => {
        Alert.alert("Success", `Payment ID: ${data.razorpay_payment_id}`);
        setcurrentBalance(currentbalance + balance);

        // Add speech output on successful payment
        Speech.speak("Money successfully deposited in your wallet.");
      })
      .catch((error: any) => {
        Alert.alert("Error", `Error: ${error.code} | ${error.description}`);
        console.error("Error:", error);

        // Add speech output on failed payment
        Speech.speak("Payment failed. Please try again.");
      });
  };

  const dataAddOn = async () => {
    try {
      const response: any = await axios.post(
        "https://api.razorpay.com/v1/contacts",
        {
          name: userName,
          email: "gauravkumar@example.com",
          contact: phoneNO,
          type: "customer",
          reference_id: "Acme Contact ID 12345",
          notes: {
            random_key_1: "Make it so.",
            random_key_2: "Tea. Earl Grey. Hot.",
          },
        },
        {
          auth: {
            username: RAZORPAY_KEY,
            password: RAZORPAY_SECRET_KEY,
          },
        }
      );
      console.log("IDD : ", response.data.id);
      if (response) console.log("RESPONSE 1 : ", response.data);
      if (response) {
        const response2: any = await axios.post(
          "https://api.razorpay.com/v1/fund_accounts",
          {
            contact_id: response.data.id,
            account_type: "bank_account",
            bank_account: {
              name: userName,
              ifsc: userIFSC,
              account_number: accountNO,
            },
          },
          {
            auth: {
              username: RAZORPAY_KEY,
              password: RAZORPAY_SECRET_KEY,
            },
          }
        );

        if (response2) console.log("RESPONSE 2 : ", response2);
        if (response2) {
          const response3: any = await axios.post(
            "https://api.razorpay.com/v1/fund_accounts",
            {
              contact_id: response.data.id,
              account_type: "vpa",
              vpa: {
                address: vpa,
              },
            },
            {
              auth: {
                username: RAZORPAY_KEY,
                password: RAZORPAY_SECRET_KEY,
              },
            }
          );
          if (response && response2 && response3) {
            await set(ref(db, "user/" + accountNO), {
              userName: userName,
              phoneNO: phoneNO,
              accountNO: accountNO,
              IFSC: userIFSC,
              vpa: vpa,
              amount: 0,
              audioFileUrl: "",
              contactId: response.data.id,
              fundUpiId: response3.data.id,
              fundBankId: response2.data.id,
              tempAudioUrl: "",
            });
          }
        }
      }
    } catch (err: any) {
      console.log("ERROR  ====> ", err.message);
    }
  };

  const withdrawMoney = () => {
    Alert.alert("Withdraw Money", "Are you sure you want to withdraw money?");
  };

  const toggleView = () => {
    setIsLogin(!isLogin); // Switch between login and sign-up
  };

  const login = () => {
    const authenticate = ref(db, "user/" + accountNO);
    onValue(authenticate, (snapshot) => {
      const data = snapshot.val();
      console.log("DATA1 ===>", data);
      if (
        data != null &&
        phoneNO === data.phoneNO &&
        accountNO === data.accountNO
      ) {
        console.log("DATA2 ========> ", data);
        setUserData(data);
        dispatch(updateAccountNo(data.accountNO));
      }
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f5f5f5",
      }}
    >
      <TouchableOpacity
        style={{
          position: "absolute",
          top: 40,
          right: 10,
          alignItems: "center",
          justifyContent: "center",
          paddingVertical: 12,
          paddingHorizontal: 32,
          borderRadius: 4,
          backgroundColor: "#EDE0AB",
        }}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.loginText}>{isLogin ? "Login" : "Sign Up"}</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <Text
              style={{
                fontSize: 20,
                color: "",
                marginBottom: 10,
              }}
            >
              {isLogin ? "Login" : "Sign Up"}
            </Text>
            {isLogin ? (
              <>
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    marginVertical: 5,
                    backgroundColor: "#f6f6f6",
                    paddingHorizontal: 20,
                  }}
                  keyboardType="numeric"
                  placeholder="Phone Number"
                  onChangeText={(text) => setPhoneNo(text)}
                />
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  keyboardType="numeric"
                  placeholder="Account Number"
                  onChangeText={(text) => setAccountNo(text)}
                />

                <Pressable
                  onPress={() => {
                    login();
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.buttonText}>Submit</Text>
                </Pressable>

                <Pressable onPress={toggleView}>
                  <Text style={styles.switchText}>
                    {isLogin
                      ? `don't have an account?`
                      : "already have an account?"}
                  </Text>
                </Pressable>

                <Pressable onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Close</Text>
                </Pressable>
              </>
            ) : (
              <>
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  placeholder="Name"
                  onChangeText={(text) => setUserName(text)}
                />
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  placeholder="IFSC"
                  onChangeText={(text) => setUserIFSC(text)}
                />
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  placeholder="vpa: example@bankname"
                  onChangeText={(text) => setVpa(text)}
                />
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  keyboardType="numeric"
                  placeholder="Phone Number"
                  onChangeText={(text) => setPhoneNo(text)}
                />
                <TextInput
                  style={{
                    height: 40,
                    width: "100%",
                    backgroundColor: "#f6f6f6",
                    marginVertical: 5,
                    paddingHorizontal: 20,
                  }}
                  keyboardType="numeric"
                  placeholder="Account Number"
                  onChangeText={(text) => setAccountNo(text)}
                />
                <Pressable
                  onPress={() => {
                    dataAddOn();
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      color: "#2196F3",
                      marginTop: 20,
                    }}
                  >
                    Sign Up
                  </Text>
                </Pressable>

                <Pressable onPress={toggleView}>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#2196F3",
                      marginTop: 10,
                      textDecorationLine: "underline",
                    }}
                  >
                    {isLogin
                      ? `don't have an account?`
                      : "already have an account?"}
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Enter Amount"
          keyboardType="numeric"
          onChangeText={(text) => setBalance(parseInt(text))}
        />
        <Button title="Deposit" onPress={() => fetchOrder()} />
      </View>

      <TouchableOpacity style={styles.withdrawButton} onPress={withdrawMoney}>
        <Text style={styles.withdrawText}>Withdraw Money</Text>
      </TouchableOpacity>
    </View>
  );
};

export default TabThreeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    paddingHorizontal: 10,
    flex: 1,
    marginRight: 10,
  },
  loginButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    backgroundColor: "#2196F3",
  },
  loginText: {
    color: "white",
    fontWeight: "bold",
  },
  withdrawButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 4,
    backgroundColor: "#EDE0AB",
  },
  withdrawText: {
    color: "white",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 35,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  buttonText: {
    fontSize: 16,
    color: "#2196F3",
    marginTop: 20,
  },
  switchText: {
    fontSize: 14,
    color: "#2196F3",
    marginTop: 10,
    textDecorationLine: "underline",
  },
});
