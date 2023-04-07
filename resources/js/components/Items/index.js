import React from 'react';
import { Row, Col } from 'antd';
import { Layout } from 'antd';
import { BrowserRouter as Router, Redirect } from 'react-router-dom';
import Sidebar from '../Navigation/Sidebar';
import Header from '../Navigation/Header';
import { Link } from 'react-router-dom';
import { Button, Modal, Form, Input, Table, Spin } from 'antd';
import axios from 'axios';
import { FileOutlined, EditOutlined, PlusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import Config from '../../constants/config';
import { UserOutlined, LockOutlined, DribbbleOutlined, GatewayOutlined } from '@ant-design/icons';
import Select from 'react-select';

const FormItem = Form.Item;
const INITIAL_STATE = {
  category:{ label: "Login", value: 1 },
  name: '',
  folder:'',
  username:'',
  password: '',
  url:'',
  notes:'',
  errors: '',
  success: '',
  nameError: '',
};
const { Content } = Layout;
const items = [];
const { TextArea } = Input;
class Folder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      windowHeight: null,
      isModalOpen:false,
      isDeleteModalOpen:false,
      isEditModalOpen:false,
      delId:null, 
      delName:null,
      ...INITIAL_STATE,
      loadingContent: true,
      dataRequested : [],
      columnRequested: [
        {
          title: "No.",
          dataIndex: 'no',
          key: 'no'
        },
        {
          title: "Name",
          dataIndex: 'name',
          key: 'name'
        },
        {
          title: 'Action',
          dataIndex: 'action',
          key: 'action',
          render: (text, row) => {  
            console.log(row);    
            return(             
              <span>
                <span className="btn-edit"><EditOutlined onClick={() => this.showEditModal(row.id)} type="edit" theme="outlined" style={{ fontSize: '20px', margin: '0' }}/></span>
                <span className="vertical_hr"></span>
                <span><DeleteOutlined onClick={() => this.showDeleteModal(row.id,row.name)} type="delete" theme="outlined" style={{ fontSize: '20px', margin: '0' }}/></span>
              </span>
            )
          }
        }
      ],
      folderList: [],
      categoryList : []
    }
  }
  componentDidMount() {
    this.setState({ windowHeight: window.innerHeight });
    this.getAllItems();
  }
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }
  showModal = () => {
    this.setState({ isModalOpen: true });
  };
  showDeleteModal = (id, name) => {
    this.setState({ isDeleteModalOpen: true, delId:id, delName:name });
  };
  showEditModal = (id) => {
    console.log(id);
    this.setState({ isEditModalOpen: true });
    axios.get(Config.get_single_vault + id + "/" + localStorage.getItem('userId'), { headers: {"authorization" : localStorage.getItem('token')} })
      .then(({ data }) => {
        console.log(data);
        let folder = null;
        if(data.items.folder_id !== null) {
          folder =  { label: data.items.folder_name, value: data.items.folder_id };
        }
        const state = { ...this.state }
        state.id = id,
        state.category = { label: data.items.category_name, value: data.items.category_id },
        state.name = data.items.name,
        state.folder = folder,
        state.username = data.items.username,
        state.password = data.items.password,
        state.url = data.items.url,
        state.notes = data.items.notes,
        state.folderList = data["folders"];
        state.categoryList = data["categories"];
        state.errors = state.success = state.nameError = "",
        state.loadingContent = false;
        this.setState(state);
      }).catch((err) => {
        console.log('error', err);
      })
  };
  handleOk = () => {
    this.setState({ isModalOpen: false });
  };
  handleCancel = () => {
    this.setState({ isModalOpen: false, errors: '', nameError: '', success: '' });
  };
  handleDeleteCancel = () => {
    this.setState({ isDeleteModalOpen: false, delId:null, delName:null });
  };
  handleEditCancel = () => {
    this.setState({ isEditModalOpen: false, errors: '', nameError: '', success: '' });
  };
  onChange = event => {
    this.setState({ [event.target.name]: event.target.value, errors: '', nameError: '', success: '' });
    console.log(this.state);
  };
  onUpdateChange = event => {
    this.setState({ [event.target.name]: event.target.value, errors: '' });
    console.log(event.target.value);
  };
  onSubmit = event => {
    console.log(this.state);
    const { name, category, folder, username, password, url, notes } = this.state;
    event.preventDefault();
    if(name  === "" || name === null) {
      this.setState({nameError: "Please enter name", errors: '', success: ''});
    } else {
      let folder_id = "";
      if(folder !== null && folder !== "") {
        folder_id = folder.value;
      }
      const headers = {
        headers: {'content-type': 'application/json'}
      };
      var self = this;
      axios.post(Config.add_vault, {
        user_id: localStorage.getItem('userId'),
        category_id: category.value,
        name: name,
        folder_id: folder_id,
        username: username,
        password: password,
        url: url,
        notes: notes
      },headers)
      .then(function (response) {
        console.log(response);
        if(response.data.success === false) {
          self.setState({errors: response.data.message, success: ''});
        }
        if(response.data.success === true) {
          self.setState({success: response.data.message, error: '', isModalOpen: false});
          self.getAllItems();
        }
        else {
          self.setState({errors: "Failed! Please try again", success: ''}); 
        }
      })
    }
  };
  onUpdate = event => {
    console.log(this.state);
    const { id, name, category, folder, username, password, url, notes } = this.state;
    event.preventDefault();
    if(name  === "" || name === null) {
      this.setState({nameError: "Please enter name", errors: '', success: ''});
    }
    else {
      let folder_id = "";
      if(folder !== null && folder !== "") {
        folder_id = folder.value;
      }
      const headers = {
        headers: {'content-type': 'application/json'}
      };
      var self = this;
      axios.post(Config.edit_vault, {
        id: id,
        category_id: category.value,
        name: name,
        folder_id: folder_id,
        username: username,
        password: password,
        url: url,
        notes: notes

      },headers)
      .then(function (response) {
        console.log(response);
        if(response.data.success === false) {
          self.setState({errors: response.data.message, success: ''});
        }
        if(response.data.success === true) {
          self.setState({success: response.data.message, error: '', isEditModalOpen: false});
          self.getAllItems();
        }
        else {
          self.setState({errors: "Failed! Please try again", success: ''}); 
        }
      })
    }
   };
  getAllItems = () => {
    axios.get(Config.get_vault + localStorage.getItem('userId'), { headers: {"authorization" : localStorage.getItem('token')} })
      .then(({ data }) => {
        console.log(data);
        const state = { ...this.state }
        state.dataRequested = data["items"];
        state.folderList = data["folders"];
        state.categoryList = data["categories"];
        state.loadingContent = false;
        this.setState(state);
      }).catch((err) => {
        console.log('error', err);
      })
  }
  removeFolder = () =>{
    console.log(this.state.delId)
    axios.delete(Config.delete_vault + this.state.delId, { headers: {"authorization" : localStorage.getItem('token')} })
      .then(({ data }) => {
        //window.location = "/folders";
        this.getAllItems();
        this.setState({ isDeleteModalOpen: false, delId:null, delName:null });
      })
      .catch((err) => {
        console.log('error', err);
      })
  }
  onSelectFolderChange(name, value) {
    this.setState({folder: value,errors: ''});
  }
  onSelectCategoryChange(name, value) {
    this.setState({category: value,errors: ''});
  }
  render() {
    const { dataRequested, columnRequested } = this.state;
    const loadingContent = this.state.loadingContent;
    return (
      <div className="App">
        <Layout style={{ minHeight: this.state.windowHeight }}>
          <Sidebar collapsed={this.state.collapsed} current="vault" openCurrent="vault"/>
          <Layout>
            <Header collapsed={this.state.collapsed} toggle={this.toggle}/>
            <Content  style={{ padding: 24, background: '#EDF1F3', minHeight: this.state.windowHeight - 112 }}>
              <div type="flex" justify="center" align="middle" style={{ background: '#fff', padding: 24, minHeight: this.state.windowHeight - 112 }}>
              
              <Modal title="ADD ITEM" open={this.state.isModalOpen} onOk={this.onSubmit} onCancel={this.handleCancel} okText="Save" centered={true}>
                <Form method="post"  name="userLoginForm" onSubmit={this.onSubmit} className="" layout="vertical" initialValues={{layout: "vertical"}} type="flex" justify="center" align="middle">
                  <div className="errorMsg">{this.state.errors}</div>
                  <div className="successMessage">{this.state.success}</div>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="What type of item is this?">
                          <Select 
                            name="category" 
                            value={this.state.category} 
                            options={this.state.categoryList} 
                            onChange={this.onSelectCategoryChange.bind(this, 'status')}
                            placeholder="Choose Type" />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Name">
                          <Input prefix={<GatewayOutlined />} placeholder="Enter name" name="name" value={this.state.name} onChange={this.onChange} required/>
                          <div className="errorMsg">{this.state.nameError}</div>
                        </FormItem>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Folder">
                          <Select 
                            name="folder" 
                            value={this.state.folder} 
                            options={this.state.folderList} 
                            onChange={this.onSelectFolderChange.bind(this, 'status')} 
                            placeholder="Choose Folder" />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Username">
                          <Input prefix={<UserOutlined />} placeholder="Enter username" name="username" value={this.state.username} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Password">
                          <Input prefix={<LockOutlined />} placeholder="Enter password" name="password" value={this.state.password} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="URI">
                          <Input prefix={<DribbbleOutlined />} placeholder="Enter URI" name="url" value={this.state.url} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="Notes">
                          <TextArea rows={4} name="notes" value={this.state.notes} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                </Form>
              </Modal>

              <Modal title="EDIT ITEM" open={this.state.isEditModalOpen} onOk={this.onUpdate} onCancel={this.handleEditCancel} okText="Update" centered={true}>
                <Form method="post"  name="userLoginForm" onSubmit={this.onUpdate} className="" layout="vertical" initialValues={{layout: "vertical"}} type="flex" justify="center" align="middle">
                  <div className="errorMsg">{this.state.errors}</div>
                  <div className="successMessage">{this.state.success}</div>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="What type of item is this?">
                          <Select 
                            name="category" 
                            value={this.state.category} 
                            options={this.state.categoryList} 
                            onChange={this.onSelectCategoryChange.bind(this, 'status')}
                            placeholder="Choose Type" />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Name">
                          <Input prefix={<GatewayOutlined />} placeholder="Enter name" name="name" value={this.state.name} onChange={this.onChange} required/>
                          <div className="errorMsg">{this.state.nameError}</div>
                        </FormItem>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Folder">
                          <Select 
                            name="folder" 
                            value={this.state.folder} 
                            options={this.state.folderList} 
                            onChange={this.onSelectFolderChange.bind(this, 'status')} 
                            placeholder="Choose Folder" />
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Username">
                          <Input prefix={<UserOutlined />} placeholder="Enter username" name="username" value={this.state.username} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                      <Col className="gutter-row" span={12}>
                        <FormItem label="Password">
                          <Input prefix={<LockOutlined />} placeholder="Enter password" name="password" value={this.state.password} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="URI">
                          <Input prefix={<DribbbleOutlined />} placeholder="Enter URI" name="url" value={this.state.url} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                    <Row gutter={16} type="flex" justify="space-around" align="middle">
                      <Col className="gutter-row" span={24}>
                        <FormItem label="Notes">
                          <TextArea rows={4} name="notes" value={this.state.notes} onChange={this.onChange}/>
                        </FormItem>
                      </Col>
                    </Row>
                </Form>
              </Modal>

              <Modal title="Are you sure you want to delete this Item?" open={this.state.isDeleteModalOpen} onOk={this.removeFolder} onCancel={this.handleDeleteCancel} okText="Delete" centered={true}>
              </Modal>

              { 
                loadingContent ?
                  <div className="outerLoadingDiv" type="flex" justify="center" align="middle" style={{ minHeight: window.screen.height + 27 }}>
                    <div className="innerLoadingDiv">
                      <Row gutter={16} type="flex" justify="space-around" align="middle">
                        <Col className="gutter-row" span={24}>
                          <div className="gutter-box">
                            <Spin size="large" tip="Loading..."/>
                          </div>
                        </Col>
                      </Row>
                    </div>   
                  </div>
                  :
                  <Row>
                    <Button style={{height:45,fontSize:20,marginBottom:10,float:'right'}} onClick={this.showModal}>
                        <PlusCircleOutlined type="plus" /> ADD
                    </Button>
                    <Col span={24}>
                    <Table columns={columnRequested} dataSource={dataRequested}/>
                    </Col>
                  </Row>
              }
              </div>
            </Content>
          </Layout>
        </Layout>
      </div>
    );
  }
}
export default Folder;