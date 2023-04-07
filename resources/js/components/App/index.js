require('../../bootstrap');

import React from 'react';
import {BrowserRouter, Route, Routes } from 'react-router-dom'
import SignInPage from '../SignIn';
import SignUpPage from '../SignUp';
import HomePage from '../Home';
import FolderPage from '../Folder';
import SingleFolderPage from '../Folder/vault';
import VaultPage from '../Items';
import ToolPage from '../Tools';
import ImportPage from '../Import';
import ExportPage from '../Export';
import * as ROUTES from '../../constants/routes';

const App = () => (
  	<BrowserRouter>
    <Routes>
      <Route  path={ROUTES.SIGN_IN} element={<SignInPage/>} />
      <Route  path={ROUTES.SIGN_UP} element={<SignUpPage/>} />
      <Route  path={ROUTES.HOME} element={<HomePage/>} />
      <Route  path={ROUTES.FOLDER} element={<FolderPage/>} />
      <Route  path={ROUTES.VIEW_FOLDER} element={<SingleFolderPage/>} />
      <Route  path={ROUTES.VAULT} element={<VaultPage/>} />
      <Route  path={ROUTES.TOOLS} element={<ToolPage/>} />
      <Route  path={ROUTES.IMPORT} element={<ImportPage/>} />
      <Route  path={ROUTES.EXPORT} element={<ExportPage/>} />
    </Routes>
    </BrowserRouter>

);
export default App;