// Content script - 웹페이지에서 실행됨
console.error('Popup script loaded');
const stringify = (obj) => JSON.stringify(obj);
const parse = (str) => JSON.parse(str);

// helper: get storage
function getStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, (result) => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve(result[key]);
    });
  });
}

// helper: set storage
function setStorage(obj) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.set(obj, () => {
      if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
      else resolve();
    });
  });
}

const emailInput = document.getElementById('email');
const ccEmailInput = document.getElementById('ccEmail');
const bccEmailInput = document.getElementById('bccEmail');
const saveBtn = document.getElementById('saveBtn');

function initInputs() {
  emailInput.value = '';
  ccEmailInput.value = '';
  bccEmailInput.value = '';
}

// 저장된 데이터 불러오기
function loadSavedData() {
  chrome.storage.sync.get('emailTargets', function (result) {
    renderEmailTargets(result.emailTargets);
  });
}

function deleteTarget(ulIndex){

  chrome.storage.sync.get('emailTargets', function (result) {
    const emailTargets = result.emailTargets;
    const newEmailTargets = emailTargets.filter((_, index) => index !== ulIndex);
    chrome.storage.sync.set({ emailTargets: newEmailTargets }, ()=> renderEmailTargets(newEmailTargets));
  });

}

// 렌더링 함수
function renderEmailTargets(emailTargets) {
  const emailTargetsDiv = document.getElementById('emailTargets');
  if (!emailTargetsDiv) return;
  emailTargetsDiv.innerHTML = '';
  emailTargets.forEach((target, ulIndex) => {
    const ul = document.createElement('ul');
    ul.innerHTML = `
      <li>To: ${target.to}</li>
      <li>Cc: ${target.cc}</li>
      <li>Bcc: ${target.bcc}</li>
    `;
    
    ul.addEventListener('click', () => deleteTarget(ulIndex));
    emailTargetsDiv.appendChild(ul);
  });
}

// 데이터 저장하기
async function saveData() {
  console.error('save 버튼 클릭!');
  let emailTargets = [];
  chrome.storage.sync.get('emailTargets', function (result) {
    if (
      result &&
      typeof result === 'object' &&
      Object.keys(result).length === 0
    ) {
      emailTargets = [];
    } else if (result.length === 0) {
      emailTargets = [];
    } else {
      emailTargets = result.emailTargets;
    }

    emailTargets.push({
      to: document.getElementById('email').value,
      cc: document.getElementById('ccEmail').value,
      bcc: document.getElementById('bccEmail').value,
    });

    chrome.storage.sync.set({ emailTargets }, function () {
      renderEmailTargets(emailTargets);
      initInputs();
    });
  });

  
}

// 이벤트 리스너 등록
saveBtn.addEventListener('click', saveData);

// 페이지 로드 시 저장된 데이터 불러오기
document.addEventListener('DOMContentLoaded', loadSavedData);
