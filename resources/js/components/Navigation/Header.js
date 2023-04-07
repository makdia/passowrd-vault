import React from 'react';
import { Layout, Icon, Tooltip } from 'antd';
import { BrowserRouter as Router,  Link } from 'react-router-dom';
import SignOut from '../SignOut';
import {Navigate} from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined, LogoutOutlined } from '@ant-design/icons';

const { Header } = Layout;
class HeaderSection extends React.Component {
	constructor(props) {
	    super(props)
	    this.state = {
	    }
	}
	isAuthenticated() {
	    const token = localStorage.getItem('token');
	    return token && token.length > 10;
	}
	render() {
		const isAlreadyAuthenticated = this.isAuthenticated();
		return (
			<div>
		        {!isAlreadyAuthenticated ? 
		        	<Navigate to="/" /> : 
		          	(
						<Header style={{ background: '#EDF1F3', padding: 0 }}>
				            {this.props.collapsed ? 
								<MenuFoldOutlined 
								className="trigger"
								onClick={this.props.toggle}
								/>
							 : <MenuUnfoldOutlined className="trigger"
							 onClick={this.props.toggle}/>}
				            <Tooltip placement="bottomLeft" title="Logout">
								<LogoutOutlined
									className="trigger logout"
									type="logout"
									onClick={SignOut}
								/>
						    </Tooltip>
			          </Header>	
		          	)
		        }
		    </div>
		);
	}
}
export default HeaderSection;