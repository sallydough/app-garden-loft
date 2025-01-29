import React, { useState, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Modal } from "react-native";
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import Carousel from "react-native-reanimated-carousel";
import { VLCPlayer } from "react-native-vlc-media-player";
import {
  fetchUserHomeId,
  getFilteredEntities,
  controlDevice,
  fetchStreamUrl
} from "../homeAssistant";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

const Lights = () => {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
    const [modalCameraVisible, setModalCameraVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const carouselRef = useRef(null);  
const [cameraStreamUrl, setCameraStreamUrl] = useState(null);

  const videoRef = useRef(null);


  // Fetch all entities and their states on mount
  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const homeId = await fetchUserHomeId(); // Specify the correct Home Assistant instance ID
        const domains = [
          // "media_player",
          "light",
          "switch",
          "humidifier",
          "lock",
          "climate",
          "water_heater",
          "remote",
          "camera"
        ];
        const entities = await getFilteredEntities(homeId, domains);
        const filteredDevices = entities.map((entity) => ({
          id: entity.entity_id,
          name: entity.attributes.friendly_name || entity.entity_id,
          entityId: entity.entity_id,
          attributes: entity.attributes,
          state: entity.state, // Fetch current state
          domain: entity.entity_id.split(".")[0], // Extract domain (e.g., 'switch')
        }));
        setDevices(filteredDevices);
      } catch (error) {
        console.error("Failed to fetch entities:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEntities();
  }, []);

    // VideoPlayer component for VLCPlayer
const VideoPlayer = ({ streamUrl }) => {
  return (
    <View style={styles.videoContainer}>
      <VLCPlayer
        style={styles.videoPlayer}
        videoAspectRatio="16:9"
        source={{ uri: streamUrl,
          initOptions: [
            "--network-caching=10", // Lower caching for reduced latency
            "--live-caching=5",
            "--rtsp-tcp", // Force TCP (may improve stability)
            "--drop-late-frames", // Drop late frames to maintain real-time sync
            "--skip-frames", // Skip frames when decoding is slow
            "--no-stats", // Disable stats for better performance
            "--clock-jitter=0", // Reduce clock jitter
            "--clock-synchro=0", // Synchronize playback
          ],
         }}
         hwDecoderEnabled={1} // Enable hardware acceleration
         hwDecoderForced={1} // Force hardware acceleration
        onError={(error) => {
          console.error("Video Error:", error);
          alert("Failed to load video. Check the console for details.");
        }}
        onBuffering={(event) => {
          console.log("Buffering:", event);
        }}
        onPlaying={(event) => {
          console.log("Playing:", event);
        }}
        onStopped={(event) => {
          console.log("Stopped:", event);
        }}
      />
    </View>
  );
};

  const handleAction = async (device, action, value = null) => {
    if (isToggling) return;

    setIsToggling(true);
    try {
      let actionToUse = action;
      let payload = {
        homeId: await fetchUserHomeId(),
        domain: device.domain,
        entityId: device.entityId,
      };

      // Special case for media_player
      if (device.domain === "media_player" || "switch") {
        if (action === "toggle") {
          actionToUse = device.state === "off" ? "turn_on" : "turn_off";
          value = actionToUse === "turn_on"; // Set the value here based on action
        }
      }

      //Case for channel up and down
      if (device.domain === "remote" && action === "send_command") {
        payload = {
          ...payload,
          domain: "remote", // Explicitly set the domain for remote commands
          action: "send_command", // Service action
          value, // Command, e.g., "KEY_CHUP" or "KEY_CHDOWN"
        };
        console.log(
          `Remote command payload: entityId=${payload.entityId}, command=${value}`
        );
      }

      // General device control
      await controlDevice({
        ...payload,
        action: actionToUse,
        value,
      });
      console.log(
        `payload: ${payload.homeId} ${payload.domain}${payload.entityId}, action ${action}, value ${value},`
      );

      // Fetch the updated state to sync with Home Assistant
      const updatedEntities = await getFilteredEntities(
        payload.homeId,
        ["media_player", "remote", "light", "switch", "camera"] // Include switch domain for plug
      );

      // Update state dynamically
      setDevices((prevDevices) =>
        prevDevices.map((d) => {
          const updatedDevice = updatedEntities.find(
            (entity) => entity.entity_id === d.entityId
          );
          return updatedDevice
            ? {
                ...d,
                state: updatedDevice.state, // Sync with the actual state
              }
            : d;
        })
      );
    } catch (error) {
      console.error(`Failed to perform action on device ${device.id}`, error);
    } finally {
      setIsToggling(false);
    }
  };

  const openRemoteModal = (device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

const openCameraModal = async (device) => {
  console.log("Opening Camera Modal for:", device);
  try {
    const homeId = await fetchUserHomeId();
    const streamUrl = await fetchStreamUrl(homeId, device.entityId);
    setCameraStreamUrl(streamUrl);
    setSelectedDevice(device);
    setModalCameraVisible(true);
  } catch (error) {
    console.error("Failed to fetch camera stream URL:", error);
  }
};

const closeModal = () => {
  setModalVisible(false);
  setSelectedDevice(null);
  setCameraStreamUrl(null);
};

const closeCameraModal = () => {
  setModalCameraVisible(false);
  setSelectedDevice(null);
  setCameraStreamUrl(null);
};

  const renderItem = ({ item }) => {
    const icons = {
      light: "lightbulb",
      // media_player: "television",
      climate: "air-conditioner",
      sensor: "thermometer",
      lock: "lock",
      switch: "lightbulb",
      camera: "camera",
      // remote: "remote",
      remote: "television",
binary_sensor: "camera",
    };

    const icon = icons[item.domain] || "camera-control";

    const onPress = () => {
      if (item.domain === "remote" || item.domain === "media_player") {
        openRemoteModal(item);
      } else if (item.domain === "switch") {
        handleAction(item, "toggle");
      }else if (item.domain === "camera") {
        openCameraModal(item);
      }  else if (item.domain === "lock") {
        handleAction(item, item.state === "locked" ? "unlock" : "lock");
      } else if (item.domain === "climate") {
        handleAction(item, "set_temperature", 22); // Example for setting temperature
      } else if (item.domain === "lock") {
        handleDeviceAction(item, "toggle", item.state === "unlocked");
      }
    };

    return (
      <Pressable
        key={item.id}
        style={[
          styles.cardContainer,
          {
            backgroundColor: item.state === "on" ? "#f3b718" : "#f09030",
            transform: [{ scale: 0.8 }],
            height:
              viewportWidth > viewportHeight
                ? Math.round(Dimensions.get("window").height * 0.3)
                : Math.round(Dimensions.get("window").height * 0.25),
          },
        ]}
        onPress={onPress}
      >
        <MaterialCommunityIcons
          name={icon}
          size={94}
          color={
            item.state === "on" || item.state === "locked" ? "yellow" : "white"
          }
        />
        <Text style={styles.cardText}>{item.name}</Text>
      </Pressable>
    );
  };

  //render remote modal and controls
  const renderRemoteControls = () => {
    if (!selectedDevice) return null;

    const togglePower = async () => {
     // Optimistically update state
     setSelectedDevice((prevDevice) => ({
      ...prevDevice,
      state: prevDevice.state === "on" ? "off" : "on", // Toggle state optimistically
    }));

   setDevices((prevDevices) =>
      prevDevices.map((d) =>
        d.id === selectedDevice.entityId
          ? {
              ...d,
              state: selectedDevice.state === "on" ? "off" : "on",
            }
          : d
      )
    );

    // Perform the action
    await handleAction(selectedDevice, "toggle");

    // Fetch the latest state for the selected device
    const updatedEntities = await getFilteredEntities(
      selectedDevice.homeId,
      ["media_player", "remote", "light", "switch"]
    );

    const updatedDevice = updatedEntities.find(
      (entity) => entity.entity_id === selectedDevice.entityId
    );

    if (updatedDevice) {
      setSelectedDevice((prevDevice) => ({
        ...prevDevice,
        state: updatedDevice.state, // Sync the state with the updated device
      }));
    }
  };

  const toggleMute = async () => {
    if (!selectedDevice) return;

    // Optimistically update the local state
    setSelectedDevice((prevDevice) => ({
      ...prevDevice,
      isMuted: !prevDevice.isMuted,
    }));

    // Send the mute toggle command to Home Assistant
    await handleAction(
      { domain: "remote", entityId: selectedDevice.entityId },
      "send_command",
      "KEY_MUTE"
    );

    // Fetch updated state from Home Assistant to ensure synchronization
    const updatedEntities = await getFilteredEntities(
      await fetchUserHomeId(),
      ["remote"]
    );

    const updatedDevice = updatedEntities.find(
      (entity) => entity.entity_id === selectedDevice.entityId
    );

    if (updatedDevice) {
      setSelectedDevice((prevDevice) => ({
        ...prevDevice,
        isMuted: updatedDevice.attributes.isMuted || prevDevice.isMuted, // Use updated mute state
      }));
    }
  };

    return (
      <View
       style={styles.modalContent}>
        <Pressable style={styles.closeButton} onPress={closeModal}>
          <FontAwesome name="close" size={24} color="black" />
        </Pressable>

        <Text style={styles.modalTitle}>{selectedDevice.name} Controls</Text>
        <View style={styles.remoteContainer}>
          {/* Top Row */}
          <View style={[styles.row, styles.navButton]}>
            <Pressable
              style={[styles.iconButton, styles.navButton]}
              // onPress={
              //   () => handleAction(selectedDevice, "toggle") //
              // }
              onPress={togglePower}
            >
              <FontAwesome name="power-off" size={24} color={selectedDevice.state === "on" ? "#0EC50E" : "red"} />
              <Text style={styles.iconButtonText}>Power</Text>
            </Pressable>
            <Pressable
              style={[styles.iconButton, styles.navButton]}
              onPress={() =>
                handleAction(
                  { domain: "remote", entityId: selectedDevice.entityId },
                  "send_command",
                  "KEY_SOURCE"
                )
              }
            >
              <MaterialCommunityIcons name="export" size={24} color="black" />
              <Text style={styles.iconButtonText}>Input Source</Text>
            </Pressable>
            {/* <Pressable
            style={styles.iconButton}
            onPress={() =>
              handleAction(
                { domain: "remote", entityId: selectedDevice.entityId },
                "send_command",
                "KEY_GUIDE"
              )
            }
          >
            <MaterialCommunityIcons name="menu" size={24} color="black" />
            <Text style={styles.iconButtonText}>Guide</Text>
          </Pressable> */}
          </View>

          {/* Middle Section */}
          <View style={styles.row}>
            <View style={styles.column}>
              <Pressable
                style={styles.arrowButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_CHUP"
                  )
                }
              >
                <FontAwesome name="chevron-up" size={24} color="black" />
              </Pressable>
              <Text style={styles.arrowLabel}>Channel</Text>
              <Pressable
                style={styles.arrowButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_CHDOWN"
                  )
                }
              >
                <FontAwesome name="chevron-down" size={24} color="black" />
              </Pressable>
            </View>

            <View style={styles.column}>
              <Pressable
                style={styles.arrowButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_CH_LIST"
                  )
                }
              >
                <MaterialCommunityIcons
                  name="view-list-outline"
                  size={24}
                  color="black"
                />
                <Text style={styles.iconButtonText}>Channel List</Text>
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_ENTER"
                  )
                }
              >
                <FontAwesome name="circle" size={24} color="black" />
                <Text style={styles.iconButtonText}>OK</Text>
              </Pressable>
              <Pressable
                style={styles.arrowButton}
                // onPress={() =>
                //   handleAction(
                //     { domain: "remote", entityId: selectedDevice.entityId },
                //     "send_command",
                //     "KEY_MUTE"
                //   )
                // }
                onPress={toggleMute}
              >
                <MaterialCommunityIcons
                  name={selectedDevice.isMuted ? "volume-mute" : "volume-high"}
                  size={24}
                  color="black"

                />
                <Text>{selectedDevice.isMuted ? "Muted" : "Unmuted"} </Text>
              </Pressable>

            </View>

            <View style={styles.column}>
              <Pressable
                style={styles.arrowButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_VOLUP"
                  )
                }
              >
                <FontAwesome name="plus" size={24} color="black" />
              </Pressable>
              <Text style={styles.arrowLabel}>Volume</Text>
              <Pressable
                style={styles.arrowButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_VOLDOWN"
                  )
                }
              >
                <FontAwesome name="minus" size={24} color="black" />
              </Pressable>
            </View>
          </View>

          {/* Bottom Section
          <View style={styles.navControls}>
            <View style={styles.navControlsTop}>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_UP"
                  )
                }
              >
                <FontAwesome name="chevron-up" size={24} color="black" />
              </Pressable>
            </View>

            <View style={styles.navControlsTop}>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_LEFT"
                  )
                }
              >
                <FontAwesome name="chevron-left" size={24} color="black" />
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_ENTER"
                  )
                }
              >
                <FontAwesome name="circle" size={24} color="black" />
                <Text style={styles.iconButtonText}>OK</Text>
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_RIGHT"
                  )
                }
              >
                <FontAwesome name="chevron-right" size={24} color="black" />
              </Pressable>
            </View>

            <View style={styles.navControlsTop}>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_DOWN"
                  )
                }
              >
                <FontAwesome name="chevron-down" size={24} color="black" />
              </Pressable>
            </View>
          </View>

          <View style={styles.navControls}>
            <View style={styles.navControlsTop}>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_RETURN"
                  )
                }
              >
                <MaterialCommunityIcons
                  name="arrow-u-left-top"
                  size={24}
                  color="black"
                />
                <Text style={styles.iconButtonText}>Back</Text>
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_HOME"
                  )
                }
              >
                <FontAwesome name="home" size={24} color="black" />
                <Text style={styles.iconButtonText}>Home</Text>
              </Pressable>
              <Pressable
                style={styles.navButton}
                onPress={() =>
                  handleAction(
                    { domain: "remote", entityId: selectedDevice.entityId },
                    "send_command",
                    "KEY_EXIT"
                  )
                }
              >
                <MaterialCommunityIcons
                  name="exit-to-app"
                  size={24}
                  color="black"
                />
                <Text style={styles.iconButtonText}>Exit</Text>
              </Pressable>
            </View>
          </View> */}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { height: viewportWidth > viewportHeight ? 320 : 450 },
        ]}
      >
        {/* <ActivityIndicator size="large" color="#f3b718" />
        <Text>Loading devices...</Text> */}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { height: viewportWidth > viewportHeight ? 320 : 450 },
      ]}
    >
      <Carousel
        ref={carouselRef}
        data={devices}
        renderItem={renderItem}
        width={Math.round(viewportWidth * 0.3)}
        height={viewportHeight * 0.3}
        style={{
          width: Math.round(viewportWidth * 0.9),
          height: Math.round(viewportWidth * 0.5),
        }}
        loop
        onSnapToItem={(index) => setActiveIndex(index)}
      />
      {/* Prompt
//       {/* <Text
//         style={[
//           styles.prompt,
//           {
//             marginBottom: viewportWidth > viewportHeight ? 35 : 100,
//           },
//         ]}
//       >
//         {contacts[activeIndex].prompt && contacts[activeIndex].prompt}
//       </Text> */}
      <Pressable
        style={[
          styles.arrowLeft,
          {
            left: viewportWidth > viewportHeight ? -17 : -22,
            top: viewportWidth > viewportHeight ? "40%" : "30%",
          },
        ]}
        onPress={() => {
          carouselRef.current?.scrollTo({ count: -1, animated: true });
        }}
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
          carouselRef.current?.scrollTo({ count: 1, animated: true });
        }}
      >
        <FontAwesome name="angle-right" size={100} color="rgb(45, 62, 95)" />
      </Pressable>

      {/* media player modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>{renderRemoteControls()}</View>
      </Modal>
{/* doorbell camera streaming video modal */}
<Modal visible={modalCameraVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <Pressable style={styles.closeButton} onPress={closeCameraModal}>
            <FontAwesome name="close" size={24} color="black" />
          </Pressable>
          {cameraStreamUrl ? (

<VideoPlayer
streamUrl={cameraStreamUrl} /> // Use VLCPlayer for RTSP stream
            // <Video
            //   ref={videoRef}
            //   source={{ uri: cameraStreamUrl }}
            //   style={styles.videoPlayer}
            //   useNativeControls
            //   resizeMode="contain"
            //   onError={(error) => {
            //     console.error("Video Error:", error);
            //     alert("Failed to load video.");
            //   }}
            // />
          ) : (
            <Text>Loading camera feed...</Text>
          )}
        </View>
      </Modal>

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
    padding: 30,
    flexDirection: "column",
    gap: 20,
    shadowColor: "#000",
    shadowOffset: { width: 8, height: 7 },
    shadowOpacity: 0.22,
    shadowRadius: 9.22,
    elevation: 12,
  },
  cardText: {
    fontSize: 25,
    color: "#393939",
    fontWeight: "700",
    textAlign: "center",
  },
  prompt: {
    fontSize: 25,
    color: "#393939",
  },
  arrowLeft: {
    position: "absolute",
    top: "40%",
    left: -30,
    transform: [{ translateY: -50 }],
  },
  arrowRight: {
    position: "absolute",
    top: "40%",
    right: -30,
    transform: [{ translateY: -50 }],
  },
  loadingContainer: {
    position: "relative",
    alignItems: "center",
  },
    loadingContainer: {
    position: "relative",
    alignItems: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  // remote controls css
  modalContent: {
    backgroundColor: "white",
    padding: 30,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
    marginTop: 30,
    fontWeight: "bold",
  },
  remoteContainer: {
    // width: "90%",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "65%",
    marginBottom: 20,
    marginTop: 20,
    // backgroundColor: "red"
  },
  column: {
    alignItems: "center",
  },
  arrowButton: {
    marginVertical: 10,
    padding: 20,
    alignItems: "center",
    backgroundColor: "#f3b718",
    borderRadius: 10,
  },
  arrowLabel: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 5,
  },
  iconButton: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  iconButtonText: {
    marginTop: 5,
    fontSize: 14,
  },
  navControls: {
    flexDirection: "column",
    justifyContent: "center",
    marginTop: 10,
    padding: 15,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  navControlsTop: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  },
  navButton: {
    marginHorizontal: 10,
    padding: 15,
    paddingLeft: 25,
    paddingRight: 25,
    alignItems: "center",
    backgroundColor: "#f3b718",
    borderRadius: 10,
  },
  closeButton: {
    position: "absolute",
    top: 30,
    right: 30,
    backgroundColor: "lightblue",
    padding: 13,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  videoContainer: {
    width: "100%",
    height: "60%", // Adjust height as needed
    backgroundColor: "black", // Ensure the background is black for better visibility
  },
  videoPlayer: {
    width: "100%",
    height: "100%",
   
  },
});

