import React, { useEffect, useState, useCallback, ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet'
import { LeafletMouseEvent } from 'leaflet' 
import { FiArrowLeft } from 'react-icons/fi';

import logo from '../../assets/logo.svg';

import api from '../../services/api';
import ibge from '../../services/ibge';

import Input from '../../components/Input';
import Select from '../../components/Select';
import Error from '../../components/Error';
import Loader from '../../components/Loader';
import Dropzone from '../../components/Dropzone';

import SuccessOverlay from '../SuccessOverlay';

import './styles.css';

interface IItem {
  id: number;
  name: string;
  image_url: string;
}

interface IState {
  id: number;
  uf: string;
  name: string;
}

interface ICity {
  id: number;
  name: string;
}

interface IBGERStatesesponse {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECitiesResponse {
  id: number;
  nome: string;
}

interface IRequest {
  name: string;
  email: string;
  image: string;
  whatsapp: string;
  uf: string;
  city: string;
  latitude: number;
  longitude: number;
  items: number[];
}

const CreatePoint: React.FC = () => {
  const [items, setItems] = useState<IItem[]>([]);
  const [states, setStates] = useState<IState[]>([])
  const [cities, setCities] = useState<ICity[]>([])

  const [currentPosition, setCurrentPosition] = useState<[number, number]>([0, 0]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })
  const [selectedUF, setSelectedUF] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0, 0]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    whatsapp: '',
    uf: '',
    city: '',
    position: '',
    items: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [scrollErrors, setScrollErrors] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setCurrentPosition([latitude, longitude]);
    })
  }, []);

  useEffect(() => {
    if(errors && scrollErrors) {
      let id: string = '';

      if(errors.name || errors.email || errors.whatsapp) {
        id = 'info';
      } else if (errors.position || errors.uf || errors.city) {
        id = 'address'
      } else if(errors.items) {
        id = 'items'
      }
      

      if(id !== '') {
        const element = document.getElementById(id);

        if(element) {
          window.scrollTo({
            top: element.offsetTop - 30,
            left: 0,
            behavior: 'smooth'
          });
        }
      }

      setScrollErrors(false);
    } 
  }, [errors, scrollErrors])

  const loadItems = useCallback(async () => {
    const response = await api.get('/items');
    
    setItems(response.data);
  }, []);

  const loadStates = useCallback(async () => {
    const response = await ibge.get<IBGERStatesesponse[]>('/estados');

      const parsedStates = response.data.map(state => {
        return {
          id: state.id,
          uf: state.sigla,
          name: state.nome
        }
      }) 

      setStates(parsedStates);
  }, []);

  useEffect(() => {
    Promise.all([
      loadItems(),
      loadStates(),
    ])
  }, [loadItems, loadStates]);

  useEffect(() => {
    async function loadCities() {
      if(selectedUF === '0') {
        return;
      }

      const response = await ibge.get<IBGECitiesResponse[]>(`/estados/${selectedUF}/municipios`);

      const parsedCities = response.data.map(city => {
        return {
          id: city.id,
          name: city.nome,
        }
      }) 

      setCities(parsedCities);
    }

    loadCities();
  }, [selectedUF]);

  const handleChangeInput = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setErrors((prevState) => ({
      ...prevState,
      [name]: ''
    }));

    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }))
  }, [])

  const handleSelectUF = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;

    if(value === '0') {
      setSelectedCity('0');
    };

    setErrors((prevState) => ({
      ...prevState,
      uf: ''
    }));

    setSelectedUF(value);
  }, []);

  const handleSelectCity = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
    setErrors((prevState) => ({
      ...prevState,
      city: ''
    }));

    setSelectedCity(event.target.value);
  }, []);
  
  const handleClickMap = useCallback((event: LeafletMouseEvent) => {
    setErrors((prevState) => ({
      ...prevState,
      position: ''
    }));

    setSelectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ]);
  }, []);
 
  const handleSelectItem = useCallback((itemId: number) => {
    setErrors((prevState) => ({
      ...prevState,
      items: ''
    }));

    const alredySelected = selectedItems.findIndex(selectedItem => selectedItem === itemId);

    if(alredySelected >= 0) {
      const filteredItems = selectedItems.filter(selectedItem => selectedItem !== itemId); 

      setSelectedItems(filteredItems);
    } else {
      setSelectedItems((prevState) => ([
        ...prevState,
        itemId
      ]));
    }
  }, [selectedItems]);

  const handleValidateName = useCallback(() => {
    if(!formData.name) {
      setErrors((prevState) => ({
        ...prevState,
        name: 'Insira um nome'
      }))
      return false;
    }

    return true;
  }, [formData.name])

  const handleValidateEmail = useCallback(() => {
    if(!formData.email) {
      setErrors((prevState) => ({
        ...prevState,
        email: 'Insira um e-mail'
      }))
      return false;
    }

    return true;
  }, [formData.email])

  const handleValidateWhatsapp = useCallback(() => {
    if(!formData.whatsapp) {
      setErrors((prevState) => ({
        ...prevState,
        whatsapp: 'Insira um número de whatsapp'
      }));
      return false;
    }

    return true;
  }, [formData.whatsapp])

  const handleValidatePosition = useCallback(() => {
    if(selectedPosition[0] === 0 && selectedPosition[1] === 0 ) {
      setErrors((prevState) => ({
        ...prevState,
        position: 'Selecione uma posição no mapa'
      }));
      return false;
    }

    return true;
  }, [selectedPosition])

  const handleValidateUF = useCallback(() => {
    if(selectedUF === '0') {
      setErrors((prevState) => ({
        ...prevState,
        uf: 'Selecione um estado'
      }));
      
      return false;
    }

    return true;
  }, [selectedUF]);

  const handleValidateCity = useCallback(() => {
    if(selectedCity === '0') {
      setErrors((prevState) => ({
        ...prevState,
        city: 'Selecione uma cidade'
      }));
      
      return false;
    }

    return true;
  }, [selectedCity]);

  const handleValidateItems = useCallback(() => {
    if(selectedItems.length === 0) {
      setErrors((prevState) => ({
        ...prevState,
        items: 'Selecione pelo menos um item de coleta'
      }));
      
      return false;
    }

    return true;
  }, [selectedItems]);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setScrollErrors(true);

    const nameIsValid = handleValidateName();
    const emailIsValid = handleValidateEmail();
    const whatsappIsValid = handleValidateWhatsapp();
    const positionIsValid = handleValidatePosition();
    const UFIsValid = handleValidateUF();
    const cityIsValid = handleValidateCity();
    const itemsIsValid = handleValidateItems();


    if(nameIsValid 
      && emailIsValid
      && whatsappIsValid
      && positionIsValid
      && UFIsValid
      && cityIsValid
      && itemsIsValid
      ) {
      try {
        setLoading(true);

        const { name, email, whatsapp } = formData;

        const data = new FormData();

        data.append('name', name);
        data.append('email', email);
        data.append('whatsapp', whatsapp);
        data.append('uf', selectedUF);
        data.append('city', selectedCity);
        data.append('latitude', String(selectedPosition[0]));
        data.append('longitude', String(selectedPosition[1]));
        data.append('items', selectedItems.join(','));
      
        if(selectedFile) {
          data.append('image', selectedFile);
        }

        setTimeout(async () => {
          await api.post('/points', data);

          setLoading(false);
          setSuccess(true);
        }, 1000)
      } catch (error) {
        setLoading(false);
        setSuccess(false);
      }
    } 
  }, [formData, handleValidateCity, handleValidateEmail, handleValidateItems, handleValidateName, handleValidatePosition, handleValidateUF, handleValidateWhatsapp, selectedCity, selectedFile, selectedItems, selectedPosition, selectedUF])

  return (
    <>
      {success && <SuccessOverlay />}

      <div id="page-create-point">
        <header>
          <img src={logo} alt="Ecoleta Logo"/>

          <Link to="/">
            <FiArrowLeft />
            
            <p>Voltar para home</p>
          </Link>
        </header>

        <form onSubmit={handleSubmit}>
          <h1>Cadastro do <br/> ponto de coleta</h1>

          <Dropzone onFileUploaded={setSelectedFile} />

          <fieldset id="info">
            <legend>
              <h2>Dados</h2>
            </legend>

            <Input 
              label="Nome da entidade" 
              name="name"
              value={formData.name}
              onChange={handleChangeInput}
              error={errors.name}
            />

            <div className="field-group">
              <Input 
                label="E-mail" 
                name="email"
                value={formData.email}
                onChange={handleChangeInput}
                error={errors.email}
              />

              <Input 
                label="Whastapp" 
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChangeInput}
                error={errors.whatsapp}
              />
            </div>
          </fieldset>

          <fieldset id="address">
            <legend>
              <h2>Endereço</h2>

              <span>Selecione o endereço no mapa</span>
            </legend>

            <div id="map">
              <Map center={currentPosition} zoom={15} onClick={handleClickMap}>
                <TileLayer
                  attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={selectedPosition} />
              </Map>

              {!!errors.position && <Error error={errors.position}/>}
            </div>

            <div className="field-group">
              <Select 
                label="Estado" 
                name="uf" 
                placeholder="Selecione um estado"
                value={selectedUF}
                onChange={handleSelectUF}
                error={errors.uf}
              >
                {states && states.map(state => (
                  <option key={state.id} value={state.uf}>
                    {`${state.uf} - ${state.name}`}
                  </option>
                ))}
              </Select>

              <Select 
                label="Cidade" 
                name="city" 
                placeholder={selectedUF === '0' ? "Selecione um estado antes" : 'Selecione uma cidade'}
                value={selectedCity}
                onChange={handleSelectCity}
                error={errors.city}
                disabled={selectedUF === '0'}
              >
                {cities && cities.map(city => (
                  <option key={city.id} value={city.name}>
                    {city.name}
                  </option>
                ))}
              </Select>
            </div>
          </fieldset>

          <fieldset id="items">
            <legend>
              <h2>Items de coleta</h2>

              <span>Selecione um ou mais items abaixo</span>
            </legend>

            <ul className="items-grid">
              {items && items.map(item => (
                <li 
                  key={item.id} 
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                  onClick={() => handleSelectItem(item.id)}
                >
                  <img src={item.image_url} alt={item.name} />

                  <span>{item.name}</span>
                </li>
              ))}
            </ul>

            {!!errors.items && <Error error={errors.items} />}
          </fieldset>

          <button type="submit" id="submit-button">
            {loading ? <Loader /> : 'Cadastrar ponto de coleta'}
          </button>
        </form>
      </div>
    </>
  )
}

export default CreatePoint;