import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/supabase-client';

export default function IndexPage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    async function init() {
      //  restore session from AsyncStorage
      const json = await AsyncStorage.getItem('supabaseSession');
      if (json) {
        try {
          const session = JSON.parse(json);
          await supabase.auth.setSession(session);
        } catch (e) {
          console.warn('⚠️ failed to parse/restore session:', e);
        }
      }

      //  ask Supabase for the current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!mounted) return;
      if (session) {
        router.replace('/(tabs)/home'); 
      } else {
        router.replace('/(auth)/login'); // ✅ corrected path
      }
    }

    init();

    // subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        router.replace('/(tabs)/home'); 
      } else {
        router.replace('/(auth)/login'); // corrected path
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  //  show loader while deciding
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
