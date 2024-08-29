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
        // return  currencyValue(value.match(/\d+\.{1}\d{0,2}/gi));

        let str = value.match(/\d+\.{1}\d{0,2}/gi);
        let formatted = currencyValue(value.split('.')[0]);

        return str.join().replace(/.+(?=\.)/g, formatted);
    } else {
        return currencyValue(value);
    }
}

const onInput = (evt) => {
    let value = evt.target.value;
    let position = value.replace(/\,/gmi, '').length % 3 == 1 ? evt.target.selectionStart + 1 :  evt.target.selectionStart;
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

    let pristine = new Pristine(form);

    form.addEventListener('submit', function (evt) {
        evt.preventDefault();

        var valid = pristine.validate();

    });
};