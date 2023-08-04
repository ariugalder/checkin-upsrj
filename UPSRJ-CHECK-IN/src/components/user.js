import React from 'react'
import { Image, StyleSheet } from 'react-native'

export default function User() {
  return <Image source={require('../assets/user.png')} style={styles.image} />
}

const styles = StyleSheet.create({
  image: {
    margin: 50,
    width: 109,
    height: 125
  },
})