export default Lights;





// import { View, Text, Pressable, StyleSheet, Dimensions, Modal } from "react-native";
// import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
// import Carousel from "react-native-reanimated-carousel";
// import { VLCPlayer } from "react-native-vlc-media-player";
// import {
//   fetchUserHomeId,
//   getFilteredEntities,
//   controlDevice,
//   fetchStreamUrl,
// } from "../homeAssistant";

// const { width: viewportWidth, height: viewportHeight } = Dimensions.get("window");




// const Lights = () => {
//   const [devices, setDevices] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isToggling, setIsToggling] = useState(false);
//   const [modalVisible, setModalVisible] = useState(false);
//   const [modalCameraVisible, setModalCameraVisible] = useState(false);
//   const [activeIndex, setActiveIndex] = useState(0);
//   const [selectedDevice, setSelectedDevice] = useState(null);
//   const [cameraStreamUrl, setCameraStreamUrl] = useState(null);
//   const carouselRef = useRef(null);
//   const videoRef = useRef(null);

//   // Fetch all entities and their states on mount
//   useEffect(() => {
//     const fetchEntities = async () => {
//       try {
//         const homeId = await fetchUserHomeId();
//         const domains = [
//           "light",
//           "switch",
//           "humidifier",
//           "lock",
//           "climate",
//           "water_heater",
//           "remote",
//           "camera",
//         ];
//         const entities = await getFilteredEntities(homeId, domains);
//         const filteredDevices = entities.map((entity) => ({
//           id: entity.entity_id,
//           name: entity.attributes.friendly_name || entity.entity_id,
//           entityId: entity.entity_id,
//           attributes: entity.attributes,
//           state: entity.state,
//           domain: entity.entity_id.split(".")[0],
//         }));
//         setDevices(filteredDevices);
//       } catch (error) {
//         console.error("Failed to fetch entities:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchEntities();
//   }, []);

