const Modal = {
    open() {
        //Abrir Modal
        //Adicionar a class active ao modal

        document
            .querySelector('.modal-overlay')
            .classList
            .add('active')
    },
    close() {
        //Fechar Modal
        //Remover a class active do modal
        document
            .querySelector('.modal-overlay')
            .classList
            .remove('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

const Transactions = {
    all: Storage.get(),

    add(transaction) {
        this.all.push(transaction)

        App.reload()
    },

    remove(index) {
        this.all.splice(index, 1)

        App.reload()
    },

    income() {
        let income = 0
        // pegar todas as transaçoes
        this.all.forEach(transaction => {
            // para cada transaçao, verificar se ela é maior que 0
            if (transaction.amount > 0) {
                income += transaction.amount
            }
        })
        // retornar o total
        return income
    },

    expense() {
        let expense = 0
        // pegar todas as transaçoes
        Transactions.all.forEach(transaction => {
            // para cada transaçao, verificar se ela é menor que 0 e somar
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })
        // retornar o total
        return expense
    },

    total() {
        let total = 0
        total = this.income() + this.expense()

        return total
    }
}

const DOM = {
    transactionContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)
    },

    innerHTMLTransaction(transaction, index) {
        const CSSclass = transaction.amount >= 0 ? 'income' : 'expense'

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick ="Transactions.remove(${index})" src="assets/img/minus.svg" alt="Remover Transação">
        </td>
        `

        return html
    },

    updateBalance() {
        document
            .querySelector('#incomeDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.income())
        document
            .querySelector('#expenseDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.expense())
        document
            .querySelector('#totalDisplay')
            .innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransactions() {
        this.transactionContainer.innerHTML = ""
    }

}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? '-' : ''
        value = String(value).replace(/\D/g, '')

        value = Number(value) / 100

        value = value.toLocaleString('pt-BR', {
            style: 'currency', currency: 'BRL'
        })

        return signal + value
    },

    formatAmount(value) {
        value = Number(value) * 100

        return value
    },

    formatDate(date) {
        const splitDate = date.split('-')

        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    }
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#data'),

    getValues() {
        return {
            description: this.description.value,
            amount: this.amount.value,
            date: this.date.value
        }
    },

    validateFields() {
        const { description, amount, date } = this.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    // formatar os dados para salvar
    formatValues() {
        let { description, amount, date } = this.getValues()

        amount = Utils.formatAmount(amount)
        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    //resetar os dados do formulário
    clearFields() {
        this.description.value = ''
        this.amount.value = ''
        this.date.value = ''
    },

    submit(event) {
        event.preventDefault()

        try {
            this.validateFields()

            const transaction = this.formatValues()

            Transactions.add(transaction)

            this.clearFields()
            //fechar modal
            Modal.close()

        } catch (error) {
            alert(error.message)
        }
    }
}

const App = {
    init() {
        Transactions.all.forEach(DOM.addTransaction)

        DOM.updateBalance()

        Storage.set(Transactions.all)
    },

    reload() {
        DOM.clearTransactions()
        App.init()
    }
}

App.init()