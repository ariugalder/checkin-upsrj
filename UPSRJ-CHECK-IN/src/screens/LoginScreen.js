import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, View, Alert } from 'react-native';
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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [showAlert, setShowAlert] = useState(false);

  const onLoginPressed = async () => {
    const emailError = emailValidator(email.value);
    const passwordError = passwordValidator(password.value);
    if (emailError || passwordError) {
      setEmail({ ...email, error: emailError });
      setPassword({ ...password, error: passwordError });
      return;
    }

    try {
      const response = await fetch('http://192.168.0.24:3000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.value,
          password: password.value,
        }),
      });

      if (response.ok) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Dashboard',
              params: {
                userEmail: email.value, // Pasar el correo electrónico del usuario en sesión
              },
            },
          ],
        });
      } else {
        const errorData = await response.json();
        setShowAlert(true);
        throw new Error(errorData.error);
      }
    } catch (error) {
      console.error('Error during login:', error);
      // Manejar el error de autenticación aquí, por ejemplo, mostrar un mensaje de error al usuario.
    }
  };

  return (
    <Background>
      <BackButton goBack={navigation.goBack} />
      <Logo />
      <Header>Welcome back.</Header>
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
          <Text style={styles.alertText}>Correo o contraseña incorrectos</Text>
        </View>
      )}
      <Button mode="contained" onPress={onLoginPressed}>
        Login
      </Button>
    </Background>
  );
}

const styles = StyleSheet.create({
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
});