// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   useWindowDimensions,
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// // import VideoCall from "../VideoCall";
// import Activities2 from "../Activities";
// import Entertainment from "../Entertainment";
// // import Lights from "../Lights";
// import Games from "../Games";
// import HowTo from "../HowTo";
// import GLClub from "../GLClub";
// // import WatchParty from "../WatchParty";
// import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
// // import Logout from "../Logout";
// import ComingSoon from "../ComingSoon";
// import Kosmi from "../Kosmi";

// const data = [
//   {
//     id: 1,
//     title: "MY FRIENDS",
//     icon: "home-group-plus",
//     component: <GLClub />,
//     prompt: "",
//   },
//   // {
//   //   id: 2,
//   //   title: "VIDEO CALL",
//   //   icon: "phone",
//   //   component: <VideoCall />,
//   //   // component: <VideoSDK />,
//   //   prompt: "Make a Video Call?",
//   // },
//   {
//     id: 3,
//     title: "MY ENTERTAINMENT",
//     icon: "movie-open-star",
//     component: <Entertainment />,
//     prompt: "Watch Entertainment?",
//   },
//   // {
//   //   title: "CLUBS",
//   //   icon: "account-group",
//   //   component: <ComingSoon />,
//   //   prompt: "Watch Entertainment?",
//   // },
//   // {
//   //   title: "EVENTS",
//   //   icon: "calendar-star",
//   //   component: <ComingSoon />,
//   //   prompt: "Join an Upcoming Event?",
//   // },
//   {
//     id: 4,
//     title: "WATCH PARTY",
//     icon: "calendar-star",
//     component: <Kosmi />,
//     prompt: "Watch Party?",
//   },
//   // {

//   //   title: "COURSES",
//   //   // icon: "card-account-details-star-outline",
//   //   icon: "food-variant",
//   //   component: <ComingSoon />,
//   //   prompt: "Join a Course?",
//   // },
//   {
//     id: 5,
//     title: "MY ACTIVITIES",
//     icon: "weight-lifter",
//     component: <Activities2 />,
//     prompt: "",
//   },
//   {
//     id: 6,
//     title: "HOW-TO VIDEOS",
//     component: <HowTo />,
//     icon: "account-question",
//     prompt: "Need Help With Your Garden Loft?",
//   },
//   // {
//   //   title: "LIGHTS",
//   //   icon: "lightbulb",
//   //   // component: <Lights />,
//   //   component: <ComingSoon/>,
//   //   prompt: "Change Lights?",
//   // },
//   // {
//   //   id: 7,
//   //   title: "LOG OUT",
//   //   icon: "logout",
//   //   component: <Logout />,
//   //   prompt: "Log Out of Garden Loft App?",
//   // },
//   {
//     id: 8,
//     title: "MY CALENDAR",
//     icon: "calendar-month",
//     component: <ComingSoon />,
//     prompt: "See What's Coming Up?",
//   },
//   {
//     id: 9,
//     title: "Games",
//     // icon: "card-account-details-star-outline",
//     icon: "gamepad",
//     component: <Games/>,
//     // prompt: "Lets play Games?",
//   },
// ];

// const Home = () => {
//   const [activeIndex, setActiveIndex] = useState(0); // Set initial active index
//   const [isLoading, setIsLoading] = useState(true); // Loading state
//   const [showPrompt, setShowPrompt] = useState(false); // Prompt visibility state
//   const carouselRef = useRef(null);
//   const { width: viewportWidth, height: viewportHeight } =
//     useWindowDimensions();

//   const handleSnapToItem = (index) => {
//     setActiveIndex(index);
//     setIsLoading(true); // Set loading true when snapping to a new item
//     setShowPrompt(false); // Hide prompt while loading the new component
//   };

//   // Simulate component loading with a timeout and show prompt 1 second after loading
//   useEffect(() => {
//     const loadTimeout = setTimeout(() => {
//       setIsLoading(false); // Set loading to false after component has "loaded"
//       const promptTimeout = setTimeout(() => {
//         setShowPrompt(true); // Show prompt 1 second after the component has loaded
//       }, 0);

//       return () => clearTimeout(promptTimeout); // Cleanup prompt timeout on unmount
//     }, 1000); // Simulating a 1-second load time

//     return () => clearTimeout(loadTimeout); // Cleanup loading timeout on unmount
//   }, [activeIndex]);

//   const handleCardPress = (item, index) => {
//     // carouselRef.current.scrollTo({ index });
//   };

