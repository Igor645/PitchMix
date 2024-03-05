let dragStarted = false;
let initialX = null;
let initialY = null;
const CELL_WIDTH = window.innerWidth * 0.03; 
const CELL_HEIGHT = window.innerHeight * 0.03; 
let midiSheet = "";
let currentInstrumentType = "piano";
const widthToSecond = 0.25;
const totalColumns = 500;
let previousWidth = CELL_WIDTH;

document.querySelectorAll(".instrumentBox").forEach(section => {
    section.addEventListener("click", (e) => { 
        let midiClose = document.createElement('div');
        midiClose.classList.add('closeMidi');
        midiClose.textContent = 'X';
        currentInstrumentType = section.parentElement.id;
        midiSheet = document.createElement('div');
        midiSheet.id = 'midiSheet';

        document.body.appendChild(midiClose);
        document.body.appendChild(midiSheet);        
        midiSheet = document.getElementById('midiSheet');

        midiClose.addEventListener("click", (e) => {
            midiSheet.remove();
            midiClose.remove();
        })

        loadMidi();
        const debouncedSnapToGrid = debounce(snapToGrid, 100);

        midiSheet.addEventListener('scroll', debouncedSnapToGrid);  
        createGrid();
        loadNotesIntoMidiSheet();

        const scrollAmount = midiSheet.scrollHeight * 0.5;

        midiSheet.scrollTop += scrollAmount;
    });
});


function createNoteLabels() {
    const notes = ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'];
    let labels = [];
    for (let octave = 0; octave <= 8; octave++) {
        for (let i = 0; i < notes.length; i++) {
            const note = `${notes[i]}${octave}`;
            labels.push(note);
            if (note === 'C8') break;
        }
    }
    return labels.reverse();
}

function loadMidi(){
        const totalHeightVH = 88 * 3;
    
        midiSheet.style.height = `calc(${totalHeightVH}vh)`;
    
        midiSheet.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });
    
        midiSheet.addEventListener('mousedown', function (e) {
            if (e.button === 0) {
                initialX = e.clientX;
                initialY = e.clientY;
                dragStarted = false;
            }
        });
        
        midiSheet.addEventListener('mousemove', function (e) {
            if (e.button !== 0) {
                return;
            }
            if (initialX === null || initialY === null) return; 
    
            const dx = e.clientX - initialX;
            const dy = e.clientY - initialY;
            const distanceMoved = Math.sqrt(dx * dx + dy * dy);
    
            if (distanceMoved > 5) {
                dragStarted = true;
            }
        });
    
        midiSheet.addEventListener('mouseup', function (e) {
            const element = e.currentTarget;
            const rect = element.getBoundingClientRect();
        
            const xInsideElement = e.clientX - rect.left;
            const yInsideElement = e.clientY - rect.top;
        
            const hasVerticalScrollbar = element.scrollHeight > element.clientHeight;
            const hasHorizontalScrollbar = element.scrollWidth > element.clientWidth;
        
            const clickInsideVerticalContentArea = xInsideElement < element.clientWidth;
            const clickInsideHorizontalContentArea = yInsideElement < element.clientHeight;
        
            if ((hasVerticalScrollbar && !clickInsideVerticalContentArea) || (hasHorizontalScrollbar && !clickInsideHorizontalContentArea)) {
                return; 
            }
        
            if (e.button === 0 && e.target === midiSheet && !dragStarted) {
                const x = e.offsetX - (e.offsetX % CELL_WIDTH);
                const y = e.offsetY - (e.offsetY % CELL_HEIGHT);
                addNote(x, y, previousWidth, CELL_HEIGHT);
            }
            initialX = null;
            initialY = null;
        });        
    
        function addNote(x, y, width, height) {
            if (!musicSave.instruments[currentInstrumentType]) {
                musicSave.instruments[currentInstrumentType] = [{instrumentVolume: 100}];
            }
            const scrollX = midiSheet.scrollLeft;
            const scrollY = midiSheet.scrollTop;
        
            const note = document.createElement('div');
            note.className = 'note';
            note.style.left = `${x + scrollX}px`; 
            note.style.top = `${y + scrollY}px`;
            note.style.width = `${width}px`;
            note.style.height = `${height}px`;
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'note-resize-handle';
            note.appendChild(resizeHandle);
            const pitch = calculatePitch(y + midiSheet.scrollTop);
            const duration = (width / CELL_WIDTH) * widthToSecond; 
            const timing = ((x + scrollX) / CELL_WIDTH) * widthToSecond; 
            const noteObject = {
                id: musicSave.instruments[currentInstrumentType].length + 1, 
                pitch: pitch,
                duration: duration,
                timing: timing,
                volume: 0.5 
            };

            console.log(noteObject)
            console.log(typeof noteObject.pitch)
            console.log(typeof noteObject.timing)
            if(note.getAttribute('data-note-id') != NaN && noteObject.id != NaN && typeof noteObject.pitch === 'number' && noteObject.duration != NaN && typeof noteObject.timing === 'number' && noteObject.volume != NaN){
                note.setAttribute('data-note-id', noteObject.id);

                musicSave.instruments[currentInstrumentType].push(noteObject);

                playSample(currentInstrumentType, noteObject.pitch, 0.5, 0, 1);

                console.log(musicSave)
                makeDraggable(note);
                makeResizable(note);
                makeDeletable(note, note.getAttribute('data-note-id'));
        
                document.getElementById('midiSheet').appendChild(note);
        }
    }
}


