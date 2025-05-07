import { test, describe, before, beforeEach, after } from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import { db } from '../src/database/db.js';
import app from '../src/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Test constants
const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret';

// Test data
let testUserId: number;
let testAuthToken: string;
let testBookmarkId: number;
let testCollectionId: number;
let testTagId: number;

// Before all tests
before(async () => {
    // Clean up database before tests
    await cleanDatabase();
});

// After all tests
after(async () => {
    // Clean up database after tests
    await cleanDatabase();
});

// Helper function to clean the database
async function cleanDatabase() {
    await db.deleteFrom('bookmark_tags').execute();
    await db.deleteFrom('collection_bookmarks').execute();
    await db.deleteFrom('bookmarks').execute();
    await db.deleteFrom('collections').execute();
    await db.deleteFrom('tags').execute();
    await db.deleteFrom('users').execute();
}

// Authentication tests
describe('Authentication', () => {
    beforeEach(async () => {
        // Clean up users before each test
        await db.deleteFrom('users').execute();
    });

    test('Register a new user', async () => {
        const response = await supertest(app).post('/api/users').send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.username, 'testuser');
        assert.strictEqual(response.body.email, 'test@example.com');
        assert.strictEqual(response.body.password, undefined); // Password should not be returned

        // Save user ID for other tests
        testUserId = response.body.id;
    });

    test('Login with valid credentials', async () => {
        // Create a test user first
        const hashedPassword = await bcrypt.hash('password123', 10);
        const createUserResult = await db
            .insertInto('users')
            .values({
                username: 'logintest',
                email: 'login@example.com',
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning(['id'])
            .executeTakeFirst();

        const userId = createUserResult?.id;

        const response = await supertest(app).post('/api/users/login').send({
            username: 'logintest',
            password: 'password123',
        });

        assert.strictEqual(response.status, 200);
        assert.ok(response.body.token);

        // Save token for later tests
        testAuthToken = response.body.token;
    });
});

// Bookmark tests
describe('Bookmark CRUD Operations', () => {
    before(async () => {
        // Create a test user for all bookmark tests
        const hashedPassword = await bcrypt.hash('password123', 10);
        const createUserResult = await db
            .insertInto('users')
            .values({
                username: 'bookmarkuser',
                email: 'bookmark@example.com',
                password: hashedPassword,
                created_at: new Date(),
                updated_at: new Date(),
            })
            .returning(['id'])
            .executeTakeFirst();

        testUserId = createUserResult?.id as number;

        // Generate JWT token for bookmark tests
        testAuthToken = jwt.sign({ userId: testUserId, username: 'bookmarkuser' }, JWT_SECRET, { expiresIn: '1h' });
    });

    beforeEach(async () => {
        // Clean up bookmarks before each test
        await db.deleteFrom('bookmark_tags').execute();
        await db.deleteFrom('collection_bookmarks').execute();
        await db.deleteFrom('bookmarks').execute();
    });

    test('Create a bookmark', async () => {
        const response = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Test Bookmark',
                url: 'https://example.com',
                description: 'This is a test bookmark',
            });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.title, 'Test Bookmark');
        assert.strictEqual(response.body.url, 'https://example.com');
        assert.strictEqual(response.body.description, 'This is a test bookmark');

        // Save bookmark ID for other tests
        testBookmarkId = response.body.id;
    });

    test('Get all bookmarks', async () => {
        // Create a test bookmark first
        const createResponse = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Get All Test Bookmark',
                url: 'https://example.com/all',
            });

        const response = await supertest(app).get('/api/bookmarks').set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.ok(response.body.length > 0);

        // Check our bookmark is in the results
        const bookmark = response.body.find((b: any) => b.id === createResponse.body.id);
        assert.ok(bookmark);
        assert.strictEqual(bookmark.title, 'Get All Test Bookmark');
    });

    test('Get a bookmark by ID', async () => {
        // Create a test bookmark first
        const createResponse = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Get By ID Test Bookmark',
                url: 'https://example.com/byid',
            });

        const bookmarkId = createResponse.body.id;

        const response = await supertest(app)
            .get(`/api/bookmarks/${bookmarkId}`)
            .set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.id, bookmarkId);
        assert.strictEqual(response.body.title, 'Get By ID Test Bookmark');
    });

    test('Update a bookmark', async () => {
        // Create a test bookmark first
        const createResponse = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Update Test Bookmark',
                url: 'https://example.com/update',
            });

        const bookmarkId = createResponse.body.id;

        const response = await supertest(app)
            .put('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                id: bookmarkId,
                title: 'Updated Bookmark Title',
                description: 'Updated description',
            });

        assert.strictEqual(response.status, 200);
        assert.strictEqual(response.body.id, bookmarkId);
        assert.strictEqual(response.body.title, 'Updated Bookmark Title');
        assert.strictEqual(response.body.description, 'Updated description');
    });

    test('Delete a bookmark', async () => {
        // Create a test bookmark first
        const createResponse = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Delete Test Bookmark',
                url: 'https://example.com/delete',
            });

        const bookmarkId = createResponse.body.id;

        const deleteResponse = await supertest(app)
            .delete(`/api/bookmarks/${bookmarkId}`)
            .set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(deleteResponse.status, 200);

        // Verify bookmark is deleted
        const getResponse = await supertest(app)
            .get(`/api/bookmarks/${bookmarkId}`)
            .set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(getResponse.status, 400);
    });
});