//   const handleCardPressSnap = (item, index) => {
//     // carouselRef.current.scrollTo({ index, animated: true }); // Scroll to the clicked card
//     // setActiveIndex(index); // Set the clicked card as the active index
//   };

//   const renderItem = ({ item, index }) => (
//     <TouchableOpacity onPress={() => handleCardPressSnap(item, index)}>
//       <View
//         style={[
//           styles.item,
//           { backgroundColor: index === activeIndex ? "#f3b718" : "#909090" },
//           {
//             transform:
//               index === activeIndex ? [{ scale: 1 }] : [{ scale: 0.8 }],
//             width:
//               viewportWidth > viewportHeight
//                 ? Math.round(Dimensions.get("window").width * 0.18)
//                 : Math.round(Dimensions.get("window").width * 0.28),
//             height:
//               viewportWidth > viewportHeight
//                 ? Math.round(Dimensions.get("window").height * 0.25)
//                 : Math.round(Dimensions.get("window").height * 0.2),
//             marginLeft: viewportWidth > viewportHeight ? 350 : 220,
//           },
//         ]}>
//         <MaterialCommunityIcons
//           style={[
//             styles.icon,
//             { color: index === activeIndex ? "black" : "#f3b718" },
//           ]}
//           name={item.icon}
//           size={82}
//         />
//         <Text
//           style={[
//             styles.title,
//             { color: index === activeIndex ? "black" : "#f3b718" },
//           ]}>
//           {item.title}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const cardsToShow = viewportWidth > viewportHeight ? 5 : 3;

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[
//           styles.arrowLeft,
//           {
//             left: viewportWidth > viewportHeight ? 28 : 18,
//             top: viewportWidth > viewportHeight ? "12%" : "14.5%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: -1, animated: true });
//         }}>
//         <FontAwesome name="angle-left" size={100} color="rgb(45, 62, 95)" />
//       </TouchableOpacity>

//       <Carousel
//         ref={carouselRef}
//         width={Math.round(viewportWidth / cardsToShow)}
//         height={Math.round(viewportHeight * 0.3)}
//         autoPlay={false}
//         data={data}
//         renderItem={renderItem}
//         loop={true}
//         onSnapToItem={handleSnapToItem}
//         style={[
//           styles.carousel,
//           { marginTop: viewportWidth > viewportHeight ? 10 : 70 },
//         ]}
//       />

//       <TouchableOpacity
//         style={[
//           styles.arrowRight,
//           {
//             right: viewportWidth > viewportHeight ? 35 : 22,
//             top: viewportWidth > viewportHeight ? "12%" : "15%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: 1, animated: true });
//         }}>
//         <FontAwesome name="angle-right" size={100} color="rgb(45, 62, 95)" />
//       </TouchableOpacity>

//       {/* Show loading indicator while the component is loading */}
//       {isLoading ? (
//         <ActivityIndicator
//           size="large"
//           color="orange"
//           style={[
//             styles.loading,
//             {
//               marginBottom: viewportWidth > viewportHeight ? 140 : 340,
//             },
//           ]}
//         />
//       ) : (
//         <>
//           {/* Show the prompt only when showPrompt is true */}
//           {showPrompt && (
//             <Text
//               style={[
//                 styles.prompt,
//                 { marginBottom: viewportWidth > viewportHeight ? 30 : 50 },
//               ]}>
//               {data[activeIndex].prompt}
//             </Text>
//           )}
//           <View style={styles.carousel2}>{data[activeIndex].component}</View>
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     marginTop: 10,
//     flexDirection: "column",
//     width: "100%",
//   },
//   carousel2: {
//     marginTop: 10,
//   },
//   carousel: {
//     width: Math.round(Dimensions.get("window").width * 0.8),
//   },
//   prompt: {
//     fontSize: 30,
//     color: "rgb(45, 62, 95)",
//   },

//   item: {
//     gap: 10,
//     // marginLeft: 350,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 30,
//     flexDirection: "column",
//     paddingHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 8, height: 7 },
//     shadowOpacity: 0.22,
//     shadowRadius: 9.22,
//     elevation: 12,
//     marginHorizontal: 25,
//   },
//   title: {
//     fontSize: 19,
//     fontWeight: "bold",
//     color: "#f3b718",
//     textAlign: "center",
//   },
//   arrowLeft: {
//     position: "absolute",
//     transform: [{ translateY: -10 }],
//   },
//   arrowRight: {
//     position: "absolute",
//     transform: [{ translateY: -10 }],
//   },
//   icon: {},
//   loading: {},
// });

// export default Home;

import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import Activities2 from "../Activities";
import Entertainment from "../Entertainment";
import Games from "../Games";
import CalendarComponent from "../Calender";
import HowTo from "../HowTo";
import GLClub from "../GLClub";
import ComingSoon from "../ComingSoon";
import Kosmi from "../Kosmi";
import Lights from "../Lights";

const data = [
  {
    id: 1,
    title: "MY FRIENDS",
    icon: "home-group-plus",
    component: <GLClub />,
    prompt: "",
  },
  {
    id: 3,
    title: "MY ENTERTAINMENT",
    icon: "movie-open-star",
    component: <Entertainment />,
    prompt: "Watch Entertainment?",
  },
  {
    id: 4,
    title: "WATCH PARTY",
    icon: "calendar-star",
    component: <Kosmi />,
    prompt: "Watch Party?",
  },
  {
    id: 5,
    title: "MY ACTIVITIES",
    icon: "weight-lifter",
    component: <Activities2 />,
    prompt: "",
  },
  {
    id: 6,
    title: "HOW-TO VIDEOS",
    component: <HowTo />,
    icon: "account-question",
    prompt: "Need Help With Your Garden Loft?",
  },
  {
    id: 7,
    title: "MY CALENDAR",
    icon: "calendar-month",
    component: <ComingSoon />,
    prompt: "See What's Coming Up?",
  },
  { id: 9, title: "Games", icon: "gamepad", component: <Games /> },
  {
    id: 8,
        title: "HOME CONTROLS",
        // icon: "home-assistant",
        icon: "home-automation",
        // title: "LIGHTS",
        // icon: "lightbulb",
        component: <Lights />,
        prompt: "Control Home Device?",
      },
];

const Home = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showPrompt, setShowPrompt] = useState(false);
  const carouselRef = useRef(null);
  const { width: viewportWidth, height: viewportHeight } =
    useWindowDimensions();

  const handleSnapToItem = (index) => {
    setActiveIndex(index);
    setIsLoading(true);
    setShowPrompt(false);
  };

  useEffect(() => {
    const loadTimeout = setTimeout(() => {
      setIsLoading(false);
      const promptTimeout = setTimeout(() => {
        setShowPrompt(true);
      }, 0);

      return () => clearTimeout(promptTimeout);
    }, 1000);

    return () => clearTimeout(loadTimeout);
  }, [activeIndex]);

  const renderItem = ({ item, index }) => (
    <TouchableOpacity onPress={() => setActiveIndex(index)}>
      <View
        style={[
          styles.item,
          { backgroundColor: index === activeIndex ? "#f3b718" : "#909090" },
          {
            transform:
              index === activeIndex ? [{ scale: 1 }] : [{ scale: 0.8 }],
            width:
              viewportWidth > viewportHeight
                ? Math.round(Dimensions.get("window").width * 0.18)
                : Math.round(Dimensions.get("window").width * 0.28),
            height:
              viewportWidth > viewportHeight
                ? Math.round(Dimensions.get("window").height * 0.25)
                : Math.round(Dimensions.get("window").height * 0.2),
            marginLeft: viewportWidth > viewportHeight ? 350 : 220,
          },
          viewportWidth <= 513 && phoneStyles.item,
        ]}>
        <MaterialCommunityIcons
          style={[
            styles.icon,
            { color: index === activeIndex ? "black" : "#f3b718" },
          ]}
          name={item.icon}
          size={82}
        />
        <Text
          style={[
            styles.title,
            { color: index === activeIndex ? "black" : "#f3b718" },
          ]}>
          {item.title}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const cardsToShow = viewportWidth > viewportHeight ? 5 : 3;

  return (
    <View style={[styles.container, viewportWidth <= 513 && phoneStyles.container]}>
      <TouchableOpacity
        style={[
          styles.arrowLeft,
          {
            left: viewportWidth > viewportHeight ? 28 : 18,
            top: viewportWidth > viewportHeight ? "12%" : "14.5%",
          },
          viewportWidth <= 513 && phoneStyles.arrowLeft,
        ]}
        onPress={() =>
          carouselRef.current?.scrollTo({ count: -1, animated: true })
        }>
        <FontAwesome
          name="angle-left"
          size={viewportWidth <= 513 ? 100 : 100}
          color="rgb(45, 62, 95)"
        />
      </TouchableOpacity>

      <Carousel
        ref={carouselRef}
        width={
          viewportWidth <= 513
            ? viewportWidth * 0.8
            : Math.round(viewportWidth / cardsToShow)
        }
        height={Math.round(viewportHeight * 0.3)}
        autoPlay={false}
        data={data}
        renderItem={renderItem}
        loop={true}
       
        onSnapToItem={handleSnapToItem}
        scrollEnabled={true} // Enable scrolling
        style={[
          styles.carousel,
          { marginTop: viewportWidth > viewportHeight ? 10 : 70 },
          
        ]}
      />

      <TouchableOpacity
        style={[
          styles.arrowRight,
          {
            right: viewportWidth > viewportHeight ? 35 : 22,
            top: viewportWidth > viewportHeight ? "12%" : "15%",
          },
          viewportWidth <= 513 && phoneStyles.arrowRight,
        ]}
        onPress={() =>
          carouselRef.current?.scrollTo({ count: 1, animated: true })
        }>
        <FontAwesome
          name="angle-right"
          size={viewportWidth <= 513 ? 100 : 100}
          color="rgb(45, 62, 95)"
        />
      </TouchableOpacity>

      {isLoading ? (
        <ActivityIndicator
          size="large"
          color="orange"
          style={[
            styles.loading,
            { marginBottom: viewportWidth > viewportHeight ? 140 : 340 },
          ]}
        />
      ) : (
        <>
          {showPrompt && (
            <Text
              style={[
                styles.prompt,
                { marginBottom: viewportWidth > viewportHeight ? 30 : 50 },
                viewportWidth <= 513 && phoneStyles.prompt,

              ]}>
              {data[activeIndex].prompt}
            </Text>
          )}
          <View style={styles.carousel2}>{data[activeIndex].component}</View>
        </>
      )}
    </View>
  );
};

