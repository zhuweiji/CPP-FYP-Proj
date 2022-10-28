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

const router = createBrowserRouter([
  {
    path: "/",
    element: <Homepage />,
    errorElement: <ErrorPage />,
  }, {
    path: "tutorials",
    element: <TutorialList/>,
  }, {
    path: "tutorial/:tutorialId",
    element: <TutorialPage />,
  }, {
    path: "games",
    element: <UnderConstruction />,
  }, {
    path: "ide",
    element: <UnderConstruction />,
  }, {
    path: "instructions",
    element: <UnderConstruction />,
  }, 
  
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
