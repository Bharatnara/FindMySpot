import {
  Text,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { Line } from "./../Components/styles";

//import api
import { TOMTOM_API_KEY } from "@env";

import { useState } from "react";
import axios from "axios";

export default function Home({ navigation, route }) {
  const [searchInput, setSearchInput] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [token, setToken] = useState(null);
  const [bookingData, setBookingData] = useState(null);

  async function getLocation() {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      console.log("location permission granted");
    } else {
      console.log("location permission denied");
    }
  }

  async function handleSearch() {
    const URL = `https://api.tomtom.com/search/2/search/${encodeURIComponent(
      searchInput
    )}.json?key=${TOMTOM_API_KEY}`;
    await axios
      .get(URL)
      .then((res) => {
        setSearchResult(res.data.results);
      })

      .catch((e) => console.log(e));
  }

  function handleNavigation(data) {
    const result = { ...data, ...route.params };
    navigation.navigate("DestinationStack", {
      screen: "Destination",
      params: { result },
    });
  }

  async function getBookingData() {
    if (token !== null && token !== undefined) {
      const URL = `https://findmyspot.onrender.com/api/bookings`;
      await axios
        .get(URL, {
          headers: {
            Authorization: token,
          },
        })
        .then((res) => {
          setBookingData(res.data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  }

  async function handleToken() {
    if (route.params !== null && route.params !== undefined) {
      setToken(route.params.userData.token);
    }
  }

  function convertTime(timeString) {
    const dateObj = new Date(timeString);
    const localDate = dateObj.toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
    });
    const localTime = dateObj.toLocaleTimeString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    return { localDate: localDate, localTime: localTime };
  }

  useEffect(() => {
    getLocation();
  }, []);

  useEffect(() => {
    //console.log("moved to home screen , clearing searchresult array");
    setSearchResult([]);
  }, [route.params]);

  useEffect(() => {
    const handleAsync = async () => {
      await handleToken();
      if (token !== null && token !== undefined) {
        await getBookingData();
      }
    };
    handleAsync();
  }, [route.params, token]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View style={styles.container}>
        <View style={styles.heading}>
          <Ionicons name="car" color="#0F81C7" size={48}></Ionicons>
          <Text style={{ fontSize: 36, marginHorizontal: 16 }}>FindMySpot</Text>
        </View>

        <View style={styles.searchBox}>
          <TextInput
            style={styles.input}
            placeholder="Enter Destination"
            onChangeText={(e) => setSearchInput(e)}
          ></TextInput>
          <Ionicons
            name="search"
            size={36}
            color="black"
            onPress={handleSearch}
          ></Ionicons>
        </View>

        {/* for lsiting */}
        {searchResult.length > 0 && (
          <View style={styles.listContainer}>
            {searchResult.map((result, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleNavigation(result)}
              >
                <View key={index} style={styles.list}>
                  <Text>{result.address.freeformAddress}</Text>
                  {}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <Text style={styles.SectionHead}>Previous Bookings</Text>

        <View style={styles.previousBookingContainer}>
          {bookingData !== null && bookingData !== undefined ? (
            <View>
              {bookingData.length > 0 ? (
                <View>
                  <ScrollView style={styles.scrollStyle}>
                    {bookingData.map((element, index) => (
                      <View key={index} style={styles.Card}>
                        <Text style={styles.Content}>
                          Date: {convertTime(element.fromTime).localDate}
                        </Text>
                        <Text style={styles.Content}>YourSpot:</Text>
                        <Text style={styles.Content}>
                          {element.parkingSpaceName}
                        </Text>

                        <Text style={styles.Content}>
                          From : {convertTime(element.fromTime).localTime}
                        </Text>
                        <Text style={styles.Content}>
                          To : {convertTime(element.toTime).localTime}
                        </Text>
                        <Text style={styles.Content}>Tariff : 40/-</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : (
                <View>
                  <Text>no previous booking found</Text>
                </View>
              )}
            </View>
          ) : (
            <ActivityIndicator size="large" color="#0F81C7" />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 48,
    padding: 15,
    borderWidth: 2,
    borderStyle: "solid",
    borderColor: "red",
  },
  heading: {
    height: 60,

    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },

  searchBox: {
    height: 48,
    marginHorizontal: "5%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 10,
    borderColor: "#0F81C7",
    backgroundColor: "#ffffff",
    color: "black",
    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  input: {
    paddingHorizontal: "5%",
    width: "85%",
  },
  SearchIcon: {
    marginRight: 0,
  },

  listContainer: {
    position: "absolute",
    top: 130,
    zIndex: 1,

    width: "100%",
    alignSelf: "center",
  },
  list: {
    height: 48,
    marginHorizontal: "5%",
    marginVertical: "1%",

    paddingStart: "5%",

    display: "flex",
    flexDirection: "row",
    alignItems: "center",

    borderRadius: 10,
    backgroundColor: "#ffffff",
    color: "black",

    // Box shadow for iOS
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  Card: {
    display: "flex",
    flexDirection: "column",
    padding: 15,
    margin: 10,
    backgroundColor: "#F1F2F6",
    borderRadius: 10,
    width: "95%",
    height: 200,
    borderColor: "#0F81C7",
    borderWidth: 3,
  },
  SectionHead: {
    fontSize: 24,
    fontWeight: "bold",
    textDecorationLine: "underline",
    marginBottom: 5,
    marginTop: 10,
  },
  Content: {
    fontSize: 18,
    marginBottom: 5,
    flexShrink: 1,
  },
  ContentDate: {
    flexDirection: "row",
  },
  previousBookingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    minHeight: 450,
  },
  scrollStyle: {
    minHeight: 450,
    maxHeight: 450,
    minWidth: "100%",
    borderColor: "black",
    borderWidth: 1,
    width: "100%",
    alignSelf: "center",

    marginVertical: 20,
  },
});
