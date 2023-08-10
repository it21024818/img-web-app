import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
var sdk = require("microsoft-cognitiveservices-speech-sdk");

function App() {
  const [language, setLanguage] = useState("");
  const [picture, setPicture] = useState("");
  const webcamRef = useRef(null);
  const [start, setStart] = useState(false);
  const [outputString, setOutputString] = useState('');

  const REACT_APP_SPEECH_KEY = '48a1f47bad034c669a041e7bad322388';
  const REACT_APP_SPEECH_REGION = 'southeastasia';

  //calling the Azure cognitive services using SDKs
  const speechConfig = sdk.SpeechConfig.fromSubscription(REACT_APP_SPEECH_KEY, REACT_APP_SPEECH_REGION);
  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  // speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 
  speechConfig.speechSynthesisVoiceName = language; 

  useEffect(() => {
    if (start) {
      //setting 5 seconds interval to capture images 
      const capture = setInterval(() => {
        setPicture(webcamRef.current.getScreenshot());
      }, 5000);

      return () => clearInterval(capture);
    }
  }, [start]);

  useEffect(() => {
    if (picture) {
      //sending the image to the server side and takng the response
      const base64Image = picture.split(',')[1];

      axios.post('http://localhost:8000/img/', {
        image: base64Image,
      }).then(response => {
        //passing the reponse to the azure speech service calling function
        console.log(response);
        setOutputString(response.data.output);
        playAudioFromAzure();
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

  //function declaration to send the text to azure speech service and play the voice
  const playAudioFromAzure = async () => {
    try {
      const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
      const output = JSON.stringify(outputString);
      synthesizer.speakTextAsync(output,
          function (result) {
              if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
                  console.log("synthesis finished.");
              } else {
                  console.error("Speech synthesis canceled, " + result.errorDetails +
                  "\nDid you set the speech resource key and region values?");
              }
              synthesizer.close();
          },
          function (err) {
              console.trace("err - " + err);
              synthesizer.close();
          }
      );
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
      marginBottom: '1rem',
      width: '40%'
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
        <option value="en-US-JennyNeural">English</option>
        <option value="fr-FR-DeniseNeural">French</option>
        <option value="es-ES-ElviraNeural">Spanish</option>
        <option value="si-LK-ThiliniNeural">Sinhala</option>
        {/* Add more language options here */}
      </select>
      <button onClick={handleStart} style={styles.button}>Start</button>
      <button onClick={handleStop} style={{...styles.button, backgroundColor: '#FF4136'}}>Stop</button>
      <p style={styles.output}>{outputString}</p>
    </div>
  );
}

export default App;
