import { initializeApp } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-app.js";
import { getFirestore, doc, collection, addDoc, deleteDoc, getDocs, setDoc } from "https://www.gstatic.com/firebasejs/10.3.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyB_2KgPy79ldEyJalYhNVUWDROq57DGPTg",
    authDomain: "todo-app-29cd9.firebaseapp.com",
    projectId: "todo-app-29cd9",
    storageBucket: "todo-app-29cd9.firebasestorage.app",
    messagingSenderId: "225424018886",
    appId: "1:225424018886:web:fc9c973909797e7de176c7",
    measurementId: "G-6GJXLCFPP7"
};

async function fetchTasks() {
  const taskList = document.getElementById("pending-tasks");
  taskList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "tasks"));
  querySnapshot.forEach((doc) => {
    addTaskToDom(doc.data(),doc.id);
  });
}

async function addTask(event){
    event.preventDefault();
    let title = document.forms['task-form']['title'].value;
    if (title == "") {
        alert("Please enter a title");
        return;
    }
    let description = document.forms['task-form']['description'].value;
    let status = document.forms['task-form']['status'].value;
    let priority = document.forms['task-form']['priority'].value;

    try {
        let newDocRef = doc(collection(db, "tasks"));
        let task = {
            title: title,
            description: description,
            status: status,
            priority: priority
        }
        addTaskToDom(task,newDocRef.id);
        document.forms['task-form'].reset();
        await setDoc(newDocRef, {
           title: title,
           description: description,
           status: status,
           priority: priority
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}

function addTaskToDom(task,id) {
    let newTask=document.createElement('div');
    newTask.id = id;
    newTask.className=`card bg-light ${task.status}-task`;
    newTask.draggable="true";
    let parent, moveStatus, buttonColor;
    if (task.status=="Completed") {
        parent=document.getElementById('completed-tasks');
        moveStatus="Pending";
        buttonColor="btn-outline-warning";
    }
    else if (task.status=="Pending") {
        parent=document.getElementById('pending-tasks');
        moveStatus="Completed";
        buttonColor="btn-success";
    }
    newTask.innerHTML=`
        <div class="card-body">
            <div class="text-center text-white rounded-1 mb-3 ${task.priority}-priority" id='priority'>${task.priority}</div>
            <h5 class="card-title">${task.title}</h5>
            <p class="card-text">${task.description}</p>
            <div class="action-buttons d-flex justify-content-around">
                <button class="btn move-btn ${buttonColor}">Move To ${moveStatus}</button>
                <button class="btn btn-danger delete-btn">Delete</button>
            </div>
        </div>
    `;
    parent.appendChild(newTask);
    const deleteBtn = newTask.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function () {
        newTask.remove();
        deleteDoc(doc(db, "tasks", id));
    });
    const moveBtn = newTask.querySelector('.move-btn');
    moveBtn.addEventListener('click', function () {
        if (task.status=="Completed") {
            task.status="Pending";
            moveStatus="Completed";
            buttonColor="btn-success";
            newTask.querySelector('.move-btn').classList.remove("btn-outline-warning");
            parent=document.getElementById('pending-tasks');
        }
        else {
            task.status="Completed";
            moveStatus="Pending";
            buttonColor="btn-outline-warning";
            newTask.querySelector('.move-btn').classList.remove("btn-success");
            parent=document.getElementById('completed-tasks');
        }
        newTask.remove();
        newTask.querySelector('.move-btn').classList.add(buttonColor);
        newTask.querySelector('.move-btn').innerText=`Move To ${moveStatus}`;
        setDoc(doc(db, "tasks", id),task);
        parent.appendChild(newTask);
    });
    newTask.addEventListener('dragstart', function(event) {
        event.dataTransfer.setData("text", event.target.id);
    });
}

function searchTasks(event,searchId,status) {
    event.preventDefault();
    let searchText = document.getElementById(searchId).getElementsByTagName('input')[0].value.toLowerCase();
    let tasks;
    if (status=="Completed") {
        tasks = document.getElementById('completed-tasks').getElementsByClassName('card-title');
    }
    else if (status=="Pending") {
        tasks= document.getElementById('pending-tasks').getElementsByClassName('card-title');
    }
    for (const element of tasks) {
        let taskTitle = element.innerText.toLowerCase();
        if (taskTitle.includes(searchText)) {
            element.parentElement.parentElement.style.display = "block";
        } else {
            element.parentElement.parentElement.style.display = "none";
        }
    }
}

function dragoverHandler(event) {
    event.preventDefault();
};
function dropHandler(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    const droppedTask = document.getElementById(data);
    if (this.contains(droppedTask)) {
        return;
    }
    let task = {
        title: droppedTask.querySelector('.card-title').innerText,
        description: droppedTask.querySelector('.card-text').innerText,
        status: droppedTask.classList.contains('Pending-task') ? "Completed" : "Pending",
        priority: droppedTask.querySelector('#priority').innerText    
    }

    droppedTask.remove();
    addTaskToDom(task,data);
    deleteDoc(doc(db, "tasks", data));
    setDoc(doc(db, "tasks", data), task);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.getElementById('task-form').addEventListener('submit', addTask);
document.getElementById('completed-search').addEventListener('submit', function(event) {
    searchTasks(event, 'completed-search','Completed');
});

document.getElementById('pending-search').addEventListener('submit', function(event) {
    searchTasks(event,'pending-search', 'Pending');
});

let pending = document.getElementById('pending-container');
pending.addEventListener('dragover', dragoverHandler);
pending.addEventListener('drop', dropHandler);

let completed = document.getElementById('completed-container');
completed.addEventListener('dragover', dragoverHandler);
completed.addEventListener('drop', dropHandler);

fetchTasks();

