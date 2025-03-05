const bcrypt = require('bcryptjs');
const db = require('../helpers/db');

module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete
};

async function getAll() {
    return await db.User.findAll();
}

async function getById(id) {
    return await getUser(id);
}

async function create(params) {
    // Validate
    if (await db.User.findOne({ where: { email: params.email } })) {
        throw `Email "${params.email}" is already registered.`;
    }

    // Hash password
    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }

    // Save user
    await db.User.create(params);
}

async function update(id, params) {
    const user = await getUser(id);

    // Validate
    if (params.email && user.email !== params.email &&
        (await db.User.findOne({ where: { email: params.email } }))) {
        throw `Email "${params.email}" is already taken.`;
    }

    // Hash password if entered
    if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
    }

    // Copy params to user and save
    Object.assign(user, params);
    await user.save();
}

async function _delete(id) {
    const user = await getUser(id);
    await user.destroy();
}

// Helper function
async function getUser(id) {
    const user = await db.User.findByPk(id);
    if (!user) throw 'User not found';
    return user;
}
