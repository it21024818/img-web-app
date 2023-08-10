import React, { useState } from 'react';
var sdk = require("microsoft-cognitiveservices-speech-sdk");

function SpeechSynthesis() {

    const REACT_APP_SPEECH_KEY = '48a1f47bad034c669a041e7bad322388';
    const REACT_APP_SPEECH_REGION = 'southeastasia';
    
    const [text, setText] = useState('');
    // const audioFile = "YourAudioFile.wav";
    // You'd ideally use .env files for React for storing environment variables.
    const speechConfig = sdk.SpeechConfig.fromSubscription(REACT_APP_SPEECH_KEY, REACT_APP_SPEECH_REGION);
    const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
    speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; 

    function handleInputChange(event) {
        setText(event.target.value);
    }

    function handleSynthesize() {
        const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);
        synthesizer.speakTextAsync(text,
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
        // console.log("Now synthesizing to: " + audioFile);
    }

    return (
        <div>
            <textarea 
                value={text} 
                onChange={handleInputChange} 
                placeholder="Enter some text that you want to speak">
            </textarea>
            <button onClick={handleSynthesize}>Synthesize</button>
        </div>
    );
}

export default SpeechSynthesis;
