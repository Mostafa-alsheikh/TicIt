const request = require('supertest');
const app = require('../index');
const User = require('../models/User');

async function loginUser(email = 'test@test.com', password = '123456') {
    await request(app).post('/auth/register').send({ email, password });
    const res = await request(app).post('/auth/login').send({ email, password });
    return res.body.token;
}

async function loginAdmin() {
    const email = 'admin@test.com';
    const password = '123456';
    await request(app).post('/auth/register').send({ email, password });
    await User.findOneAndUpdate({ email }, { role: 'admin' });
    const res = await request(app).post('/auth/login').send({ email, password });
    return res.body.token;
}

test('GET /tasks with token should work', async () => {
    const token = await loginUser();
    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
});

test('GET /tasks without token should return 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
});

test('DELETE /tasks can be done by admin', async () => {
    const token = await loginAdmin();

    const taskRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task to delete' });

    const taskId = taskRes.body._id;

    const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
});

test('DELETE /tasks cant be done by non-admin', async () => {
    const token = await loginUser();

    const taskRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task' });

    const taskId = taskRes.body._id;

    const res = await request(app)
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(403);
});

test('User cannot update another users task', async () => {
    const tokenA = await loginUser('userA@test.com', '123456');

    const taskRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'User A Task' });

    const taskId = taskRes.body._id;

    const tokenB = await loginUser('userB@test.com', '123456');

    const res = await request(app)
        .put(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Not your task' });

    expect(res.statusCode).toBe(403);
});

test('POST /tasks should create a task', async () => {
    const token = await loginUser();

    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test task' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test task');
});

test('GET /tasks returns tasks', async () => {
    const token = await loginUser();

    await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'NewTask' });

    const res = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results[0].title).toBe('NewTask');
});

test('GET /tasks?page=1&limit=2 pagination', async () => {
    const token = await loginUser();

    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 1' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 2' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 3' });

    const res = await request(app)
        .get('/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.results.length).toBe(2);
    expect(res.body.total).toBe(3);
});

test('GET /tasks?search=test', async () => {
    const token = await loginUser();

    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Test Task' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Something else' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'test a feature' });

    const res = await request(app)
        .get('/tasks?search=test')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(2);
    expect(res.body.results.every(item => item.title.toLowerCase().includes('test'))).toBe(true);
});

test('GET /tasks?completed=true', async () => {
    const token = await loginUser();

    const taskRes = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Task 1' });

    await request(app)
        .patch(`/tasks/${taskRes.body._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ completed: true });

    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'Task 2' });

    const res = await request(app)
        .get('/tasks?completed=true')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.results.every(item => item.completed === true)).toBe(true);
});

test('GET /tasks?sort=title_asc', async () => {
    const token = await loginUser();

    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'C' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'A' });
    await request(app).post('/tasks').set('Authorization', `Bearer ${token}`).send({ title: 'B' });

    const res = await request(app)
        .get('/tasks?sort=title_asc')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.results[0].title).toBe('A');
    expect(res.body.results[1].title).toBe('B');
    expect(res.body.results[2].title).toBe('C');
});

test('GET /tasks?page=0 should return 400', async () => {
    const token = await loginUser();

    const res = await request(app)
        .get('/tasks?page=0')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Page must be atleast 1');
});

test('GET /tasks?sort=wrong should return 400', async () => {
    const token = await loginUser();

    const res = await request(app)
        .get('/tasks?sort=wrong')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Sort must be one of');
});

test('GET /tasks?search=doesnotexist returns empty', async () => {
    const token = await loginUser();

    const res = await request(app)
        .get('/tasks?search=doesnotexist')
        .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.total).toBe(0);
    expect(res.body.results).toEqual([]);
});

test('POST /tasks should fail without title', async () => {
    const token = await loginUser();

    const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toContain('Title is required');
});