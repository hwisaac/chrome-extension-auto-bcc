// Content script - 웹페이지에서 실행됨
console.log('Popup script loaded');

const emailInput = document.getElementById('email');
const ccEmailInput = document.getElementById('ccEmail');
const bccEmailInput = document.getElementById('bccEmail');
const saveBtn = document.getElementById('saveBtn');

const savedEmailSpan = document.getElementById('savedEmail');
const savedCcEmailSpan = document.getElementById('savedCcEmail');
const savedBccEmailSpan = document.getElementById('savedBccEmail');

// 저장된 데이터 불러오기
function loadSavedData() {
  chrome.storage.sync.get(['email', 'ccEmail', 'bccEmail'], function (result) {
    if (result.email) {
      emailInput.value = result.email;
      savedEmailSpan.textContent = result.email;
    }
    if (result.ccEmail) {
      ccEmailInput.value = result.ccEmail;
      savedCcEmailSpan.textContent = result.ccEmail;
    }
    if (result.bccEmail) {
      bccEmailInput.value = result.bccEmail;
      savedBccEmailSpan.textContent = result.bccEmail;
    }
  });
}

// 데이터 저장하기
function saveData() {
  const emailData = {
    email: emailInput.value,
    ccEmail: ccEmailInput.value,
    bccEmail: bccEmailInput.value,
  };

  chrome.storage.sync.set(emailData, function () {
    // 저장된 데이터를 화면에 표시
    savedEmailSpan.textContent = emailData.email;
    savedCcEmailSpan.textContent = emailData.ccEmail;
    savedBccEmailSpan.textContent = emailData.bccEmail;

    // 저장 완료 알림
    alert('데이터가 저장되었습니다!');
  });
}

// 이벤트 리스너 등록
saveBtn.addEventListener('click', saveData);

// 페이지 로드 시 저장된 데이터 불러오기
document.addEventListener('DOMContentLoaded', loadSavedData);
