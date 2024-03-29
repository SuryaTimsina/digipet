import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image, Vibration } from 'react-native';
import { Audio } from 'expo-av';

// Define states for the pet and corresponding image and sound paths
const faceStates = {
  happy: 'happy',
  sad: 'sad',
  angry: 'angry',
};

const imagePaths = {
  happy: require('./images/happy.png'),
  sad: require('./images/sad.png'),
  angry: require('./images/angry.png'),
};

const soundPaths = {
  happy: require('./sounds/happy.mp4'),
  sad: require('./sounds/sad.mp4'),
  angry: require('./sounds/angry.mp4'),
};

export default function App() {
  const [petState, setFaceState] = useState(faceStates.sad); // Set initial facestate
  const [currentSound, setCurrentSound] = useState(null); // current sound
  const [treats, setTreats] = useState(10); //treat count

  // Function to feed the pet
  const feedPet = async () => {
    setFaceState(faceStates.happy); // Change pet state to happy
    playSound(faceStates.happy); 
    setTreats(treats - 1); // Decrease treat count by 1
    Vibration.vibrate(); // Vibrate device
  };

  // Function  no treat 
  const handleNoTreat = () => {
    if (currentSound) {
      currentSound.stopAsync(); // Stop the current sound if playing
    }
    setFaceState(faceStates.angry); // Change pet state to angry
    playSound(faceStates.angry); // Play angry sound
  };

  // Function to play sound based on the pet state
  const playSound = async (state) => {
    if (currentSound) {
      await currentSound.pauseAsync(); // Pause the current sound
    }
    const { sound } = await Audio.Sound.createAsync(soundPaths[state]); // Load the sound
    setCurrentSound(sound); // Set the current sound
    await sound.playAsync(); // Play the sound
  };

  // Check treats every 10 seconds and change facestate accordingly
  useEffect(() => {
    const treatInterval = setInterval(() => {
      if (treats === 0) {
        setFaceState(faceStates.sad); // Change facestate to sad
        playSound(faceStates.sad); // Play less happy sound
      }
    }, 10000); // Repeat every 60 seconds

    return () => clearInterval(treatInterval); // Clear the interval on component unmount
  }, [treats]);

  // Reset pet state to less happy after 10 seconds if it's in happy state
  useEffect(() => {
    const resetInterval = setInterval(() => {
      if (petState === faceStates.happy) {
        setFaceState(faceStates.sad); // Change pet state to sad
        playSound(faceStates.sad); // Play less happy sound
      }
    }, 10000); // Repeat every 10 second, the pet needs treat in every 10s 

    return () => clearInterval(resetInterval); 
  }, [petState]);

  // Play sound when facestate changes
  useEffect(() => {
    playSound(petState); // Play sound based on the current facestate
    return () => {
      if (currentSound) {
        currentSound.unloadAsync(); // Unload the current sound on component unmount
      }
    };
  }, [petState]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Digipet App</Text>
      <View style={styles.petContainer}>
        <Image source={imagePaths[petState]} style={styles.petImage} />
      </View>
      <View style={styles.infoContainer}>
        <Text>Treats: {treats}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Feed Pet" onPress={feedPet} />
        <Button title="No Treat" onPress={handleNoTreat} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  petContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  petImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  infoContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
