import React, { Component } from 'react';
import { connect } from "react-redux";

import ChatQrService from './chat-qr-service'

import Container from "react-bootstrap/Container"
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import CardColumns from 'react-bootstrap/CardColumns';
import Image from 'react-bootstrap/Image';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import ListGroup from 'react-bootstrap/ListGroup';

import {Home, Coffee, ShoppingCart, Briefcase, Compass, Facebook, Twitter, Map, Instagram} from 'react-feather';

import GoogleMapReact from 'google-map-react';
import _ from 'underscore';

class LocationInfo extends Component{

  constructor(props){
    super(props);
    const self = this;

    self.ref = {};
    self.state = {
      show: false,
      target: null,
      businessPublicInfo: [],
      mapsKey: ''
    }
  }

  handleClick(e){
    const target = e.target;
    this.setState({...this.state, target, show: !this.state.show});
  }

  componentDidUpdate(prevProps){
    const {show} = this.state;
    const {mapClicked} = this.props;

    if(show && prevProps.mapClicked != mapClicked){
      this.setState({...this.state, show: false});
    }
  }

  getUrls(business){
    var urls = [];
    if(business.url){
      urls.push(
        <ListGroup.Item variant="secondary">
          <Card.Link href={business.url} target="_blank">Visit us</Card.Link>
        </ListGroup.Item>
      );
    }
    if(business.facebook){
      urls.push(
        <ListGroup.Item variant="secondary">
          <Card.Link href={business.facebook} target="_blank"><Facebook/> Facebook</Card.Link>
        </ListGroup.Item>)
    }
    if(business.instagram){
      urls.push(
        <ListGroup.Item variant="secondary">
          <Card.Link href={business.instagram} target="_blank"><Instagram/> Instagram</Card.Link>
        </ListGroup.Item>)
    }
    if(business.twitter){
      urls.push(
        <ListGroup.Item variant="secondary">
          <Card.Link href={business.twitter} target="_blank"><Twitter/> Twitter</Card.Link>
        </ListGroup.Item>)
    }
    if(business.maps){
      urls.push(
        <ListGroup.Item variant="secondary">
          <Card.Link href={business.maps} target="_blank"><Map/> Maps</Card.Link>
        </ListGroup.Item>)
    }

    return (
      <ListGroup>
        {urls}
      </ListGroup>
      )
  }

  getMapIcon(business){
    
    if(_.find(["Restaurant", "Bar", "Cafe"], (bt)=>{return business.business_type == bt})){
      return (<Coffee/>);
    }else if(_.find(["Store", "Sport"], (bt)=>{return business.business_type == bt})){
      return (<ShoppingCart/>);
    }else if(_.find(["Service"], (bt)=>{return business.business_type == bt})){
      return (<Briefcase/>);
    }else if(_.find(["Transport"], (bt)=>{return business.business_type == bt})){
      return (<Compass/>);
    }else{
      return (<Home/>);
    }
  }

  render(){
    const self = this;
    const {target, show} = self.state;
    const {business} = self.props;
    
    return (
      <ButtonToolbar ref={node => self.ref = node}>
        <Button variant="light" size="sm" style={{padding: 0}} onClick={(t)=>{self.handleClick(t)}}>{self.getMapIcon(business)}</Button>
        <Overlay
          show={show}
          target={target}
          placement="auto"
          container={self.ref.current}
          containerPadding={0}
        >
          <Tooltip id={_.uniq()} className="map-tooltip">
            <Card style={{width: '12rem'}} bg="info">
              <Card.Header>{business.name}</Card.Header>
              <Card.Body>
                <Card.Text>
                  {business.description}
                </Card.Text>
                {self.getUrls(business)}
              </Card.Body>
            </Card>
          </Tooltip>
        </Overlay>
      </ButtonToolbar>
    )
  }
}

const mapStateToPropsLocationInfo = (state, ownProps) => {
  return {
    mapClicked: state.navbarReducer.mapClicked
  }
}

const LocationInfoComponent = connect(mapStateToPropsLocationInfo)(LocationInfo);

class Welcome extends Component {

