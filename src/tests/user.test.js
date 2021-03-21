const app = require('../index');
const request = require('supertest');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../models/users');

const userId = new mongoose.Types.ObjectId();
const user = {
    _id: userId,
    name:'yazanalsharif',
    email:'yazanalsharif@gmail.com',
    password:'Yazan2000!!',
    tokens: [{
        token: jwt.sign({_id: userId}, process.env.TOKEN_SECRET)
    }]
}

beforeEach(async () => {
    await User.deleteMany();
    await new User(user).save();
});

test('should sign up a new user', async () => {
  const res =  await request(app).post('/users').send({
        name: 'Andrew',
        email: 'yazanalsharif@example.com',
        password: 'MyPass777!'
    }).expect(201);
    //make sure the user added on database
    const user = await User.findById(res.body.user._id);
    expect(user).not.toBeNull();
    console.log('here we go', res.body);
    //make sure the user has the same name and email in database
    expect(res.body).toMatchObject({
        user: {
            name: 'Andrew',
            email: 'yazanalsharif@example.com'
        },
        token: user.tokens[0].token
    });
    expect(res.body.user.password).not.toBe('MyPass777!');
});

test('should login the existing user', async () => {
    const res = await request(app).post('/users/login').send({
        email: user.email,
        password: user.password
    }).expect(200);

    const userFromDb = await User.findById(userId);
    expect(res.body.token).toBe(userFromDb.tokens[1].token);
});

test('should not login for non-existing user', async () => {
    await request(app).post('/users/login').send({
        email: 'notEmail@gmail.com',
        password: 'Yazan2193!'
    }).expect(400);
});

test('should get profile for user', async () => {
    await request(app)
    .get('/users/me')
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
});

test('shold not get profile for user nonAuthorization', async () => {
    await request(app)
    .get('/users/me')
    .send()
    .expect(401)
});

test('should delete the user', async () => {
    await request(app)
    .delete('/users/me')
    .set('Authorization', `Bearer ${user.tokens[0].token}`)
    .send()
    .expect(200);
    const userFromDb = await User.findById(userId);
    expect(userFromDb).toBeNull();
});

test('should not delete the unAuthorize user', async () => {
    await request(app)
    .delete('/users/me')
    .send()
    .expect(401)
});