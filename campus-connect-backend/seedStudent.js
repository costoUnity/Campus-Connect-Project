const mongoose = require('mongoose');
const Student = require('./Backend/models/Student'); // Adjust as needed

const mongoURI = "mongodb+srv://campusadmin:campusconnect@campusconnectdb.i94nqjc.mongodb.net/campusconnect?retryWrites=true&w=majority&appName=CampusConnectDB";


const students = [
  { regNumber: "BIT/123/2023", name: "John Doe", password: "1234" },
  { regNumber: "BIT/456/2023", name: "Jane Smith", password: "4567" },
  { regNumber: "BCS/789/2022", name: "Brian Otieno", password: "7890" },
  { regNumber: "BIT/789/2023", name: "Alice Muthoni", password: "alice" },
  { regNumber: "BCS/333/2022", name: "Kevin Kipkoech", password: "kevin" }
];

mongoose.connect(mongoURI)
  .then(async () => {
    console.log("✅ Connected to MongoDB");

    for (const student of students) {
      const exists = await Student.findOne({ regNumber: student.regNumber });
      if (!exists) {
        await Student.create(student);
        console.log(`✅ Added ${student.name}`);
      } else {
        console.log(`⚠️ Skipped ${student.regNumber} (already exists)`);
      }
    }

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("❌ Error seeding students:", err);
  });
