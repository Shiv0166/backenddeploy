const express = require("express");
require("dotenv").config();
const http = require("http");
const path = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const { Server } = require("socket.io");

const User = require("./models/User");
const orderRoutes = require("./routes/orderRoutes");
const authRoutes = require("./routes/authRoutes");
const viewRoutes = require("./routes/viewRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const middlewareDemoRoutes = require("./routes/middlewareDemoRoutes");
const { requestLifecycleLogger } = require("./middlewares/requestLifecycle");
const { notFoundHandler, globalErrorHandler } = require("./middlewares/errorHandler");
const { connectDB } = require("./db");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 5000;

// ---------------------- DATABASE (PostgreSQL) ----------------------
connectDB().catch((err) => console.error("PostgreSQL connection failed:", err.message));

// ---------------------- PASSPORT LOCAL STRATEGY ----------------------
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "Invalid credentials" });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return done(null, false, { message: "Invalid credentials" });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  })
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

// ---------------------- TEMPLATE ENGINE (EJS) ----------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ---------------------- APP-LEVEL MIDDLEWARE ----------------------
// Third-party middleware examples
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));

// Cookie and session middleware (session data uses a cookie id)
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "dev_session_secret",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware via built-in Express parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Lifecycle middleware to show middleware chain progression
app.use(requestLifecycleLogger);

// Static file serving for your existing frontend
app.use(express.static(path.join(__dirname)));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------- ROUTER-LEVEL MIDDLEWARE + ROUTES ----------------------
// Request path through chain:
// app-level middleware -> router-level middleware -> route handler -> error handler (if thrown)
app.use(orderRoutes);
app.use("/auth", authRoutes);
app.use(viewRoutes);
app.use("/api", productRoutes);
app.use("/api", userRoutes);
app.use("/api", cartRoutes);
app.use("/session", sessionRoutes);
app.use(middlewareDemoRoutes);

app.get("/health", async (req, res, next) => {
  try {
    const { pool } = require("./db");
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", message: "Server is healthy", database: "postgresql" });
  } catch (error) {
    next(error);
  }
});

// ---------------------- SOCKET.IO (FULL DUPLEX) ----------------------
io.on("connection", (socket) => {
  console.log("Socket client connected:", socket.id);

  socket.emit("chat:message", {
    message: "Connected to Socket.IO server",
    time: new Date().toLocaleTimeString(),
  });

  // Server listens for client events and broadcasts to all clients.
  socket.on("chat:message", (payload) => {
    io.emit("chat:message", {
      message: payload.message,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("disconnect", () => {
    console.log("Socket client disconnected:", socket.id);
  });
});

// ---------------------- ERROR MIDDLEWARE ----------------------
app.use(notFoundHandler);
app.use(globalErrorHandler);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
