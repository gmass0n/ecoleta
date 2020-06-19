import React, { useCallback, useState, useEffect } from 'react';
import { Feather as FeatherIcon } from '@expo/vector-icons';
import { StyleSheet, View, Text, Image, SafeAreaView, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import { SvgUri } from 'react-native-svg';
import { FlatList, TouchableOpacity } from 'react-native-gesture-handler';
import * as Location from 'expo-location';

import api from '../../services/api';

interface IItem {
  id: number;
  name: string;
  image_url: string;
}

interface IPoint {
  id: number;
  name: string;
  image: string;
  latitude: number;
  longitude: number;
  image_url: string;
}

interface IParams {
  uf: string;
  city: string;
}

const Points: React.FC = () => {
  const { params } = useRoute();
  const { goBack, navigate } = useNavigation();

  const [items, setItems] = useState<IItem[]>([]);
  const [points, setPoints] = useState<IPoint[]>([]);
  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const { city, uf } = params as IParams;

  const loadPosition = useCallback(async () => {
    try {
      const { status } = await Location.requestPermissionsAsync();

      if(status !== 'granted') {
        Alert.alert('Oooops...', 'Precisamos de sua permissão para obter a localização!')
        return;
      }
  
      const location = await Location.getCurrentPositionAsync();
  
      const { latitude, longitude } = location.coords;
  
      setCurrentPosition([
        latitude,
        longitude
      ]);
    } catch (error) {

    }
  }, []);

  const loadItems = useCallback(async () => {
    try {
      const response = await api.get('/items');

      if(response.data) {
        setItems(response.data);
      }
    } catch(error) {

    }
  }, []);

  const loadPoints = useCallback(async () => {
   try {
    const response = await api.get('/points', {
      params: {
        city,
        uf,
        items: selectedItems
      }
    });

    if(response.data) {
      setPoints(response.data);
    }
  } catch (error) {

  }
  }, [city, uf, selectedItems]);

  useEffect(() => {
    Promise.all([
      loadPosition(),
      loadItems(),
      loadPoints()
    ])
  }, [loadItems, loadPosition, loadPoints])

  const handleNavigateBack = useCallback(() => {
    goBack();
  }, [goBack]);

  const handleNavigateToDetail = useCallback((pointId: number) => {
    navigate(
      'Detail', {
        pointId
      }
    );
  }, [navigate]);

  const handleSelectItem = useCallback((itemId: number) => {
    const alredySelected = selectedItems.findIndex((selectedItem) => selectedItem === itemId);

    if (alredySelected >= 0) {
      setSelectedItems(selectedItems.filter((selectedItem) => selectedItem !== itemId));
    } else {
      setSelectedItems((prevState) => ([
        ...prevState,
        itemId
      ]));
    }
  }, [selectedItems]);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <FeatherIcon name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>

        <Text style={styles.title}>
          😜 Bem vindo.
        </Text>
{/* 
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text> */}

        <Text style={styles.description}>
          {`Foram encontrados ${points.length} pontos de coleta., você pode acha-los no mapa.`}
        </Text>

        <View style={styles.mapContainer}>
          {currentPosition[0] !== 0 && (
              <MapView 
              style={styles.map}
              initialRegion={{
                latitude: currentPosition[0],
                longitude: currentPosition[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
              loadingEnabled={currentPosition[0] === 0}
            >
              {points.map((point) => (
                <Marker
                  key={String(point.id)}
                  style={styles.mapMarker} 
                  onPress={() => handleNavigateToDetail(point.id)}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image 
                      style={styles.mapMarkerImage}
                      source={{uri: point.image_url}} 
                    />

                    <Text style={styles.mapMarkerTitle}>
                      {point.name}
                    </Text>
                    </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <FlatList
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 32 }}
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item, index }) => (
            <TouchableOpacity 
              style={[{
                  ...styles.item, 
                  marginRight: items.length === index + 1 ? 0 : 8, 
                },
                selectedItems.includes(item.id) ? styles.selectedItem : {}
              ]}
              onPress={() => handleSelectItem(item.id)}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />

              <Text style={styles.itemTitle}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </SafeAreaView>
  )
}

export default Points;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  title: {
    fontSize: 20,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'Roboto_400Regular',
  },

  mapContainer: {
    flex: 1,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 32
  },

  map: {
    width: '100%',
    height: '100%',
  },

  mapMarker: {
    width: 90,
    height: 80, 
  },

  mapMarkerContainer: {
    width: 90,
    height: 70,
    backgroundColor: '#34CB79',
    flexDirection: 'column',
    borderRadius: 8,
    overflow: 'hidden',
    alignItems: 'center'
  },

  mapMarkerImage: {
    width: 90,
    height: 45,
    resizeMode: 'cover',
  },

  mapMarkerTitle: {
    flex: 1,
    fontFamily: 'Roboto_400Regular',
    color: '#FFF',
    fontSize: 13,
    lineHeight: 23,
  },

  itemsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },

  item: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    height: 120,
    width: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    textAlign: 'center',
  },

  selectedItem: {
    borderColor: '#34CB79',
    backgroundColor: '#E1FAEC',
    borderWidth: 2,
  },

  itemTitle: {
    fontFamily: 'Roboto_400Regular',
    textAlign: 'center',
    fontSize: 13,
  },
});