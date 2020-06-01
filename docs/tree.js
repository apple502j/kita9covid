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
import cache from './lib/cache.js';
import {changeClassVisibility, useAttrAsContent} from './lib/dom-helper.js';

const INTENTIONAL_BLANK = Symbol("INTENTIONAL_BLANK");
let urlId = getId();
if (urlId === null) {
    urlId = INTENTIONAL_BLANK;
} else {
    changeClassVisibility('id_input', true);
}
const showError = () => useAttrAsContent('error', 'error');
const hideError = () => useAttrAsContent('error', 'normal');

let chart;

const DEFAULT_CONFIG = {
    chart: {
        container: '#tree',
        hideRootNode: true,
        rootOrientation: 'WEST',
        siblingSeparation: 70,
        levelSeparation: 200,
        subTeeSeparation: 100
    },
    nodeStructure: {}
};

const getTree = (patientsInfo, id, usedIDs) => {
    if (!usedIDs) {
        usedIDs = [];
    } else if (usedIDs.includes(id)) {
        return;
    }
    const patientInfo = patientsInfo[id];
    if (!patientInfo) {
        return;
    }
    usedIDs.push(id);
    let children = [];
    if (patientInfo.touching) {
        children = patientInfo.touching.map(
            childId => getTree(patientsInfo, childId - 1, usedIDs)
        ).filter(i => i && i.children);
    }
    usedIDs.pop();
    const age = patientInfo.age === null ? '年齢不詳' : `${patientInfo.approx_age}歳代`;
    return {
        text: {
            name: {
                val: `No.${id+1} ${age}${patientInfo.gender || ''}`,
                href: `./details.html?id=${id}`
            },
            desc: patientInfo.job || '職業不明'
        },
        children
    };
};

const getTrees = patientsInfo => {
    const top = patientsInfo.map(
        (info, id) => [id, info]
    ).filter(
        ([_, patientInfo]) => !(patientInfo.touched_by && patientInfo.touched_by.length)
    ).map(
        ([id, _]) => id
    );
    const tree = top.map(id => getTree(patientsInfo, id));
    return tree;
};

const onIDObtained = (id, fromForm) => {
    changeClassVisibility('tree', true);
    hideError();
    cache.useAsync('info', () => fetchJSON('./info')).then(patientsInfo => {
        let tree;
        if (id === INTENTIONAL_BLANK) {
            tree = _.defaultsDeep({
                nodeStructure: {
                    children: getTrees(patientsInfo)
                }
            }, DEFAULT_CONFIG);
        } else if (id === null || !patientsInfo[id]) {
            if (fromForm) {
                return showError();
            } else {
                return onIDObtained(INTENTIONAL_BLANK);
            }
        } else {
            tree = _.defaultsDeep({
                nodeStructure: {
                    children: [getTree(patientsInfo, id)]
                }
            }, DEFAULT_CONFIG);
        }
        chart = new Treant(tree, () => changeClassVisibility('tree', false));
    });
};

document.getElementById('showButton').addEventListener('click', () => {
    const val = document.getElementById('patientID').value;
    let id;
    if (val === '') {
        id = INTENTIONAL_BLANK;
    } else {
        id = getId(val);
    }
    onIDObtained(id, true);
});

onIDObtained(urlId);