//   // VideoPlayer component for VLCPlayer
// const VideoPlayer = ({ streamUrl }) => {
//   return (
//     <View style={styles.videoContainer}>
//       <VLCPlayer
//         style={styles.videoPlayer}
//         videoAspectRatio="16:9"
//         source={{ uri: streamUrl }}
//         hwDecoderEnabled={1} // Enable hardware acceleration
//   hwDecoderForced={1} // Force hardware acceleration
//         onError={(error) => {
//           console.error("Video Error:", error);
//           alert("Failed to load video. Check the console for details.");
//         }}
//         onBuffering={(event) => {
//           console.log("Buffering:", event);
//         }}
//         onPlaying={(event) => {
//           console.log("Playing:", event);
//         }}
//         onStopped={(event) => {
//           console.log("Stopped:", event);
//         }}
//       />
//     </View>
//   );
// };

//   const handleAction = async (device, action, value = null) => {
//     if (isToggling) return;

//     setIsToggling(true);
//     try {
//       let actionToUse = action;
//       let payload = {
//         homeId: await fetchUserHomeId(),
//         domain: device.domain,
//         entityId: device.entityId,
//       };

//       if (device.domain === "media_player" || "switch") {
//         if (action === "toggle") {
//           actionToUse = device.state === "off" ? "turn_on" : "turn_off";
//           value = actionToUse === "turn_on";
//         }
//       }

