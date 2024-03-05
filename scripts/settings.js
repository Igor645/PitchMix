let instrumentVolumes = document.querySelectorAll(".instrumentVolumeInput");

instrumentVolumes.forEach(input => {
    input.addEventListener("click", (e) => {
        e.stopPropagation();
    })

    input.addEventListener('input', (event) => {
        event.stopPropagation();
  
        const instrumentName = input.parentNode.parentNode.parentNode.id;
        const newVolume = parseInt(input.value, 10);
        
        if (!musicSave.instruments[instrumentName]) {
            musicSave.instruments[instrumentName] = [{instrumentVolume: 100}];
        }

        musicSave.instruments[instrumentName][0].instrumentVolume = newVolume;

        console.log(musicSave)
        
        console.log(`Updated ${instrumentName} volume to ${newVolume}`);
    });
})

document.querySelector("#stopButton").addEventListener("click", (e) => {
    stopPlayback();
  });

document.getElementById('volumeInput').addEventListener('input', function() {
    const volumeValue = Math.min(Math.max(this.value, 0));
    musicSave.volume = volumeValue;
    this.value = volumeValue;
});

document.getElementById('bpmInput').addEventListener('input', function() {
    let bpmValue = parseInt(this.value, 10);

    if (isNaN(bpmValue)) {
        bpmValue = 120; 
    } else if (bpmValue < 20) {
        bpmValue = 20; 
    } else if (bpmValue > 240) {
        bpmValue = 240; 
    }

    musicSave.bpm = bpmValue; 
});

document.getElementById('exportButton').addEventListener('click', function() {
    const dataStr = JSON.stringify(musicSave, null, 2); 
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);

    const fileName = musicSave.projectName ? musicSave.projectName + ".json" : "musicSave.json";

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", url);
    downloadAnchorNode.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    URL.revokeObjectURL(url);
});


document.getElementById('importButton').addEventListener('click', function() {
    document.getElementById('fileInput').click(); 
});

document.addEventListener('DOMContentLoaded', function() {
    var newProjectButton = document.getElementById('newProject');
    
    if (newProjectButton) {
        newProjectButton.addEventListener('click', function() {
            window.location.reload(); 
        });
    }
});


document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const json = JSON.parse(e.target.result);
                if (validateMusicSaveJson(json)) {
                    musicSave = json;
                    console.log('Import successful', musicSave);
                    document.getElementById('bpmInput').value = musicSave.bpm;
                    document.getElementById('volumeInput').value = musicSave.volume;
                    document.getElementById('musicNameInput').value = musicSave.projectName;
                    for (const instrumentName in musicSave.instruments) {
                        const instrumentVolume = musicSave.instruments[instrumentName][0]?.instrumentVolume;
                        if (instrumentVolume !== undefined) {
                            const instrumentBox = document.getElementById(instrumentName);
                            if (instrumentBox) {
                                const volumeInput = instrumentBox.querySelector('.instrumentVolumeInput');
                                if (volumeInput) {
                                    volumeInput.value = instrumentVolume;
                                }
                            }
                        }
                    }
                } else {
                    alert("The file is not in the correct format.");
                }
            } catch (error) {
                alert("Error reading file: " + error.message);
            }
        };
        reader.readAsText(file);
    }
    event.target.value = '';
});

function validateMusicSaveJson(json) {
    if (typeof json.bpm !== 'number' ||
        typeof json.volume !== 'number' ||
        typeof json.instruments !== 'object' ||
        typeof json.projectName !== 'string') {
            console.log("missing project settings")
        return false;
    }

        if (!json.instruments.hasOwnProperty('drums') || 
        !json.instruments['drums'].hasOwnProperty('kick') || 
        !json.instruments['drums'].hasOwnProperty('cymbal') || 
        !json.instruments['drums'].hasOwnProperty('hihat') ||
        !json.instruments['drums'].hasOwnProperty('snare')) {
            console.log("missing drum properties")
            return false; 
        }

    for (const instrument in json.instruments) {
        if(instrument === "drums"){
            for(const drumPart in json.instruments[instrument]){
                const notes = json.instruments[instrument][drumPart];
                if (!Array.isArray(notes) || notes.length === 0) {
                    console.log(`Error in notes: ${notes}`)
                    return false; 
                }

                if (typeof notes[0].instrumentVolume !== 'number') {
                    console.log(`error in drum-part volume: ${notes[0]}`)
                    return false;
                }

                for (const note of notes) {
                    if(note.instrumentVolume === undefined){
                    if (typeof note.id !== 'number' ||
                        typeof note.pitch !== 'number' ||
                        typeof note.duration !== 'number' ||
                        typeof note.timing !== 'number' ||
                        typeof note.volume !== 'number') {
                            console.log(`Error in note: ${note}`)
                        return false;
                    }
                    }
                }
            }
        }
        else{
            const notes = json.instruments[instrument];
            if (!Array.isArray(notes) || notes.length === 0) {
                return false;
            }

            if (typeof notes[0].instrumentVolume !== 'number') {
                return false; 
            }

            for (const note of notes) {
                if(note.instrumentVolume === undefined){
                    if (typeof note.id !== 'number' ||
                        typeof note.pitch !== 'number' ||
                        typeof note.duration !== 'number' ||
                        typeof note.timing !== 'number' ||
                        typeof note.volume !== 'number') {
                            
                            console.log(`error in note: ${JSON.stringify(note)}`)
                        return false; 
                    }
                }
            }
        }
    }

    return true;
}

document.getElementById('musicNameInput').addEventListener('input', function() {
    if(this.value != ""){
        musicSave.projectName = this.value;
    }
    else{
        musicSave.projectName = "Project"
    }
});


