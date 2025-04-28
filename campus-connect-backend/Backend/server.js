// 1. Load required packages
const express = require("express");
const cors = require("cors");
//loading MongoDB
const mongoose = require('mongoose');

// ⚡Replace <password> and <dbname> properly in your connection string
const mongoURI = "mongodb+srv://campusadmin:campusconnect@campusconnectdb.i94nqjc.mongodb.net/?retryWrites=true&w=majority&appName=CampusConnectDB";

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


// 6. Dummy "database" — list of students
const students = [
  {
    regNumber: "BIT/123/2023",
    name: "John Doe",
    password: "1234",
    group: {
      name: "BIT2221",
      year: "2023",
      department: "Computer Science",
      faculty: "ICT"
    }
  },
  {
    regNumber: "BIT/456/2023",
    name: "Jane Smith",
    password: "abcd",
    group: {
      name: "BIT2221",
      year: "2023",
      department: "Computer Science",
      faculty: "ICT"
    },
    group: {
      name: "BIT2223",
      year: "2025",
      department: "Computer Science",
      faculty: "CIT"
    }
  },
  {
    regNumber: "BBM/789/2023",
    name: "Alice Muthoni",
    password: "pass123",
    group: {
      name: "BBM1102",
      year: "2023",
      department: "Business Management",
      faculty: "Business"
    }
  }
];

// In-memory message storage by group
const groupMessages = {
  BIT2221: [],
  AllStudents: [],
  CodingClub: [],
  BBM1102: []
};


//Student Dummy Group Database
const groups = [
  {
    name: "BIT2221",
    year: "2023",
    department: "Computer Science",
    faculty: "ICT",
    messages: [
      {
        sender: "BIT/123/2023",
        name: "John Doe",
        message: "Hey team, class starts at 9!",
        timestamp: "2024-04-15 09:00"
      },
      {
        sender: "BIT/456/2023",
        name: "Jane Smith",
        message: "Thanks for the reminder 🙌",
        timestamp: "2024-04-15 09:05"
      }
    ]
  }
];

app.get("/", (req, res) => {
    res.send("✅ Backend is running!");
  });
  

// 7. Your real API route (POST) for login
app.post("/api/login", (req, res) => {
  console.log("🔐 Login attempt...");

  const { regNumber, password } = req.body;

  // Find the student
  const student = students.find((stu) => stu.regNumber === regNumber);

  if (student) {
    if (student.password === password) {
      // ✅ Success
      res.json({
        success: true,
        name: student.name,
        group: student.group
      });
    } else {
      // ❌ Wrong password
      res.json({
        success: false,
        message: "Incorrect password"
      });
    }
  } else {
    // ❌ Student not found
    res.json({
      success: false,
      message: "Student not found"
    });
  }
});

//API for Dashboard, for fetching group
app.get("/api/group/:groupName", (req, res) => {
  console.log("Student is accessing a group");
  const groupName = req.params.groupName;
  const group = groups.find(g => g.name === groupName);

  if (group) {
    res.json({
      success: true,
      group
    });
  } else {
    res.json({
      success: false,
      message: "Group not found"
    });
  }
});

app.get("/api/student-groups/:regNumber", (req, res) => {
  const regNumber = req.params.regNumber;
  console.log("Looking for student:", regNumber);
  console.log("API HIT: ", req.params.regNumber);


  const student = students.find(s => s.regNumber === regNumber);

  if (!student) {
    return res.status(404).json({ success: false, message: "Student not found" });
  }

  // Sample group assignment
  const allGroups = [
    { name: student.group.name, type: "class" },
    { name: "AllStudents", type: "school" },
    { name: "CodingClub", type: "club" }
  ];

  res.json({
    success: true,
    groups: allGroups
  });
});

app.get("/", (req, res) => {
  res.send("✅ Backend is working!");
});

// API: Get messages for a group
app.get("/api/group/:groupName", (req, res) => {
  const groupName = req.params.groupName;
  const messages = groupMessages[groupName] || [];
  res.json({ success: true, group: { name: groupName, messages } });
});

// API: Send a message to a group
app.post("/api/send", (req, res) => {
  const { regNumber, name, group, message } = req.body;
  const timestamp = new Date().toLocaleTimeString();

  if (!groupMessages[group]) groupMessages[group] = [];

  groupMessages[group].push({ regNumber, name, sender: regNumber, message, timestamp });

  res.json({ success: true });
});


app.get("/api/group-info/:groupName", (req, res) => {
  const groupName = req.params.groupName;

  const dummyInfo = {
    BIT2221: {
      name: "BIT2221",
      description: "Class group for BIT 2221 unit",
      members: [
        { name: "Class Rep John" }, // admin
        { name: "Jane Smith" },
        { name: "Mark Omondi" },
        { name: "Alice Wanjiru" },
        { name: "Jane Smith" },
        { name: "Mark Omondi" },
        { name: "Alice Wanjiru" },
        { name: "Jane Smith" },
        { name: "Mark Omondi" },
        { name: "Alice Wanjiru" },
        { name: "Jane Smith" },
        { name: "Mark Omondi" },
        { name: "Alice Wanjiru" },
        { name: "Jane Smith" },
        { name: "Mark Omondi" },
        { name: "Alice Wanjiru" }
      ]
    },
    AllStudents: {
      name: "AllStudents",
      description: "Official communication group for all students",
      members: [
        { name: "Dean's Office" }, // admin
        { name: "John Doe" },
        { name: "Alice Muthoni" }
      ]
    },
    CodingClub: {
      name: "CodingClub",
      description: "For students passionate about programming and tech",
      members: [
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" },
        { name: "Club President Brian" },
        { name: "Jane Smith" },
        { name: "Alice Muthoni" }
        
      ]
    }
  };

  const group = dummyInfo[groupName];

  if (group) {
    res.json({ success: true, group });
  } else {
    res.json({ success: false, message: "Group not found" });
  }
});

// 8. Start the server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
