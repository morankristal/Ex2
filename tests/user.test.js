const request = require("supertest");
const initApp = require("../app");
const mongoose = require("mongoose");
const User = require("../models/user.model");

var app;
let userId = "";
let accessToken = "";
let refreshToken = "";

beforeAll(async () => {
    app = await initApp();
    await User.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("User API Tests", () => {
    test("Test Create User (Register)", async () => {
        const response = await request(app)
            .post("/users/register")
            .send({
                username: "testuser",
                email: "testuser@example.com",
                password: "password123",
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe("User registered successfully");

        userId = response.body._id;
        console.log("Create User Response:", response.body);
        console.log(userId)
    });

    test("Test Login User", async () => {
        const response = await request(app)
            .post("/users/login")
            .send({
                email: "testuser@example.com",
                password: "password123",
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();

        accessToken = response.body.accessToken;
        refreshToken = response.body.refreshToken;
    });

    test("Test Get User by ID", async () => {

        expect(userId).toBeDefined();
        console.log(userId)

        const response = await request(app)
            .get(`/users/id/${userId}`)
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.username).toBe("testuser");
        expect(response.body.email).toBe("testuser@example.com");
    });

    test("Test Get User by Username", async () => {
        const response = await request(app)
            .get("/users?username=testuser")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(response.statusCode).toBe(200);
        expect(response.body[0].username).toBe("testuser");
    });

    test("Test Refresh Token", async () => {
        const response = await request(app)
            .post("/users/refresh-token")
            .send({ token: refreshToken });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
    });

    test("Test Logout User", async () => {
        const response = await request(app)
            .post("/users/logout")
            .send({ refreshToken });

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe("Logged out successfully");
    });

    test("Test Login Fail (Invalid Credentials)", async () => {
        const response = await request(app)
            .post("/users/login")
            .send({
                email: "invaliduser@example.com",
                password: "wrongpassword",
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.message).toBe("Invalid credentials");
    });
});
