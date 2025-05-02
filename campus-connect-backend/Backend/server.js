// 1. Load required packages
const express = require("express");
const cors = require("cors");

//File Path
const path = require("path");
//loading MongoDB
const mongoose = require('mongoose');

//intergrate with the student table in mongoDB atlass
//const Student = require("./models/Student"); // ← if models is inside Backend

const Student = require("./models/Student");

const Message = require('./models/Message');



// ⚡Replace <password> and <dbname> properly in your connection string
const mongoURI = "mongodb+srv://campusadmin:campusconnect@campusconnectdb.i94nqjc.mongodb.net/campusconnect?retryWrites=true&w=majority&appName=CampusConnectDB";
//const mongoURI = "mongodb+srv://campusadmin:campusconnect@campusconnectdb.i94nqjc.mongodb.net/students?retryWrites=true&w=majority&appName=CampusConnectDB";

mongoose.connect(mongoURI, {
  
})
.then(() => console.log("✅ Connected to MongoDB Atlas"))
.catch((err) => console.error("❌ MongoDB connection error:", err));

// 2. Create a new express app
const app = express();

// 3. Set the port your server will run on
const port = 5020;

// 4. Enable Cross-Origin (frontend can talk to backend)
app.use(cors());

// 5. Allow backend to read data sent from frontend as JSON
app.use(express.json());

app.use(express.static("public"));

// Serve uploads folder

app.use("/uploads", express.static(path.join(__dirname, "public/uploads")));



