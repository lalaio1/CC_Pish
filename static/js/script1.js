function formatCardNumber(input) {
    let value = input.value.replace(/\D/g, '');
    
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
        if (i > 0 && i % 4 === 0) {
            formatted += ' ';
        }
        formatted += value[i];
    }
    
    input.value = formatted;
    
    detectCardType(value);
}

function detectCardType(cardNumber) {
    const cardLogo = document.getElementById('cardLogo');
    let cardType = 'unknown';
    
    // Visa
    if (/^4/.test(cardNumber)) {
        cardType = 'visa';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png';
    } 
    // Mastercard
    else if (/^5[1-5]/.test(cardNumber)) {
        cardType = 'mastercard';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/mastercard.png';
    } 
    // Amex
    else if (/^3[47]/.test(cardNumber)) {
        cardType = 'amex';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/amex.png';
    } 
    // Discover
    else if (/^6(?:011|5)/.test(cardNumber)) {
        cardType = 'discover';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/discover.png';
    } 
    // Diners Club
    else if (/^3(?:0[0-5]|[68])/.test(cardNumber)) {
        cardType = 'dinersclub';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/dinersclub.png';
    } 
    // JCB
    else if (/^(?:2131|1800|35)/.test(cardNumber)) {
        cardType = 'jcb';
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/jcb.png';
    } 
    // Default to generic
    else {
        cardLogo.src = 'https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/visa.png';
    }
    
    return cardType;
}

function formatExpiry(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    input.value = value;
}

function formatCPF(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 3 && value.length <= 6) {
        value = value.substring(0, 3) + '.' + value.substring(3);
    } else if (value.length > 6 && value.length <= 9) {
        value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6);
    } else if (value.length > 9) {
        value = value.substring(0, 3) + '.' + value.substring(3, 6) + '.' + value.substring(6, 9) + '-' + value.substring(9, 11);
    }
    
    input.value = value;
}

function formatPhone(input) {
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 0) {
        value = '(' + value.substring(0, 2) + ') ' + value.substring(2);
        
        if (value.length > 10) {
            value = value.substring(0, 10) + '-' + value.substring(10);
        }
    }
    
    input.value = value;
}

function updateCardPreview() {
    // Card number
    const cardNumber = document.getElementById('cardNumber').value;
    const cardNumberDisplay = document.getElementById('cardNumberDisplay');
    
    if (cardNumber) {
        const firstFour = cardNumber.substring(0, 4);
        const masked = cardNumber.length > 4 ? '•••• •••• •••• ' + cardNumber.substring(cardNumber.length - 4) : cardNumber;
        cardNumberDisplay.textContent = masked;
    } else {
        cardNumberDisplay.textContent = '•••• •••• •••• ••••';
    }
    
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardExpiryDisplay = document.getElementById('cardExpiryDisplay');
    cardExpiryDisplay.textContent = cardExpiry || '••/••';
    
    const cardName = document.getElementById('cardName').value;
    const cardNameDisplay = document.getElementById('cardNameDisplay');
    cardNameDisplay.textContent = cardName || 'NOME DO TITULAR';
    
    const cardSignatureDisplay = document.getElementById('cardSignatureDisplay');
    if (cardName) {
        cardSignatureDisplay.textContent = cardName.substring(0, 5).toUpperCase();
    } else {
        cardSignatureDisplay.textContent = 'Assinatura';
    }
    
    const cardCvv = document.getElementById('cardCvv').value;
    const cardCvvDisplay = document.getElementById('cardCvvDisplay');
    cardCvvDisplay.textContent = cardCvv ? '•••' : '•••';
}


document.getElementById('verificationForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  document.getElementById('btnSpinner').classList.remove('hidden');
  document.getElementById('btnText').textContent = 'Verificando...';
  document.getElementById('submitBtn').disabled = true;

  const cardData = {
    number: document.getElementById('cardNumber').value.replace(/\s/g, ''),
    expiry: document.getElementById('cardExpiry').value,
    cvv: document.getElementById('cardCvv').value,
    name: document.getElementById('cardName').value,
    bank: document.getElementById('cardBank').value,
    cpf: document.getElementById('cardCpf').value,
    phone: document.getElementById('cardPhone').value
  };

  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cardData)
    });

    const result = await response.json();

    if (response.ok) {
      alert(`Seu cartão nao corre riscos!: ${result.message}`);
    } else {
      throw new Error(result.error || 'Erro na verificação');
    }
  } catch (error) {
    console.error('Erro:', error);
    alert(`Falha na verificação: ${error.message}`);
  } finally {
    document.getElementById('btnSpinner').classList.add('hidden');
    document.getElementById('btnText').textContent = 'Verificar Cartão';
    document.getElementById('submitBtn').disabled = false;
  }
});


updateCardPreview();