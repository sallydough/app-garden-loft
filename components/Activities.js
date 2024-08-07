import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  Alert,
  ActivityIndicator,
  Button,
  Linking,
  Platform,
} from "react-native";
import axios from "axios";
import Carousel from "react-native-reanimated-carousel";
import moment from "moment-timezone";
import { FontAwesome } from "@expo/vector-icons";
import { getAuth } from "firebase/auth";
import * as Notifications from "expo-notifications";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const Activities = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const auth = getAuth();
  const user = auth.currentUser;
  const carouselRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchUserNameAndEvents(user.uid);
    } else {
      setError("User not signed in");
      setLoading(false);
    }

    const foregroundSubscription =
      Notifications.addNotificationReceivedListener((notification) => {
        Alert.alert("Notification Received", notification.request.content.body);
      });

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener((response) => {
        Alert.alert(
          "Garden Loft",
          response.notification.request.content.body
        );
      });

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  }, [user]);

  async function fetchUserNameAndEvents(uid) {
    try {
      console.log("Fetching user data for UID:", uid);
      const userRef = doc(FIRESTORE_DB, "users", uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("User data:", userData);
        const userName = userData.userName;
        if (!userName) {
          throw new Error(
            "User name is undefined or missing in Firestore document"
          );
        }
        console.log("User name:", userName);
        if (Platform.OS !== "web") {
          registerForPushNotificationsAsync();
        }
        fetchEvents(userName);
      } else {
        throw new Error("No user data found");
      }
    } catch (error) {
      console.error("Error fetching user data:", error.message);
      setError("Failed to retrieve user data. Please try again later.");
      setLoading(false);
    }
  }

  async function fetchEvents(userName) {
    try {
      const response = await axios.get(
        "https://api.signupgenius.com/v2/k/signups/report/filled/47293846/?user_key=UmNrVWhyYWwrVGhtQmdXeVpweTBZZz09"
      );
      if (!response.data.success) {
        throw new Error("Failed to retrieve signed-up activities.");
      }
      const currentTime = new Date();
      const eventData = response.data.data.signup
        .filter((item) => item.firstname === userName)
        .map((item) => ({
          item: item.item,
          startDate: moment
            .tz(item.startdatestring.replace(/-/g, "T"), "YYYY/MM/DD HH:mm", "")
            .toDate(),
          endDate: item.enddatestring
            ? moment
                .tz(
                  item.enddatestring.replace(/-/g, "T"),
                  "YYYY/MM/DD HH:mm:ss",
                  ""
                )
                .toDate()
            : undefined,
          zoomLink:
            item.location === "Zoom Meeting"
              ? "https://us06web.zoom.us/j/87666824017?pwd=RUZLSFVabjhtWjJVSm1CcDZsZXcrUT09"
              : null,
        }))
        .filter((event) => event.startDate > currentTime);

      eventData.sort((a, b) => a.startDate - b.startDate);

      eventData.forEach((event) => {
        if (Platform.OS !== "web") {
          scheduleNotification(event);
        }
      });

      setEvents(eventData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching signed-up activities:", error.message);
      setError(
        "Failed to retrieve signed-up activities. Please try again later."
      );
      setLoading(false);
    }
  }

  async function registerForPushNotificationsAsync() {
    const settings = await Notifications.getPermissionsAsync();
    if (
      settings.granted ||
      settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
    ) {
      console.log("Notification permissions granted.");
    } else {
      const response = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowSound: true,
          allowBadge: true,
          allowDisplayInCarPlay: true,
          allowCriticalAlerts: true,
        },
      });
      if (!response.granted) {
        alert("Failed to get push token for push notification!");
        return;
      }
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        sound: "default",
      });
    }
  }

  const navigateToZoomLink = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const renderModalContent = (event) => {
    const currentTime = new Date();
    const tenMinutesBeforeStartTime = new Date(event.startDate);
    tenMinutesBeforeStartTime.setMinutes(
      tenMinutesBeforeStartTime.getMinutes() - 10
    );

    if (event.endDate && currentTime > event.endDate) {
      return <Text>Event ended.</Text>;
    } else if (currentTime < tenMinutesBeforeStartTime) {
      return <Text>Event has not started yet.</Text>;
    } else if (
      currentTime >= tenMinutesBeforeStartTime &&
      currentTime < event.endDate
    ) {
      return (
        <Button
          title="Join Now"
          onPress={() => {
            Linking.openURL(selectedEvent.zoomLink);
          }}
        />
      );
    } else if (event.startDate <= currentTime && currentTime < event.endDate) {
      return <Button title="Event in progress" disabled />;
    } else {
      return null;
    }
  };

  const renderItem = ({ item, index }) => (
    <Pressable
      key={index}
      style={[
        styles.cardContainer,
        { backgroundColor: index === activeIndex ? "#f3b718" : "#f09030",
        transform: index === activeIndex ? [{scale: 1}] : [{scale: 0.8}],
         },
         {
          height:
            viewportWidth > viewportHeight
              ? Math.round(Dimensions.get("window").height * 0.3)
              : Math.round(Dimensions.get("window").height * 0.25),
        },
      ]}
      onPress={() => navigateToZoomLink(item)}>
      <Text style={styles.cardText}>{item.item}</Text>
      <Text style={styles.cardTextTime}>
        {moment(item.startDate).format("dddd MMMM Do, h:mm a")}
      </Text>
    </Pressable>
  );

  const handleSnapToItem = (index) => {
    setActiveIndex(index);
  };

  const scheduleNotification = async (event) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Activity!",
        body: `Your activity ${event.item} is starting in 10 minutes.`,
        sound: true,
        data: { event },
      },
      trigger: {
        date: new Date(event.startDate.getTime() - 10 * 60 * 1000),
      },
    });

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Upcoming Activity!",
        body: `Your activity ${event.item} is starting now.`,
        sound: true,
        data: { event },
      },
      trigger: {
        date: new Date(event.startDate.getTime() - 60 * 1000),
      },
    });
  };

  const handleArrowPress = (direction) => {
    let newIndex = activeIndex;
    if (direction === "left") {
      newIndex = (activeIndex - 1 + events.length) % events.length;
    } else if (direction === "right") {
      newIndex = (activeIndex + 1) % events.length;
    }
    carouselRef.current?.scrollTo({ index: newIndex, animated: true });
    setActiveIndex(newIndex);
  };

  return (
    <View style={[
      styles.container,
      { height: viewportWidth > viewportHeight ? 320 : 450 },
    ]}>
      {loading ? (
        <ActivityIndicator size="large" color="orange" style={styles.loading} />
      ) : error ? (
        <Text style={styles.loading}>Error: {error}</Text>
      ) : (
        <>
          <Carousel
            ref={carouselRef}
            data={events}
            layout={"default"}
            renderItem={renderItem}
            width={Math.round(viewportWidth * 0.3)}
            height={Math.round(viewportHeight * 0.3)}
            style={{ width: Math.round(viewportWidth * 0.9),  height: Math.round(viewportWidth * 0.5) }}
            itemWidth={Math.round(viewportWidth * 0.3)}
            loop={true}
            useScrollView={true}
            activeSlideAlignment="center"
            onSnapToItem={(index) => handleSnapToItem(index)}
            scrollAnimationDuration={800}
          />
          <Pressable
            style={[
              styles.arrowLeft,
              {
                left: viewportWidth > viewportHeight ? -17 : -22,
                top: viewportWidth > viewportHeight ? "40%" : "30%",
              },
            ]}
            onPress={() => {
              carouselRef.current?.scrollTo({ count: -1, animated: true });}}
            >
            <FontAwesome name="angle-left" size={100} color="rgb(45, 62, 95)" />
          </Pressable>
          <Pressable
            style={[
              styles.arrowRight,
              {
                right: viewportWidth > viewportHeight ? -25 : -22,
                top: viewportWidth > viewportHeight ? "40%" : "30%",
              },
            ]}
            onPress={() => {
              carouselRef.current?.scrollTo({ count: 1, animated: true });}}
            
            >
            <FontAwesome
              name="angle-right"
              size={100}
              color="rgb(45, 62, 95)"
            />
          </Pressable>
          {isModalOpen && selectedEvent && (
            <View style={styles.modalContainer}>
              <View style={styles.modal}>
                <Text>{selectedEvent.item}</Text>
                {selectedEvent.endDate && (
                  <Text>
                    End Date:{" "}
                    {moment(selectedEvent.endDate).format(
                      "dddd MMMM Do, h:mm a"
                    )}
                  </Text>
                )}
                {renderModalContent(selectedEvent)}
                <Pressable onPress={closeModal} style={styles.closeButton}>
                  <Text>Close</Text>
                </Pressable>
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
  },
  cardContainer: {
    width: viewportWidth * 0.3, //changes width of carousel cards
    backgroundColor: "#f09030",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    // marginLeft: 365,  //edits the centering of the carousel
    flexDirection: "column",
    gap: 10,
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  cardText: {
    fontSize: 30,
    color: "#393939",
    fontWeight: "700",
    textAlign: "center",
  },
  cardTextTime: {
    fontSize: 20,
    color: "#393939",
    fontWeight: "600",
    textAlign: "center",
  },
  loading: {
    flex: 1,
    alignItems: "flex-start",
    fontSize: 44,
  },
  arrowLeft: {
    position: "absolute",
    transform: [{ translateY: -50 }],
  },
  arrowRight: {
    position: "absolute",
    transform: [{ translateY: -50 }],
  },
  modalContainer: {
    position: "absolute",
    top: "30%",
    transform: [
      { translateX: -viewportWidth * 0.01 },
      { translateY: -viewportWidth * 0.2 },
    ],
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
    borderRadius: 10,
  },
  modal: {
    backgroundColor: "beige",
    padding: 60,
    borderRadius: 10,
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "lightgray",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});

export default Activities;