// 7. Your real API route (POST) for login
app.post("/api/login", async (req, res) => {
  const { regNumber, password } = req.body;

  try {
    const student = await Student.findOne({ regNumber });

    if (!student) {
      return res.json({ success: false, message: "Student not found in database." });
    }

    if (student.password !== password) {
      return res.json({ success: false, message: "Incorrect password" });
    }

    // ✅ Extract group info from regNumber e.g. "BIT/456/2023" => "BIT 2023"
    const parts = regNumber.split("/");
    const courseCode = parts[0]; // "BIT"
    const year = parts[2];       // "2023"
    const groupName = `${courseCode} ${year}`;

    const officialGroup = "Official Campus Group";

    // 🛠️ Ensure class group exists and add student
    let classGroup = await Group.findOne({ name: groupName });
    if (!classGroup) {
      classGroup = new Group({
        name: groupName,
        type: "class",
        description: `Group for ${groupName} students`,
        admin: regNumber,
        members: [regNumber],
        messages: [],
      });
      await classGroup.save();
      console.log(`✅ Created group: ${groupName}`);
    } else if (!classGroup.members.includes(regNumber)) {
      classGroup.members.push(regNumber);
      await classGroup.save();
    }

    // 🛠️ Ensure official group exists and add student
    let schoolGroup = await Group.findOne({ name: officialGroup });
    if (!schoolGroup) {
      schoolGroup = new Group({
        name: officialGroup,
        type: "school",
        description: "Official announcements from the campus administration",
        admin: "Dean",
        members: [regNumber],
        messages: [],
      });
      await schoolGroup.save();
      console.log(`✅ Created group: ${officialGroup}`);
    } else if (!schoolGroup.members.includes(regNumber)) {
      schoolGroup.members.push(regNumber);
      await schoolGroup.save();
    }

    // ✅ Login Success
    res.json({
      success: true,
      name: student.name,
      regNumber: student.regNumber,
      group: groupName,
      lastSeen: student.lastSeen || {}
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


//and api login to test if there was a connection to database
// app.post("/api/login", async (req, res) => {
//   const { regNumber, password } = req.body;
//   console.log("Trying to log in with:", regNumber);

//   try {
//     // TEMP: Show all students in the DB
//     const allStudents = await Student.find({});
//     console.log("Students in DB:", allStudents);

//     const student = await Student.findOne({ regNumber });

//     if (!student) {
//       console.log("No matching student for:", regNumber);
//       return res.json({ success: false, message: "Student not found in database " });
//     }

//     if (student.password !== password) {
//       return res.json({ success: false, message: "Incorrect password" });
//     }

//     res.json({
//       success: true,
//       name: student.name,
//       regNumber: student.regNumber,
//       group: student.group
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// });


//API for Dashboard, for fetching group
const Group = require("./models/Group");

app.get("/api/student-groups/:regNumber", async (req, res) => {
  const regNumber = req.params.regNumber;

  try {
    const groups = await Group.find({ members: regNumber });

    if (!groups.length) {
      return res.json({ success: false, message: "No groups found for this student." });
    }

    // Attach last message from Messages collection
    const result = await Promise.all(
      groups.map(async (group) => {
        const lastMsg = await Message.findOne({ group: group.name }).sort({ timestamp: -1 });
        return {
          name: group.name,
          type: group.type || "class", // fallback
          lastMessage: lastMsg ? lastMsg.message : "No messages yet",
          lastTimestamp: lastMsg ? lastMsg.timestamp : null
        };
      })
    );

    res.json({ success: true, groups: result });
  } catch (err) {
    console.error("Group fetch error:", err);
    res.status(500).json({ success: false, message: "Server error." });
  }
});



// app.get("/api/student-groups/:regNumber", (req, res) => {
//   const regNumber = req.params.regNumber;
//   console.log("Looking for student:", regNumber);
//   console.log("API HIT: ", req.params.regNumber);


//   const student = students.find(s => s.regNumber === regNumber);

//   if (!student) {
//     return res.status(404).json({ success: false, message: "Student not found" });
//   }

  

//   res.json({
//     success: true,
//     groups: allGroups
//   });
// });

app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});


// API: Get messages for a group





// Send message API endpoint
app.post("/api/send", async (req, res) => {
  const { regNumber, name, group, message } = req.body;

  if (!regNumber || !name || !group || !message) {
    return res.status(400).json({ success: false, error: "Missing required fields" });
  }

  try {
    const newMessage = new Message({
      sender: regNumber,
      name,
      group,
      message,
    });

    await newMessage.save();

    res.json({ success: true, message: "Message saved successfully!" });
  } catch (err) {
    console.error("Error saving message:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});



// Fetch messages for the group
app.get('/api/group/:groupName', async (req, res) => {
  const groupName = req.params.groupName;

  try {
    const messages = await Message.find({ group: groupName }).sort({ timestamp: 1 });

const processedMessages = messages.map(msg => {
  if (msg.deleted) {
    return {
      ...msg._doc,
      message: "🗑️ This message was deleted",
      deleted: true,
    };
  }
  return msg;
});

res.json({ success: true, group: { name: groupName, messages: processedMessages } });

  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
});

//API to fetch the group info
app.get("/api/group-info/:groupName", async (req, res) => {
  const groupName = req.params.groupName;

  try {
    const group = await Group.findOne({ name: groupName });

    if (!group) {
      return res.json({ success: false, message: "Group not found" });
    }

    // Look up member details
    const detailedMembers = await Promise.all(
      group.members.map(async (regNumber) => {
        const student = await Student.findOne({ regNumber });
        return student ? { name: student.name, regNumber } : { name: "Unknown", regNumber };
      })
    );

    const groupWithNames = {
      name: group.name,
      description: group.description,
      members: detailedMembers
    };

    res.json({ success: true, group: groupWithNames });

  } catch (err) {
    console.error("❌ Error fetching group info:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// Update group description
app.put("/api/group-description/:groupName", async (req, res) => {
  const groupName = req.params.groupName;
  const { description } = req.body;

  try {
    const group = await Group.findOneAndUpdate(
      { name: groupName },
      { description },
      { new: true }
    );

    if (group) {
      res.json({ success: true, message: "Description updated" });
    } else {
      res.json({ success: false, message: "Group not found" });
    }
  } catch (err) {
    console.error("Error updating group description:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

//The Delete Message API
app.delete("/api/message/:id", async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});



// 8. Start the server with Socket.IO support
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app); // 👈 Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // ✅ Allow frontend to connect
    methods: ["GET", "POST"]
  }
});

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});

// 👇 ADD THIS AFTER all the routes (near the end of server.js):
io.on("connection", (socket) => {
  console.log("🔌 A user connected");

  socket.on("joinGroup", (groupName) => {
    socket.join(groupName);
    console.log(`🟢 User joined group: ${groupName}`);
  });

  socket.on("sendMessage", async (data) => {
    const newMessage = new Message({
      sender: data.regNumber,
      name: data.name,
      group: data.group,
      message: data.message,
    });
  
    const savedMessage = await newMessage.save();
  
    io.to(data.group).emit("newMessage", {
      _id: savedMessage._id, // ✅ Include the ID
      regNumber: data.regNumber,
      name: data.name,
      group: data.group,
      message: data.message,
      timestamp: savedMessage.timestamp, // use consistent timestamp
    });
  });

//To check last seen
app.post("/api/update-last-seen", async (req, res) => {
  const { regNumber, group, timestamp } = req.body;

  if (!regNumber || !group || !timestamp) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  try {
    const student = await Student.findOne({ regNumber });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    // ✅ Use Map.set for groupLastSeen
    student.groupLastSeen.set(group, new Date(timestamp));

    await student.save();

    // ✅ Optionally return the updated student
    res.json({ success: true, updatedUser: student });

  } catch (err) {
    console.error("❌ Error updating groupLastSeen:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// API for file uploads 
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "public/uploads")); // <-- must exist!
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// API Route fo file upload
app.post("/api/upload", upload.single("file"), async (req, res) => {
  const { group, regNumber, name, caption = "" } = req.body;
  const fileUrl = `http://localhost:5020/uploads/${req.file.filename}`;

  const newMessage = new Message({
    sender: regNumber,
    name,
    group,
    message: `📎 <a href="${fileUrl}" target="_blank">${req.file.originalname}</a><br/>${caption}`,
    timestamp: new Date()
  });

  await newMessage.save();
  io.to(group).emit("newMessage", newMessage);

  res.json({ success: true });
});



  // ✅ Add this for real-time deletion
  socket.on("deleteMessage", async ({ messageId, group }) => {
    try {
      const updated = await Message.findByIdAndUpdate(
        messageId,
        { deleted: true, deletedAt: new Date() },
        { new: true }
      );
  
      if (updated) {
        io.to(group).emit("messageDeleted", {
          messageId,
          placeholder: "🗑️ This message was deleted"
        });
      }
    } catch (err) {
      console.error("❌ Error soft deleting message:", err);
    }
  });
  

  

  socket.on("disconnect", () => {
    console.log("🔌 A user disconnected");
  });
});

