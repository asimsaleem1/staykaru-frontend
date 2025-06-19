import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FormButton } from '../../components/ui/FormElements';
import LogoPlaceholder from '../../components/ui/LogoPlaceholder';
import StayKaruTextLogo from '../../components/ui/StayKaruTextLogo';
import { AuthNavigationProp } from '../../types/navigation.types';

const WelcomeScreen = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const [imageError, setImageError] = useState(false);
  
  // Use the new text-based logo by default if we're in development mode
  // This helps prevent bundling issues during development
  const useTextLogo = __DEV__ || imageError;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>        <View style={styles.logoContainer}>
          {!useTextLogo ? (
            <Image 
              source={require('../../../assets/logo.png')} 
              style={styles.logo} 
              resizeMode="contain"
              onError={() => setImageError(true)}
            />
          ) : (
            <StayKaruTextLogo size={150} />
          )}
          <Text style={styles.title}>StayKaru</Text>
          <Text style={styles.subtitle}>Your All-in-One Campus Life Solution</Text>
        </View><View style={styles.buttonContainer}>
          <FormButton 
            title="Sign In" 
            onPress={() => navigation.navigate('Login')} 
            style={styles.button}
          />
          <FormButton 
            title="Create Account"            onPress={() => navigation.navigate('Register')} 
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4b7bec',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  button: {
    backgroundColor: '#4b7bec',
    marginBottom: 16,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#4b7bec',
  }
});

export default WelcomeScreen;