function createGrid() {
    midiSheet.innerHTML = ''; 
    midiSheet.style.display = 'flex';
    midiSheet.style.flexDirection = 'column';
    midiSheet.style.alignItems = 'flex-start';

    const rows = 88; 
    const noteLabels = createNoteLabels(); 

     
    const columns = totalColumns;

    for (let i = 0; i < rows; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.className = "midiRow";
        row.style.minHeight = `${CELL_HEIGHT}px`;
        row.style.pointerEvents = 'none';
        
        const noteLabelCell = document.createElement('div');
        noteLabelCell.textContent = noteLabels[i]; 
        noteLabelCell.style.width = `${CELL_WIDTH}px`;
        noteLabelCell.style.height = `${CELL_HEIGHT}px`; 
        noteLabelCell.style.border = '1px solid rgb(165, 79, 182)';
        noteLabelCell.style.boxSizing = 'border-box';
        noteLabelCell.style.backgroundColor = 'black';
        noteLabelCell.style.color = "white" 
        noteLabelCell.className = 'note-label';
        row.appendChild(noteLabelCell);

        if (i % 2 === 0) {
            row.style.backgroundColor = '#222222';
        } else {
            row.style.backgroundColor = '#323232';
        }

        for (let j = 0; j < columns - 1; j++) { 
            const cell = document.createElement('div');
            cell.style.width = `${CELL_WIDTH}px`; 
            cell.style.height = `${CELL_HEIGHT}px`; 
            cell.style.border = '0.1vw solid rgb(99, 42, 110)';
            cell.style.boxSizing = 'border-box'; 
        
            if ((j + 1) % 16 === 0) {
                cell.style.borderRight = '0.2vw solid rgb(175, 16, 151)';
            }
            else if ((j + 1) % 8 === 0){
                cell.style.borderRight = '0.2vw solid rgb(99, 42, 110)';
            }
        
            cell.className = 'grid-cell';
            row.appendChild(cell);
        }
        

        midiSheet.appendChild(row);
    }

    midiSheet.style.overflowY = 'auto'; 
    midiSheet.style.height = '90vh'; 
}

let columns = Math.floor(window.innerWidth / CELL_WIDTH);

function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        let context = this, args = arguments;
        let later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

