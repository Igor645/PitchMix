let instructionsData = {
    "instructions": [
      {
        "imgSrc": "videos/PlacingNotesDemo.gif" ,
        "title": "Placing Notes",
        "text": "Once you click on any of the instruments, a new window will open. This window is used to visualize the notes of your project. Here you can place notes and therefore create your music. The note's edge can be dragged in order to change it's duration. \n You can also freely move already placed notes. But if you really want a note gone, you can delete it by right-clicking on it."
      },
      {
        "imgSrc": "videos/DrumsDemo.gif" ,
        "title": "Drums",
        "text": "You can click on the drums button right of the instruments to open the drums window. In here you have the kick, snare, hi-hat and cymbal. Underneath their names is a volume input which you can adjust accordingly. To place beats, simply left click on one of the cells in the row of a drum instrument. Removing a placed beat is as simple as left clicking on it again."
      },
      {
        "imgSrc": "images/ProjectSettings.png" ,
        "title": "Project Settings",
        "text": "Here you can change the overall volume of your project, its default value is 400. The BPM setting can also be found here, this is used to determine the speed at which your song gets replayed. The project name is used to give your save file a name once you export your song."
      },
      {
        "imgSrc": "images/SaveManager.png" ,
        "title": "Managing your Saves",
        "text": "Here you can see three buttons: import, export and new project. The import button is used to import the json of a project you have already saved. You can not import any kind of json, since the import strictly checks the file's format. The export button is used to export your song as a json."
      }
    ]
  };

  displayInstructions(instructionsData);
  
  function displayInstructions(instructionsData) {
    const instructionsContainer = document.querySelector(".instructions");
    const instructionImage = instructionsContainer.querySelector(".instructionImage");
    const instructionTitle = instructionsContainer.querySelector(".instructionTitle");
    const instructionText = instructionsContainer.querySelector(".instructionText");
    let currentInstructionIndex = 0;

    function updateInstruction(index) {
        const instruction = instructionsData.instructions[index];
        instructionImage.src = instruction.imgSrc;
        instructionTitle.textContent = instruction.title; 
        instructionText.textContent = instruction.text;
    }

    updateInstruction(currentInstructionIndex);

    const leftArrow = instructionsContainer.querySelector(".instructionArrow.left");
    const rightArrow = instructionsContainer.querySelector(".instructionArrow.right");

    leftArrow.addEventListener("click", () => {
        if (currentInstructionIndex > 0) {
            currentInstructionIndex--;
            updateInstruction(currentInstructionIndex);
        }
    });

    rightArrow.addEventListener("click", () => {
        if (currentInstructionIndex < instructionsData.instructions.length - 1) {
            currentInstructionIndex++;
            updateInstruction(currentInstructionIndex);
        }
    });
}
