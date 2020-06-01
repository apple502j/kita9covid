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
import {changeClassVisibility, useAttrAsContent, addContentToClass} from './lib/dom-helper.js';

const showError = () => useAttrAsContent('error', 'error');
const hideError = () => useAttrAsContent('error', 'normal');

document.getElementById('showButton').addEventListener('click', () => {
    const val = document.getElementById('patientID').value;
    const id = getId(val);
    changeClassVisibility('info', true);
    if (id === null) return showError();
    fetchJSON('./info').then(patientsInfo => {
        hideError();
        const data = patientsInfo[id];
        if (!data) return showError();
        changeClassVisibility('info', false);
        addContentToClass('insert_id', id + 1);
        addContentToClass('insert_age', data.approx_age);
        addContentToClass('insert_location', data.location);
        addContentToClass('insert_job', data.job);
        addContentToClass('insert_gender', data.gender);

        document.getElementById('showDetailsLink').href = `./details.html?id=${id}`;
    });
});
