let projects = {};

chrome.storage.sync.get(['projects'], (result) => {
    projects = {};
    (result.projects || []).forEach(p => {
        projects[p.id] = p.name;
    });
});

chrome.storage.onChanged.addListener((changes, namespace) => {
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
    const dropDownMenuSelectors = [
        'button.co-namespace-dropdown__menu-toggle > span.pf-v5-c-menu-toggle__text',
        'button.co-namespace-dropdown__menu-toggle > span.pf-c-menu-toggle__text'
    ];

    dropDownMenuSelectors.forEach((selector) => {
        let dropDownMenu = document.querySelectorAll(selector);

        if (dropDownMenu.length > 0) {
            let originalHtml = dropDownMenu[0].getAttribute('data-original-html');

            if (originalHtml != null) {
                let projectId = originalHtml.replace('Project: ', '');

                if (projects[projectId] != null) {
                    dropDownMenu[0].innerHTML = originalHtml.replace(projectId, projectId + ' (' + projects[projectId] + ')')
                } else {
                    dropDownMenu[0].innerHTML = originalHtml;
                    dropDownMenu[0].removeAttribute('data-original-html');
                }
            } else {
                let originalHtml = dropDownMenu[0].innerHTML;
                let projectId = originalHtml.replace('Project: ', '');

                if (projects[projectId] != null) {
                    dropDownMenu[0].innerHTML = originalHtml.replace(projectId, projectId + ' (' + projects[projectId] + ')')
                    dropDownMenu[0].setAttribute('data-original-html', originalHtml);
                }
            }
        }
    });

    const dropDownMenuItemSelectors = [
        'ul.pf-v5-c-menu__list > li.pf-v5-c-menu__list-item > button.pf-v5-c-menu__item > span > span',
        'ul.pf-c-menu__list > li.pf-c-menu__list-item > button.pf-c-menu__item > span > span'
    ];

    dropDownMenuItemSelectors.forEach((selector) => {
        let dropDownMenuItems = document.querySelectorAll(selector);

        if (dropDownMenuItems.length > 0) {
            dropDownMenuItems.forEach(item => {
                let projectId = item.innerHTML;
                if (projects[projectId] != null) {
                    item.innerHTML = projectId + ' (' + projects[projectId] + ')';
                }
            });
        }
    });
}