function snapToGrid() {
    const scrollX = midiSheet.scrollLeft;
    const scrollY = midiSheet.scrollTop;

    const nearestX = Math.round(scrollX / CELL_WIDTH) * CELL_WIDTH;
    const nearestY = Math.round(scrollY / CELL_HEIGHT) * CELL_HEIGHT;

    midiSheet.scrollLeft = nearestX;
    midiSheet.scrollTop = nearestY;
}

function makeDraggable(note) {
    let offsetX, offsetY;
    const noteId = note.getAttribute('data-note-id');
    let newX, newY;

    note.addEventListener('mousedown', function (e) {
        if (e.button !== 0 || e.target.className.includes('note-resize-handle')) {
            return;
        }

        initialX = e.clientX;
        initialY = e.clientY;
        offsetX = e.clientX - note.getBoundingClientRect().left;
        offsetY = e.clientY - note.getBoundingClientRect().top;
        note.style.cursor = 'grabbing';

        function mouseMoveHandler(e) {
            const scrollX = midiSheet.scrollLeft;
            const scrollY = midiSheet.scrollTop;

            newX = e.clientX - offsetX - midiSheet.getBoundingClientRect().left + scrollX;
            newY = e.clientY - offsetY - midiSheet.getBoundingClientRect().top + scrollY;

            newX = Math.round(newX / CELL_WIDTH) * CELL_WIDTH;
            newY = Math.round(newY / CELL_HEIGHT) * CELL_HEIGHT;

            const midiSheetBounds = document.getElementById('midiSheet').getBoundingClientRect();
            const maxRight = midiSheetBounds.width + scrollX - note.offsetWidth;
            const maxBottom = midiSheetBounds.height + scrollY - note.offsetHeight;

            newX = Math.min(maxRight, Math.max(scrollX, newX)); 
            newY = Math.min(maxBottom, Math.max(scrollY, newY)); 

            note.style.left = `${newX}px`;
            note.style.top = `${newY}px`;
            console.log("old", newX, "", newY)
            console.log("new", newX, "", newY)
        }

        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
            note.style.cursor = 'grab';
            updateNotePosition(note, noteId, newX, newY);
        });
    });
}

function updateNotePosition(noteDiv, noteId, newX, newY) {
    const noteIndex = musicSave.instruments[currentInstrumentType].findIndex(note => note.id === parseInt(noteId));
    
    if (noteIndex !== -1) {
        const note = musicSave.instruments[currentInstrumentType][noteIndex];
        const oldPitch = note.pitch;
        const oldDuration = note.duration;
        const oldTiming = note.timing;

        note.pitch = calculatePitch(newY);
        note.duration = Math.ceil(noteDiv.getBoundingClientRect().width / CELL_WIDTH) * widthToSecond; 
        note.timing = (newX / CELL_WIDTH) * widthToSecond;

        if(!Number.isNaN(note.pitch) && typeof note.timing == 'number' && typeof note.duration === 'number')
        {
            console.log("playing moved note")
            playSample(currentInstrumentType, note.pitch, 0.5, 0, 1);
        }
        else{
            note.pitch = oldPitch;
            note.duration = oldDuration;
            note.timing = oldTiming;
        }

    } else {
        console.log("Note not found");
    }

    console.log(musicSave);
}


