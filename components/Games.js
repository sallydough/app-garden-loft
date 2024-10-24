// import React, { useState, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Pressable,
//   Dimensions,
//   Modal,
//   ActivityIndicator,
// } from "react-native";
// import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
// import Carousel from "react-native-reanimated-carousel";
// import { WebView } from "react-native-webview";

// const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");

// // Game data for carousel
// const gamesData = [
//   { id: '1', name: 'Crossword' },
//   { id: '2', name: 'Word Search' },
//   { id: '3', name: 'Sudoku' },
//   { id: '4', name: 'Trivia' },
//   { id: '5', name: 'Code Cracker' },
//   { id: '6', name: 'Memory Game' },
//   { id: '7', name: 'UNO' },  // Added UNO game
//   { id: '8', name: 'Chess' },
//   { id: '9', name: 'Connect 4' },
//   { id: '10', name: 'Battleship' },
// ];

// // Game URLs based on game names
// const gameUrls = {
//   "Crossword": "https://www.seniorsonline.vic.gov.au/services-information/crossword",
//   "Word Search": "https://www.seniorsonline.vic.gov.au/services-information/word-search",
//   "Sudoku": "https://www.seniorsonline.vic.gov.au/services-information/sudoku",
//   "Trivia": "https://www.seniorsonline.vic.gov.au/services-information/trivia",
//   "Code Cracker": "https://www.seniorsonline.vic.gov.au/services-information/code-cracker",
//   "Memory Game": "https://www.memozor.com/memory-games/for-seniors-or-elderly/black-and-white",
//   "UNO": "https://buddyboardgames.com/uno", // Added UNO game URL
//   "Chess": "https://buddyboardgames.com/chess",
//   "Connect 4": "https://buddyboardgames.com/connect4",
//   "Battleship": "https://buddyboardgames.com/battleship"

// };

// const Games = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isGameModalVisible, setIsGameModalVisible] = useState(false);
//   const [selectedGame, setSelectedGame] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const carouselRef = useRef(null);

//   // Function to open modal when a game is selected
//   const openGameModal = (game) => {
//     setIsLoading(true); // Simulate loading time
//     setSelectedGame(game);
//     setIsGameModalVisible(true);
//     setTimeout(() => setIsLoading(false), 1000); // Loading effect for 1 second
//   };

//   // Function to close the modal
//   const closeGameModal = () => {
//     setIsGameModalVisible(false);
//     setSelectedGame(null);
//   };

//   // Function to render each game in the carousel
//   const renderItem = ({ item, index }) => (
//     <Pressable
//       key={item.id}
//       style={[
//         styles.cardContainer,
//         { backgroundColor: index === activeIndex ? "#f09030" : "#f09030" },
//         { transform: index === activeIndex ? [{ scale: 0.85 }] : [{ scale: 0.85 }] },
//         {
//           height: viewportWidth > viewportHeight
//             ? Math.round(viewportHeight * 0.3)
//             : Math.round(viewportHeight * 0.25),
//         },
//       ]}
//       onPress={() => openGameModal(item)}
//     >
//       <MaterialCommunityIcons name="gamepad-variant" size={94} color="white" />
//       <Text style={styles.cardText}>{item.name}</Text>
//     </Pressable>
//   );

//   return (
//     <View
//       style={[
//         styles.container,
//         {
//           height: viewportWidth > viewportHeight ? 320 : 450,
//         },
//       ]}
//     >
//       {/* Modal for displaying game content */}
//       <Modal
//         animationType="slide"
//         transparent={true}
//         visible={isGameModalVisible}
//         onRequestClose={closeGameModal}
//       >
//         <View style={styles.modalView}>
//           {isLoading ? (
//             <ActivityIndicator size="large" color="orange" />
//           ) : (
//             <WebView
//               source={{ uri: gameUrls[selectedGame?.name] }}
//               style={{ width: viewportWidth * 0.9, height: viewportHeight * 0.7 }}
//             />
//           )}
//           <Pressable style={styles.closeButton} onPress={closeGameModal}>
//             <FontAwesome name="close" size={24} color="black" />
//           </Pressable>
//         </View>
//       </Modal>

//       {/* Carousel for displaying game options */}
//       <Carousel
//         ref={carouselRef}
//         data={gamesData}
//         renderItem={renderItem}
//         width={Math.round(viewportWidth * 0.3)}
//         height={Math.round(viewportWidth * 0.3)}
//         loop={true}
//         style={{ width: Math.round(viewportWidth * 0.9), height: Math.round(viewportWidth * 0.5) }}
//         onSnapToItem={(index) => setActiveIndex(index)}
//         scrollAnimationDuration={800}
//         snapEnabled
//       />

