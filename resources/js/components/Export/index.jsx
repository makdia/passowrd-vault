import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../Navigation/Sidebar';
import Header from '../Navigation/Header';
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { DownloadOutlined, LoadingOutlined } from '@ant-design/icons';
import { CSVLink, CSVDownload } from "react-csv";
import Config from '../../constants/config';

const { Content } = Layout;

class Export extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      windowHeight: null,
      listOfVault: [],
      loading: false
    }
  }
  componentDidMount() {
    this.setState({ windowHeight: window.innerHeight });
    this.getData();
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
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

  exportCSV = (event, done) => {
    if(!this.state.loading) {
      this.setState({
        loading: true
      });
      axios.get(Config.export_vault + localStorage.getItem('userId'), { headers: {"authorization" : localStorage.getItem('token')} })
        .then((response) => {
          this.setState({
            listOfVault: response.data.items,
            loading: false
          });
          done(true);
          this.notify("Vault data exported successfully");
        }).catch(() => {
          this.setState({
            loading: false
          });
          done(false);
          this.notify('Failed!Please try again', true);
        });
    }
  }

  getData = () => {
    axios.get(Config.export_vault + localStorage.getItem('userId'), { headers: {"authorization" : localStorage.getItem('token')} })
      .then((response) => {
        this.setState({
          listOfVault: response.data.items
        });
      }).catch(() => { 
      });
  }

  render() {
    const {loading} = this.state;
    const headers = [
      { label: "id", key: "id" },
      { label: "name", key: "name" },
      { label: "type_id", key: "category_id" },
      { label: "type_name", key: "category_name" },
      { label: "folder_id", key: "folder_id" },
      { label: "folder_name", key: "folder_name" },
      { label: "username", key: "username" },
      { label: "password", key: "password" },
      { label: "url", key: "url" },
      { label: "notes", key: "notes" }
    ];
    return (
      <div className="App">
        <Layout style={{ minHeight: this.state.windowHeight }}>
          <Sidebar collapsed={this.state.collapsed} current="export" openCurrent="export"/>
          <Layout>
            <Header collapsed={this.state.collapsed} toggle={this.toggle}/>
            <Content  style={{ padding: 24, background: '#EDF1F3', minHeight: this.state.windowHeight - 112 }}>
              <div type="flex" justify="center" align="middle" style={{ background: '#fff', padding: 24, minHeight: this.state.windowHeight - 112 }}>
                <h2 className=''>Export vault</h2>
                <CSVLink 
                  data={this.state.listOfVault}
                  headers={headers}
                  asyncOnClick={true}
                  onClick={this.exportCSV}
                  filename={"password_vault_export.csv"}
                  className='export_btn'
                  target="_blank">
                  {loading ?  <span><LoadingOutlined style={{fontSize: '16px'}}/> Exporting...</span> : <span><DownloadOutlined style={{fontSize: '16px'}}/> Export</span> } 
                </CSVLink>
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
export default Export;