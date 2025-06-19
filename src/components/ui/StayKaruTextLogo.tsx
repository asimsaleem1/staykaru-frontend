import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * A component that renders the StayKaru logo as a styled text element
 * inside a colored circle.
 * 
 * This is a reliable alternative to using an image file.
 */
const StayKaruTextLogo = ({ size = 150 }) => {
  // Dynamically scale text based on container size
  const fontSize = size * 0.27;
  
  return (
    <View style={[
      styles.container,
      { 
        width: size, 
        height: size, 
        borderRadius: size / 2 
      }
    ]}>
      <Text style={[styles.text, { fontSize }]}>
        StayKaru
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4b7bec',
    justifyContent: 'center',
    alignItems: 'center',
    // Add a subtle shadow
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StayKaruTextLogo;
