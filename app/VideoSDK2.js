import React, { useState, useEffect, useRef } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Dimensions,
  Alert,
  Modal,
  Button,
} from "react-native";
import {
  MeetingProvider,
  useMeeting,
  useParticipant,
  MediaStream,
  RTCView,
  createCameraVideoTrack,
} from "@videosdk.live/react-native-sdk";
import { createMeeting, token } from "../components/api";
import { FIRESTORE_DB } from "../FirebaseConfig";
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import * as Notifications from "expo-notifications";
import { getAuth, onAuthStateChanged } from "firebase/auth";  // Import onAuthStateChanged
import { useLocalSearchParams } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CallDeclineModal from "./CallDeclineModal";

const { width: viewportWidth, height: viewportHeight } =
  Dimensions.get("window");

let auth = getAuth();  // Initialize auth

// Function to handle the call logic
const callUser = async (calleeUid, user) => {
  if (!user) {
    Alert.alert("User is not authenticated");
    return;
  }

  const newMeetingId = await createMeeting({ token });

  const callerDoc = await getDoc(doc(FIRESTORE_DB, "users", user.uid));
  const caller = callerDoc.data().userName;

  const calleeDoc = await getDoc(doc(FIRESTORE_DB, "users", calleeUid));
  if (!calleeDoc.exists()) {
    Alert.alert("Callee not found");
    return;
  }
  const calleeData = calleeDoc.data();
  const calleePushToken = calleeData.pushToken;
  const callee = calleeDoc.data().userName;

  await setDoc(
    doc(FIRESTORE_DB, "users", user.uid),
    { callerId: newMeetingId },
    { merge: true }
  );
  await setDoc(
    doc(FIRESTORE_DB, "users", calleeUid),
    { calleeId: newMeetingId },
    { merge: true }
  );

  const message = {
    to: calleePushToken,
    sound: "default",
    title: "Incoming Call",
    body: `${caller} is calling you`,
    data: {
      meetingId: newMeetingId,
      callerUid: user.uid,
      caller: caller,
      calleeUid: calleeUid,
      callee: callee,
    },
    categoryId: "incoming_call",
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(message),
  });
};

export { callUser };

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function JoinScreen() {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#F6F6FF",
        justifyContent: "center",
        paddingHorizontal: 60,
        width: viewportWidth * 0.8,
      }}
    >
      <Text>Join the meeting by pressing the button below</Text>
    </SafeAreaView>
  );
}

const IconButton = ({ onPress, iconName, buttonText, backgroundColor }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: backgroundColor,
        flexDirection: "row",
        gap: 2,
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        borderRadius: 8,
        marginBottom: 40,
      }}
    >
      <MaterialCommunityIcons name={iconName} size={24} color="white" />
      <Text style={{ color: "white", fontSize: 16 }}>{buttonText}</Text>
    </TouchableOpacity>
  );
};

function ControlsContainer({
  join,
  leave,
  end,
  handleEnd,
  toggleWebcam,
  toggleMic,
  addPeople,
  isWebcamOn,
  isMicOn,
}) {
     const router = useRouter();
  console.log("handleEnd function:", handleEnd);

  const handleBack = () => {
    router.back();
  };

  return (
    <View
      style={{
        padding: 24,
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 20,
        width: viewportWidth * 0.9,
      }}
    >
      <IconButton
        onPress={() => toggleWebcam()}
        iconName="camera"
        buttonText={isWebcamOn ? "Turn Webcam On" : "Turn Webcam Off"}
        backgroundColor={isWebcamOn ? "green" : "red"}
      />
      <IconButton
        onPress={() => toggleMic()}
        iconName="microphone"
        buttonText={isMicOn ? "Turn Mic Off" : "Turn Mic On"}
        backgroundColor={isMicOn ? "red" : "green"}
      />
      <IconButton
        onPress={() => {
          handleEnd();
          handleBack();
        }}
        iconName="phone-hangup"
        buttonText="End"
        backgroundColor="red"
      />
      {/* <IconButton
        onPress={addPeople}
        iconName="account-plus"
        buttonText="Add People"
        backgroundColor="green"
      /> */}
    </View>
  );
}

