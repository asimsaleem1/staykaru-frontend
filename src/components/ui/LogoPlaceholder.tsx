import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// This is a temporary component that renders a placeholder logo
// You should replace this with a proper image file
const LogoPlaceholder = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>StayKaru</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    backgroundColor: '#4A90E2',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
});

export default LogoPlaceholder;
