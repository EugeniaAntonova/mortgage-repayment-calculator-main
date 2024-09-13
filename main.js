const textInputs = [...document.querySelectorAll('input[type="text"]')];

const onTextInput = (evt) => {
    let key = evt.key;
    if (!key.match(/[\d\.]|escape|enter|tab|arrow.+|delete|backspace/gi)) evt.preventDefault();
}

const currencyValue = (value) => {
    return Number(value).toLocaleString('en-GB');
}

const cutValue = (value) => {
    if (value.includes('.')) {

        let str = value.match(/\d+\.{1}\d{0,2}/gi);
        let formatted = currencyValue(value.split('.')[0]);

        return str.join().replace(/.+(?=\.)/g, formatted);
    } else {
        return currencyValue(value);
    }
}

const onInput = (evt) => {
    let value = evt.target.value;
    let position = value.replace(/\,/gmi, '').length % 3 == 1 ? evt.target.selectionStart + 1 : evt.target.selectionStart;
    evt.target.value = cutValue(value.replace(/\,/gmi, ''));
    evt.target.selectionStart = position;
    evt.target.selectionEnd = position;
}

window.onload = function () {
    textInputs.forEach(input => {
        input.addEventListener('keydown', onTextInput);
        input.addEventListener('input', onInput);
    })

    let form = document.querySelector('form');

    const prevData = JSON.parse(sessionStorage.getItem('data'));
    if (prevData) {
        if (Object.keys(prevData).length !== 0) {
            fillInPrevData(form, prevData)
        }
    }

    let pristine = new Pristine(form);

    form.addEventListener('submit', function (evt) {
        evt.preventDefault();

        var valid = pristine.validate();
        if (valid) {
            let total = parseFloat(form.querySelector('input[name="amount"]').value.replace(',', ''));
            let term = parseFloat(form.querySelector('input[name="years"]').value.replace(',', ''));
            let interestRate = parseFloat(form.querySelector('input[name="interestRate"]').value);
            let mode = form.querySelector('input[name="morgageType"]:checked').value;

            const data = { total, term, interestRate, mode };

            const { monthInterestPayments, totalInterestRepayments, avgMonthlyCapitalRepayments, totalRepaiment } = calculateMortgage(total, term, interestRate);
            showResults(monthInterestPayments, totalInterestRepayments, avgMonthlyCapitalRepayments, totalRepaiment, mode);

            sessionStorage.setItem('data', JSON.stringify(data));
        }

    });
};

function calculateMortgage(total, term, interestRate) {
    let monthInterestPayments = (((total / 3) * 2) * (interestRate / 100)) / 12;
    let termMonths = term * 12;
    let totalInterestRepayments = monthInterestPayments * termMonths;
    let monthlyRepayment = total / termMonths;
    let avgMonthlyCapitalRepayments = monthInterestPayments + monthlyRepayment;
    let totalRepaiment = avgMonthlyCapitalRepayments * termMonths;

    return { monthInterestPayments, totalInterestRepayments, avgMonthlyCapitalRepayments, totalRepaiment }
}

function showResults(monthInterest, totalInterest, avgMonthlyRepayments, totalRepaiment, mode) {

    const completedSection = document.querySelector('.js-result-completed');
    const emptySection = document.querySelector('.js-result-empty');

    const monthlyOutput = document.querySelector('.js-monthly-output');
    const totalOutput = document.querySelector('.js-total-output');

    if (mode == 'repayment') {
        monthlyOutput.textContent = avgMonthlyRepayments.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalOutput.textContent = totalRepaiment.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
        monthlyOutput.textContent = monthInterest.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        totalOutput.textContent = totalInterest.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    emptySection.classList.replace('shown', 'hidden');
    completedSection.classList.replace('hidden', 'shown');
}

function fillInPrevData(form, data) {
    const totalInput = form.querySelector('#amount');
    const termInput = form.querySelector('#years');
    const interestInput = form.querySelector('#interestRate');
    const { total, term, interestRate, mode } = data;
    const modeInputs = [...form.querySelectorAll('input[type="radio"][name="morgageType"]')];
    modeInputs.forEach((item) => {
        item.checked = false;
    })
    const modeInput = form.querySelector(`input[name="morgageType"][value="${mode}"]`);
    modeInput.checked = true;
    totalInput.value = total.toLocaleString('en-GB');
    termInput.value = term;
    interestInput.value = interestRate;

    const { monthInterestPayments, totalInterestRepayments, avgMonthlyCapitalRepayments, totalRepaiment } = calculateMortgage(total, term, interestRate);
    showResults(monthInterestPayments, totalInterestRepayments, avgMonthlyCapitalRepayments, totalRepaiment, mode);
}
