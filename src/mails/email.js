

const sendGrid = require('@sendgrid/mail');

sendGrid.setApiKey(process.env.API_ADDRESS_KEY);

const me = 'yazan.ana219@gmail.com';
const sendWelcomeMessage = (email, name) => {
    sendGrid.send({
        from:me,
        to:email,
        subject:'welcome in our app',
        text:'hello mr ' + name + 'wish we find you well, welcome in our app and we hope it will like you'
    });
    
}

const sendWhyCansaling = (email, name) => {
    sendGrid.send({
        from:me,
        to:email,
        subject:'deleting your email',
        text:'we very sad to leave us mr' + name
    })
}

module.exports = {
    sendWelcomeMessage,
    sendWhyCansaling
}