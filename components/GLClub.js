import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { FontAwesome } from "@expo/vector-icons";
import { collection, addDoc, query, getDocs } from "firebase/firestore";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { getAuth } from "firebase/auth";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const defaultImage = {
  elizabeth: require("../assets/images/pexels-anna-nekrashevich-8993561.jpg"),
  shari: require("../assets/images/portrait2.jpg"),
  pat: require("../assets/images/portrait4.jpg"),
  john: require("../assets/images/portrait3.jpg"),
  matthew: require("../assets/images/portrait5.jpg"),
};

const GLClub= () => {
  const [contacts, setContacts] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef(null);

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchUserNames();
    }
  }, [user]);

  const fetchUserNames = async () => {
    const querySnapshot = await getDocs(collection(FIRESTORE_DB, 'users'));
    const fetchedContacts = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().userName,
      meetingId: doc.data().meetingId || '',
      imageUrl: defaultImage[doc.data().userName.toLowerCase()] || defaultImage.john,
    }));
    setContacts(fetchedContacts);
    if (user) {
      checkContactsInDatabase(user.uid, fetchedContacts);
    }
  };

  const checkContactsInDatabase = async (uid, fetchedContacts) => {
    const contactsQuery = query(
      collection(FIRESTORE_DB, `users/${uid}/contacts`)
    );
    const querySnapshot = await getDocs(contactsQuery);
    const dbContacts = querySnapshot.docs.map((doc) => doc.data().name);

    const updatedContacts = fetchedContacts.map((contact) => ({
      ...contact,
      isAdded: dbContacts.includes(contact.name),
    }));

    setContacts(updatedContacts);
  };

  const handleAddContact = async (contact) => {
    if (!user) {
      Alert.alert("No user signed in");
      return;
    }

    if (contact.isAdded) {
      Alert.alert("Contact already added.");
      return;
    }

    try {
      await addDoc(collection(FIRESTORE_DB, `users/${user.uid}/contacts`), {
        name: contact.name,
        meetingId: contact.meetingId,
        imageUrl: contact.imageUrl,
      });
      Alert.alert("Contact added successfully");
      fetchUserNames(); // Refresh the contacts list
    } catch (error) {
      console.error("Error adding contact: ", error);
      Alert.alert("Error adding contact.");
    }
  };

  const renderItem = ({ item }) => (
    <Pressable
      key={item.id}
      style={[
        styles.cardContainer,
        {
          backgroundColor:
            item.id === contacts[activeIndex]?.id ? "#f3b718" : "#f09030",
            transform: item.id === contacts[activeIndex]?.id ? [{scale: 1}] : [{scale: 0.8}],
        },
        {
          height: viewportWidth > viewportHeight
            ? Math.round(Dimensions.get("window").height * 0.3)
            : Math.round(Dimensions.get("window").height * 0.25),
        },
      ]}
      onPress={() => handleAddContact(item)}>
      <Image source={item.imageUrl} style={styles.image} />
      <Text style={styles.cardText}>{item.name}</Text>
      <FontAwesome
        name={item.isAdded ? "check-circle" : "plus-circle"}
        size={24}
        color={item.isAdded ? "green" : "white"}
        style={styles.iconStyle}
      />
    </Pressable>
  );



  return (
    <View style={[styles.container,
      {height: viewportWidth > viewportHeight
        ? 320
        : 450,}
    ]}>
      <Carousel
        ref={scrollViewRef}
        data={contacts}
        renderItem={renderItem}
        width={Math.round(viewportWidth * 0.3)}
        height={Math.round(viewportWidth * 0.3)}
        style={{ width: Math.round(viewportWidth * 0.9), height: Math.round(viewportWidth * 0.5) }}
        scrollAnimationDuration={800}
        loop
        onSnapToItem={(index) => setActiveIndex(index)}
      />
      <Pressable
        style={[styles.arrowLeft,
          {left: viewportWidth > viewportHeight
            ? -17
            : -22,
          top: viewportWidth > viewportHeight
            ? "40%"
            : "30%",}
        ]}
        onPress={() => {
          scrollViewRef.current?.scrollTo({ count: -1, animated: true });}}
        >
        <FontAwesome name="angle-left" size={100} color="rgb(45, 62, 95)" />
      </Pressable>
      <Pressable
        style={[styles.arrowRight,
          {right: viewportWidth > viewportHeight
            ? -25
            : -22,
          top: viewportWidth > viewportHeight
            ? "40%"
            : "30%",}
        ]}
        onPress={() => {
          scrollViewRef.current?.scrollTo({ count: 1, animated: true });}}
        >
        <FontAwesome name="angle-right" size={100} color="rgb(45, 62, 95)" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
  },
  cardContainer: {
    width: viewportWidth * 0.3,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
    // marginLeft: 355,
  },
  cardText: {
    fontSize: 30,
    color: '#393939',
    fontWeight: "700",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  iconStyle: {
    position: "absolute",
    bottom: 10,
    right: 10,
  },
  arrowLeft: {
         // top and left styles are above in code for media queries
    position: "absolute",
    transform: [{ translateY: -50 }],
  },
  arrowRight: {
    position: "absolute",
    // top and right styles are above in code for media queries
    transform: [{ translateY: -50 }],
  },
});

export default GLClub;