import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Divider } from 'antd';
import axios from 'axios';
import Logo from '../../assets/images/logo.png';
import Config from '../../constants/config';
import * as ROUTES from '../../constants/routes';
import { MailOutlined, LockOutlined, UserOutlined, ClusterOutlined } from '@ant-design/icons';
import {Navigate} from 'react-router-dom';
import { BrowserRouter as Router,  Link } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

const FormItem = Form.Item;
const INITIAL_STATE = {
  email: '',
  name: '',
  password: '',
  confirm_password: '',
  errors: '',
  success: ''
}
const [messageApi, contextHolder] = "";
class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = { ...INITIAL_STATE };
  }
 isAuthenticated() {
    const token = localStorage.getItem('token');
    return token && token.length > 10;
  }
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value, errors: '' });
    console.log(this.state);
  };
  onSubmit = event => {
    console.log(this.state);
    const { email, name, password, confirm_password } = this.state;
    event.preventDefault();
    const headers = {
      headers: {'content-type': 'application/json'}
    };
    var self = this;
    if(password !== confirm_password) {
      self.setState({errors: "Master password confirmation does not match."});
      self.setState({success: ""});
    } else {
      axios.post(Config.sign_up, {
        email: email,
        name: name,
        password: password,
        phone: "123456789"
      },headers)
      .then(function (response) {
        console.log(response);
        if(response.data.success === false) {
          self.notify("Whoops! This email already taken", true);
          self.setState({errors: response.data.message});
        }
        if(response.data.success === true) {
          self.notify("Account created successfully");
          self.setState({success: response.data.message});
          window.location.href = '/';
        }
      }).catch(function (error) {
        self.notify("Failed! Please try again", true);
        self.setState({errors: "Failed! Please try again"});
      });
    }
  };
  notify = (message, hasError = false) => {
    if (hasError) {
      toast.error(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    } else {
      toast(message, {
        position: 'top-center',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      })
    }
  }
  render() {
    const { email, name, password, confirm_password } = this.state;
    const isInvalid = email === '' || name === '' || password === '' || confirm_password === '';
    const isAlreadyAuthenticated = this.isAuthenticated();
    return (
      <div className="wrapper">
        <div className="container">
          {isAlreadyAuthenticated ? 
             <Navigate to="/home" replace={true} /> : 
              (
                <div type="flex" justify="center" align="middle">
                  <Row className="form-login">
                    <Col span={24}>
                      <img src={Logo} className="logo" alt="Password Vault"/>
                      <div className="welcome-administrator-section"><ClusterOutlined style={{ fontSize: '24px' }}/> <h1 className="welcome-administrator-title">Create account</h1></div>
                      <Divider />
                    </Col>
                    <Col span={24}>
                      <Form method="post"  name="userLoginForm" onSubmit={this.onSubmit} className="login-form" layout="vertical" initialValues={{layout: "vertical"}} type="flex" justify="center" align="middle">
                        <div className="errorMsg">{this.state.errors}</div>
                        <div className="successMessage">{this.state.success}</div>
                        <FormItem label="Email address">
                          <Input prefix={<MailOutlined />} placeholder="Your Email" name="email" value={this.state.email} onChange={this.onChange}/>
                        </FormItem>
                        <FormItem label="Name">
                          <Input prefix={<UserOutlined />} placeholder="Your Name" name="name" value={this.state.name} onChange={this.onChange}/>
                        </FormItem>
                        <FormItem label="Master password">
                          <Input prefix={<LockOutlined />} type="password" placeholder="**********" name="password" value={this.state.password} onChange={this.onChange}/>
                        </FormItem>
                        <FormItem label="Re-type master password">
                          <Input prefix={<LockOutlined />} type="password" placeholder="**********" name="confirm_password" value={this.state.confirm_password} onChange={this.onChange}/>
                        </FormItem>
                        <FormItem>
                          <Button type="primary" htmlType="submit" className="login-form-button" disabled={isInvalid} onClick={this.onSubmit}>
                            Create account
                          </Button>
                          <p>Already have an account? <Link to="/"><span>Log In</span></Link></p>
                        </FormItem>
                      </Form>
                    </Col>
                  </Row>
                  <ToastContainer
                    position='top-center'
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                  />
                </div>
              )
          }
        </div>
      </div>
    );
  }
}
export default SignUp;


