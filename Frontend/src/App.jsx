import { Component } from 'react';
import Home from './components/Home';
import About from './components/about';


class App extends Component {
  render() {
    return (
      <div>
        <Home />
         <About  />
      </div>
    );
  }
}

export default App;