//       if (device.domain === "remote" && action === "send_command") {
//         payload = {
//           ...payload,
//           domain: "remote",
//           action: "send_command",
//           value,
//         };
//       }

//       await controlDevice({
//         ...payload,
//         action: actionToUse,
//         value,
//       });

//       const updatedEntities = await getFilteredEntities(
//         payload.homeId,
//         ["media_player", "remote", "light", "switch", "camera"]
//       );

//       setDevices((prevDevices) =>
//         prevDevices.map((d) => {
//           const updatedDevice = updatedEntities.find(
//             (entity) => entity.entity_id === d.entityId
//           );
//           return updatedDevice
//             ? {
//                 ...d,
//                 state: updatedDevice.state,
//               }
//             : d;
//         })
//       );
//     } catch (error) {
//       console.error(`Failed to perform action on device ${device.id}`, error);
//     } finally {
//       setIsToggling(false);
//     }
//   };

//   const openRemoteModal = (device) => {
//     setSelectedDevice(device);
//     setModalVisible(true);
//   };

//   const openCameraModal = async (device) => {
//     console.log("Opening Camera Modal for:", device);
//     try {
//       const homeId = await fetchUserHomeId();
//       const streamUrl = await fetchStreamUrl(homeId, device.entityId);
//       setCameraStreamUrl(streamUrl);
//       setSelectedDevice(device);
//       setModalCameraVisible(true);
//     } catch (error) {
//       console.error("Failed to fetch camera stream URL:", error);
//     }
//   };

