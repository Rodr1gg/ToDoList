let groups = JSON.parse(localStorage.getItem("groups")) || {};
let individualTasks = JSON.parse(localStorage.getItem("individualTasks")) || [];
let currentGroup = null;

// Guardar en localStorage
function saveGroups() {
    localStorage.setItem("groups", JSON.stringify(groups));
}

function saveIndividualTasks() {
    localStorage.setItem("individualTasks", JSON.stringify(individualTasks));
}

// Renderizar Grupos
function renderGroups() {
    let groupList = document.getElementById("groupList");
    groupList.innerHTML = "";
    for (let groupName in groups) {
        let li = document.createElement("li");
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        li.innerHTML = `${groupName} <button class='btn btn-danger btn-sm delete-group'><i class="fa-solid fa-trash"></i></button>`;
        groupList.appendChild(li);
        li.addEventListener("click", function() {
            currentGroup = groupName;
            renderGroupTasks(groupName);
        });
        li.querySelector(".delete-group").addEventListener("click", function(event) {
            event.stopPropagation();
            delete groups[groupName];
            saveGroups();
            renderGroups();
            document.getElementById("taskContainer").innerHTML = "";
        });
    }
}

// Renderizar Tareas de un Grupo
function renderGroupTasks(groupName) {
    let taskContainer = document.getElementById("taskContainer");
    taskContainer.innerHTML = `<h3>${groupName}</h3>
        <div class="input-group mb-3">
            <input type="text" class="form-control" id="groupTaskInput" placeholder="New task in ${groupName}">
            <button class="btn btn-success" id="addGroupTask"><i class="fa-solid fa-plus"></i></button>
            <button class="btn btn-secondary" id="voiceGroupTaskBtn"><i class="fa-solid fa-microphone"></i></button>
        </div>
        <ul class="list-group" id="groupTaskList"></ul>`;
    
    document.getElementById("addGroupTask").addEventListener("click", function() {
        let taskInput = document.getElementById("groupTaskInput");
        let taskText = taskInput.value.trim();
        if (taskText) {
            groups[groupName].push(taskText);
            saveGroups();
            renderGroupTasks(groupName);
            taskInput.value = "";
        }
    });

    document.getElementById("voiceGroupTaskBtn").addEventListener("click", function() {
        startSpeechRecognition("groupTaskInput");
    });

    let taskList = document.getElementById("groupTaskList");
    taskList.innerHTML = "";
    groups[groupName].forEach((task, index) => {
        let li = document.createElement("li");
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        li.innerHTML = `${task} <button class='btn btn-danger btn-sm delete-task' data-index='${index}'><i class="fa-solid fa-trash"></i></button>`;
        taskList.appendChild(li);
    });

    document.querySelectorAll(".delete-task").forEach(button => {
        button.addEventListener("click", function() {
            let index = this.getAttribute("data-index");
            groups[groupName].splice(index, 1);
            saveGroups();
            renderGroupTasks(groupName);
        });
    });
}

// Agregar Grupo
document.getElementById("addGroup").addEventListener("click", function() {
    let groupInput = document.getElementById("groupInput");
    let groupText = groupInput.value.trim();
    if (groupText && !groups[groupText]) {
        groups[groupText] = [];
        saveGroups();
        renderGroups();
        groupInput.value = "";
    }
});

// Agregar Tarea Individual
document.getElementById("addIndividualTask").addEventListener("click", function() {
    let taskInput = document.getElementById("individualTaskInput");
    let taskText = taskInput.value.trim();
    if (taskText) {
        individualTasks.push(taskText);
        saveIndividualTasks();
        renderIndividualTasks();
        taskInput.value = "";
    }
});

// Renderizar Tareas Individuales
function renderIndividualTasks() {
    let taskList = document.getElementById("individualTaskList");
    taskList.innerHTML = "";
    individualTasks.forEach((task, index) => {
        let li = document.createElement("li");
        li.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        li.innerHTML = `${task} <button class='btn btn-danger btn-sm delete-task' data-index='${index}'><i class="fa-solid fa-trash"></i></button>`;
        taskList.appendChild(li);
    });

    // Agregar evento para eliminar tareas individuales
    document.querySelectorAll(".delete-task").forEach(button => {
        button.addEventListener("click", function() {
            let index = this.getAttribute("data-index");
            individualTasks.splice(index, 1);
            saveIndividualTasks();
            renderIndividualTasks();
        });
    });
}

// Llamar a renderIndividualTasks() al inicio para asegurarnos de que se carguen las tareas guardadas
renderIndividualTasks();

// 🎤 Función de Reconocimiento de Voz
function startSpeechRecognition(inputId) {
    if (!("webkitSpeechRecognition" in window)) {
        alert("Tu navegador no soporta el reconocimiento de voz");
        return;
    }

    let recognition = new webkitSpeechRecognition();
    recognition.lang = "es-ES";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    let button = document.getElementById(inputId === "individualTaskInput" ? "voiceTaskBtn" : "voiceGroupTaskBtn");
    button.innerHTML = "<i class='fa-solid fa-spinner fa-spin'></i>";

    recognition.onresult = function(event) {
        let transcript = event.results[0][0].transcript;
        document.getElementById(inputId).value = transcript;
    };

    recognition.onerror = function(event) {
        alert("Error en el reconocimiento de voz: " + event.error);
    };

    recognition.onend = function() {
        button.innerHTML = "<i class='fa-solid fa-microphone'></i>";
    };

    recognition.start();
}

// 🎤 Botón de voz para tareas individuales
document.getElementById("voiceTaskBtn").addEventListener("click", function() {
    startSpeechRecognition("individualTaskInput");
});

// Sidebar toggle
document.getElementById("toggleSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").classList.toggle("show");
});
document.getElementById("closeSidebar").addEventListener("click", function() {
    document.getElementById("sidebar").classList.remove("show");
});

// Render inicial
renderGroups();
renderIndividualTasks();
