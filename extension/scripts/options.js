document.addEventListener('DOMContentLoaded', () => {
    const projectForm = document.getElementById('projectForm');
    const projectsTable = document.getElementById('projectsTable').getElementsByTagName('tbody')[0];
    const cancelBtn = document.getElementById('cancelBtn');
    let editingId = null;

    // Load existing projects on page load
    loadProjects();

    // Form submit handler
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const projectId = document.getElementById('projectId').value;
        const projectName = document.getElementById('projectName').value;

        if (editingId !== null) {
            updateProject(editingId, projectId, projectName);
        } else {
            saveProject(projectId, projectName);
        }
    });

    // Cancel button handler
    cancelBtn.addEventListener('click', () => {
        resetForm();
    });

    function saveProject(projectId, projectName) {
        chrome.storage.sync.get(['projects'], (result) => {
            const projects = result.projects || [];
            
            // Check for duplicate project ID
            if (projects.some(p => p.id === projectId)) {
                alert('Project ID already exists!');
                return;
            }

            projects.push({ id: projectId, name: projectName });
            
            chrome.storage.sync.set({ projects }, () => {
                loadProjects();
                resetForm();
            });
        });
    }

    function updateProject(oldId, newId, newName) {
        chrome.storage.sync.get(['projects'], (result) => {
            const projects = result.projects || [];
            
            // Check for duplicate project ID if ID is changed
            if (oldId !== newId && projects.some(p => p.id === newId)) {
                alert('Project ID already exists!');
                return;
            }

            const updatedProjects = projects.map(p => 
                p.id === oldId ? { id: newId, name: newName } : p
            );
            
            chrome.storage.sync.set({ projects: updatedProjects }, () => {
                loadProjects();
                resetForm();
            });
        });
    }

    function deleteProject(projectId) {
        if (confirm('Are you sure you want to delete this project?')) {
            chrome.storage.sync.get(['projects'], (result) => {
                const projects = result.projects || [];
                const updatedProjects = projects.filter(p => p.id !== projectId);
                
                chrome.storage.sync.set({ projects: updatedProjects }, () => {
                    loadProjects();
                    if (editingId === projectId) {
                        resetForm();
                    }
                });
            });
        }
    }

    function loadProjects() {
        chrome.storage.sync.get(['projects'], (result) => {
            const projects = result.projects || [];
            projectsTable.innerHTML = '';
            
            projects.forEach(project => {
                const row = projectsTable.insertRow();
                row.innerHTML = `
                    <td>${project.id}</td>
                    <td>${project.name}</td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${project.id}" data-name="${project.name}">Edit</button>
                        <button class="action-btn delete-btn" data-id="${project.id}">Delete</button>
                    </td>
                `;

                // Add event listeners for edit and delete buttons
                row.querySelector('.edit-btn').addEventListener('click', (e) => {
                    const { id, name } = e.target.dataset;
                    editProject(id, name);
                });

                row.querySelector('.delete-btn').addEventListener('click', (e) => {
                    deleteProject(e.target.dataset.id);
                });
            });
        });
    }

    function editProject(projectId, projectName) {
        document.getElementById('projectId').value = projectId;
        document.getElementById('projectName').value = projectName;
        document.getElementById('saveBtn').textContent = 'Update';
        cancelBtn.style.display = 'inline-block';
        editingId = projectId;
    }

    function resetForm() {
        projectForm.reset();
        document.getElementById('saveBtn').textContent = 'Save';
        cancelBtn.style.display = 'none';
        editingId = null;
    }
});
