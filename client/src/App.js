import React, { Component } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Calendar from "./pages/Calendar";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";
import Navbar from './components/NavbarComponent';
import Footer from  './components/Footer';
import Terms from  './pages/Terms';
import API from './utils/API';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { loggedIn: false }
  }

  componentDidMount() {
    API.getUser()
    .then(response => {
      if (response) {
        this.setState({ loggedIn: true });
      }
    });
  }

  render = () => {
    return (
      <Router>
        <div>
        <Navbar/>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/about" component={About}/>
            <Route exact path="/contact" component={Contact}/>
            <Route exact path="/setup" component={Setup}/>
            <Route exact path="/calendar" component={Calendar}/>
            <Route exact path="/terms" component={Terms}/>
            <Route path="*" component={NotFound}/>
          </Switch>
          <Footer/>
        </div>
      </Router>
    );
  }
}

export default App;
