import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import Background from '../components/Background';
import Logo from '../components/Logo';
import Header from '../components/Header';
import Button from '../components/Button';
import TextInput from '../components/TextInput';
import BackButton from '../components/BackButton';
import { theme } from '../core/theme';
import { emailValidator } from '../helpers/emailValidator';
import { passwordValidator } from '../helpers/passwordValidator';
import { nameValidator } from '../helpers/nameValidator';
import { idValidator } from '../helpers/idValidator';
import { careerValidator } from '../helpers/careerValidator';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState({ value: '', error: '' });
  const [id, setid] = useState({ value: '', error: '' });
  const [career, setCareer] = useState({ value: '', error: '' });
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [showAlert, setShowAlert] = useState(false); // Estado para controlar la visibilidad de la alerta

  const careerOptions = ['ISW', 'LTF', 'IAEV', 'ISA', 'IRC'];

  const handleCareerSelection = (selectedCareer) => {
    setCareer({ value: selectedCareer, error: '' });
    setIsDropdownVisible(false);
  };

  const [isDropdownVisible, setIsDropdownVisible] = useState(false); // Estado para controlar la visibilidad del dropdown

  const onSignUpPressed = async () => {
    const nameError = nameValidator(name.value);
    const idError = idValidator(id.value);
    const careerError = careerValidator(career.value);
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);

    if (emailError || passwordError || nameError || idError || careerError) {
      setName({ ...name, error: nameError });
      setid({ ...id, error: idError });
      setCareer({ ...career, error: careerError });
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return; // Retorna sin enviar la solicitud si hay errores en los campos
    }

    try {
      const response = await fetch('http://192.168.0.24:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.value,
          id: id.value,
          career: career.value,
          email: email.value,
          password: password.value,
        }),
      });

      if (response.ok) {
        // Registro exitoso, redirige a la pantalla de inicio de sesión
        navigation.replace('LoginScreen');
      } else {
        const { error } = await response.json();
        if (error === 'Email or ID already exists') {
          // El correo o el ID ya existen, mostrar una alerta
          setShowAlert(true);
        } else {
          // Ocurrió otro error durante el registro
          console.log('Error:', error);
        }
      }
    } catch (error) {
      console.log('Error:', error);
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Create Account</Header>
      <TextInput
        label="Name"
        returnKeyType="next"
        value={name.value}
        onChangeText={(text) => setName({ value: text, error: '' })}
        error={!!name.error}
        errorText={name.error}
      />
      <TextInput
        label="ID"
        returnKeyType="next"
        value={id.value}
        onChangeText={(text) => setid({ value: text, error: '' })}
        error={!!id.error}
        errorText={id.error}
      />
      <View style={styles.dropdownContainer}>
        <TouchableOpacity onPress={() => setIsDropdownVisible(!isDropdownVisible)}>
          <View style={styles.dropdownHeader}>
            <Text>{career.value || 'Select your career'}</Text>
          </View>
        </TouchableOpacity>
        {isDropdownVisible && (
          <View style={styles.dropdownContent}>
            {careerOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.dropdownOption}
                onPress={() => handleCareerSelection(option)}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
      <TextInput
        label="Email"
        returnKeyType="next"
        value={email.value}
        onChangeText={(text) => setEmail({ value: text, error: '' })}
        error={!!email.error}
        errorText={email.error}
        autoCapitalize="none"
        autoCompleteType="email"
        textContentType="emailAddress"
        keyboardType="email-address"
      />
      <TextInput
        label="Password"
        returnKeyType="done"
        value={password.value}
        onChangeText={(text) => setPassword({ value: text, error: '' })}
        error={!!password.error}
        errorText={password.error}
        secureTextEntry
      />
      {showAlert && (
        <View style={styles.alert}>
          <Text style={styles.alertText}>El correo electrónico o el ID ya existen</Text>
        </View>
      )}
      <Button mode="contained" onPress={onSignUpPressed} style={{ marginTop: 24 }}>
        Sign Up
      </Button>
      <View style={styles.row}>
        <Text>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.replace('LoginScreen')}>
          <Text style={styles.link}>Login</Text>
        </TouchableOpacity>
      </View>
    </Background>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginTop: 4,
  },
  link: {
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  alert: {
    backgroundColor: '#ff5252',
    padding: 10,
    marginBottom: 10,
    borderRadius: 4,
  },
  alertText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  dropdownContainer: {
    position: 'relative',
    zIndex: 1,
    width: 300,
    marginTop:10,
    marginBottom:10
    
  },
  dropdownHeader: {
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
  },
  dropdownContent: {
    position: 'absolute',
    backgroundColor: '#fff',
    elevation: 5,
    borderRadius: 4,
    top: '100%',
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  dropdownOption: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});