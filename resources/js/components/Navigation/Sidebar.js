import React, { Component } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { BrowserRouter as Router,  Link, Redirect } from 'react-router-dom';
import '../../assets/css/App.css';
import Logo from '../../assets/images/logo.png';
import {
  AppstoreOutlined,
  SyncOutlined,
  FolderOpenOutlined,
  UnlockOutlined,
  DownloadOutlined,
  ImportOutlined
} from '@ant-design/icons';

const { Sider } = Layout;
const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

class Sidebar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      current: props.current,
      openCurrent: props.openCurrent,
      openItem: props.openItem
    }
  }
  handleClick = (e) => {
    this.setState({
      current : this.props.current
    });
  }
  render() {
    return (
      <Sider
        trigger={null}
        collapsible
        collapsed={this.props.collapsed}
        >
          <div className="sidebar-logo-background">
            { /*!this.props.collapsed ? <div className="sidebar-logo" style={{ height: 180 }}/> : <div className="sidebar-logo" style={{ height: 90 }}/> */}
             <img src={Logo} className={!this.props.collapsed ? "dashboard-large-logo" : "dashboard-small-logo"} alt="Password Vault"/>
                      
          </div> 

          <div className="sidebar-header">
            { !this.props.collapsed ? <h1>Password Vault</h1> : <h1>PV</h1> }
          </div>
          
          <Menu defaultSelectedKeys={[this.state.current]} defaultOpenKeys={[this.state.openCurrent]} theme="dark" mode="inline" inlineCollapsed={true}>
            <Menu.Item key="home"><Link to="/"><AppstoreOutlined  /><span>Dashboard</span></Link></Menu.Item>
            <Menu.Item key="folders"><Link to="/folders"><FolderOpenOutlined  /><span>Folders</span></Link></Menu.Item>
            <Menu.Item key="vault"><Link to="/vault"><UnlockOutlined  /><span>Vault</span></Link></Menu.Item>
            <Menu.Item key="tools"><Link to="/tools"><SyncOutlined  /><span>Tools</span></Link></Menu.Item>
            <Menu.Item key="import"><Link to="/import"><ImportOutlined  /><span>Import</span></Link></Menu.Item>
            <Menu.Item key="export"><Link to="/export"><DownloadOutlined  /><span>Export</span></Link></Menu.Item>
          </Menu>
      </Sider>   
    );
  }
}
export default Sidebar;
