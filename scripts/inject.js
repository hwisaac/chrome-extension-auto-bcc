console.log('Content script loaded');



chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillEmails') {
    const { email, ccEmail, bccEmail } = message.data;

    // Gmail의 입력 필드에 자동으로 입력 (예시)
    const toField = document.querySelector('textarea[name=to]');
    const ccField = document.querySelector('textarea[name=cc]');
    const bccField = document.querySelector('textarea[name=bcc]');

    if (toField) toField.value = email || '';
    if (ccField) ccField.value = ccEmail || '';
    if (bccField) bccField.value = bccEmail || '';

    alert('injectjs : ' + email + ' ' + ccEmail + ' ' + bccEmail);
  }
});

function findCCBtn() {
  try {
    console.log('findCCBtn 호출됨');
    const ccBtns = document.querySelectorAll(
      'span[aria-label^="참조 수신자 추가"]'
    );
    const bccBtns = document.querySelectorAll(
      'span[aria-label^="숨은참조 수신자 추가"]'
    );
    if (ccBtns.length > 0 || bccBtns.length > 0) {
      return { ccBtns, bccBtns };
    } else {
      return null;
    }

  } catch (error) {
    console.error('findCCBtn 에러', error);
    return null;
  }
}

function clickBtns(btns) {
  if (!btns || btns.length === 0) return;

  btns.forEach((btn) => {
    console.log('btn 클릭됨', btn);
    btn.click();
  });
}

let lastValue = '';

const emailTargets = [
  {
    to : 'wh2ssac@naver.com',
    bcc: ["wh2ssac@naver.com", "wh2ssac@naver.com"],
    cc: ["wh2ssac@naver.com", "wh2ssac@naver.com"],
  }
]

const observeToFieldFocus = (toField) => {
  console.log('observeToFieldFocus 호출됨', toField);
  if (!toField) {
    return console.log('observeToFieldFocus: ❌ 수신자 필드가 없습니다.');
  }

  if (toField) {
    console.log('toField 에 이벤트를 등록합니다.');

    toField.addEventListener('focus', () => {
      console.log('✅ 수신자 필드에 포커스됨');
      chrome.runtime.sendMessage({ action: 'toFieldFocused' });
    });

    toField.addEventListener('input', () => {
      const newValue = toField.value;
      if (newValue === lastValue) return;

      lastValue = newValue;
      console.log('✏️ 수신자 입력값:', newValue);
      chrome.storage.sync.get('email', (result) => {
        const savedEmail = result.email;
        if (savedEmail === newValue.trim()){
          console.log('✅ 저장된 이메일과 일치합니다.');
        } else {
          console.log('❌ 저장된 이메일과 일치하지 않습니다.');
        }
      });


    });
  }
};

function getEmails(toField) {
  let emailDivs = toField.querySelectorAll('div[draggable="true"]');
  const result = [];
  emailDivs.forEach((div) => {
    const email = div.textContent;
    result.push(email);
  });
  return result;
}

let foundCount = 0 ;
let prevLength = 0;
// Gmail이 SPA라서 반복해서 감지 필요
const intervalId = setInterval(() => {
  console.log('setInterval');
  // const toField = document.querySelector('div[aria-label="검색창"]');
  const toFields = document.querySelectorAll('input[aria-label="수신자"]');
  if (!toFields) return console.log('toField 발견 실패');
  
  foundCount++;

  if ( toFields.length > prevLength ) {
    prevLength = toFields.length;
    console.log('toField 발견', toFields.length);
    const emails = getEmails(toFields);
    console.log('emails', emails);
  } else if (prevLength !== 0 && toFields.length === prevLength ) {
    clearInterval(intervalId);
    observeToFieldFocus(toFields[toFields.length - 1]);
  }

}, 1000);

// setTimeout(() => {
//   chrome.storage.sync.get(['email', 'ccEmail', 'bccEmail'], function (result) {
//     console.log('🕒 3초 후 저장된 이메일 정보:');
//     console.log('📨 email:', result.email);
//     console.log('📨 ccEmail:', result.ccEmail);
//     console.log('📨 bccEmail:', result.bccEmail);
//   });
// }, 1000);