// Collection tests
describe('Collection CRUD Operations', () => {
    before(async () => {
        if (!testUserId || !testAuthToken) {
            // Create a test user for collection tests if not already created
            const hashedPassword = await bcrypt.hash('password123', 10);
            const createUserResult = await db
                .insertInto('users')
                .values({
                    username: 'collectionuser',
                    email: 'collection@example.com',
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                .returning(['id'])
                .executeTakeFirst();

            testUserId = createUserResult?.id as number;

            // Generate JWT token
            testAuthToken = jwt.sign({ userId: testUserId, username: 'collectionuser' }, JWT_SECRET, {
                expiresIn: '1h',
            });
        }

        // Create a test bookmark to add to collections
        const createBookmarkResponse = await supertest(app)
            .post('/api/bookmarks')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                title: 'Collection Test Bookmark',
                url: 'https://example.com/collection',
            });

        testBookmarkId = createBookmarkResponse.body.id;
    });

    beforeEach(async () => {
        // Clean up collections before each test
        await db.deleteFrom('collection_bookmarks').execute();
        await db.deleteFrom('collections').execute();
    });

    test('Create a collection', async () => {
        const response = await supertest(app)
            .post('/api/collections')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                name: 'Test Collection',
                description: 'This is a test collection',
            });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.name, 'Test Collection');
        assert.strictEqual(response.body.description, 'This is a test collection');

        // Save collection ID for other tests
        testCollectionId = response.body.id;
    });

    test('Add bookmark to collection', async () => {
        // Create a collection first
        const createCollectionResponse = await supertest(app)
            .post('/api/collections')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                name: 'Bookmark Collection',
                description: 'Collection for bookmarks',
            });

        const collectionId = createCollectionResponse.body.id;

        const response = await supertest(app)
            .post(`/api/collections/${collectionId}/bookmarks`)
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                bookmark_id: testBookmarkId,
            });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.collection_id, collectionId);
        assert.strictEqual(response.body.bookmark_id, testBookmarkId);
    });

    test('Get bookmarks in collection', async () => {
        // Create a collection
        const createCollectionResponse = await supertest(app)
            .post('/api/collections')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                name: 'Get Bookmarks Collection',
                description: 'Collection for getting bookmarks',
            });

        const collectionId = createCollectionResponse.body.id;

        // Add a bookmark to the collection
        await supertest(app)
            .post(`/api/collections/${collectionId}/bookmarks`)
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({ bookmark_id: testBookmarkId });

        const response = await supertest(app)
            .get(`/api/collections/${collectionId}/bookmarks`)
            .set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].id, testBookmarkId);
    });
});

// Tag tests
describe('Tag CRUD Operations', () => {
    before(async () => {
        if (!testUserId || !testAuthToken) {
            // Create a test user for tag tests if not already created
            const hashedPassword = await bcrypt.hash('password123', 10);
            const createUserResult = await db
                .insertInto('users')
                .values({
                    username: 'taguser',
                    email: 'tag@example.com',
                    password: hashedPassword,
                    created_at: new Date(),
                    updated_at: new Date(),
                })
                .returning(['id'])
                .executeTakeFirst();

            testUserId = createUserResult?.id as number;

            // Generate JWT token
            testAuthToken = jwt.sign({ userId: testUserId, username: 'taguser' }, JWT_SECRET, { expiresIn: '1h' });
        }

        // Create a test bookmark if not already created
        if (!testBookmarkId) {
            const createBookmarkResponse = await supertest(app)
                .post('/api/bookmarks')
                .set('Authorization', `Bearer ${testAuthToken}`)
                .send({
                    user_id: testUserId,
                    title: 'Tag Test Bookmark',
                    url: 'https://example.com/tag',
                });

            testBookmarkId = createBookmarkResponse.body.id;
        }
    });

    beforeEach(async () => {
        // Clean up tags before each test
        await db.deleteFrom('bookmark_tags').execute();
        await db.deleteFrom('tags').execute();
    });

    test('Create a tag', async () => {
        const response = await supertest(app).post('/api/tags').set('Authorization', `Bearer ${testAuthToken}`).send({
            user_id: testUserId,
            name: 'Test Tag',
            slug: 'test-tag',
        });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.name, 'Test Tag');
        assert.strictEqual(response.body.slug, 'test-tag');

        // Save tag ID for other tests
        testTagId = response.body.id;
    });

    test('Add tag to bookmark', async () => {
        // Create a tag first
        const createTagResponse = await supertest(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                name: 'Bookmark Tag',
                slug: 'bookmark-tag',
            });

        const tagId = createTagResponse.body.id;

        const response = await supertest(app)
            .post(`/api/bookmarks/${testBookmarkId}/tags`)
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                tag_id: tagId,
            });

        assert.strictEqual(response.status, 201);
        assert.strictEqual(response.body.bookmark_id, testBookmarkId);
        assert.strictEqual(response.body.tag_id, tagId);
    });

    test('Get tags for a bookmark', async () => {
        // Create a tag
        const createTagResponse = await supertest(app)
            .post('/api/tags')
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({
                user_id: testUserId,
                name: 'Get Tags Test',
                slug: 'get-tags-test',
            });

        const tagId = createTagResponse.body.id;

        // Add tag to bookmark
        await supertest(app)
            .post(`/api/bookmarks/${testBookmarkId}/tags`)
            .set('Authorization', `Bearer ${testAuthToken}`)
            .send({ tag_id: tagId });

        const response = await supertest(app)
            .get(`/api/bookmarks/${testBookmarkId}/tags`)
            .set('Authorization', `Bearer ${testAuthToken}`);

        assert.strictEqual(response.status, 200);
        assert.ok(Array.isArray(response.body));
        assert.strictEqual(response.body.length, 1);
        assert.strictEqual(response.body[0].id, tagId);
        assert.strictEqual(response.body[0].name, 'Get Tags Test');
    });
});
