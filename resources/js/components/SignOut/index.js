import React, { Component } from 'react';

const SignOut = () => {
    localStorage.removeItem('token');
	return window.location.reload();
}
export default SignOut;
