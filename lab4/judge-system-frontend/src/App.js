import './App.css'
import Main from './main/Main'

import React from 'react'
import {
    BrowserRouter as Router,
    Redirect,
    Switch,
    Route,
} from 'react-router-dom'
import Header from './header/Header'
import PersonalArea from './personal_area/PersonalArea'
import { TournamentsArea } from './tournament/TournamentsArea'

export default function App() {
    return (
        <Router>
            <Header />
            <Switch>
                <Route path="/tournaments">
                    <TournamentsArea />
                </Route>
                <Route path="/main">
                    <Main />
                </Route>
                <Route path="/profile/:username">
                    <PersonalArea />
                </Route>
                <Redirect from="/" to="/main" />
            </Switch>
        </Router>
    )
}