//   const closeModal = () => {
//     setModalVisible(false);
//     setSelectedDevice(null);
//     setCameraStreamUrl(null);
//   };

//   const closeCameraModal = () => {
//     setModalCameraVisible(false);
//     setSelectedDevice(null);
//     setCameraStreamUrl(null);
//   };

//   const renderItem = ({ item }) => {
//     const icons = {
//       light: "lightbulb",
//       climate: "air-conditioner",
//       sensor: "thermometer",
//       lock: "lock",
//       switch: "lightbulb",
//       camera: "camera",
//       remote: "television",
//       binary_sensor: "camera",
//     };

//     const icon = icons[item.domain] || "camera-control";

//     const onPress = () => {
//       if (item.domain === "remote" || item.domain === "media_player") {
//         openRemoteModal(item);
//       } else if (item.domain === "camera") {
//         openCameraModal(item);
//       } else if (item.domain === "switch") {
//         handleAction(item, "toggle");
//       } else if (item.domain === "lock") {
//         handleAction(item, item.state === "locked" ? "unlock" : "lock");
//       } else if (item.domain === "climate") {
//         handleAction(item, "set_temperature", 22);
//       }
//     };

//     return (
//       <Pressable
//         key={item.id}
//         style={[
//           styles.cardContainer,
//           {
//             backgroundColor: item.state === "on" ? "#f3b718" : "#f09030",
//             transform: [{ scale: 0.8 }],
//             height:
//               viewportWidth > viewportHeight
//                 ? Math.round(Dimensions.get("window").height * 0.3)
//                 : Math.round(Dimensions.get("window").height * 0.25),
//           },
//         ]}
//         onPress={onPress}
//       >
//         <MaterialCommunityIcons
//           name={icon}
//           size={94}
//           color={item.state === "on" || item.state === "locked" ? "yellow" : "white"}
//         />
//         <Text style={styles.cardText}>{item.name}</Text>
//       </Pressable>
//     );
//   };

