import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image } from 'react-native';

export default function App() {
  return (
    <>
    <View style={styles.container}>
    <Text style={{color: "darkgrey", fontSize: 50, fontFamily: "Courier" }}>Welcome To</Text>
    <Text style={{color: "orange", fontSize: 50, fontFamily: "Courier" }}>Garden Loft</Text>
    <StatusBar style="auto" />
  </View>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FCF8E3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 400,
    height: 200,
    marginBottom: 50,
  }
});
