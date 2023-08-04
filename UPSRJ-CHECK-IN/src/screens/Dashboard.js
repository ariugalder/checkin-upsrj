import React, { useState, useEffect } from 'react';
import Background from '../components/Background';
import Header from '../components/Header';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import axios from 'axios';
import User from '../components/user';
import { Alert, Modal, Text, Pressable } from 'react-native';
import { StyleSheet, View } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Dashboard({ navigation, route }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alumnos, setAlumnos] = useState([]);
  const [currentDateTime, setCurrentDateTime] = useState(null);
  const [userSession, setUserSession] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState(null);
  const { userEmail } = route.params;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://192.168.0.24:3000/alumnos');
        const data = response.data;
        setAlumnos(data);
      } catch (error) {
        console.error('Error al obtener los datos', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchLastCheckInTime = async () => {
      try {
        const response = await axios.get(`http://192.168.0.24:3000/checkin?user=${userEmail}`);
        const checkIns = response.data;
        if (checkIns.length > 0) {
          const lastCheckIn = checkIns[checkIns.length - 1];
          setCurrentDateTime(lastCheckIn.dateTime);
          setLastCheckInTime(new Date(lastCheckIn.dateTime));
          setIsCheckedIn(true);
        }
      } catch (error) {
        console.error('Error al obtener el último check-in:', error);
      }
    };

    setUserSession(userEmail);
    fetchLastCheckInTime();
  }, [userEmail]);

  const showAlert = (message) => {
    setAlertMessage(message);
    setModalVisible(true);
  };

  const handleRecordCheckIn = async () => {
    const canCheckInAgain = (() => {
      if (!lastCheckInTime) return true;

      const currentTime = new Date();
      const oneMinuteLater = new Date(lastCheckInTime);
      oneMinuteLater.setMinutes(oneMinuteLater.getMinutes() + 1); // Add 1 minute to the last check-in time

      return currentTime >= oneMinuteLater;
    })();

    if (isCheckedIn && !canCheckInAgain) {
    // Calculate the time remaining until the next check-in
    const currentTime = new Date();
    const oneMinuteLater = new Date(lastCheckInTime);
    oneMinuteLater.setMinutes(oneMinuteLater.getMinutes() + 1); // Add 1 minute to the last check-in time
    const timeRemaining = oneMinuteLater - currentTime;

    // Format the time remaining as seconds
    const secondsRemaining = Math.floor(timeRemaining / 1000);

    showAlert(`You can check in again in ${secondsRemaining} seconds`);
    return;
    }

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        showAlert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = location.coords;

      // Define the allowed location coordinates
      // const targetLatitude = 20.842912814443352; // Latitud de la ubicación permitida
      // const targetLongitude = -100.4330733332879; // Longitud de la ubicación permitida
      const targetLatitude = 20.552893815932485; // Latitud de la ubicación no permitida
      const targetLongitude = -100.41876323329602; // Longitud de la ubicación no permitida
      const distance = calculateDistance(latitude, longitude, targetLatitude, targetLongitude);

      console.log("Distance to allowed location (in kilometers):", distance);

      if (distance <= 0.25 && (!isCheckedIn || canCheckInAgain)) {
        const date = new Date();
        const formattedDateTime = date.toLocaleString();

        await axios.post('http://192.168.0.24:3000/checkin', {
          dateTime: formattedDateTime,
          user: userSession,
        });

        setIsCheckedIn(true);
        setCurrentDateTime(formattedDateTime);
        setLastCheckInTime(date);

        // Almacenar el estado en AsyncStorage
        await AsyncStorage.setItem('isCheckedIn', 'true');
        await AsyncStorage.setItem('lastCheckInTime', date.toString());

        showAlert('Check-in successful');
      } else if (distance > 0.5) {
        showAlert('You are not near the allowed location');
      } else if (!canCheckInAgain) {
        showAlert('You can check in again after 1 minute');
      }
    } catch (error) {
      console.error('Error al guardar el check-in:', error);
      showAlert('Error al guardar el check-in');
    }
  };

  const filteredAlumnos = alumnos.filter((alumno) => alumno.email === userEmail);

  return (
    <Background>
      <Header>CHECK-IN UPSRJ</Header>
      <User email={userEmail} />
      {filteredAlumnos.map((alumno) => (
        <View key={alumno._id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardHeaderText}>{alumno.name}</Text>
          </View>
          <View style={styles.cardBody}>
            <Paragraph>ID: {alumno.id}</Paragraph>
            <Paragraph>Career: {alumno.career}</Paragraph>
            <Paragraph>Email: {alumno.email}</Paragraph>
            <Paragraph>Record: {isCheckedIn ? currentDateTime : 'False'}</Paragraph>
          </View>
        </View>
      ))}

      <Button mode="contained" onPress={handleRecordCheckIn}>
        Record Check-In
      </Button>

      <Button
        width="100%"
        mode="outlined"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'StartScreen' }],
          })
        }
      >
        Logout
      </Button>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>{alertMessage}</Text>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setModalVisible(!modalVisible)}
            >
              <Text style={styles.textStyle}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Background>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 5,
  },
  cardHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Alineación centrada horizontal para el nombre del alumno
  },
  cardBody: {
    paddingTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center', // Alineación centrada horizontal para la alerta
    justifyContent: 'center', // Alineación centrada vertical para la alerta
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: '#6CC370',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radio de la Tierra en kilómetros
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distancia en kilómetros
};

const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};