//   const renderRemoteControls = () => {
//     if (!selectedDevice) return null;

//     const togglePower = async () => {
//       setSelectedDevice((prevDevice) => ({
//         ...prevDevice,
//         state: prevDevice.state === "on" ? "off" : "on",
//       }));

//       setDevices((prevDevices) =>
//         prevDevices.map((d) =>
//           d.id === selectedDevice.entityId
//             ? {
//                 ...d,
//                 state: selectedDevice.state === "on" ? "off" : "on",
//               }
//             : d
//         )
//       );

//       await handleAction(selectedDevice, "toggle");

//       const updatedEntities = await getFilteredEntities(
//         selectedDevice.homeId,
//         ["media_player", "remote", "light", "switch"]
//       );

//       const updatedDevice = updatedEntities.find(
//         (entity) => entity.entity_id === selectedDevice.entityId
//       );

//       if (updatedDevice) {
//         setSelectedDevice((prevDevice) => ({
//           ...prevDevice,
//           state: updatedDevice.state,
//         }));
//       }
//     };

//     return (
//       <View style={styles.modalContent}>
//         <Pressable style={styles.closeButton} onPress={closeModal}>
//           <FontAwesome name="close" size={24} color="black" />
//         </Pressable>
//         <Text style={styles.modalTitle}>{selectedDevice.name} Controls</Text>
//         <View style={styles.remoteContainer}>
//           {/* Add your remote controls here */}
//         </View>
//       </View>
//     );
//   };

