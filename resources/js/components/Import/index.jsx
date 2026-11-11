import React from 'react';
import { Row, Col, Form, Button, Input } from 'antd';
import { Layout } from 'antd';
import Sidebar from '../Navigation/Sidebar';
import Header from '../Navigation/Header';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import { LoadingOutlined, ImportOutlined } from '@ant-design/icons';
import Config from '../../constants/config';
import Papa from "papaparse";

const { Content } = Layout;

class Import extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      windowHeight: null,
      file:  '',
      loading: false
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

  importCSV = (e) => {
    if(this.state.file === '' || this.state.file === null) {
      this.notify("Please upload CSV file", true);
    } else {
      if(this.state.file.type !== "text/csv") {
        this.notify("File type should be CSV", true);
      } else {
        console.log(this.state.file);
        if(!this.state.loading) {
          this.setState({
            loading: true
          });
        }
        let { loading } = this.state;
        let status = false;

        Papa.parse(this.state.file, {
          header: true,
          skipEmptyLines: true,
          complete: function (results) {
            const rowsArray = [];
            const valuesArray = [];
            // Iterating data to get column name and their values
            results.data.map((d) => {
              rowsArray.push(Object.keys(d));
              valuesArray.push(Object.values(d));
            });
            const headers = {
              headers: {'content-type': 'application/json'}
            };
            axios.post(Config.import_vault, {
              data: results.data,
              user_id: localStorage.getItem('userId')
            },headers)
            .then(function (response) {
              console.log(response);
              loading = false;
              status = false;
              window.location.href = "/vault";
            }).catch(() => {
              loading = false;
              status=true;
            });
          },
        });
        this.setState({loading:loading});
        console.log(status);
        if(status === false) {
          this.notify("Data Imported successfully");
        } else{
          this.notify("Failed!Please try again", status);
        }
      }
    }
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

  render() {
    const {loading} = this.state;
    return (
      <div className="App">
        <Layout style={{ minHeight: this.state.windowHeight }}>
          <Sidebar collapsed={this.state.collapsed} current="import" openCurrent="import"/>
          <Layout>
            <Header collapsed={this.state.collapsed} toggle={this.toggle}/>
            <Content  style={{ padding: 24, background: '#EDF1F3', minHeight: this.state.windowHeight - 112 }}>
              <div type="flex" justify="center" align="middle" style={{ background: '#fff', padding: 24, minHeight: this.state.windowHeight - 112 }}>
                <h2 className=''>Import data</h2>

                <strong>Upload CSV file</strong>
                <div className='upload-file'>
                  <input
                    onChange={(e) => this.setState({file: e.target.files[0]})}
                    type='file'
                    id='password-strength'
                    name='password-strength'
                    accept=".csv"
                  />
                </div>
                <button onClick={this.importCSV} className='export_btn'>
                  {loading ?  <span><LoadingOutlined style={{fontSize: '16px'}}/> Importing...</span> : <span><ImportOutlined style={{fontSize: '16px'}}/> Import</span> } 
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
export default Import;