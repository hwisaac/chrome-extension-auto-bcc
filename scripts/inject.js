console.log("Content script loaded");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fillEmails') {
    const { email, ccEmail, bccEmail } = message.data;

    // Gmail의 입력 필드에 자동으로 입력 (예시)
    const toField = document.querySelector("textarea[name=to]");
    const ccField = document.querySelector("textarea[name=cc]");
    const bccField = document.querySelector("textarea[name=bcc]");

    if (toField) toField.value = email || '';
    if (ccField) ccField.value = ccEmail || '';
    if (bccField) bccField.value = bccEmail || '';

    alert('injectjs : ' + email + ' ' + ccEmail + ' ' + bccEmail);
  }
});


const observeToFieldFocus = (toField) => {
  if (!toField) return console.log('observeToFieldFocus: ❌ 수신자 필드가 없습니다.');
  
  if (toField) {
    toField.addEventListener('focus', () => {
      console.log('✅ 수신자 필드에 포커스됨');
      chrome.runtime.sendMessage({ action: 'toFieldFocused' });
    });
    
  }
};

// Gmail이 SPA라서 반복해서 감지 필요
const intervalId = setInterval(() => {
  console.log('setInterval');
  const toField = document.querySelector('input[aria-label="수신자"]');
  console.log('toField', toField);
  if (toField) {
    console.log('toField found');
    clearInterval(intervalId);
    observeToFieldFocus(toField);
  }else{
    console.log('toField not found');
  }
}, 1000);
