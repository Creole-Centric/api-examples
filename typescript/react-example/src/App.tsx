import TTSForm from './components/TTSForm';
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="container">
        <h1>CreoleCentric TTS Example</h1>
        <p className="subtitle">Convert text to speech using the CreoleCentric API</p>
        <TTSForm />
      </div>
    </div>
  );
}

export default App;
