import fetchJSON from './lib/fetch-json.js';
import getId from './lib/get-id.js';
import isDevelopment from './lib/is-development.js';

const handleNotFound = () => location.replace('./404.html');
const id = getId();
if (id === null) handleNotFound();

const formatter = new Intl.DateTimeFormat('ja-JP');

const showContent = (toHide, toShow) => {
    Array.from(document.getElementsByClassName(toHide)).forEach(node => node.hidden = true);
    Array.from(document.getElementsByClassName(toShow)).forEach(node => node.hidden = false);
};

const useAttrAsContent = (className, attr) => Array.from(
    document.getElementsByClassName(className)
).forEach(node => node.textContent = node.dataset[attr]);

const addContentToClass = (className, value) => Array.from(
    document.getElementsByClassName(className)
).forEach(node => {
    if (value === null && node.dataset.hasOwnProperty('default')) {
        node.textContent = node.dataset.default;
        return;
    }
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    node.textContent = `${prefix}${value}${suffix}`;
});

const addDateTimeToClass = (className, datetime) => Array.from(
    document.getElementsByClassName(className)
).forEach(node => {
    if (datetime === null && node.dataset.hasOwnProperty('default')) {
        node.textContent = node.dataset.default;
        return;
    }
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    const value = formatter.format(new Date(datetime));
    node.textContent = `${prefix}${value}${suffix}`;
    node.dateTime = datetime;
});

const addBooleanToClass = (className, bool) => Array.from(
    document.getElementsByClassName(className)
).forEach(node => {
    if (bool === null && node.dataset.hasOwnProperty('default')) {
        node.textContent = node.dataset.default;
        return;
    }
    const prefix = node.dataset.prefix || '';
    const suffix = node.dataset.suffix || '';
    const value = bool ? node.dataset.yes : node.dataset.no;
    node.textContent = `${prefix}${value}${suffix}`;
});

const addLinkListToClass = (className, linkObj, toShow) => Array.from(
    document.getElementsByClassName(className)
).forEach(node => {
    if (linkObj === null) {
        showContent(className, toShow);
        useAttrAsContent(toShow, 'default');
        return;
    }
    console.log(linkObj);
    const entries = Object.entries(linkObj);
    if (!entries.length) {
        showContent(className, toShow);
        useAttrAsContent(toShow, 'none');
        return;
    }
    entries.forEach(([name, link]) => {
        const liTag = document.createElement('li');
        const linkTag = document.createElement('a');
        linkTag.href = link;
        linkTag.textContent = name;
        liTag.appendChild(linkTag);
        node.appendChild(liTag);
    })
});

const makeLinkFromIds = ids => ids && Object.fromEntries(ids.map(id => [`No. ${id}`, `./details.html?id=${id-1}`]));

fetchJSON('./info').then(patientsInfo => {
    if (!patientsInfo[id]) return handleNotFound();
    const val = patientsInfo[id];
    const has_left_hospital = val.status === '死亡' ? null : val.has_left_hospital;
    showContent('loading', 'loaded');
    addContentToClass('insert_id', id + 1);
    addContentToClass('insert_age', val.approx_age);
    addContentToClass('insert_location', val.location);
    addContentToClass('insert_job', val.job);
    addContentToClass('insert_gender', val.gender);

    addDateTimeToClass('insert_shared', val.shared);
    addDateTimeToClass('insert_onset', val.onset);

    addContentToClass('insert_status', val.status);
    addContentToClass('insert_symptom', val.symptom);

    addBooleanToClass('insert_has_traveled', val.has_traveled);
    addBooleanToClass('insert_has_left_hospital', has_left_hospital);

    addLinkListToClass('map_touching', makeLinkFromIds(val.touching), 'no_touching');
    addLinkListToClass('map_touched_by', makeLinkFromIds(val.touched_by || []), 'no_touched_by');
}).catch(e => {
    if (isDevelopment()) {
        throw e;
    } else {
        handleNotFound();
    }
});