function ParticipantView({ participantId }) {
  const { webcamStream, webcamOn, setQuality } = useParticipant(participantId);

  useEffect(() => {
    if (webcamOn) {
      setQuality("high");
    }
  }, [webcamOn]);

  if (webcamOn && webcamStream) {
    return (
      <RTCView
        streamURL={new MediaStream([webcamStream.track]).toURL()}
        objectFit="cover"
        style={{
          flex: 1,
          margin: 8,
          width: viewportWidth * 0.9,
          height: viewportHeight * 0.65,
        }}
      />
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          margin: 8,
          backgroundColor: "#DBD2CE",
          justifyContent: "center",
          alignItems: "center",
          width: viewportWidth * 0.9,
          height: viewportHeight * 0.65,
          borderRadius: 10,
        }}
      >
        <Text style={{ fontSize: 18 }}>Webcam is off</Text>
      </View>
    );
  }
}

function ParticipantList({ participants }) {
  return participants.length > 0 ? (
    <View
      style={{
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
      }}
    >
      {participants.map((participantId) => (
        <ParticipantView key={participantId} participantId={participantId} />
      ))}
    </View>
  ) : (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F6F6FF",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 18 }}>No participants yet.</Text>
    </View>
  );
}

function MeetingView({
  autoJoin,
  setAutoJoin,
  onMeetingEnd,
  customVideoTrack,
}) {
  const { join, end, leave, toggleWebcam, toggleMic, meetingId, participants } =
    useMeeting({
      config: {
        multiStream: false,
      },
      onMeetingJoined: () => {
        console.log("onMeetingJoined");
      },
      onMeetingLeft: () => {
        console.log("onMeetingLeft");
        onMeetingEnd();
        handleEnd();
      },
    });

  useEffect(() => {
    return () => {
      if (typeof leave === "function") {
        try {
          leave();
        } catch (error) {
          console.error("Error leaving meeting:", error);
        }
      }
    };
  }, []);

  const handleEnd = async () => {
    try {
      if (typeof leave === "function") await leave();
      console.log("handleend leave activated");
      if (typeof end === "function") await end();
      console.log("handleend end activated");
    } catch (error) {
      console.error("Error ending meeting:", error);
    } finally {
      setAutoJoin(false);
    }
  };

  const handleJoin = () => {
    if (typeof join === "function") {
      join();
      if (customVideoTrack) {
        toggleWebcam(customVideoTrack);
      } else {
        toggleWebcam();
      }
    }
  };

  const participantsArrId = [...participants.keys()];
  const [modalVisible, setModalVisible] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);

  const handleToggleWebcam = () => {
    toggleWebcam();
    setIsWebcamOn((prev) => !prev);
  };

  const handleToggleMic = () => {
    toggleMic();
    setIsMicOn((prev) => !prev);
  };

  useEffect(() => {
    if (autoJoin) {
      handleJoin();
      setIsWebcamOn(true);
      setIsMicOn(true);
      setAutoJoin(false);
    }
  }, [autoJoin, setAutoJoin]);

  useEffect(() => {
    const fetchContacts = async () => {
      const contactsCollection = collection(
        FIRESTORE_DB,
        `users/${auth.currentUser?.uid}/addedContacts`
      );
      const contactsSnapshot = await getDocs(contactsCollection);
      const contactsList = contactsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setContacts(contactsList);
    };

    fetchContacts();
  }, []);

  const addPeople = () => {
    setModalVisible(true);
  };

  const handleAddPeople = async () => {
    if (selectedContact) {
      await callUser(selectedContact.id, auth.currentUser);
    }
    setModalVisible(false);
    setSelectedContact(null);
  };

  return (
    <View
      style={{
        flex: 1,
        width: viewportWidth * 0.9,
        height: viewportHeight * 0.5,
        alignContent: "center",
        backgroundColor: "white",
        borderRadius: 40,
      }}
    >
      {meetingId ? (
        <Text style={{ fontSize: 22, padding: 16 }}>
          Video Call: {meetingId}
        </Text>
      ) : null}
      <ParticipantList participants={participantsArrId} />
      <ControlsContainer
        handleEnd={handleEnd}
        join={handleJoin}
        leave={leave}
        toggleWebcam={handleToggleWebcam}
        toggleMic={handleToggleMic}
        isWebcamOn={isWebcamOn}
        isMicOn={isMicOn}
        addPeople={addPeople}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <View
            style={{
              width: 300,
              backgroundColor: "white",
              padding: 20,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18, marginBottom: 10 }}>
              Select a contact to add:
            </Text>
            <FlatList
              data={contacts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setSelectedContact(item)}>
                  <Text
                    style={{
                      padding: 10,
                      backgroundColor:
                        selectedContact?.id === item.id ? "#ddd" : "#fff",
                    }}
                  >
                    {item.userName}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Button title="Add" onPress={handleAddPeople} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const createCustomVideoTrack = async () => {
  try {
    const customTrack = await createCameraVideoTrack({
      optimizationMode: "text",
      encoderConfig: "h540p_w960p",
      facingMode: "user",
      multiStream: false,
    });
    return customTrack;
  } catch (error) {
    console.error("Error creating custom video track:", error);
    return null;
  }
};

export default function VideoSDK() {
  const [meetingId, setMeetingId] = useState(null);
  const [autoJoin, setAutoJoin] = useState(false);
  const [calleeName, setCalleeName] = useState("");
  const [declineModalVisible, setDeclineModalVisible] = useState(false);
  const notificationListener = useRef(null);
  const [customVideoTrack, setCustomVideoTrack] = useState(null);
  const params = useLocalSearchParams();
  const router = useRouter();

  useEffect(() => {
    // Add notification listener to listen for decline notification
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        const { decline } = notification.request.content.data;
        if (decline) {
          setDeclineModalVisible(true);
        }
      });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
    };
  }, []);


  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        const { accept, meetingId } = notification.request.content.data;
        if (accept) {
          // Route to VideoSDK screen when call is accepted
          router.push({
            pathname: "/VideoSDK2",
            params: { meetingId, autoJoin: true },
          });
        }
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
    };
  }, []);



  useEffect(() => {
    if (params.meetingId) {
      setMeetingId(params.meetingId);
    }
  }, [params.meetingId]);


  useEffect(() => {
    const setupCustomTrack = async () => {
      const track = await createCustomVideoTrack();
      setCustomVideoTrack(track);
    };
    setupCustomTrack();
  }, []);

  const getMeetingId = async (id) => {
    const newMeetingId = id == null ? await createMeeting({ token }) : id;
    setMeetingId(newMeetingId);
  };

  return meetingId ? (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: "#FCF8E3",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <CallDeclineModal
        visible={declineModalVisible}
        onDismiss={() => {
          setDeclineModalVisible(false);
        }}
        calleeName={calleeName}
      /> */}
      <MeetingProvider
        config={{
          meetingId,
          micEnabled: true,
          webcamEnabled: false,
          name: getAuth().currentUser?.displayName || "Test User",
          customCameraVideoTrack: customVideoTrack,
          optimizationMode: "text",
          mediaStream: false,
          adaptiveVideo: false,
          participantId: getAuth().currentUser?.uid,
          preferredProtocol: "udp",
          screenShareEnabled: true,
          speakerDetectionEnabled: true,
          recordingEnabled: true,
          chatEnabled: true,
          raiseHandEnabled: true,
          debug: true,
          networkBarEnabled: true,
          autoDeviceManagement: {
            audioInput: true,
            audioOutput: true,
          },
          layout: {
            type: "SPOTLIGHT",
            priority: "SPEAKER",
            gridSize: 9,
          },
        }}
        token={token}
        joinWithoutUserInteraction={true}
      >
        <MeetingView
          autoJoin={autoJoin}
          setAutoJoin={setAutoJoin}
          customVideoTrack={customVideoTrack}
          onMeetingEnd={() => {
            setMeetingId(null);
            setAutoJoin(false);
          }}
        />
      </MeetingProvider>
    </SafeAreaView>
  ) : (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <JoinScreen getMeetingId={getMeetingId} />
    </SafeAreaView>
  );
}
