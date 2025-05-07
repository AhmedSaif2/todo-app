
addTaskToDom("Task 1","Description 1","Completed");
addTaskToDom("Task 2","Description 2","Pending");

document.getElementById('task-form').addEventListener('submit', addTask);

document.getElementById('completed-search').addEventListener('submit', function(event) {
    searchTasks(event, 'completed-search','Completed');
});

document.getElementById('pending-search').addEventListener('submit', function(event) {
    searchTasks(event,'pending-search', 'Pending');
});

function addTaskToDom(title,description,status) {

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
        parent.appendChild(newTask);
    });
}

function addTask(event) {
    event.preventDefault();
    // Get form values
    let title = document.forms['task-form']['title'].value;
    let description = document.forms['task-form']['description'].value;
    let status = document.forms['task-form']['status'].value;

    addTaskToDom(title,description,status);
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
    console.log(tasks)
    for (let i = 0; i < tasks.length; i++) {
        let taskTitle = tasks[i].innerText.toLowerCase();
        if (taskTitle.includes(searchText)) {
            tasks[i].parentElement.parentElement.style.display = "block";
        } else {
            tasks[i].parentElement.parentElement.style.display = "none";
        }
    }

}