// Phone-specific styles
const phoneStyles = {
  container: {
    marginTop: -20,
  },
  item: {
    width: Dimensions.get("window").width * 0.7,
    height: Dimensions.get("window").height * 0.25,
    alignSelf: "center",
    marginLeft: 0,
    marginRight: 1,
  },
  arrowLeft: {
    left: 7,
    top: "20%",
    transform: [{ translateY: -30 }],
  },
  arrowRight: {
    right: 7,
    top: "20%",
    transform: [{ translateY: -30 }],
  },
  prompt: {
    fontSize: 22, // Smaller font for phones
    textAlign: "center", // Center the prompt text
    marginHorizontal: Dimensions.get("window").width * 0.1, // Add horizontal margin
    // marginTop: 2, // Space above the prompt
    marginBottom: -40,
    color: "rgb(45, 62, 95)",
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    marginTop: 10,
    flexDirection: "column",
    width: "100%",
  },
  carousel2: {
    marginTop: 10,
  },
  carousel: {
    width: Math.round(Dimensions.get("window").width * 0.8),
  },
  prompt: {
    fontSize: 30,
    color: "rgb(45, 62, 95)",
    // marginHorizontal: Dimensions.get("window").width * 0.15, // More horizontal margin
    ...phoneStyles.prompt,
  },
  item: {
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 30,
    flexDirection: "column",
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
    marginHorizontal: 25,
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#f3b718",
    textAlign: "center",
  },
  arrowLeft: {
    position: "absolute",
    transform: [{ translateY: -10 }],
  },
  arrowRight: {
    position: "absolute",
    transform: [{ translateY: -10 }],
  },
  icon: {},
  loading: {},
});