//   if (loading) {
//     return (
//       <View style={[styles.loadingContainer, { height: viewportWidth > viewportHeight ? 320 : 450 }]}>
//         <Text>Loading devices...</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={[styles.container, { height: viewportWidth > viewportHeight ? 320 : 450 }]}>
//       <Carousel
//         ref={carouselRef}
//         data={devices}
//         renderItem={renderItem}
//         width={Math.round(viewportWidth * 0.3)}
//         height={viewportHeight * 0.3}
//         style={{
//           width: Math.round(viewportWidth * 0.9),
//           height: Math.round(viewportWidth * 0.5),
//         }}
//         loop
//         onSnapToItem={(index) => setActiveIndex(index)}
//       />
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
//         <FontAwesome name="angle-left" size={100} color="rgb(45, 62, 95)" />
//       </Pressable>
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
//         <FontAwesome name="angle-right" size={100} color="rgb(45, 62, 95)" />
//       </Pressable>

//       <Modal visible={modalVisible} animationType="slide" transparent={true}>
//         <View style={styles.modalContainer}>{renderRemoteControls()}</View>
//       </Modal>

//       <Modal visible={modalCameraVisible} animationType="slide" transparent={true}>
//         <View style={styles.modalContainer}>
//           <Pressable style={styles.closeButton} onPress={closeCameraModal}>
//             <FontAwesome name="close" size={24} color="black" />
//           </Pressable>
//           {cameraStreamUrl ? (