//       {/* Left navigation arrow */}
//       <Pressable
//         style={[
//           styles.arrowLeft,
//           {
//             left: viewportWidth > viewportHeight ? -17 : -22,
//             top: viewportWidth > viewportHeight ? "40%" : "30%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: -1, animated: true });
//         }}
//       >
//         <FontAwesome name="angle-left" size={100} color="black" />
//       </Pressable>

//       {/* Right navigation arrow */}
//       <Pressable
//         style={[
//           styles.arrowRight,
//           {
//             right: viewportWidth > viewportHeight ? -25 : -22,
//             top: viewportWidth > viewportHeight ? "40%" : "30%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: 1, animated: true });
//         }}
//       >
//         <FontAwesome name="angle-right" size={100} color="black" />
//       </Pressable>
//     </View>
//   );
// };

// // Styles for the component
// const styles = StyleSheet.create({
//   container: {
//     position: "relative",
//     alignItems: "center",
//   },
//   cardContainer: {
//     width: viewportWidth * 0.3,
//     backgroundColor: "#f09030",
//     borderRadius: 20,
//     justifyContent: "center",
//     alignItems: "center",
//     marginHorizontal: 0,
//     padding: 20,
//     height: viewportHeight * 0.2,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.22,
//     shadowRadius: 9.22,
//     elevation: 12,
//   },
//   cardText: {
//     fontSize: 18,
//     color: "white",
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   arrowLeft: {
//     position: "absolute",
//     zIndex: 10,
//     transform: [{ translateY: -50 }],
//   },
//   arrowRight: {
//     position: "absolute",
//     zIndex: 10,
//     transform: [{ translateY: -50 }],
//   },
//   modalView: {
//     margin: 10,
//     height: viewportHeight * 0.9,
//     width: viewportWidth * 0.95,
//     marginTop: 50,
//     backgroundColor: "white",
//     borderRadius: 20,
//     padding: 20,
//     alignItems: "center",
//     justifyContent: "center",
//     shadowColor: "#000",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     elevation: 3,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 30,
//     right: 30,
//     backgroundColor: "lightblue",
//     padding: 10,
//     borderRadius: 5,
//   },
// });

// export default Games;

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Modal,
  ActivityIndicator,
  Image,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { WebView } from "react-native-webview";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

// Game URLs based on game names
const gameUrls = {
  Crossword:
    "https://www.seniorsonline.vic.gov.au/services-information/crossword",
  "Word Search":
    "https://www.seniorsonline.vic.gov.au/services-information/word-search",
  Sudoku: "https://www.seniorsonline.vic.gov.au/services-information/sudoku",
  Trivia: "https://www.seniorsonline.vic.gov.au/services-information/trivia",
  "Code Cracker":
    "https://www.seniorsonline.vic.gov.au/services-information/code-cracker",
  "Memory Game":
    "https://www.memozor.com/memory-games/for-seniors-or-elderly/black-and-white",
  UNO: "https://buddyboardgames.com/uno",
  Chess: "https://buddyboardgames.com/chess",
  "Connect 4": "https://buddyboardgames.com/connect4",
  Battleship: "https://buddyboardgames.com/battleship",
};

// Multiplayer games requiring instruction modal
const multiplayerGames = ["UNO", "Chess", "Connect 4", "Battleship"];

const Games = () => {
  const [gamesData, setGamesData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isGameModalVisible, setIsGameModalVisible] = useState(false);
  const [isInstructionModalVisible, setIsInstructionModalVisible] =
    useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const carouselRef = useRef(null);

  // Fetching games data from Firestore
  const fetchGamesData = async () => {
    try {
      const gamesCollection = collection(FIRESTORE_DB, "games");
      const gamesSnapshot = await getDocs(gamesCollection);
      const gamesList = gamesSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl,
      }));
      setGamesData(gamesList);
    } catch (error) {
      console.error("Error fetching games from Firestore: ", error);
    }
  };

  useEffect(() => {
    fetchGamesData();
  }, []);

  // Open game modal
  const openGameModal = (game) => {
    if (multiplayerGames.includes(game.name)) {
      // Show instruction modal for multiplayer games
      setSelectedGame(game);
      setIsInstructionModalVisible(true);
    } else {
      // Directly open WebView for single-player games
      setSelectedGame(game);
      setIsLoading(true);
      setIsGameModalVisible(true);
      setTimeout(() => setIsLoading(false), 1000); // Simulate loading effect
    }
  };

  // Proceed to game after the instructional modal
  const proceedToGame = () => {
    setIsInstructionModalVisible(false);
    setIsLoading(true);
    setIsGameModalVisible(true);
    setTimeout(() => setIsLoading(false), 1000); // Simulate loading effect
  };

  // Close game modal
  const closeGameModal = () => {
    setIsGameModalVisible(false);
    setSelectedGame(null);
  };

  // Render each game in the carousel
  const renderItem = ({ item, index }) => (
    <View key={item.id} style={styles.itemContainer}>
      <Pressable
        style={[
          styles.cardContainer,
          {
            backgroundColor:
              index === activeIndex ? "transparent" : "transparent",
            transform:
              index === activeIndex ? [{ scale: 0.85 }] : [{ scale: 0.85 }],
          },
          {
            height:
              viewportWidth > viewportHeight
                ? Math.round(Dimensions.get("window").height * 0.3)
                : Math.round(Dimensions.get("window").height * 0.25),
          },
        ]}
        onPress={() => openGameModal(item)}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.cardImage}
            resizeMode="cover" // Ensures the image covers the card size
          />
        ) : (
          <FontAwesome name="gamepad" size={94} color="white" />
        )}
      </Pressable>
      <Text style={styles.cardText}>{item.name}</Text>
    </View>
  );

  return (
    <View
      style={[
        styles.container,
        {
          height: viewportWidth > viewportHeight ? 320 : 450,
        },
      ]}>
      {/* Instructional Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isInstructionModalVisible}
        onRequestClose={() => setIsInstructionModalVisible(false)}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>
            Please enter your name in the game and use "gardenloft" as the room
            name.
          </Text>
          <Pressable style={styles.proceedButton} onPress={proceedToGame}>
            <Text style={styles.proceedButtonText}>Proceed to Game</Text>
          </Pressable>
        </View>
      </Modal>

      {/* Game WebView Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGameModalVisible}
        onRequestClose={closeGameModal}>
        <View style={styles.modalView}>
          {isLoading ? (
            <ActivityIndicator size="large" color="orange" />
          ) : (
            <WebView
              source={{ uri: gameUrls[selectedGame?.name] }}
              style={{
                width: viewportWidth * 0.95,
                height: viewportHeight * 0.7,
              }}
            />
          )}
          <Pressable style={styles.closeButton} onPress={closeGameModal}>
            <FontAwesome name="close" size={24} color="black" />
          </Pressable>
        </View>
      </Modal>

      {/* Carousel for displaying game options */}
      <Carousel
        ref={carouselRef}
        data={gamesData}
        renderItem={renderItem}
        width={Math.round(viewportWidth * 0.3)}
        height={Math.round(viewportWidth * 0.3)}
        loop={true}
        style={{
          width: Math.round(viewportWidth * 0.9),
          height: Math.round(viewportWidth * 0.5),
        }}
        onSnapToItem={(index) => setActiveIndex(index)}
        scrollAnimationDuration={800}
        snapEnabled
      />
      <Pressable
        style={[
          styles.arrowLeft,
          { left: viewportWidth > viewportHeight ? -17 : -22, top: "40%" },
        ]}
        onPress={() => {
          carouselRef.current?.scrollTo({ count: -1, animated: true });
        }}>
        <FontAwesome name="angle-left" size={100} color="black" />
      </Pressable>
      <Pressable
        style={[
          styles.arrowRight,
          { right: viewportWidth > viewportHeight ? -25 : -22, top: "40%" },
        ]}
        onPress={() => {
          carouselRef.current?.scrollTo({ count: 1, animated: true });
        }}>
        <FontAwesome name="angle-right" size={100} color="black" />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    alignItems: "center",
  },
  itemContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  cardContainer: {
    width: viewportWidth * 0.3,
    backgroundColor: "#f09030",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
    marginLeft: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardText: {
    fontSize: 30,
    color: "#393939",
    fontWeight: "700",
    textAlign: "center",
    marginTop: 10,
  },
  arrowLeft: {
    position: "absolute",
    zIndex: 10,
    transform: [{ translateY: -50 }],
  },
  arrowRight: {
    position: "absolute",
    zIndex: 10,
    transform: [{ translateY: -50 }],
  },
  modalView: {
    margin: 10,
    height: viewportHeight * 0.88, // Adjusted for tablets
    width: viewportWidth * 0.95, // Adjusted for tablets
    marginTop: 50,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  modalText: {
    fontSize: 20,
    textAlign: "center",
    marginBottom: 20,
  },
  proceedButton: {
    backgroundColor: "#f09030",
    padding: 15,
    borderRadius: 10,
  },
  proceedButtonText: {
    fontSize: 20,
    color: "white",
    fontWeight: "bold",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 30,
    backgroundColor: "lightblue",
    padding: 13,
    borderRadius: 5,
  },
});

export default Games;
