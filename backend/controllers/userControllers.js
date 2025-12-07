const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const session = require("express-session");
const RedisStore = require("connect-redis").default;
const Redis = require("ioredis");
const dotenv = require("dotenv");
dotenv.config();
// Initialize Redis client
const redisHost = process.env.REDIS_HOST || "redis";
const redisPort = process.env.REDIS_PORT || 6379;

// Create a proper Redis connection string URL
const redisUrl =
"redis://red-cvqna2e3jp1c73dsnbb0:6379";
  
console.log("Connecting to Redis at URL:", redisUrl);

const redisClient = new Redis(redisUrl);


//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search ? req.query.search.toLowerCase() : "";

  // Retrieve all keys for users
  const userKeys = await redisClient.keys("user:*");

  // Initialize an array to hold the matched users
  const matchedUsers = [];

  // Iterate through user keys and fetch their details
  for (const key of userKeys) {
    const user = await redisClient.hgetall(key); // Get user details as a hash

    // Check if the user's name or email contains the search keyword
    if (
      (user.name && user.name.toLowerCase().includes(keyword)) ||
      (user.email && user.email.toLowerCase().includes(keyword))
    ) {
      matchedUsers.push({
        _id: key.split(":")[1], // Extract user ID from the key
        name: user.name,
        email: user.email,
        // Include other fields as needed
      });
    }
  }

  // Filter out the current user
  const result = matchedUsers.filter(
    (user) => user._id !== req.user._id.toString()
  );

  res.send(result);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please Enter all the Fields");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });

  if (user) {
    // Store user details in Redis store
    await redisClient.hset(`user:${user._id}`, {
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
    });

    // Optionally set expiration time for the cached data (e.g., 1 hour)
    //await redisClient.expire(`user:${user._id}`, 3600);

    // Create session for the user (if needed)
    req.session.userId = user._id; // Store user ID in session
    

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});

module.exports = { allUsers, registerUser, authUser };
