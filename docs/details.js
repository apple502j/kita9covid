/*
Copyright 2020 apple502j

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation and/or
other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors may
be used to endorse or promote products derived from this software without
specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
OF THE POSSIBILITY OF SUCH DAMAGE.
*/
import fetchJSON from './lib/fetch-json.js';
import getId from './lib/get-id.js';
import isDevelopment from './lib/is-development.js';
import {showContent, useAttrAsContent, addContentToClass} from './lib/dom-helper.js';

const handleNotFound = () => location.replace('./404.html');
const id = getId();
if (id === null) handleNotFound();

const formatter = new Intl.DateTimeFormat('ja-JP');

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
    const val = patientsInfo[id];
    if (!val) return handleNotFound();
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
