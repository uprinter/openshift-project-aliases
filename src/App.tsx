import { useEffect, useState } from 'react';
import './App.css'

function App() {
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
    const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        chrome.storage.sync.get(['projects'], (result) => {
            if (result.projects) {
                setProjects(result.projects);
            }
        });
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const id = (form.projectId as HTMLInputElement).value;
        const name = (form.projectName as HTMLInputElement).value;

        if (editingProject) {
            const updatedProjects = projects.map(p => p.id === editingProject.id ? { id, name } : p);
            setProjects(updatedProjects);
            chrome.storage.sync.set({ projects: updatedProjects });
            setEditingProject(null);
        } else {
            const updatedProjects = [...projects, { id, name }];
            setProjects(updatedProjects);
            chrome.storage.sync.set({ projects: updatedProjects });
        }

        form.reset();
    };

    const handleEdit = (project: { id: string; name: string }) => {
        setEditingProject(project);
        const form = document.getElementById('projectForm') as HTMLFormElement;
        form.projectId.value = project.id;
        form.projectName.value = project.name;
    };

    const handleDelete = (projectId: string) => {
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        chrome.storage.sync.set({ projects: updatedProjects });
    };

    return (
        <>
            <div className="container">
                <h1>Project Parameters</h1>

                <form id="projectForm" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="projectId">Project ID:</label>
                        <input type="text" id="projectId" name="projectId" required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="projectName">Project Name:</label>
                        <input type="text" id="projectName" name="projectName" required />
                    </div>

                    <div className="button-group">
                        <button type="submit" id="saveBtn">Save</button>
                        <button
                            type="button"
                            id="cancelBtn"
                            style={{ display: editingProject ? 'block' : 'none' }}
                            onClick={() => {
                                setEditingProject(null);
                                (document.getElementById('projectForm') as HTMLFormElement).reset();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                <div className="table-container">
                    <table id="projectsTable">
                        <thead>
                            <tr>
                                <th>Project ID</th>
                                <th>Project Name</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map(project => (
                                <tr key={project.id}>
                                    <td>{project.id}</td>
                                    <td>{project.name}</td>
                                    <td>
                                        <button onClick={() => handleEdit(project)}>Edit</button>
                                        <button onClick={() => handleDelete(project.id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    )
}

export default App