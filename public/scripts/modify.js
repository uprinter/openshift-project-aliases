let projects = {};

// Load initial projects from storage
chrome.storage.sync.get(['projects'], (result) => {
    projects = {};
    (result.projects || []).forEach(p => {
        projects[p.id] = p.name;
    });
});

// Listen for changes in storage
chrome.storage.onChanged.addListener((changes, namespace) => {
    console.error('Storage changed', changes, namespace);
    if (namespace === 'sync' && changes.projects) {
        projects = {};
        changes.projects.newValue.forEach(p => {
            projects[p.id] = p.name;
        });

        updateProject(projects);
    }
});

setInterval(() => {
    updateProject(projects);
}, 1000)

const updateProject = (projects) => {
    let dropDownMenu = document.querySelectorAll('button.co-namespace-dropdown__menu-toggle > span.pf-v5-c-menu-toggle__text');

    if (dropDownMenu.length > 0) {
        let text = dropDownMenu[0].innerHTML;
        let projectId = text.replace('Project: ', '')

        if (projects[projectId] != null) {
            dropDownMenu[0].innerHTML = text.replace(projectId, projectId + ' (' + projects[projectId] + ')')
        }
    }

    let dropDownMenuItems = document.querySelectorAll('ul.pf-v5-c-menu__list > li.pf-v5-c-menu__list-item > button.pf-v5-c-menu__item > span > span');

    if (dropDownMenuItems.length > 0) {
        if (dropDownMenuItems.length > 0) {
            dropDownMenuItems.forEach(item => {
                let projectId = item.innerHTML;
                if (projects[projectId] != null) {
                    item.innerHTML = projectId + ' (' + projects[projectId] + ')';
                }
            });
        }
    }
}