import React, { Component } from 'react';
import './App.css';
import Joi from 'joi';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import svg from './assets/spinner.svg';
import L from 'leaflet';
import {
  Card,
  Button,
  CardTitle,
  CardText,
  Form,
  FormGroup,
  Label,
  Input
} from 'reactstrap';

let myIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [25 / 2, 41],
  popupAnchor: [0, 0]
});

const schema = Joi.object().keys({
  name: Joi.string()
    .alphanum()
    .regex(/^[A-Za-zÀ-ÿ]{1,100}$/),
  message: Joi.string()
    .min(1)
    .max(500)
    .required()
});

const API_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api/v1/messages'
    : 'https://leafletv1.herokuapp.com/api/v1/messages';

class App extends Component {
  state = {
    location: {
      lat: 51.505,
      lng: -0.09
    },
    messageForm: {
      name: '',
      message: ''
    },
    haveUsersLocation: false,
    zoom: 2,
    sendingMessage: false,
    sentMessage: false,
    messages: []
  };

  componentDidMount = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((messages) => {
        this.setState({
          messages
        });
      });
    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          },
          haveUsersLocation: true,
          zoom: 13
        });
      },
      () => {
        fetch('https://ipapi.co/json')
          .then((response) => response.json())
          .then((location) => {
            this.setState({
              location: {
                lat: location.latitude,
                lng: location.longitude
              },
              haveUsersLocation: true,
              zoom: 13
            });
          });
      }
    );
  };

  inputChanged = (event) => {
    let { name, value } = event.target;

    this.setState((prevState) => ({
      messageForm: {
        ...prevState.messageForm,
        [name]: value
      }
    }));
  };

  formIsValid = () => {
    const { name, message } = this.state.messageForm;
    const userMessage = {
      name,
      message
    };

    const result = Joi.validate(userMessage, schema);
    return !result.error && this.state.haveUsersLocation ? true : false;
  };
  messageFormSubmitted = (event) => {
    event.preventDefault();
    if (this.formIsValid()) {
      this.setState({
        sendingMessage: true
      });
      fetch(API_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          name: this.state.messageForm.name,
          message: this.state.messageForm.message,
          latitude: this.state.location.lat,
          longitude: this.state.location.lng
        })
      })
        .then((response) => response.json())
        .then((message) => {
          console.log(message);
          setTimeout(() => {
            this.setState({
              sendingMessage: false,
              sentMessage: true
            });
          }, 1000);
        });
    }
  };

  render() {
    console.log(this.state.messages.length === 0);
    const position = [this.state.location.lat, this.state.location.lng];
    let form = null;
    let markers = null;

    if (!this.state.sendingMessage && !this.state.sentMessage) {
      form = (
        <React.Fragment>
          <Form id='messageForm' onSubmit={this.messageFormSubmitted}>
            <FormGroup>
              <Label for='name'>Name</Label>
              <Input
                type='text'
                name='name'
                id='name'
                placeholder='Enter your name'
                onChange={this.inputChanged}
              />
            </FormGroup>
            <FormGroup>
              <Label for='message'>Message</Label>
              <Input
                type='textarea'
                name='message'
                id='message'
                placeholder='Enter your message'
                onChange={this.inputChanged}
              />
            </FormGroup>
          </Form>
          <Button
            form='messageForm'
            color='info'
            disabled={!this.formIsValid()}
          >
            Send
          </Button>{' '}
        </React.Fragment>
      );
    } else if (this.state.sendingMessage) {
      form = <img src={svg} />;
    }

    // Markers

    if (this.state.haveUsersLocation) {
      markers = this.state.messages.map((message) => {
        if (
          Number.parseFloat(message.latitude).toFixed(8) ===
            Number.parseFloat(this.state.location.lat).toFixed(8) &&
          Number.parseFloat(message.longitude).toFixed(8) ===
            Number.parseFloat(this.state.location.lng).toFixed(8)
        ) {
          myIcon.options.iconUrl =
            'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
        } else {
          console.log(message, this.state.location);
        }
        return (
          <Marker
            position={[message.latitude, message.longitude]}
            icon={myIcon}
          >
            <Popup>
              <em>
                {message.name}: {message.message}
              </em>
            </Popup>
          </Marker>
        );
      });
    } else if (
      this.state.messages.length === 0 ||
      !this.state.haveUsersLocation
    ) {
      markers = (
        <Marker position={position} icon={myIcon}>
          <Popup>
            A pretty CSS3 popup. <br /> Easily customizable.
          </Popup>
        </Marker>
      );
    }

    return (
      <div className='Map'>
        <Map center={position} zoom={this.state.zoom} className='Map'>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          {markers}
        </Map>
        <Card body className='message-form'>
          <CardTitle>Welcome to Mapper</CardTitle>
          <CardText>Leave a message with your location!</CardText>
          <CardText>Thanks for stopping by.</CardText>
          {form}
          {this.state.sentMessage ? <CardText><strong>Thanks For submitting the message</strong></CardText>}
        </Card>
      </div>
    );
  }
}

export default App;
