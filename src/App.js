import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';

function App() {
  const [language, setLanguage] = useState("");
  const [picture, setPicture] = useState("");
  const webcamRef = useRef(null);
  const [start, setStart] = useState(false);
  const [outputString, setOutputString] = useState('');

  const azureEndpoint = 'https://southeastasia.tts.speech.microsoft.com/cognitiveservices/v1';
  const azureKey = '48a1f47bad034c669a041e7bad322388'; // this should be stored in a secure location


  useEffect(() => {
    if (start) {
      const capture = setInterval(() => {
        setPicture(webcamRef.current.getScreenshot());
      }, 5000);

      return () => clearInterval(capture);
    }
  }, [start]);

  useEffect(() => {
    if (picture) {
      const base64Image = picture.split(',')[1];

      axios.post('http://localhost:8000/img/', {
        image: base64Image,
      }).then(response => {
        console.log(response);
        setOutputString(response.data.output);
        playAudioFromAzure(response.data.output);
      }).catch(error => {
        console.log(error);
      });
    }
  }, [picture]);

  const handleStart = () => {
    setStart(true);
  };

  const handleStop = () => {
    setStart(false);
  };

  const playAudioFromAzure = async (text) => {
    try {
      const headers = {
        'Authorization': `Bearer ${azureKey}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'riff-24khz-16bit-mono-pcm'
      };
      const body = `
        <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
          <voice name='en-US-JennyNeural'>
            ${text}
          </voice>
        </speak>
      `;
      const response = await axios.post(azureEndpoint, body, { headers, responseType: 'blob' });
      const audioUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'audio/wav' }));
      new Audio(audioUrl).play();
    } catch (error) {
      console.error("Error synthesizing speech:", error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: '#070C41',
      minHeight: '100vh'
    },
    webcam: {
      border: '2px solid #333',
      marginBottom: '1rem'
    },
    select: {
      margin: '0.5rem',
      padding: '0.5rem 1rem',
    },
    button: {
      margin: '0.5rem',
      padding: '0.5rem 1rem',
      cursor: 'pointer',
      backgroundColor: '#007BFF',
      color: '#fff',
      border: 'none',
      borderRadius: '5px'
    },
    output: {
      marginTop: '1rem',
      fontSize: '1.2rem',
      color: '#444'
    },
    h1: {
      color: 'white',
    }
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.h1}>Image Capture App</h1>
      <Webcam audio={false} screenshotFormat="image/jpeg" ref={webcamRef} style={styles.webcam} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)} style={styles.select}>
        <option value="">Select a language</option>
        <option value="en">English</option>
        <option value="fr">French</option>
        {/* Add more language options here */}
      </select>
      <button onClick={handleStart} style={styles.button}>Start</button>
      <button onClick={handleStop} style={{...styles.button, backgroundColor: '#FF4136'}}>Stop</button>
      <p style={styles.output}>{outputString}</p>
    </div>
  );
}

export default App;
