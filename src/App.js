import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';

function App() {
  const [language, setLanguage] = useState("");
  const [picture, setPicture] = useState("");
  const webcamRef = useRef(null);
  const [start, setStart] = useState(false);
  const [audioSrc, setAudioSrc] = useState("");

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
        language: language,
      }).then(response => {
        console.log(response);
        setAudioSrc(response.data.output);
        const audio = new Audio(audioSrc);
        audio.play();
      }).catch(error => {
        console.log(error);
      });
    }
  }, [picture, language]);

  const handleStart = () => {
    setStart(true);
  };

  return (
    <div>
      <Webcam audio={false} screenshotFormat="image/jpeg" ref={webcamRef} />
      <select value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="">Select a language</option>
        <option value="en">English</option>
        <option value="fr">French</option>
        {/* Add more language options here */}
      </select>
      <button onClick={handleStart}>Start</button>
    </div>
  );
}

export default App;