  constructor(props){
    super(props);
    const self = this;

    self.state = {
      latitude: 4.60971,
      longitude: -74.08175
    }

    const {http} = props;
    this.chatqrservice = new ChatQrService();
    this.chatqrservice.setHttp(http);

    self.chatqrservice.getMapsKey()
    .then(function(res){
      self.setState({...self.state, mapsKey: res.data});
    })
  }

  componentDidMount(){
    const self = this;
    if(navigator && navigator.geolocation){
      navigator.geolocation.getCurrentPosition((position)=>{self.getLatLon(position)});
    }
    self.chatqrservice.getBusinessesPublicInfo()
    .then(function(res){
      self.setState({...self.state, businessPublicInfo: res.data});
    });
  }

  getLatLon(position) {
    const self = this;
    self.setState({...self.state, latitude: position.coords.latitude, longitude: position.coords.longitude});
  }

  drawLocations(){
    const self = this;
    const {businessPublicInfo} = self.state;

    return _.map(businessPublicInfo, function(business){
      return (<LocationInfoComponent
        lat={business.coordinates.latitude}
        lng={business.coordinates.longitude}
        business={business}
      />)
    });
  }

  drawMap(){
    const self = this;
    const {latitude, longitude, mapsKey} = self.state;
    const {development} = self.props;
    
    if(mapsKey){
      return (<GoogleMapReact
        bootstrapURLKeys={{key: mapsKey}}
        defaultCenter={{lat: latitude, lng: longitude}}
        defaultZoom={12}
        onClick={(e)=>{
          self.props.mapClicked(e);
        }}
      >
      {self.drawLocations()}
      </GoogleMapReact>)
    }else if(development){
      return (<GoogleMapReact
        defaultCenter={{lat: latitude, lng: longitude}}
        defaultZoom={12}
        onClick={(e)=>{
          self.props.mapClicked(e);
        }}
      >
      {self.drawLocations()}
      </GoogleMapReact>)
    }else{
      return '';
    }
    
  }

  render(){
    const self = this;
    
    return (
      <Container>
        <Row>
          <CardColumns>
            <Card bg="light" text="dark">
              <Card.Header>¿Qué es Bitcoin?</Card.Header>
              <Card.Body>
                <Card.Text>
                  Es la moneda digital del futuro que se usa en el presente en casi todo el mundo. Cada vez más los principales comercios están aceptando Bitcoins. En Colombia está comenzando a usarse y Bit2Cash te ayudará a hacerlo. 
                </Card.Text>
              </Card.Body>
            </Card>
            <Card bg="light" text="dark">
              <Card.Header>¿Qué es Bit2Cash?</Card.Header>
              <Card.Body>
                <Card.Text>
                  Bit2cash es una plataforma digital segura que permite utilizar Bitcoins como forma de pago. Bit2cash se encarga de convertirlos a pesos (COP) y hacértelos llegar.  
                </Card.Text>
              </Card.Body>
            </Card>
            <Card bg="light" text="dark">
              <Card.Header>¿Cómo empezar?</Card.Header>
              <Card.Body>
                <Card.Text>
                  Usa nuestro robot Telegram para generar códigos QR que pueden ser presentados a tu cliente. 
                  Descarga Telegram de <a href="https://telegram.org/">https://telegram.org/</a> y adiciona
                  nuestro robot <a href="https://telegram.me/bit2cashBot">@bit2cashBot</a> a tus contactos. 
                  Para generar tu primer QR, envía un mensaje usando '$' y el monto de la transacción. 
                  Si es la primera vez que usas nuestro servicio contáctanos en <a href="https://telegram.me/purpurato">@purpurato</a> o <a href="mailto:contact@bit2cash.site">contact@bit2cash.site</a> para crear tu cuenta. 
                </Card.Text>
              </Card.Body>
            </Card>
          </CardColumns>
        </Row>
        <Row>
          <Col>
            <Card bg="light" text="dark">
              <Card.Header>
                Nuestro mapa de clientes bit2cash
              </Card.Header>
              <Card.Body style={{ height: '90vh', width: '100%' }}>
                {self.drawMap()}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>);
  }  
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.navbarReducer.http
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    mapClicked: event => {
      dispatch({
        type: 'map-clicked',
        event
      });
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);