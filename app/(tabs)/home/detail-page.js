import {Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Text,View } from 'react-native';


export default function Index() {
  return (
    <>
    <Stack.Screen options={{ headerShown: true, title: "Home" }} />
    <View style={styles.container}>
      <Text Style={{fontsize:24}}> Detail Page of Home Tab</Text>
      <StatusBar style="auto" />  
       
    </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
});