export default Home;

// import React, { useState, useRef, useEffect } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   TouchableOpacity,
//   ActivityIndicator,
//   useWindowDimensions,
// } from "react-native";
// import Carousel from "react-native-reanimated-carousel";
// import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
// import GLClub from "../GLClub";
// import Entertainment from "../Entertainment";
// import Kosmi from "../Kosmi";
// import Activities2 from "../Activities";
// import HowTo from "../HowTo";
// import ComingSoon from "../ComingSoon";
// import Games from "../Games";

// const data = [
//   { id: 1, title: "MY FRIENDS", icon: "home-group-plus", component: <GLClub /> },
//   { id: 3, title: "MY ENTERTAINMENT", icon: "movie-open-star", component: <Entertainment /> },
//   { id: 4, title: "WATCH PARTY", icon: "calendar-star", component: <Kosmi /> },
//   { id: 5, title: "MY ACTIVITIES", icon: "weight-lifter", component: <Activities2 /> },
//   { id: 6, title: "HOW-TO VIDEOS", icon: "account-question", component: <HowTo /> },
//   { id: 8, title: "MY CALENDAR", icon: "calendar-month", component: <ComingSoon /> },
//   { id: 9, title: "Games", icon: "gamepad", component: <Games /> },
// ];

// const Home = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [isLoading, setIsLoading] = useState(true);
//   const [showPrompt, setShowPrompt] = useState(false);
//   const carouselRef = useRef(null);
//   const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();

