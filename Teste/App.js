import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import * as Location from 'expo-location';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';

export default function App() {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permissão de localização não concedida');
        return;
      }
  
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
  
      // Obtendo o endereço a partir das coordenadas
      const { latitude, longitude } = currentLocation.coords;
      
      // Usando a API de Geocodificação do Google Maps para obter o endereço
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=YOUR_GOOGLE_MAPS_API_KEY`);
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const locationData = data.results[0];
        setAddress(locationData.formatted_address);
      } else {
        setAddress('Endereço não encontrado');
      }
    })();
  }, []);

  const shareLocation = async () => {
    if (location) {
      const locationText = `Minha localização: Latitude ${location.coords.latitude}, Longitude ${location.coords.longitude}, Endereço: ${address}`;
      
      // Criando um arquivo temporário para conter o texto
      const fileUri = `${FileSystem.cacheDirectory}location.txt`;

      try {
        await FileSystem.writeAsStringAsync(fileUri, locationText);
        if (Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          console.log('Compartilhamento não suportado neste dispositivo');
        }
      } catch (error) {
        console.error('Erro ao compartilhar localização:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      {location && (
        <View>
          <Text>Latitude: {location.coords.latitude}</Text>
          <Text>Longitude: {location.coords.longitude}</Text>
          <Text>Endereço: {address}</Text>
        </View>
      )}
      <Button title="Compartilhar Localização" onPress={shareLocation} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
