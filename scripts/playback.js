let musicSave = {
  projectName: "Project",
  bpm: 120,
  volume: 400,
  instruments: {
    drums:{
      kick: [
        {instrumentVolume: 10}
      ],
      snare:[
        {instrumentVolume: 10}
      ],
      hihat: [
        {instrumentVolume: 10}
      ],
      cymbal: [
        {instrumentVolume: 10}
      ]
    }
  }
};
let currentlyPlayingSources = [];
let audioBuffers = {}; 
const audioCtx = new window.AudioContext();

function loadInstrumentSample(instrumentName, url) {
  fetch(url)
    .then(response => response.arrayBuffer())
    .then(arrayBuffer => audioCtx.decodeAudioData(arrayBuffer))
    .then(audioBuffer => {
      audioBuffers[instrumentName] = audioBuffer;
    })
    .catch(e => console.error(e));
}

//https://www.vibrationdata.com/piano.htm
loadInstrumentSample('piano', 'instruments/Piano.mp3');
//https://freesound.org/people/MTG/sounds/247409/
loadInstrumentSample('violin', 'instruments/Violin.mp3');
//https://freesound.org/people/MTG/sounds/247098/
loadInstrumentSample('trumpet', 'instruments/trumpet.mp3');
//https://freesound.org/people/Skamos66/sounds/399466/
loadInstrumentSample('guitar', 'instruments/guitar.wav');
//https://freesound.org/people/modularsamples/sounds/282870/
loadInstrumentSample('bass', 'instruments/Bass.wav');
//https://samplefocus.com/samples/one-shot-kick-eb3651f2-14b9-408e-8a38-153d1728a6ec
loadInstrumentSample('kick', 'instruments/kick.wav');
//https://samplefocus.com/samples/snare-basic
loadInstrumentSample('snare', 'instruments/snare.wav')
//https://samplefocus.com/samples/splash-hi
loadInstrumentSample('cymbal', 'instruments/cymbal.wav')
//https://samplefocus.com/samples/wet-phonk-hi-hat
loadInstrumentSample('hihat', 'instruments/hihat.wav')

function getPlaybackRateForPitchShift(semitones) {
  return Math.pow(2, semitones / 12);
}


document.querySelector("#playButton").addEventListener("click", (e) => {
  stopPlayback();
  playNotes();
});

function playNotes() {
  const beatDuration = 60 / musicSave.bpm; 
  const globalVolume = musicSave.volume / 100; 

  for (const instrumentType in musicSave.instruments) {
    if (instrumentType === 'drums') {
      const drumParts = musicSave.instruments[instrumentType];
      for (const part in drumParts) {
        drumParts[part].forEach(note => {
          if(note.instrumentVolume == undefined){
          const adjustedTiming = note.timing * beatDuration;
          const instrumentVolume = drumParts[part][0].instrumentVolume / 100;
          const adjustedVolume = globalVolume * instrumentVolume;
          console.log(part, 0, note.duration, adjustedTiming, adjustedVolume)
          playSample(part, 0, note.duration, adjustedTiming, adjustedVolume);
          }
        });
      }
    } else {
      const notes = musicSave.instruments[instrumentType];
      notes.forEach(note => {
        if (note.instrumentVolume === undefined) {
          const adjustedTiming = note.timing * beatDuration;
          const adjustedDuration = note.duration * beatDuration;
          const adjustedVolume = note.volume * globalVolume * (musicSave.instruments[instrumentType][0].instrumentVolume / 100);
          console.log(instrumentType, note.pitch, note.duration, adjustedTiming, adjustedVolume)
          playSample(instrumentType, note.pitch, adjustedDuration, adjustedTiming, adjustedVolume);
        }
      });
    }
  }
}

function playSample(instrumentName, notePitch, duration, timing, volume) {
  const source = audioCtx.createBufferSource();
  const gainNode = audioCtx.createGain();

  source.buffer = audioBuffers[instrumentName];
  
  const isDrum = instrumentName.startsWith('drum') || ['kick', 'snare', 'hihat', 'cymbal'].includes(instrumentName);

  if (!isDrum) {
    const semitoneShift = 12 * Math.log2(notePitch / 440);
    const playbackRate = getPlaybackRateForPitchShift(semitoneShift);
    source.playbackRate.value = playbackRate;
  }
  
  gainNode.gain.value = volume;
  
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const fadeOutDuration = duration * 0.1;
  const startTime = audioCtx.currentTime + timing;
  const fadeOutStartTime = startTime + duration - fadeOutDuration;
  const extendedDuration = duration + 0.3;

  source.start(startTime);

  gainNode.gain.setValueAtTime(volume, fadeOutStartTime);
  gainNode.gain.linearRampToValueAtTime(0, startTime + extendedDuration);

  source.stop(startTime + extendedDuration);

  currentlyPlayingSources.push(source);

  source.onended = function() {
    currentlyPlayingSources = currentlyPlayingSources.filter(s => s !== source);
  };
}




function stopPlayback() {
  while(currentlyPlayingSources.length > 0) {
    const source = currentlyPlayingSources.pop();
    try {
      source.stop();
    } catch(e) {
      console.error('Error stopping source:', e);
    }
  }
}

function calculatePitch(yPosition) {
  console.log(yPosition)
  const A4Position = 51;
  const semitonesFromA4 = (Math.round(yPosition / CELL_HEIGHT) - A4Position) * -1;
  console.log(semitonesFromA4)
  const pitch = 440 * Math.pow(2, semitonesFromA4 / 12);
  return pitch;
}