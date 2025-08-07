const { MongoClient } = require("mongodb");

async function createSubjectDocs() {
  const uri = "mongodb://localhost:27017"; // Replace with your MongoDB URI if needed
  const dbName = "college_database"; // Replace with your DB name
  const sourceCollectionName = "uniqueSubjectsCollection"; // Replace with your source collection name
  const targetCollectionName = "unique_subjects"; // Name for new collection
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const sourceCollection = db.collection(sourceCollectionName);
    const targetCollection = db.collection(targetCollectionName);

    // Step 1: Fetch the first document with the uniqueSubjects array
    const sourceDoc = await sourceCollection.findOne({
      uniqueSubjects: { $exists: true },
    });

    if (!sourceDoc || !Array.isArray(sourceDoc.uniqueSubjects)) {
      console.error("❌ No valid document with uniqueSubjects array found.");
      return;
    }

    // Step 2: Prepare and clean the subject documents
    const subjectDocs = sourceDoc.uniqueSubjects.map((subject) => ({
      subject: subject.trim().toUpperCase(),
    }));

    // Step 3: Clear target collection (optional)
    await targetCollection.deleteMany({});

    // Step 4: Insert all documents
    await targetCollection.insertMany(subjectDocs);

    console.log(
      `✅ Inserted ${subjectDocs.length} subject documents into '${targetCollectionName}'`
    );
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await client.close();
  }
}

createSubjectDocs();