//   const handleSnapToItem = (index) => {
//     setActiveIndex(index);
//     setIsLoading(true);
//     setShowPrompt(false);
//   };

//   useEffect(() => {
//     const loadTimeout = setTimeout(() => {
//       setIsLoading(false);
//       const promptTimeout = setTimeout(() => setShowPrompt(true), 0);
//       return () => clearTimeout(promptTimeout);
//     }, 1000);

//     return () => clearTimeout(loadTimeout);
//   }, [activeIndex]);

//   const renderItem = ({ item, index }) => (
//     <TouchableOpacity onPress={() => handleSnapToItem(index)}>
//       <View
//         style={[
//           styles.item,
//           {
//             backgroundColor: index === activeIndex ? "#f3b718" : "#909090",
//             transform: index === activeIndex ? [{ scale: 1 }] : [{ scale: 0.9 }],
//             width: Math.round(viewportWidth * 0.7),
//             height: Math.round(viewportHeight * 0.3),
//           },
//         ]}>
//         <MaterialCommunityIcons
//           style={styles.icon}
//           name={item.icon}
//           size={viewportWidth < 430 ? 60 : 82}
//           color={index === activeIndex ? "black" : "#f3b718"}
//         />
//         <Text
//           style={[
//             styles.title,
//             { color: index === activeIndex ? "black" : "#f3b718" },
//           ]}>
//           {item.title}
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );

//   const cardsToShow = 1;

//   return (
//     <View style={styles.container}>
//       <TouchableOpacity
//         style={[
//           styles.arrowLeft,
//           {
//             left: 20,
//             top: viewportWidth > viewportHeight ? "12%" : "15%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: -1, animated: true });
//         }}>
//         <FontAwesome name="angle-left" size={viewportWidth < 430 ? 60 : 80} color="rgb(45, 62, 95)" />
//       </TouchableOpacity>

//       <Carousel
//         ref={carouselRef}
//         width={Math.round(viewportWidth / cardsToShow)}
//         height={Math.round(viewportHeight * 0.35)}
//         autoPlay={false}
//         data={data}
//         renderItem={renderItem}
//         loop={true}
//         onSnapToItem={handleSnapToItem}
//         style={styles.carousel}
//       />

//       <TouchableOpacity
//         style={[
//           styles.arrowRight,
//           {
//             right: 20,
//             top: viewportWidth > viewportHeight ? "12%" : "15%",
//           },
//         ]}
//         onPress={() => {
//           carouselRef.current?.scrollTo({ count: 1, animated: true });
//         }}>
//         <FontAwesome name="angle-right" size={viewportWidth < 430 ? 60 : 80} color="rgb(45, 62, 95)" />
//       </TouchableOpacity>

//       {isLoading ? (
//         <ActivityIndicator
//           size="large"
//           color="orange"
//           style={[
//             styles.loading,
//             { marginBottom: viewportWidth > viewportHeight ? 140 : 340 },
//           ]}
//         />
//       ) : (
//         <>
//           {showPrompt && (
//             <Text style={[styles.prompt, { marginBottom: viewportWidth > viewportHeight ? 30 : 50 }]}>
//               {data[activeIndex].prompt}
//             </Text>
//           )}
//           <View style={styles.carousel2}>{data[activeIndex].component}</View>
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: "center",
//     marginTop: 10,
//     width: "100%",
//   },
//   carousel2: {
//     marginTop: 10,
//   },
//   carousel: {
//     width: Math.round(Dimensions.get("window").width * 0.8),
//   },
//   prompt: {
//     fontSize: 30,
//     color: "rgb(45, 62, 95)",
//   },
//   item: {
//     gap: 10,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     paddingHorizontal: 10,
//     shadowColor: "#000",
//     shadowOffset: { width: 8, height: 7 },
//     shadowOpacity: 0.22,
//     shadowRadius: 9.22,
//     elevation: 12,
//     marginHorizontal: 15,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//   },
//   arrowLeft: {
//     position: "absolute",
//     transform: [{ translateY: -10 }],
//     zIndex: 1,
//   },
//   arrowRight: {
//     position: "absolute",
//     transform: [{ translateY: -10 }],
//     zIndex: 1,
//   },
//   icon: {
//     paddingTop: 10,
//   },
//   loading: {},
// });

// export default Home;
