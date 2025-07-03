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
    to: 'wh2ssac@naver.com',
    bcc: ['wh2ssac@naver.com', 'wh2ssac@naver.com'],
    cc: ['wh2ssac@naver.com', 'wh2ssac@naver.com'],
  },
];

function addCcEmail(ccEmail) {
  if (!ccEmail) return;
  const input = document.querySelectorAll('input[aria-label^="참조 수신자"]');
  console.log('input', input);
  if (input.length === 0) {
    return alert('참조 수신자 필드가 없습니다.');
  };

  if (
    input.length > 0 &&
    !input[input.length - 1].value.includes(ccEmail)
  ) {
    if (input[input.length - 1].value.length === 0) {
      input[input.length - 1].value = ccEmail;
    } else {
      input[input.length - 1].value += `,${ccEmail}`;
    }
  }
}
function addBccEmail(bccEmail) {
  if (!bccEmail) return;
  const input = document.querySelectorAll(
    'input[aria-label="숨은참조 수신자"]'
  );
  console.log('input', input);
  if (input.length === 0) {
    // 발견 못함
    return alert('숨은참조 수신자 필드가 없습니다.');
  }

  if (input.length === 1 && !input[0].value.includes(bccEmail)) {
    if (input[0].value.length === 0) {
      input[0].value = bccEmail;
    } else {
      input[0].value += `,${bccEmail}`;
    }
  } else if (
    input.length > 1 &&
    !input[input.length - 1].value.includes(bccEmail)
  ) {
    if (input[input.length - 1].value.length === 0) {
      input[input.length - 1].value = bccEmail;
    } else {
      input[input.length - 1].value += `,${bccEmail}`;
    }
  }
}

function checkCcBccEnabled() {
  const ccEnableBtn = document.querySelectorAll(
    'span[aria-label^="참조 수신자 추가"]'
  );
  const bccEnableBtn = document.querySelectorAll(
    'span[aria-label^="숨은참조 수신자 추가"]'
  );
  const toInput = document.querySelector('input[aria-label="수신자"]');
  if (ccEnableBtn.length > 0) {
    const foundBtn = ccEnableBtn[ccEnableBtn.length - 1];
    console.log('ccEnableBtn 클릭', foundBtn);
    foundBtn.click()
    toInput.focus();
  }
  if( bccEnableBtn.length > 0){
    const foundBtn = bccEnableBtn[bccEnableBtn.length - 1];
    console.log('bccEnableBtn 클릭', foundBtn);
    foundBtn.click()
    toInput.focus();
  }
  
}

const observedToFields = new Set();


const observeToFieldFocus = (toField) => {
  if (!toField || observedToFields.has(toField)) {
    return
  }
  console.log('observeToFieldFocus 호출됨', toField);

  checkCcBccEnabled();

  console.log('toField 에 이벤트를 등록합니다.');

  toField.addEventListener('focus', () => {
    // console.log('✅ 수신자 필드에 포커스됨');
    chrome.runtime.sendMessage({ action: 'toFieldFocused' });
  });

  toField.addEventListener('input', () => {
    const newValue = toField.value.trim();
    if (newValue === lastValue) return;

    lastValue = newValue;
    console.log('✏️ 수신자 입력값:', newValue);
    chrome.storage.sync.get('emailTargets', ({ emailTargets }) => {
      emailTargets.forEach((target) => {
        if (target.to === newValue.trim()) {
          console.log(`✅ 저장된 이메일(${target.to})과 일치합니다.`);
          addCcEmail(target.cc);
          addBccEmail(target.bcc);
        } else {
          console.log('❌ 저장된 이메일과 일치하지 않습니다.');
        }
      });
    });
  });
  // 등록했음을 기록
  observedToFields.add(toField);
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

let foundCount = 0;
let prevLength = 0;
// Gmail이 SPA라서 반복해서 감지 필요
const intervalId = setInterval(() => {
  // console.log('setInterval');
  // const toField = document.querySelector('div[aria-label="검색창"]');
  const toFields = document.querySelectorAll('input[aria-label="수신자"]');
  if (!toFields) return console.log('toField 발견 실패');

  foundCount++;

  if (toFields.length > prevLength) {
    prevLength = toFields.length;
    console.log('toField 발견', toFields.length);
    const emails = getEmails(toFields);
    console.log('emails', emails);
  } else if (prevLength !== 0 && toFields.length === prevLength) {
    // clearInterval(intervalId);
    observeToFieldFocus(toFields[toFields.length - 1]);
  }
}, 1000);