function makeResizable(note) {
    const resizeHandle = note.querySelector('.note-resize-handle');

    resizeHandle.addEventListener('mousedown', function (e) {
        e.stopPropagation(); 

        const startX = e.clientX;
        const startWidth = note.offsetWidth;
        
        function mouseMoveHandler(e) {
            let newWidth = startWidth + e.clientX - startX;
            const dx = e.clientX - initialX;
            const dy = e.clientY - initialY;
            const distanceMoved = Math.sqrt(dx * dx + dy * dy); 
    
            if (distanceMoved > 5) {
                dragStarted = true;
            }
            newWidth = Math.round(newWidth / CELL_WIDTH) * CELL_WIDTH;

            const totalCellsAcross = document.querySelector(".midiRow").children.length;

            const totalCellsWidth = totalCellsAcross * CELL_WIDTH;

            const maxAllowedWidthFromNote = totalCellsWidth - note.offsetLeft;

            if (newWidth > maxAllowedWidthFromNote) {
                newWidth = Math.floor(maxAllowedWidthFromNote / CELL_WIDTH) * CELL_WIDTH;
            }

            note.style.width = `${Math.max(CELL_WIDTH, newWidth)}px`;
        }

        function mouseUpHandler() {
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        
            let newDuration = Math.ceil(note.getBoundingClientRect().width / CELL_WIDTH) * widthToSecond;
            previousWidth = note.getBoundingClientRect().width;
            const noteId = parseInt(note.getAttribute('data-note-id'));
            
            const noteObject = findNoteById(noteId);
            if (noteObject) {
                noteObject.duration = newDuration;
            }
            console.log(musicSave)
        }
        
        function findNoteById(noteId) {
            const noteIndex = musicSave.instruments[currentInstrumentType].findIndex(note => note.id == noteId);
            if (noteIndex !== -1) {
                return musicSave.instruments[currentInstrumentType][noteIndex];
            }
            return null;
        }
        
        document.addEventListener('mousemove', mouseMoveHandler);
        document.addEventListener('mouseup', mouseUpHandler);
    });
}


function makeDeletable(note, noteId) {
    note.addEventListener('contextmenu', function (e) {
        e.preventDefault(); 
    
        let noteDeleted = false;
    
        const notesArray = musicSave.instruments[currentInstrumentType];
        const noteId = note.getAttribute('data-note-id');
        const index = notesArray.findIndex(n => n.id == noteId);
        if (index !== -1) { 
            notesArray.splice(index, 1);
            noteDeleted = true; 
            notesArray.forEach(n => {
                if (n.id > noteId) n.id -= 1;
            });
    
            const allNotes = document.querySelectorAll('.note');
            allNotes.forEach(n => {
                let currentId = parseInt(n.getAttribute('data-note-id'));
                if (currentId > noteId) {
                    n.setAttribute('data-note-id', currentId - 1);
                }
            });
        }
    
        if (noteDeleted) {
            note.remove();
        }
    
        console.log(musicSave);
    });
    
}

function loadNotesIntoMidiSheet() {
    const notes = musicSave.instruments[currentInstrumentType];
    console.log(notes);
    if (notes !== undefined) {
        notes.forEach(note => {
            if (note.instrumentVolume === undefined) {
                const yPosition = calculateYPositionFromPitch(note.pitch);
            
                const noteWidth = (note.duration * CELL_WIDTH) / widthToSecond;
                
                const noteLeft = (note.timing * CELL_WIDTH) / widthToSecond; 

                const noteElement = document.createElement("div");
                noteElement.classList.add("note");
                noteElement.style.top = `${yPosition}px`;
                noteElement.style.left = `${noteLeft}px`;
                noteElement.style.width = `${noteWidth}px`;
                noteElement.style.height = `${CELL_HEIGHT}px`
                noteElement.setAttribute('data-note-id', note.id);
                const resizeHandle = document.createElement('div');
                resizeHandle.className = 'note-resize-handle';
                noteElement.appendChild(resizeHandle);
                console.log(`Width: ${noteWidth}, yPos: ${yPosition}, Left: ${noteLeft}`);

                makeDraggable(noteElement);
                makeResizable(noteElement);
                makeDeletable(noteElement, noteElement.getAttribute('data-note-id'));

                midiSheet.appendChild(noteElement);
            }
        });
    }
}

  
  function calculateYPositionFromPitch(pitch) {
    const semitonesFromA4 = 12 * Math.log2(pitch / 440);
    const A4Position = 51; 
    const yPosition = (A4Position - semitonesFromA4) * CELL_HEIGHT;
    return yPosition;
  }
  
