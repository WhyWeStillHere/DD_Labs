import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'
import { applyMiddleware, compose, createStore } from 'redux'
import { RootReducer } from './redux/RootReducer'
import { Provider } from 'react-redux'
import thunk from 'redux-thunk'

import 'bootstrap/dist/css/bootstrap.min.css'
import reportWebVitals from './reportWebVitals'

const DEBUG = false
export const store = createStore(
    RootReducer,
    DEBUG
        ? compose(
              applyMiddleware(thunk),
              window.__REDUX_DEVTOOLS_EXTENSION__ &&
                  window.__REDUX_DEVTOOLS_EXTENSION__()
          )
        : applyMiddleware(thunk)
)

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById('root')
)

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
