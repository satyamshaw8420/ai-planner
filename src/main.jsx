import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter } from 'react-router-dom'
import { RouterProvider } from 'react-router-dom'
import CreateTrip from './create-trip/index.jsx'
import Hero from './components/custom/Hero.jsx'
import TripHistory from './components/custom/TripHistory.jsx'
import TripDetails from './components/custom/TripDetails.jsx'
import SharedTripView from './components/custom/SharedTripView.jsx'
import GlobeVisualization from './components/custom/GlobeVisualization.jsx'
import TripComparison from './components/custom/TripComparison.jsx'
import OfflineTrips from './components/custom/OfflineTrips.jsx'
import WeatherIntegration from './components/custom/WeatherIntegration.jsx'
import SocialFeatures from './components/custom/SocialFeatures.jsx'
import DataVerification from './components/custom/DataVerification.jsx'
import ViewTrip from './view-trip/index.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Hero />
      },
      {
        path: '/trip-history',
        element: <TripHistory />
      },
      {
        path: '/trip-details/:id',
        element: <TripDetails />
      },
      {
        path: '/shared-trip/:shareId',
        element: <SharedTripView />
      },
      {
        path: '/globe',
        element: <GlobeVisualization />
      },
      {
        path: '/compare',
        element: <TripComparison />
      },
      {
        path: '/offline',
        element: <OfflineTrips />
      },
      {
        path: '/weather',
        element: <WeatherIntegration />
      },
      {
        path: '/social',
        element: <SocialFeatures />
      },
      {
        path: '/verify-data',
        element: <DataVerification />
      },
      {
        path: '/view-trip/:id',
        element: <ViewTrip />
      },
      {
        path: '/create-trip',
        element: <CreateTrip />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_AUTH_CLIENT_ID}>
      <ConvexProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
)