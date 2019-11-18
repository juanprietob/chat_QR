import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import store from "./redux/store";
import {withRouter} from 'react-router-dom';
import {Card, Form, Container, Row, Alert, Button, ButtonToolbar, ListGroup, Table} from "react-bootstrap"
import {PlusCircle, XCircle, Layers, PlusSquare, Check, Edit3} from 'react-feather';
import ChatQrService from './chat-qr-service'
import _ from 'underscore'

class Business extends Component{
  constructor(props) {
    super(props);

    const {http} = props;

    this.chatqrservice = new ChatQrService();
    this.chatqrservice.setHttp(http);

    this.defaultBusiness = {
      "name": "",
      "users": [],
      "chat_ids": [],
      "type": "business",
      "wallet": {
        "wallet_name": ""
      },
      "currency": "COP",
      "coordinates": {
        longitude: "",
        latitude: ""
      },
      "business_type": "",
      "description": ""
    };

    this.state = {
    	viewAddBusiness: false,
    	newBusiness: this.defaultBusiness,
    	businesses: [],
      currencies: [],
      addNewChatId: "",
      addNewEmail: ""
    }
  }

  componentDidMount(){
  	const self = this;

    Promise.all([self.chatqrservice.getBusinesses(), self.chatqrservice.getCurrencies()])
    .then(function(res){
    	self.setState({...self.state, businesses: res[0].data, currencies: res[1].data});
    });
  }

  setViewAddBusiness(viewAddBusiness){
    this.setState({...this.state, viewAddBusiness})
  }

  createBusiness(event){
    const self = this;
    const {newBusiness, businesses} = self.state;

    event.preventDefault();

    if(newBusiness._id && newBusiness._rev){
      self.chatqrservice.updateBusiness(newBusiness)
      .then(function(){
        
        var index = _.indexOf(businesses, function(b){
          return b._id == newBusiness._id;
        });

        businesses[index] = newBusiness;

        self.setState({...self.state, 
          addNewEmail: "",
          newBusiness: self.defaultBusiness,
          businesses,
          viewAddBusiness: false
        });
      })
      .catch(alert)
    }else{
      console.log(newBusiness)
      self.chatqrservice.createBusiness(newBusiness)
      .then(function(){
        businesses.push(newBusiness);

        self.setState({...self.state, 
          addNewEmail: "",
          newBusiness: self.defaultBusiness,
          businesses,
          viewAddBusiness: false
        });
      })
      .catch(alert)
    }
  }

  getBusinesses(){
    const self = this;
    const {businesses} = this.state;
    
    var business_items = _.map(businesses, function(b){
      return (<tr>
          <td>{b.name}</td>
          <td>{b.chat_id}</td>
          <td>{b.wallet.wallet_name}</td>
          <td>{b.currency}</td>
          <td><Button variant="warning" onClick={()=>{
            self.setState({...self.state, newBusiness: b, viewAddBusiness: true});
          }}> <Edit3/></Button></td>
        </tr>);
    })

    return (
      <Card>
        <Card.Header as="h5" style={{padding: 0}}><Alert variant="info" style={{marginBottom: 0}}>Business</Alert></Card.Header>
        <Card.Body>
          <Table striped bordered hover variant="dark">
            <thead>
              <tr>
                <th>Name</th>
                <th>Chat Id</th>
                <th>Wallet</th>
                <th>Currency</th>
                <th>Edit</th>
              </tr>
            </thead>
            <tbody>
              {business_items}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
      );
  }

  getBusinessUsers(){
  	const self = this;
  	const {newBusiness} = self.state;

  	return _.map(newBusiness.users, function(e, index){
  		return (<ListGroup.Item variant="light">{e} <Button variant="warning" onClick={()=>{
        	const {newBusiness} = self.state;
        	newBusiness.users.splice(index, 1);
        	self.setState({...self.state, newBusiness});
        }}><XCircle/></Button></ListGroup.Item>);
  	})
  }

  getBusinessChatIds(){
    const self = this;
    const {newBusiness} = self.state;

    return _.map(newBusiness.chat_ids, function(e, index){
      return (<ListGroup.Item variant="light">{e} <Button variant="warning" onClick={()=>{
          const {newBusiness} = self.state;
          newBusiness.chat_ids.splice(index, 1);
          self.setState({...self.state, newBusiness});
        }}><XCircle/></Button></ListGroup.Item>);
    })
  }

  getCurrencies(){
    const self = this;
    const {currencies} = self.state;

    return _.map(currencies, function(curr, key){
      return (<option>{key}</option>)
    });
  }

  getBusinessType(){
    return _.map(["Restaurant", "Bar", "Cafe", "Store", "Service", "Sport", "Transport"], function(type){
      return (<option>{type}</option>)
    })
  }

