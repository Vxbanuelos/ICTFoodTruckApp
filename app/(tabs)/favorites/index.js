import {Link,Stack} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Text,View } from 'react-native';

export const options = { headerShown: false }
export default function Index() {
  return (
    <>
   
    <View style={styles.container}>
      <Text> Index of Settings</Text>
      <StatusBar style="auto" />  
      <Link href={"/home/detail-page"}>
        <Text>Go to Home</Text> 
      </Link>
      
    </View>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#a3c0cd',
    justifyContent: 'center',
    alignItems: 'center',
  },
});