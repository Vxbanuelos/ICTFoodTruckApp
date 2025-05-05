// This file is used to create a dynamic route in the settings tab
// It uses the expo-router library to handle navigation and routing
//app/tabs/settings/[settingType].js

import {Link,Stack,useLocalSearchParams} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet,Text,View } from 'react-native';


export default function Index() {


const{settingType}=useLocalSearchParams();
  return (
    <>
    <Stack.Screen options={{ headerShown: true, title: "Settings:Details" }} />
    <View style={styles.container}>
      <Text style={{fontSize:24}}>Detail page of Settings Tab</Text>
      <Text style={{fontSize:24,marginTop:8}}>{settingType}</Text>
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