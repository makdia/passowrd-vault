import React from 'react';
import { Row, Col, Form, Button, Input } from 'antd';
import { Layout } from 'antd';
import Sidebar from '../Navigation/Sidebar';
import Header from '../Navigation/Header';
import { toast, ToastContainer } from 'react-toastify'
import {
  numbers,
  upperCaseLetters,
  lowerCaseLetters,
  specialCharacters,
  SUCCESS_MSG
} from './characters'
import 'react-toastify/dist/ReactToastify.css'
import { CopyOutlined, ReloadOutlined } from '@ant-design/icons';

const { Content } = Layout;

class Tools extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      windowHeight: null,
      password:  '',
      passwordLength:  10,
      includeUppercase:  true,
      includeLowercase:  false,
      includeNumbers:  false,
      includeSymbols:  false
    }
  }
  componentDidMount() {
    this.setState({ windowHeight: window.innerHeight });
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }
  handleGeneratePassword = (e) => {
    const { includeUppercase, includeLowercase, includeNumbers, includeSymbols } = this.state;
    if (
      !includeUppercase &&
      !includeLowercase &&
      !includeNumbers &&
      !includeSymbols
    ) {
      this.notify('You must Select atleast one option', true)
    }
    let characterList = ''

    if (includeLowercase) {
      characterList = characterList + lowerCaseLetters
    }

    if (includeUppercase) {
      characterList = characterList + upperCaseLetters
    }

    if (includeNumbers) {
      characterList = characterList + numbers
    }

    if (includeSymbols) {
      characterList = characterList + specialCharacters
    }

    this.setState({ password: this.createPassword(characterList)})
  }
  createPassword = (characterList) => {
    let password = ''
    const characterListLength = characterList.length

    for (let i = 0; i < this.state.passwordLength; i++) {
      const characterIndex = Math.round(Math.random() * characterListLength)
      password = password + characterList.charAt(characterIndex)
    }
    return password
  }
  copyToClipboard = () => {
    const newTextArea = document.createElement('textarea')
    newTextArea.innerText = this.state.password
    document.body.appendChild(newTextArea)
    newTextArea.select()
    document.execCommand('copy')
    newTextArea.remove()
  }

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

  handleCopyPassword = (e) => {
    if (this.state.password === '') {
      this.notify('Nothing To Copy', true)
    } else {
      this.copyToClipboard()
      this.notify(SUCCESS_MSG)
    }
  }
  render() {
    return (
      <div className="App">
        <Layout style={{ minHeight: this.state.windowHeight }}>
          <Sidebar collapsed={this.state.collapsed} current="tools" openCurrent="tools"/>
          <Layout>
            <Header collapsed={this.state.collapsed} toggle={this.toggle}/>
            <Content  style={{ padding: 24, background: '#EDF1F3', minHeight: this.state.windowHeight - 112 }}>
              <div type="flex" justify="center" align="middle" style={{ background: '#fff', padding: 24, minHeight: this.state.windowHeight - 112 }}>
                <h2 className=''>Password Generator</h2>
                <div className='generator__password'>
                  <h3>{this.state.password}</h3>
                  <button onClick={this.handleCopyPassword} className='copy__btn'>
                    <CopyOutlined style={{fontSize: '16px'}}/>
                  </button>
                </div>

                <div className='form-group'>
                  <label htmlFor='password-strength'>Password length</label>
                  <input
                    defaultValue={this.state.passwordLength}
                    onChange={(e) => this.setState({passwordLength: e.target.value})}
                    type='number'
                    id='password-strength'
                    name='password-strength'
                    max='20'
                    min='10'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='uppercase-letters'>Include Uppercase Letters(A-Z)</label>
                  <input
                    checked={this.state.includeUppercase}
                    onChange={(e) => this.setState({includeUppercase: e.target.checked})}
                    type='checkbox'
                    id='uppercase-letters'
                    name='uppercase-letters'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='lowercase-letters'>Include Lowercase Letters(a-z)</label>
                  <input
                    checked={this.state.includeLowercase}
                    onChange={(e) => this.setState({includeLowercase: e.target.checked})}
                    type='checkbox'
                    id='lowercase-letters'
                    name='lowercase-letters'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='include-numbers'>Include Numbers(0-9)</label>
                  <input
                    checked={this.state.includeNumbers}
                    onChange={(e) => this.setState({includeNumbers: e.target.checked})}
                    type='checkbox'
                    id='include-numbers'
                    name='include-numbers'
                  />
                </div>

                <div className='form-group'>
                  <label htmlFor='include-symbols'>Include Symbols</label>
                  <input
                    checked={this.state.includeSymbols}
                    onChange={(e) => this.setState({includeSymbols: e.target.checked})}
                    type='checkbox'
                    id='include-symbols'
                    name='include-symbols'
                  />
                </div>

                <button onClick={this.handleGeneratePassword} className='generator__btn'>
                <ReloadOutlined style={{fontSize: '16px'}}/> Generate Password
                </button>
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
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
export default Tools;