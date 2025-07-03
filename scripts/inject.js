console.log('Content script loaded');

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
    return console.log('참조 수신자 필드가 없습니다.');
  }

  if (input.length > 0 && !input[input.length - 1].value.includes(ccEmail)) {
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
  if (input.length === 0)
    return console.log('숨은참조 수신자 필드가 없습니다.');

  if ( !input[input.length - 1].value.includes(bccEmail)) {
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
    // console.log('ccEnableBtn 클릭', foundBtn);
    foundBtn.click();
    toInput.focus();
  }
  if (bccEnableBtn.length > 0) {
    const foundBtn = bccEnableBtn[bccEnableBtn.length - 1];
    // console.log('bccEnableBtn 클릭', foundBtn);
    foundBtn.click();
    toInput.focus();
  }
}

const observedToFields = new Set();

const observeToFieldFocus = (toField) => {
  if (!toField || observedToFields.has(toField)) {
    return;
  }
  console.log('observeToFieldFocus 호출됨', toField);

  checkCcBccEnabled();

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

let prevFromEmail = '';
setInterval(() => {
  const labels = document.querySelectorAll('label');
  const fromLabels = [];

  labels.forEach((label) => {
    if (label.textContent.includes('보낸사람')) {
      fromLabels.push(label);
    }
  });

  if (fromLabels.length === 0) return console.log('fromLabels 발견 실패');
  checkCcBccEnabled();
  const lastLabel = fromLabels[fromLabels.length - 1];
  const fromEmail = lastLabel.parentElement.nextSibling.textContent.trim();

  prevFromEmail = fromEmail;

  console.log('fromEmail', fromEmail);

  chrome.storage.sync.get('emailTargets', ({ emailTargets }) => {
    emailTargets.forEach((target) => {
      if (fromEmail.includes(target.to)) {
        console.log('일치함 ', target.to);
        addCcEmail(target.cc);
        addBccEmail(target.bcc);
      }
    });
  });
}, 1000);
