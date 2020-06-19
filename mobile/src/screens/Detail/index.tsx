import React, { useCallback, useEffect, useState } from 'react';
import { 
  Feather as FeatherIcon, 
  FontAwesome as FontAwesomeIcon
} from '@expo/vector-icons';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  SafeAreaView,
  Linking 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as MailComposer from 'expo-mail-composer';
import { RectButton, TouchableOpacity } from 'react-native-gesture-handler';

import api from '../../services/api';

interface IParams {
  pointId: number;
}

interface IData {
  point: {
    image: string;
    name: string;
    email: string;
    whatsapp: string;
    city: string;
    uf: string;
    image_url: string; 
  };
  items: {
    title: string;
  }[];
}

const Detail: React.FC = () => {
  const { params } = useRoute();
  const { goBack } = useNavigation();

  const { pointId } = params as IParams;

  const [data, setData] = useState<IData>({} as IData);

  useEffect(() => {
    async function loadPoint() {
      try {
        const response = await api.get(`/points/${pointId}`);

        if(response.data) {
          setData(response.data);
        }
      } catch (error) {
        
      }
    }

    loadPoint();
  }, [])

  const handleNavigateBack = useCallback(() => {
    goBack();
  }, [])

  const handleComposeMail = useCallback(() => {
    MailComposer.composeAsync({
      subject: 'Interesse na coleta de resíduos',
      recipients: [data.point.email],
    }); 
  }, [])

  const handleWhatsapp = useCallback(() => {
    Linking.openURL(`whatsapp://send?phone=55${data.point.whatsapp}&text=Tenho interesse na coleta de resíduos`)
  }, []);

  if(!data.point) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <FeatherIcon name="arrow-left" color="#34cb79" size={20} />
        </TouchableOpacity>

        <Image 
          style={styles.pointImage}
          source={{uri: data.point.image_url}} 
        />

        <Text style={styles.pointName}>
          {data.point.name}
        </Text>

        <Text style={styles.pointItems}>
          {data.items.map(item => item.title)}
        </Text>

        <View style={styles.address}>
          <Text style={styles.addressTitle}>
            Endereço
          </Text>

          <Text style={styles.addressContent}>
            {`${data.point.city} - ${data.point.uf}`}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleWhatsapp}>
          <FontAwesomeIcon name="whatsapp" size={20} color="#fff" />

          <Text style={styles.buttonText}>
            Whatsapp
          </Text>
        </RectButton>

        <RectButton style={styles.button} onPress={handleComposeMail}>
          <FeatherIcon name="mail" size={20} color="#fff" />

          <Text style={styles.buttonText}>
            E-mail
          </Text>
        </RectButton>
      </View>
    </SafeAreaView>
  )
}

export default Detail; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  pointImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginTop: 32,
  },

  pointName: {
    color: '#322153',
    fontSize: 28,
    fontFamily: 'Ubuntu_700Bold',
    marginTop: 24,
  },

  pointItems: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  address: {
    marginTop: 32,
  },
  
  addressTitle: {
    color: '#322153',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  },

  addressContent: {
    fontFamily: 'Roboto_400Regular',
    lineHeight: 24,
    marginTop: 8,
    color: '#6C6C80'
  },

  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    paddingVertical: 20,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  
  button: {
    width: '48%',
    backgroundColor: '#34CB79',
    borderRadius: 10,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    marginLeft: 8,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Roboto_500Medium',
  },
});