  getAddNewBusiness(){
  	const self = this;
    const {newBusiness, addNewEmail, addNewChatId} = self.state;
    var {coordinates} = newBusiness;

    if(!coordinates){
      coordinates = {
        latitude: "",
        longitude: ""
      };
    }

    return (
      <Card>
        <Card.Body>
          <Alert variant="info">
            <Form onSubmit={(e)=>{self.createBusiness(e)}}>
              <Form.Group controlId="businessName">
                <Form.Label>Business name</Form.Label>
                <Form.Control type="text" placeholder="Enter business name" value={newBusiness.name} onChange={(e)=>{
                  var business = newBusiness;
                  business.name = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>
              
              <Form.Group controlId="chatId">
                <Form.Label>Chat Id</Form.Label>

                <Form.Control type="number" placeholder="Telegram chat id" value={addNewChatId} onChange={(e)=>{
                  this.setState({...this.state, addNewChatId: e.target.value});
                }}/>

                <Button variant="info" onClick={()=>{
                  const {newBusiness, addNewChatId} = self.state;
                  newBusiness.chat_ids.push(addNewChatId);
                  self.setState({...self.state, newBusiness, addNewChatId: ""});
                }}>
                  <PlusCircle/>
                </Button>

                
                <ListGroup variant="info">
                {self.getBusinessChatIds()}
                </ListGroup>

              </Form.Group>

              <Form.Group controlId="businessUser">
                <Form.Label>User email</Form.Label>
                <Form.Control type="text" placeholder="Add user email" value={addNewEmail} onChange={(e)=>{
                  this.setState({...this.state, addNewEmail: e.target.value});
                }}/>
                <Button variant="info" onClick={()=>{
                	const {newBusiness, addNewEmail} = self.state;
                	newBusiness.users.push(addNewEmail);
                	self.setState({...self.state, newBusiness, addNewEmail: ""});
                }}>
                	<PlusCircle/>
              	</Button>
              	<ListGroup variant="info">
				        {self.getBusinessUsers()}
				        </ListGroup>
              </Form.Group>
              <Form.Group controlId="walletName">
                <Form.Label>Wallet name</Form.Label>
                <Form.Control type="text" placeholder="Wallet name" value={newBusiness.wallet.wallet_name} onChange={(e)=>{
                  var business = newBusiness;
                  business.wallet.wallet_name = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>
              <Form.Group controlId="currencies">
                <Form.Label>Currency type</Form.Label>
                <Form.Control as="select" placeholder="Currency type" value={newBusiness.currency} onChange={(e)=>{
                  var business = newBusiness;
                  business.currency = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}>
                  {self.getCurrencies()}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="coordinates">
                <Form.Label>Coordinates</Form.Label>
                <Form.Control type="number" placeholder="Latitude" value={coordinates.latitude} onChange={(e)=>{
                  var business = newBusiness;
                  business.coordinates.latitude = Number(e.target.value);
                  this.setState({...this.state, newBusiness: business});
                }}/>
                <Form.Control type="number" placeholder="Longitude" value={coordinates.longitude} onChange={(e)=>{
                  var business = newBusiness;
                  business.coordinates.longitude = Number(e.target.value);
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="businessType">
                <Form.Label>Type</Form.Label>
                <Form.Control as="select" placeholder="Business type" value={newBusiness.business_type} onChange={(e)=>{
                  var business = newBusiness;
                  business.business_type = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}>
                  {self.getBusinessType()}
                </Form.Control>
              </Form.Group>

              <Form.Group controlId="url">
                <Form.Label>Web</Form.Label>
                <Form.Control type="url" placeholder="URL" value={newBusiness.url} onChange={(e)=>{
                  var business = newBusiness;
                  business.url = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="facebook">
                <Form.Label>Facebook</Form.Label>
                <Form.Control type="url" placeholder="Facebook url" value={newBusiness.facebook} onChange={(e)=>{
                  var business = newBusiness;
                  business.facebook = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="instagram">
                <Form.Label>Instagram</Form.Label>
                <Form.Control type="url" placeholder="Instagram url" value={newBusiness.instagram} onChange={(e)=>{
                  var business = newBusiness;
                  business.instagram = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="twitter">
                <Form.Label>Twitter</Form.Label>
                <Form.Control type="url" placeholder="Twitter url" value={newBusiness.twitter} onChange={(e)=>{
                  var business = newBusiness;
                  business.twitter = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="whatsapp">
                <Form.Label>Whatsapp</Form.Label>
                <Form.Control type="url" placeholder="Whatsapp" value={newBusiness.whatsapp} onChange={(e)=>{
                  var business = newBusiness;
                  business.whatsapp = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="maps">
                <Form.Label>Google maps</Form.Label>
                <Form.Control type="url" placeholder="Google maps url" value={newBusiness.maps} onChange={(e)=>{
                  var business = newBusiness;
                  business.maps = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Form.Group controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control as="textarea" placeholder="Description" value={newBusiness.description} onChange={(e)=>{
                  var business = newBusiness;
                  business.description = e.target.value;
                  this.setState({...this.state, newBusiness: business});
                }}/>
              </Form.Group>

              <Button variant="primary" type="submit">
                <Check/>
              </Button>
            </Form>
          </Alert>
        </Card.Body>
      </Card>
      );
  }

  render() {
    const self = this;
    const {user} = self.props;
    const {viewAddBusiness} = self.state;

    var businessView;
    if(viewAddBusiness){
      businessView = self.getAddNewBusiness();
    }else{
      businessView = self.getBusinesses();
    }

    return (<Container>
    	<Row>
          <ButtonToolbar>
            <Button variant="primary" onClick={()=>{
              self.setState({...self.state, viewAddBusiness: false})
            }}><Layers/></Button>
            <Button variant="primary" onClick={()=>{
              self.setState({...self.state, viewAddBusiness: true, newBusiness: self.defaultBusiness});
            }}><PlusSquare/></Button>
          </ButtonToolbar>
        </Row>
		<Row class="justify-content-center">
		  {businessView}
		</Row>
	</Container>);               

  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http, 
    user: state.jwtAuthReducer.user
  }
}

export default withRouter(connect(mapStateToProps)(Business));

