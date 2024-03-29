import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';

import {
  createBrowserRouter,
  RouterProvider,
  Route,
} from "react-router-dom";

import './index.css';
import TutorialPage from './pages/TutorialPage';
import Homepage from './pages/Homepage';
import TutorialList from './pages/TutorialListPage.js';
import ErrorPage from './pages/ErrorPage';
import UnderConstruction from './pages/UnderConstruction';
import IDEPage from './pages/OnlyIDEPage';
import NotebookPage from './pages/OnlyNotebookPage';
import UserPage from './pages/UserPage';
import LoginPage from './pages/Login';
import CreateAccountPage from './pages/CreateAccountPage';
import SimpleGame from './pages/SimpleGame';
import CodingConumdrumPage from './pages/CodingConundrumPage';
import PyIDEPage from './pages/HiddenOnlyPyIDEPage'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <ErrorPage />,
  }, {
    path: "tutorials",
    element: <TutorialList />,
  }, {
    path: "tutorial/:topicId/:tutorialId",
    element: <TutorialPage />,
  }, {
    path: "games",
    element: <UnderConstruction />,
  }, {
    path: "ide",
    element: <IDEPage />,
  }, {
    path: "instructions",
    element: <UnderConstruction />,
  }, {
    path: 'notebook/:topicId/:tutorialId',
    element: <NotebookPage />,
  }, {
    path: 'my-page',
    element: <UserPage />,
  }, {
    path: 'login',
    element: <LoginPage />,
  }, {
    path: 'create_account',
    element: <CreateAccountPage />,
  }, {
    path: 'simple-game',
    element: <SimpleGame />,
  }, {
    path: 'coding-conundrum',
    element: <CodingConumdrumPage />
  },

  {
    path: 'hidden-py',
    element: <PyIDEPage />
  },

]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <RouterProvider router={router} />
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

// collect good coding practices (code) / avoid bad ones
// choose one of two blocks of code, one that fulfils the condition and one that doesnt - some kind
// 
