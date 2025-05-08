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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fetchTasks() {
  const taskList = document.getElementById("pending-tasks");
  taskList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "tasks"));
  console.log(querySnapshot);
  querySnapshot.forEach((doc) => {
    addTaskToDom(doc.data().title, doc.data().description, doc.data().status,doc.id);
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

    try {
        let newDocRef = doc(collection(db, "tasks"));
        addTaskToDom(title,description,status,newDocRef.id);
        document.forms['task-form'].reset();
        await setDoc(newDocRef, {
           title: title,
           description: description,
           status: status
        });
    } catch (e) {
        console.error("Error adding document: ", e);
    }
}


function addTaskToDom(title,description,status,id) {
    let newTask=document.createElement('div');
    newTask.className="card bg-light";
    let parent, moveStatus, buttonColor;
    if (status=="Completed") {
        parent=document.getElementById('completed-tasks');
        moveStatus="Pending";
        buttonColor="btn-outline-warning";
    }
    else if (status=="Pending") {
        parent=document.getElementById('pending-tasks');
        moveStatus="Completed";
        buttonColor="btn-success";
    }
    newTask.innerHTML=`
        <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${description}</p>
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
        if (status=="Completed") {
            status="Pending";
            moveStatus="Completed";
            buttonColor="btn-success";
            newTask.querySelector('.move-btn').classList.remove("btn-outline-warning");
            parent=document.getElementById('pending-tasks');
        }
        else {
            status="Completed";
            moveStatus="Pending";
            buttonColor="btn-outline-warning";
            newTask.querySelector('.move-btn').classList.remove("btn-success");
            parent=document.getElementById('completed-tasks');
        }
        newTask.remove();
        newTask.querySelector('.move-btn').classList.add(buttonColor);
        newTask.querySelector('.move-btn').innerText=`Move To ${moveStatus}`;
        setDoc(doc(db, "tasks", id), {
                    title: title,
                    description: description,
                    status: status
                });
        parent.appendChild(newTask);
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
    for (let i = 0; i < tasks.length; i++) {
        let taskTitle = tasks[i].innerText.toLowerCase();
        if (taskTitle.includes(searchText)) {
            tasks[i].parentElement.parentElement.style.display = "block";
        } else {
            tasks[i].parentElement.parentElement.style.display = "none";
        }
    }
}

window.onload = () => {
    document.getElementById('task-form').addEventListener('submit', addTask);
    document.getElementById('completed-search').addEventListener('submit', function(event) {
        searchTasks(event, 'completed-search','Completed');
    });

    document.getElementById('pending-search').addEventListener('submit', function(event) {
        searchTasks(event,'pending-search', 'Pending');
    });

    fetchTasks();
}

