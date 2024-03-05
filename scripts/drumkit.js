document.querySelector('.drumButton').addEventListener('click', function() {
    if (!document.querySelector('.hider')) {
        const hiderDiv = document.createElement('div');
        hiderDiv.classList.add('hider');

        const closeMidiDiv = document.createElement('div');
        closeMidiDiv.classList.add('closeMidi');
        closeMidiDiv.textContent = 'X';
        closeMidiDiv.addEventListener('click', function() {
            hiderDiv.remove();
        });

        const drumContainerDiv = document.createElement('div');
        drumContainerDiv.classList.add('drum-container');

        const drumTypes = [['Kick', 'kick'], ['Snare', 'snare'], ['Hi-Hat', 'hihat'], ['Cymbal', 'cymbal']];

        drumTypes.forEach(type => {
            const drumRowDiv = document.createElement('div');
            drumRowDiv.classList.add('drum-row');
            drumRowDiv.id = type[1];

            const nameAndVolumeContainer = document.createElement('div');
            nameAndVolumeContainer.classList.add('name-and-volume-container');

            const drumNameSpan = document.createElement('span');
            drumNameSpan.classList.add('drum-name');
            drumNameSpan.textContent = type[0];

            const volumeControlDiv = document.createElement('div');
            volumeControlDiv.classList.add('drumVolume');
            volumeControlDiv.innerHTML = `
                <input type="number" class="instrumentVolumeInput" value="100" min="0" max="100" placeholder="Volume">
            `;

            volumeControlDiv.querySelector(".instrumentVolumeInput").addEventListener("input", (e) => {
                applyVolume(volumeControlDiv.parentNode.parentNode.id, volumeControlDiv.querySelector(".instrumentVolumeInput"));
            })

            nameAndVolumeContainer.appendChild(drumNameSpan);
            nameAndVolumeContainer.appendChild(volumeControlDiv);

            const drumButtonsDiv = document.createElement('div');
            drumButtonsDiv.classList.add('drum-buttons');

            drumRowDiv.appendChild(nameAndVolumeContainer);
            drumRowDiv.appendChild(drumButtonsDiv);

            drumContainerDiv.appendChild(drumRowDiv);
        });

        hiderDiv.appendChild(closeMidiDiv);
        hiderDiv.appendChild(drumContainerDiv);

        document.body.appendChild(hiderDiv);

        document.querySelectorAll('.drum-buttons').forEach(buttonContainer => {
            for (let i = 0; i <= totalColumns; i++) {
                const button = document.createElement('div');
                button.classList.add("drum-button");
                button.setAttribute('data-index', i + 1);

                if (Math.floor(i / 8) % 2 === 0) {
                    button.style.backgroundColor = '#0c0c0c';
                } else {
                    button.style.backgroundColor = 'rgb(46, 46, 46)';
                }

                button.setAttribute('data-original-color', button.style.backgroundColor);
                makeClickable(button);

                buttonContainer.appendChild(button);
            }
        });

        loadDrumNotes();
    }
});


function makeClickable(button) {
    button.addEventListener("click", (e) => {
        if (button.classList.contains("ticked")) {
            button.style.backgroundColor = button.getAttribute('data-original-color');
            button.classList.remove("ticked");
            removeDrumNote(button);
        } else {

            button.style.backgroundColor = 'lime';
            button.classList.add("ticked");

            addDrumNote(button)
        }
    });
}

function addDrumNote(button){
    const drumPart = button.parentNode.parentNode.id;
        const index = parseInt(button.getAttribute('data-index'), 10);
    console.log(index)
    console.log(index * widthToSecond)
        const note = {
            id: index,
            pitch: 0, 
            duration: widthToSecond,
            timing: (index * widthToSecond),
            volume: 0.5
        };

        playSample(drumPart, 1, 0.25, 0, 0.5)

        if (!musicSave.instruments.drums[drumPart]) {
            musicSave.instruments.drums[drumPart] = [];
        }
        musicSave.instruments.drums[drumPart].push(note);

        console.log(`Added note to ${drumPart}:`, note);
        console.log('Current musicSave:', musicSave)
}

function removeDrumNote(button) {
    const drumPart = button.parentNode.parentNode.id;
    const noteId = parseInt(button.getAttribute('data-index'), 10);

    if (musicSave.instruments.drums[drumPart]) {
        const noteIndex = musicSave.instruments.drums[drumPart].findIndex(note => note.id === noteId);

        if (noteIndex !== -1) {
            musicSave.instruments.drums[drumPart].splice(noteIndex, 1);
            console.log(`Removed note ID ${noteId} from ${drumPart}`);
        } else {
            console.log(`Note ID ${noteId} not found in ${drumPart}`);
        }
    } else {
        console.log(`${drumPart} does not exist in the musicSave structure`);
    }
}

function loadDrumNotes() {
    if (!musicSave || !musicSave.instruments || !musicSave.instruments.drums) {
        console.log("No drum notes found in musicSave.");
        return;
    }

    Object.keys(musicSave.instruments.drums).forEach(drumPart => {
        const notes = musicSave.instruments.drums[drumPart];
        document.getElementById(drumPart).querySelector(".instrumentVolumeInput").value = musicSave.instruments.drums[drumPart][0].instrumentVolume;
        notes.forEach(note => {
            const buttonIndex = note.id;
            const buttonSelector = `#${drumPart} .drum-button[data-index="${buttonIndex}"]`;
            const button = document.querySelector(buttonSelector);
            if (button) {
                button.classList.add("ticked");
                button.style.backgroundColor = 'lime';
            } else {
                console.log(`No button found for ${drumPart} with index ${buttonIndex}`);
            }
        });
    });
}

function applyVolume(drumPart, volumeInput){
    console.log(volumeInput)
        musicSave.instruments.drums[drumPart][0].instrumentVolume = parseInt(volumeInput.value, 10);

        console.log(`Updated volume for ${drumPart}: ${volumeInput.value}`);
}