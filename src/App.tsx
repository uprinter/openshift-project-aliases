import { useEffect, useState } from 'react';
import {
    Container,
    TextField,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Box,
    Alert,
    Fade
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import './App.css';

function App() {
    const [projects, setProjects] = useState<Array<{ id: string; name: string }>>([]);
    const [editingProject, setEditingProject] = useState<{ id: string; name: string } | null>(null);
    const [formData, setFormData] = useState({ projectId: '', projectName: '' });
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const saveToStorage = (data: Array<{ id: string; name: string }>) => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.set({ projects: data });
        } else {
            localStorage.setItem('projects', JSON.stringify(data));
        }
    };

    const loadFromStorage = () => {
        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.sync.get(['projects'], (result) => {
                if (result.projects) {
                    setProjects(result.projects);
                }
            });
        } else {
            const savedProjects = localStorage.getItem('projects');
            if (savedProjects) {
                setProjects(JSON.parse(savedProjects));
            }
        }
    };

    useEffect(() => {
        loadFromStorage();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (projects.find(p => p.id === formData.projectId)) {
            setAlert({ message: 'Project ID already exists', type: 'error' });
            return;
        }

        if (editingProject) {
            const updatedProjects = projects.map(p =>
                p.id === editingProject.id
                    ? { id: formData.projectId, name: formData.projectName }
                    : p
            );
            setProjects(updatedProjects);
            saveToStorage(updatedProjects);
            setEditingProject(null);
            setAlert({ message: 'Project updated successfully', type: 'success' });
        } else {
            const updatedProjects = [...projects, {
                id: formData.projectId,
                name: formData.projectName
            }];
            setProjects(updatedProjects);
            saveToStorage(updatedProjects);
            setAlert({ message: 'Project added successfully', type: 'success' });
        }

        setFormData({ projectId: '', projectName: '' });
    };

    const handleEdit = (project: { id: string; name: string }) => {
        setEditingProject(project);
        setFormData({
            projectId: project.id,
            projectName: project.name
        });
    };

    const handleDelete = (projectId: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }
        const updatedProjects = projects.filter(p => p.id !== projectId);
        setProjects(updatedProjects);
        saveToStorage(updatedProjects);
        setAlert({ message: 'Project deleted successfully', type: 'success' });
    };

    return (
        <Container>
            {alert && (
                <Fade in={Boolean(alert)} timeout={300}>
                    <Alert
                        severity={alert.type}
                        sx={{ mt: 2 }}
                        onClose={() => setAlert(null)}
                    >
                        {alert.message}
                    </Alert>
                </Fade>
            )}

            <Box
                component="form"
                id="projectForm"
                onSubmit={handleSubmit}
                sx={{ mb: 4 }}
            >
                <TextField
                    fullWidth
                    margin="normal"
                    id="projectId"
                    name="projectId"
                    label="Project ID"
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    required
                />

                <TextField
                    fullWidth
                    margin="normal"
                    id="projectName"
                    name="projectName"
                    label="Project Name"
                    value={formData.projectName}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectName: e.target.value }))}
                    required
                    sx={{ mb: 3 }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                    >
                        Save
                    </Button>
                    {editingProject && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => {
                                setEditingProject(null);
                                setFormData({ projectId: '', projectName: '' });
                            }}
                        >
                            Cancel
                        </Button>
                    )}
                </Box>
            </Box>

            {projects.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    No projects found. Add a new project to get started.
                </Alert>
            )}
            {projects.length > 0 && (
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold' }}>Project ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Project Name</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {projects.map(project => (
                                <TableRow
                                    key={project.id}
                                    hover
                                    sx={{
                                        '&:last-child td, &:last-child th': { border: 0 }
                                    }}
                                >
                                    <TableCell>{project.id}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <EditIcon
                                                onClick={() => handleEdit(project)}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                            <DeleteIcon 
                                                onClick={() => handleDelete(project.id)} 
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    )
}

export default App
