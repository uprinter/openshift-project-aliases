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
    const [projects, setProjects] = useState<Array<{ id: string; alias: string }>>([]);
    const [editingProject, setEditingProject] = useState<{ id: string; alias: string } | null>(null);
    const [formData, setFormData] = useState({ projectId: '', projectAlias: '' });
    const [alert, setAlert] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const saveToStorage = (data: Array<{ id: string; alias: string }>) => {
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

        if (editingProject) {
            const updatedProjects = projects.map(p =>
                p.id === editingProject.id
                ? { id: formData.projectId, alias: formData.projectAlias }
                : p
            );
            
            setProjects(updatedProjects);
            saveToStorage(updatedProjects);
            setEditingProject(null);
            setAlert({ message: 'Project updated successfully', type: 'success' });
        } else {
            if (projects.find(p => p.id === formData.projectId)) {
                setAlert({ message: 'Project ID already exists', type: 'error' });
                return;
            }

            const updatedProjects = [...projects, {
                id: formData.projectId,
                alias: formData.projectAlias
            }];
            
            setProjects(updatedProjects);
            saveToStorage(updatedProjects);
            setAlert({ message: 'Project added successfully', type: 'success' });
        }

        setFormData({ projectId: '', projectAlias: '' });
    };

    const handleEdit = (project: { id: string; alias: string }) => {
        setEditingProject(project);
        setFormData({
            projectId: project.id,
            projectAlias: project.alias
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
                    inputProps={{ maxLength: 20 }}
                    value={formData.projectId}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectId: e.target.value }))}
                    required
                />

                <TextField
                    fullWidth
                    margin="normal"
                    id="projectAlias"
                    name="projectAlias"
                    label="Project Alias"
                    inputProps={{ 
                        maxLength: 20, 
                        pattern: '[a-zA-Z0-9\\- ]+',
                        title: 'Only letters, numbers, spaces and hyphens are allowed' 
                    }}
                    value={formData.projectAlias}
                    onChange={(e) => setFormData(prev => ({ ...prev, projectAlias: e.target.value }))}
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
                                setFormData({ projectId: '', projectAlias: '' });
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
                                <TableCell sx={{ fontWeight: 'bold' }}>Alias</TableCell>
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
                                    <TableCell>{project.alias}</TableCell>
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