// <VideoPlayer
// streamUrl={cameraStreamUrl} /> // Use VLCPlayer for RTSP stream
//             // <Video
//             //   ref={videoRef}
//             //   source={{ uri: cameraStreamUrl }}
//             //   style={styles.videoPlayer}
//             //   useNativeControls
//             //   resizeMode="contain"
//             //   onError={(error) => {
//             //     console.error("Video Error:", error);
//             //     alert("Failed to load video.");
//             //   }}
//             // />
//           ) : (
//             <Text>Loading camera feed...</Text>
//           )}
//         </View>
//       </Modal>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     position: "relative",
//     alignItems: "center",
//   },
//   cardContainer: {
//     width: viewportWidth * 0.3,
//     justifyContent: "center",
//     alignItems: "center",
//     borderRadius: 20,
//     marginHorizontal: 10,
//     padding: 30,
//     flexDirection: "column",
//     gap: 20,
//     shadowColor: "#000",
//     shadowOffset: { width: 8, height: 7 },
//     shadowOpacity: 0.22,
//     shadowRadius: 9.22,
//     elevation: 12,
//   },
//   cardText: {
//     fontSize: 25,
//     color: "#393939",
//     fontWeight: "700",
//     textAlign: "center",
//   },
//   prompt: {
//     fontSize: 25,
//     color: "#393939",
//   },
//   arrowLeft: {
//     position: "absolute",
//     top: "40%",
//     left: -30,
//     transform: [{ translateY: -50 }],
//   },
//   arrowRight: {
//     position: "absolute",
//     top: "40%",
//     right: -30,
//     transform: [{ translateY: -50 }],
//   },
//   loadingContainer: {
//     position: "relative",
//     alignItems: "center",
//   },
//   modalContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//   },
//   modalContent: {
//     backgroundColor: "white",
//     padding: 30,
//     borderRadius: 10,
//     alignItems: "center",
//   },
//   modalTitle: {
//     fontSize: 24,
//     marginBottom: 20,
//     marginTop: 30,
//     fontWeight: "bold",
//   },
//   remoteContainer: {
//     alignItems: "center",
//   },
//   row: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     width: "65%",
//     marginBottom: 20,
//     marginTop: 20,
//   },
//   column: {
//     alignItems: "center",
//   },
//   arrowButton: {
//     marginVertical: 10,
//     padding: 20,
//     alignItems: "center",
//     backgroundColor: "#f3b718",
//     borderRadius: 10,
//   },
//   arrowLabel: {
//     fontSize: 16,
//     fontWeight: "bold",
//     padding: 5,
//   },
//   iconButton: {
//     alignItems: "center",
//     marginHorizontal: 10,
//   },
//   iconButtonText: {
//     marginTop: 5,
//     fontSize: 14,
//   },
//   navControls: {
//     flexDirection: "column",
//     justifyContent: "center",
//     marginTop: 10,
//     padding: 15,
//     paddingLeft: 20,
//     paddingRight: 20,
//     backgroundColor: "#f0f0f0",
//     borderRadius: 5,
//   },
//   navControlsTop: {
//     flexDirection: "row",
//     justifyContent: "center",
//     marginTop: 10,
//   },
//   navButton: {
//     marginHorizontal: 10,
//     padding: 15,
//     paddingLeft: 25,
//     paddingRight: 25,
//     alignItems: "center",
//     backgroundColor: "#f3b718",
//     borderRadius: 10,
//   },
//   closeButton: {
//     position: "absolute",
//     top: 30,
//     right: 30,
//     backgroundColor: "lightblue",
//     padding: 13,
//     borderRadius: 5,
//   },
//   closeButtonText: {
//     color: "white",
//     fontWeight: "bold",
//   },
//   videoContainer: {
//     width: "100%",
//     height: "60%", // Adjust height as needed
//     backgroundColor: "black", // Ensure the background is black for better visibility
//   },
//   videoPlayer: {
//     width: "100%",
//     height: "100%",
   
//   },
// });

// export default Lights;
